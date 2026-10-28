# Nek'tahr Hub multi-page migration plan

## Baseline inspected
- Source branch: `main`, commit `46779fd56d57c87691ef73cd982b0ef877fe6ae4`.
- Current deployment is a static GitHub Pages site on a custom domain; root contains `CNAME` and a single `index.html` (~147 KB).
- `index.html` contains the shared header/footer, all six sections (home, pricing, gallery, queue, ToS, FAQ), localization dictionaries (EN/ES/RU), calculator, gallery filters/lightbox/18+ modal, FAQ renderer, and public Google Apps Script queue integration.
- Recent work includes Patreon “Coming Soon”, simplified gallery filters, and age confirmation for 18+ content. Gallery items currently contain no `nsfw: true` entries, so the UI exists but no adult artwork is currently available in the data.

## Safety constraints
1. Preserve the root `CNAME` and current domain.
2. Keep the public Queue API URL, JSONP callback contract, public-only data handling, active-order counter, and queue sorting/filtering logic unchanged.
3. Preserve existing text, EN/ES/RU translations, social links, pricing calculator, gallery category filters, lightbox, age gate, terms acknowledgement, FAQ categories, responsive styling, and Patreon placeholder.
4. Store only the language preference in `localStorage`; do not persist 18+ confirmation across reloads.
5. Use a dedicated migration branch and keep `main` untouched until review.

## URL structure
- `/` home
- `/pricing/` pricing, adoptables, YCH and quote builder
- `/gallery/` gallery filters, age confirmation and lightbox
- `/queue/` live commission queue
- `/terms/` terms of service
- `/faq/` FAQ

## Implementation sequence
1. Create `feature/multi-page-migration` from the current `main`.
2. Add explicit URL routing and initialize each document with its active page.
3. Add cross-page language persistence, defaulting to English when no valid preference exists.
4. Add the five route documents and keep the original home URL.
5. Verify every route maps to the intended section, all nav/call-to-action routes use real URLs, language is restored on page load, and the queue API / gallery / calculator functions are still present.
6. Preserve the original `main` until the migration branch is reviewed and deployed.

## Deliberate low-risk tradeoff
For this first migration, each route document keeps the current complete DOM and script bundle, while showing only the route's active section. This avoids breaking the existing all-section localization renderer and the many interactive features during the URL migration. It creates genuinely separate URLs/documents now, but duplicates markup and scripts. A follow-up optimization can extract shared CSS/JS and page-specific markup after behavior has been verified. This tradeoff is explicit rather than risking a broad untested rewrite of the existing 146 KB application in one step.

## Acceptance checklist
- [ ] All six URLs are distinct and navigable directly.
- [ ] Navigation and in-page calls to action load the correct URL.
- [ ] EN/ES/RU choice persists across routes and reloads.
- [ ] Gallery category filters, 18+ modal and lightbox remain functional.
- [ ] Pricing tabs, quote calculator and copy action remain functional.
- [ ] Queue counter and live queue still use the existing public endpoint.
- [ ] ToS confirmation and FAQ category filters remain functional.
- [ ] Root `CNAME` remains unchanged.
