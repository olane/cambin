/* global clients */

// A fetch listener keeps the app installable as a PWA. Requests fall through to
// the network; we don't cache anything here.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
    let payload = { title: 'Bin collection', body: '', url: '/' };

    if (event.data) {
        try {
            payload = { ...payload, ...event.data.json() };
        } catch (e) {
            payload.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/logo190.png',
            badge: '/logo190.png',
            tag: 'bin-collection',
            data: { url: payload.url || '/' },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
