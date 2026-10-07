import { AddressSearchResponse } from '../model/BinTypes';
import { baseApiUrl } from './BinService';

const serviceWorkerUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;

export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function registerServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
        console.error('Service worker registration failed', error);
    });
}

async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing != null) {
        return existing;
    }

    return navigator.serviceWorker.register(serviceWorkerUrl);
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
    if (!isPushSupported()) {
        return null;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration == null) {
        return null;
    }

    return registration.pushManager.getSubscription();
}

export async function enableNotifications(address: AddressSearchResponse): Promise<void> {
    if (!isPushSupported()) {
        throw new Error('Push notifications are not supported on this device');
    }

    const registration = await getRegistration();
    if (registration == null) {
        throw new Error('Could not register the service worker');
    }

    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission was not granted');
    }

    const publicKey = await getVapidPublicKey();

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const result = await fetch(`${baseApiUrl}push/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subscription: subscription.toJSON(),
            uprn: address.id,
            houseNumber: address.houseNumber,
            postCode: address.postCode,
        }),
    });

    if (!result.ok) {
        await subscription.unsubscribe();
        throw new Error('Could not save the notification subscription');
    }
}

export async function disableNotifications(): Promise<void> {
    if (!isPushSupported()) {
        return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();

    if (subscription == null) {
        return;
    }

    await fetch(`${baseApiUrl}push/unsubscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
}

async function getVapidPublicKey(): Promise<string> {
    const result = await fetch(`${baseApiUrl}push/config`, {
        headers: {
            Accept: 'application/json',
        },
    });

    if (!result.ok) {
        throw new Error('Could not load the notification configuration');
    }

    const json = await result.json();
    if (json == null || typeof json.publicKey !== 'string') {
        throw new Error('Push notifications are not configured');
    }

    return json.publicKey;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
