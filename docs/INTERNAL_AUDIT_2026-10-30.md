# Internal audit and repair — 2026-10-30

Scope: source organization, static output, navigation, failure handling, data/media integrity, maintainability and regression verification. Baseline: 760881424ac14c2fbccee6026ec535af81f628a7. No commercial prices or artwork metadata changed.

## Findings and repairs

| Severity | Finding | Repair |
|---|---|---|
| High | Seven independently edited copies of application logic, translations and CSS; hero markup already diverged | One src/page.html, src/routes.json, src/translations.js, src/state.js and src/app.js. Deterministic generator creates seven HTML outputs and shared browser scripts. |
| High | Early language bootstrap hid entire body; a failed script request could leave it permanently invisible | No global visibility gate. English editorial content is generated before browser JS. Saved language applied when app initializes. |
| Medium | Most text, pricing cards, terms and FAQ depended on successful JS execution | Execute existing editorial render functions in isolated Node VM at build time, without network/storage/consent; serialize their content into HTML. Catalog has an English heading and description. Interactive galleries, catalog data, queue and calculator still need JS. |
| Medium | Runtime Tailwind CDN compilation created third-party availability dependency | Pin Tailwind 3.4.17 in package-lock.json; compile utilities locally; serve CSS on own domain. Preserve stylesheet order. Google Fonts remains optional with system fallbacks. |
| Medium | Manual cache query versions were easy to miss | Per-file SHA-256 versions for all local script/style references. Catalog uses conditional revalidation and 10-second request timeout. |
| Medium | Tier-label changes lived in contact UI extension, requiring extra render and producing a different initial state | Move normalization before initial render and static generation. |
| Medium | Existing regression suite had drifted from production (old tiers, removed extras, incomplete DOM mocks) | Update fixtures to current agreed pricing and extension interfaces; preserve calculation assertions. |
| Medium | No architecture guard against stale generated output | New architecture regression and CI workflow check deterministic generation, JS syntax, metadata, static editorial text and asset hashes. |
| Low | Featured button closed with a div tag | Correct closing tag; generator checks source nesting. |
| Low | No custom missing-page document | Add standalone 404.html with real recovery links and noindex. |

## Source contract

- Run `npm ci`, `npm run build`, `npm test` before committing.
- Edit src files, not generated root/route HTML or generated app scripts. Other assets remain directly maintained.
- src/routes.json owns static titles, descriptions, canonical and OG URL. Shared social image retains absolute URL.
- Keep generated output tracked: existing GitHub Pages branch publishing continues without a hosting migration or a new production deployment workflow.
- Header navigation remains ordinary anchors with static active-page state. Browser history uses normal document navigation.
- All DOM targets remain present across routes intentionally: extensions still rely on them. HTML markup is repeated in generated output, not manually maintained source.
- CI detects errors but is not a production deployment gate under current branch-based Pages settings. No branch protection or permissions were changed.

## Verification

- Runtime 46 assertions; queue 29; contact 17: passed.
- Structural validator: seven routes, 68 catalog items, 87 work records, 128 decoded local images; local references, unique IDs, metadata, navigation and secret-pattern scan passed. This is not a full secret/security audit.
- Architecture: generated-output freshness, content hashes, English editorial content, route visibility, JS parsing and 404 passed.
- Browser: all seven direct routes show exactly their intended section. RU and ES switching, saved language on route navigation, browser back, gallery rendering and missing-page recovery document checked.
- Gallery: 63 cards rendered; 13 adult previews blurred before consent. Existing adult-alternative labels and safe previews retained.
- Local utility CSS and absence of runtime Tailwind script verified in browser.

## Remaining limits / follow-up

- No physical-phone, assistive-technology or full visual comparison certification. Responsive styles retained; no new mobile design introduced.
- Inline onclick handlers and global extension hooks remain. Moving them to modules/event delegation is a separate migration; pretending they are already modular would be incorrect.
- Queue uses existing cross-origin JSONP (remote script trust). Server permissions and public row projection were not altered or independently certified.
- Age gate is a presentation preference, not access control: public asset URLs are still public.
- A small number of external Carrd artwork URLs remain. They should be migrated with original media availability confirmed; no broken substitution was made.
- Dynamic catalog/queue/viewers and calculator require JS. Core editorial English text, metadata and navigation do not.
- Hosting outages are outside this refactor; verify actual public deployment independently.

Rollback: revert the repair commit or restore baseline commit via a normal revert; never force-push main. Source and generated outputs must be reverted together.
