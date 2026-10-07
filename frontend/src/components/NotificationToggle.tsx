import React, { FC, useEffect, useState } from 'react';
import { AddressSearchResponse } from '../model/BinTypes';
import {
    disableNotifications,
    enableNotifications,
    getPushSubscription,
    isPushSupported,
} from '../services/PushService';

interface NotificationToggleProps {
    address: AddressSearchResponse;
}

type NotificationState = 'checking' | 'unsupported' | 'off' | 'on' | 'denied';

export const NotificationToggle: FC<NotificationToggleProps> = ({ address }) => {
    const [state, setState] = useState<NotificationState>('checking');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            if (!isPushSupported()) {
                if (!cancelled) {
                    setState('unsupported');
                }
                return;
            }

            if (Notification.permission === 'denied') {
                if (!cancelled) {
                    setState('denied');
                }
                return;
            }

            const subscription = await getPushSubscription();
            if (!cancelled) {
                setState(subscription != null ? 'on' : 'off');
            }
        };

        check();

        return () => {
            cancelled = true;
        };
    }, [address.id]);

    const onToggle = async () => {
        setBusy(true);
        setError(false);

        try {
            if (state === 'on') {
                await disableNotifications();
                setState('off');
            } else {
                await enableNotifications(address);
                setState('on');
            }
        } catch (e) {
            console.error(e);
            setError(true);
            if (isPushSupported() && Notification.permission === 'denied') {
                setState('denied');
            }
        } finally {
            setBusy(false);
        }
    };

    if (state === 'checking' || state === 'unsupported') {
        return null;
    }

    if (state === 'denied') {
        return (
            <p className="notifications-message">
                Notifications are blocked for this site. Enable them in your browser settings to get collection reminders.
            </p>
        );
    }

    const buttonText = state === 'on'
        ? 'Turn off collection reminders'
        : 'Remind me the night before';

    return (
        <div className="notifications-toggle">
            <button className="standard-button secondary" onClick={onToggle} disabled={busy}>
                {busy ? 'Just a moment...' : buttonText}
            </button>
            {error && <p className="notifications-message">Something went wrong. Please try again.</p>}
        </div>
    );
};
