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