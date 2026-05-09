# keel-labs.github.io

Landing site for [Keel](https://github.com/Keel-Labs/keel) — a local-first AI chief-of-staff Mac app.

Built with [Astro](https://astro.build/) + [Tailwind CSS](https://tailwindcss.com/). Deployed via GitHub Actions to GitHub Pages.

## Local development

```bash
npm install
npm run dev      # localhost:4321
npm run build    # output → dist/
npm run preview  # preview the production build
```

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds with `withastro/action@v3` and publishes to GitHub Pages.

The Pages source must be set to **GitHub Actions** in repo Settings → Pages once before the first deploy.

## Content sources

Section copy is lifted from the Keel README and PRIVACY.md. Screenshots are referenced from the GitHub user-attachments URLs already used in the README so they stay in sync.

The hero CTA `Keel-0.2.0-mac.dmg` direct link is a stopgap; once `releases/latest` redirect is verified working, swap to that.
