# Zephyr Cleaning — Website

Single-page site for Zephyr Cleaning, Dubai. Plain HTML/CSS/JS with no build step, ready for GitHub + Vercel.

## Files
- `index.html` — page content
- `css/style.css` — styling (colours and fonts are variables at the top)
- `js/main.js` — **settings at the top**: WhatsApp number, phone and all estimator prices
- `assets/img/` — logo mark, favicon, link-preview image (`og-image.png`)

## Before going live
1. **WhatsApp / phone number** — placeholder `+971 50 000 0000`. Change `whatsapp` and `phoneDisplay` in `js/main.js`, and the two `tel:` / `"telephone"` values in `index.html`.
2. **Prices** — every figure in `CONFIG.prices` (`js/main.js`) is a placeholder. Replace with real prices.
3. **Email** — `hello@zephyrcleaning.ae` is a placeholder; search for it in `index.html`.
4. **Areas** — check the community list in the "Cleaning across Dubai" section matches where you actually work.
5. **Domain** — once you have one, add `<link rel="canonical" href="https://yourdomain/">` and absolute `og:image` URLs in `<head>`.
6. **Logo** — `assets/img/mark.svg` is a simple placeholder mark. Swap in your real logo if you have one.

## Deploy
1. Create an empty GitHub repo, then in this folder:
   `git init && git add . && git commit -m "Initial site" && git branch -M main && git remote add origin https://github.com/<you>/zephyr-cleaning.git && git push -u origin main`
2. On vercel.com/new, import the repo. Framework preset: **Other**, no build command. Deploy.
3. Add your domain in Vercel → Settings → Domains.
