# Infratrade Inventory Site

Static website for **Infratrade Limited** — pre-owned small plant machinery and trade tools based in Warrington, NW England.

Built with plain HTML, CSS, and vanilla JavaScript. Vite is used as a dev server and build tool only — the output is fully static and works on any host including GitHub Pages.

---

## Live site

Deployed via GitHub Pages from the `gh-pages` branch (built automatically by GitHub Actions on every push to `main`).

---

## Project structure

```
├── artifacts/infratrade/     ← Vite project (source files)
│   ├── index.html            ← Homepage
│   ├── category.html         ← Category browse page
│   ├── public/
│   │   ├── app.js            ← All JavaScript (vanilla)
│   │   ├── style.css         ← All CSS
│   │   ├── inventory_categories.json  ← Stock data (569 items)
│   │   └── assets/           ← Logo, yard photo
│   └── vite.config.ts
├── inventory_categories.json ← Source copy of stock data (root)
├── generate_json.py          ← Script to rebuild stock data from eBay CSV
└── README.md
```

---

## Updating stock (weekly)

When you download a fresh **Active Listings** CSV from eBay Seller Hub:

1. Replace the CSV file referenced inside `generate_json.py` (default: `attached_assets/*.csv`).
2. Run the script:

```bash
python generate_json.py
```

This writes a fresh `inventory_categories.json` to the root **and** copies it to `artifacts/infratrade/public/` automatically.

3. Commit and push — GitHub Actions will rebuild and redeploy the site.

---

## Local development

Requires [Node.js](https://nodejs.org) ≥ 18 and [pnpm](https://pnpm.io):

```bash
pnpm install
pnpm --filter @workspace/infratrade run dev
```

Open the URL printed in the terminal (e.g. `http://localhost:XXXXX`).

---

## Deploying to GitHub Pages

### First-time setup

1. Push this repository to GitHub.
2. Go to **Settings → Pages → Source** and set it to **GitHub Actions**.
3. Push any commit to `main` — the workflow in `.github/workflows/deploy.yml` will build the site and publish it automatically.

### If your site lives at a subdirectory (e.g. `username.github.io/repo-name/`)

Set the `BASE_PATH` variable in `.github/workflows/deploy.yml`:

```yaml
env:
  BASE_PATH: /repo-name/
```

Leave it as `/` for a root domain (`username.github.io`).

---

## Manual build (optional)

```bash
pnpm --filter @workspace/infratrade run build
```

Output lands in `artifacts/infratrade/dist/public/` — these are the files GitHub Pages serves.

---

## Contact

WhatsApp: [07909 329693](https://wa.me/447909329693)  
Email: contactinfratrade@gmail.com  
Company No. 15903849
