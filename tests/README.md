# Regression checks

Run from the extracted site root:

```text
node tests/queue-regression.cjs
node tests/runtime-regression.cjs
node tests/contact-regression.cjs
python tests/validate-project.py
```

The first two suites use Node.js built-ins only. They evaluate actual application functions with a small synthetic DOM/service fixture; they do not control a browser, accept real terms, contact payment services, or modify a workbook. They cover 29 queue/API, 46 runtime and 17 contact assertions.

The structural/media validator uses Python 3 with Pillow. It checks all seven routes, references, IDs, shared business logic, data relationships, all local images and a limited set of secret patterns. It deliberately allows the existing page-specific hero variants.

Browser interaction results and manual checks are recorded in `../docs/archive/AUDIT_2026-10-28.md`. These tests do not certify production hosting, access control of the deployed Apps Script, legal compliance, the OS clipboard or physical mobile devices.
