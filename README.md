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
