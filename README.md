# Nek’tahr website

Production: https://nektahr.com/ — GitHub Pages, branch `main`.

Seven static routes share the same application and translations. Keep shared inline changes synchronized across all seven `index.html` files.

- `assets/`: runtime code, data, artwork and sharing images.
- `docs/`: current pricing rules and artwork provenance; `docs/archive/`: historical plans and audits, not current requirements.
- `tests/`: regression and structural checks; see `tests/README.md`.
- `scripts/render-social-preview.py`: regenerates the current sharing image.
- `integrations/`: public queue backend source and setup instructions.
- `CNAME`, `robots.txt`, `sitemap.xml`: production domain and crawler configuration.

Maintenance folders are excluded from the published Pages output by `_config.yml`. Historical social-preview image URLs are retained for existing cached shares. No artwork originals are removed during repository cleanup.

## Maintaining the site after the internal audit

The seven public HTML pages are generated output. Edit `src/page.html` (shared markup),
`src/routes.json` (per-route metadata), `src/translations.js`, `src/state.js`, or
`src/app.js`. Existing feature extensions remain in `assets/`.

```sh
npm ci
npm run build
npm test
```

Commit both sources and generated outputs. Build also compiles the pinned Tailwind
utilities locally and fingerprints local CSS/JS URLs. Do not edit generated HTML
or `assets/app.js`, `assets/app-state.js`, `assets/translations.js` directly.
See `docs/INTERNAL_AUDIT_2026-10-30.md` for findings, checks, limits and rollback.
