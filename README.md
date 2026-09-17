# Back end

Inside `cloudflare_worker`. Deployed on Cloudflare workers and deployed using `wrangler publish`.

# Front end
A CRA React app inside `frontend`. Deployed on Cloudflare pages.

To deploy, inside that folder:

```
npm run build
npm run deploy
```

This will build into `frontend/build` and then deploy onto Cloudflare. On first deploy you will be asked to select an existing project to deploy into (or create a new one).

# Collection reminders (web push)

The PWA can send a push notification on the evening before a collection. The
service worker lives in `frontend/public/sw.js`, and the worker sends the pushes
from a nightly cron trigger (`0 19 * * *` UTC, i.e. 8pm British Summer Time) by
looking up every subscriber's schedule and messaging anyone with a collection the
next day.

To enable it in your Cloudflare account:

1. Create the KV namespace that stores subscriptions and copy the printed id into
   `cloudflare_worker/wrangler.toml`:

   ```
   cd cloudflare_worker
   npx wrangler kv namespace create PUSH_SUBSCRIPTIONS
   ```

2. Generate a VAPID key pair and set it as worker secrets:

   ```
   npx web-push generate-vapid-keys --json
   npx wrangler secret put VAPID_PUBLIC_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   npx wrangler secret put VAPID_SUBJECT   # e.g. mailto:you@example.com
   ```

3. Deploy the worker (`npm run deploy`), then deploy the frontend.

For local development, put the same values in `cloudflare_worker/.dev.vars`:

```
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@example.com"
```

Notes:

- iOS/iPadOS only delivers web pushes to PWAs added to the home screen (iOS 16.4+).
- Browsers cannot receive push while they have no internet connection, and a user
  must explicitly opt in via the "Remind me the night before" button.
