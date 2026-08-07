# Sazón 24/7 — Website

Marketing site for **Sazón 24/7**, Venezuelan + Mexican street food in downtown Toledo.

**Address:** 322 N. Erie St., Downtown Toledo  
**Phone:** 419.820.6767

## Preview locally

Open `index.html` in a browser, or:

```bash
npx --yes serve . -l 4321
```

## Deploy on Render

### Option A — Blueprint (recommended)

1. Push this repo to GitHub.
2. In [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repo. Render reads `render.yaml` and creates **sazon-247**.
4. After deploy, open the `*.onrender.com` URL (or attach a custom domain).

### Option B — Manual static site

1. **New** → **Static Site**
2. Connect this repo, branch `main`
3. **Build command:** leave blank or `echo Static site ready`
4. **Publish directory:** `.` (root)
5. Create Static Site → wait for deploy

### Files published

`index.html`, `styles.css`, `script.js`, `i18n.js`, `public/`

## Menu source

Printed menu photos in `public/menu.jpg` and `public/menu-2.jpg`.
