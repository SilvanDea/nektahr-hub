# Repository cleanup and artwork filters — 2026-10-29

- Gallery/catalog/highlights retain 3:4 frames with a neutral #141119 canvas. Removed edge-color gradients and obsolete generator. Near-matching ratios (within 2.5%) use cover to eliminate tiny seams; unusual ratios retain the complete artwork with contain. Adult blur scaling is preserved.
- Independent Only 18+ filter in gallery and catalog, translated EN/RU/ES. Includes works with adult alternate versions; does not grant age consent or reveal blurred previews. Gallery modal browsing respects the current filter. Catalog filter combines with type, status, search and pagination.
- Historical audits/plans moved to docs/archive, current rules and source provenance to docs. Added repository README and GitHub Pages excludes for maintenance folders.
- Removed only two replaced artwork files after scanning every HTML/JS/CSS/JSON/SVG/script/doc reference: catalog/adoptable-chinese-dragon-girl-close.webp and catalog/street-demon-adoptable.webp. Their active replacements remain referenced in data. Git history retains previous files.
- Retained past social image URLs for shared-link caches, icons, runtime scripts, tests, backend source and domain/crawler configuration.

Validation: 46 runtime, 29 queue, 17 contact regression assertions pass; structural/data/media validator and seven-route static metadata checks pass. Browser: gallery 63→18 works with Only 18+; category combination works; catalog 68→38 works; blur stays on; neutral background and 3:4 computed styles confirmed.

Remaining: owner supplies conversation excerpts for FAQ/ToS revision; messenger cache refresh remains external; physical-phone review was deferred by owner. No claim of preventing image extraction through developer tools, nor of legal certification of terms. Current intake remains open independently of queue length.
