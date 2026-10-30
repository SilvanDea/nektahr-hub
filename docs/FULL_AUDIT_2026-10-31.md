# Full audit, debug & repair — 31 October 2026

Repository: SilvanDea/nektahr-hub. Production: https://nektahr.com/.

## Result and scope

Reviewed the shared source/build pipeline, generated pages, calculator, gallery and comparison viewer, catalog, queue transport/cache/privacy projection, contacts, translations, metadata, public links, keyboard affordances and deployment packaging. Repairs are isolated on `repair/full-audit`. Business policy and detailed ToS were not changed. This is an engineering and editorial consistency audit, not a legal opinion.

### Fixed

1. **Undocumented calculator subtraction.** Full render $200 plus the displayed NSFW $50 returned $240 because a leftover `commissionBundle` subtracted $10. Removed the hidden subtraction. Result is now $250, or $338 with NDA (+35%, rounded). The same fix applies to furry/futa alternatives. Added five calculation regressions; published base prices and displayed extra rates remain unchanged.
2. **Wrong comparison relationships.** Viewer ignored `comparisonPairs` and `compareFromBase`, always pairing adjacent images. It now honors valid explicit pairs, then base comparisons, then adjacent stages. Watermelon’s blue outfit is compared to its template; its NSFW variant uses the corresponding blue outfit. Three targeted regressions cover these cases.
3. **Stale archive captions.** Gallery and pricing samples hard-coded `AB · 2024`. They now read each artwork’s year; Watermelon displays 2025 while Veldora retains 2024.
4. **Wrong type of example caption.** Data-backed non-YCH samples could be called “Template → Finished example” based only on a numeric ID. They now use the shared artwork-aware caption.
5. **Misleading zero during queue failures.** A catalog reservation could make the active work counter show zero before the queue API had returned. Unknown active counts now stay unknown, while available reservation data remains visible. Added three failure/loading regressions. Known order types are localized.
6. **Pagination accessibility.** First/previous/next/last symbol buttons now have explicit labels in EN/RU/ES.
7. **Keyboard navigation and motion preference.** Added a localized skip-to-content link and a global reduced-motion override without changing the established layouts.
8. **Metadata consistency.** Removed leftover “catalog mockup” copy and keep runtime Twitter metadata aligned with language changes and catalog metadata. Static route-specific canonical/OG/Twitter tags remain in HTML for non-JS crawlers. Final browser checks confirmed matching Twitter titles on all 21 route/language combinations.
9. **Data integrity gate.** Added `tests/data-contracts.cjs` to the standard test command. Checks duplicate artwork/catalog IDs, stage/image/adult-flag alignment, valid thumbnails, local image existence, translated titles/labels, comparison bounds, catalog artwork references, explicit listing prices and complete translation structures.

## Verified

| Area | Evidence |
|---|---|
| Build | Deterministic generated outputs and content hashes verified |
| Seven routes | Direct browser opening of Board, Pricing, Catalog, Gallery, Queue, ToS, FAQ |
| Languages | All seven pages checked on EN/RU/ES (21 page/language states) |
| DOM | One visible H1 per route; no duplicate IDs, unnamed visible buttons, undefined/NaN/object text or horizontal page overflow at the tested desktop size |
| Calculator | 50 runtime checks; browser verified $250 full-render/NSFW, same result after language change, YCH $65, adopt $450 and preserved commission state after switching tabs |
| Comparisons | All 16 shared examples available; Watermelon template → blue outfit pair verified in browser; three pair tests |
| Queue | 32 checks including caching, timeout, retry, explicit private rows, escaped HTML and invalid dates; browser manual refresh reached ready with a successful live update; no real orders or spreadsheet data modified |
| Contacts | 17 checks; browser opened localized email options without sending email |
| Catalog | Empty-search state, page 2 and reset to page 1 after search verified in browser |
| Age control | Confirmation prompt opens; declining keeps five explicit gallery previews blurred. Consent acceptance was tested only in synthetic tests |
| Navigation | Real links and browser Back verified; one browser attachment error required rebinding, then Back succeeded |
| Media | 131 local image files decode; 87 artwork records, 68 catalog records, 105 portfolio media references pass the data gate |
| Translations | EN/RU/ES key/list/type structures match. Numeric comparison found no conflicting prices or durations (only repeated NDA percentage and localized 18+ heading differences) |
| Public site | All seven production addresses, robots.txt, sitemap.xml and social preview returned 200; a nonexistent address correctly returned 404 |
| Dependencies | `npm audit` reported zero known vulnerabilities across production and build dependencies at audit time |
| Publish boundary | Actions builds and tests before deploy; PR builds do not publish; explicit packaging allowlist excludes source, tests, integrations and npm directories |

Primary contact/platform HEAD checks returned 200 for DeviantArt, X, YCH.art, FurAffinity, Ko-fi and Telegram. Pixiv and YCH.Commishes returned 403 to the audit HTTP client: this does not establish a broken destination, so their URLs were preserved. No sign-in, message sending or third-party account changes were performed.

## Limits and remaining maintenance considerations

- Browser checks used the available desktop cloud browser. Physical phones, iOS/Safari, a screen reader, browser zoom/text scaling and touch interactions were not certified. Responsive CSS was inspected; that is not a substitute for those device tests.
- No Lighthouse/Core Web Vitals benchmark, network throttling or load test was run. The image decoder and static-reference checks establish integrity, not a performance score.
- Public social pages may require login or reject automated requests. Link response status alone does not establish account ownership or messaging delivery.
- The queue remains dependent on the public Apps Script JSON endpoint. Timeout, stale cache and unknown-state behavior are tested; availability of that external service cannot be guaranteed.
- Age gating is a presentation preference. Public image URLs remain public; this is not authentication or file access control.
- Shared feature files still wrap several global render/calculator functions. This remains a maintenance concern: future work should consolidate those hooks carefully, with UI regression coverage, rather than perform a second broad rewrite during a bug-fix audit.
- Existing low-resolution artwork is not automatically replaced with invented high-resolution content. The supplied Thinking of You original is used; other source quality depends on the files actually provided.
- Original artwork, listing status, queue dates and policies remain artist-controlled. No refund rules, licence scope, deadlines or content restrictions were invented during this pass.

## Reproducing checks

`npm run build` then `npm test`; `npm audit`; `python scripts/package-site.py`.

The regression command includes architecture, public references/media, runtime, comparison pairs, queue, contacts and data-contract suites. Desktop browser scenarios complement these tests; they are not claimed as an automated cross-browser suite.
