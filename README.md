# Sazón 24/7 — Website

Marketing site for **Sazón 24/7**, Venezuelan + Mexican street food in downtown Toledo.

**Address:** 332 N. Erie St., Downtown Toledo  

### Facebook specials (auto-updating)
- Live timeline: Facebook Page Plugin on the **Specials** section (`#specials`)
- Featured card: `public/announcements.json` (refreshes every 10 minutes + on tab focus)
- Edit `announcements.json` → `featured` to pin a special day / promo; leave `"active": true`
- Page: https://www.facebook.com/share/1EcUBacwAo/  
**Phone:** 419.820.6767

## Preview locally

Open `index.html` in a browser, or:

```bash
npx --yes serve . -l 4321
```

## Deploy on Render (live site)

Repo is already on GitHub: [Shamwows/sazon-247](https://github.com/Shamwows/sazon-247)

### Fastest path (Static Site)

1. Open [Render Dashboard](https://dashboard.render.com) (same account as Wifi America CRM).
2. **New** → **Static Site**
3. Connect **GitHub** → select **`Shamwows/sazon-247`**
4. Settings:
   - **Name:** `sazon-247`
   - **Branch:** `main`
   - **Build command:** `echo Static site ready` (or leave blank)
   - **Publish directory:** `.`  ← root (not `public` or `dist`)
5. **Create Static Site** → wait until status is **Live**
6. Open the URL Render shows (usually `https://sazon-247.onrender.com`)

### Or Blueprint

1. **New** → **Blueprint**
2. Connect **`Shamwows/sazon-247`**
3. Render reads `render.yaml` and creates service **sazon-247**

### After first deploy

- Every push to `main` auto-redeploys
- Optional: **Settings → Custom Domains** for your real domain

### Files published

`index.html`, `styles.css`, `script.js`, `i18n.js`, `public/`

## Menu source

Printed menu photos in `public/menu.jpg` and `public/menu-2.jpg`.
