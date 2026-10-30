# Follow-up repair — 2026-10-30

- Removed global $110 weapon option in all languages; first adopt tier remains $100. Listing-specific prices continue to be represented by each catalog record's existing price object; no undocumented amounts invented.
- Removed obsolete hidden Carrd gallery records and unused breakdown image fields. Migrated the two actively referenced Carrd images (Thinking of You color sketch and Frieren white dress) byte-for-byte to local assets. They retain existing small web-image dimensions: 314×460 and 345×461. This does not claim recovery of high-resolution originals.
- Both queue clients now fetch JSON with omitted credentials and bounded timeouts. Confirmed deployed Apps Script returns HTTP 200, JSON with orders, Access-Control-Allow-Origin: *. Cache/stale/retry rendering and escaping preserved. Server JSONP support remains for compatibility but the website does not use it.
- Workflow: source build → tests → allowlisted package → artifact → deploy. Only main deploys; PRs only build/test. Cancellation supersedes obsolete runs. Deploy token permissions confined to deploy job.
- Activation requires Pages Source=GitHub Actions. This is a repository setting, not implied by committing YAML. Existing branch publishing must be switched off to make checks a real gate.
- Test suite: 45 runtime +29 queue +17 contact assertions; $110 global case removed, remaining expected prices retained. Structural/architecture/media checks passed.
