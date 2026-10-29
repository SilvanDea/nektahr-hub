# Contact and sharing update

Base: 1c0b24b548bab635afdba2d4cf86d68a57ec9da6 (the retained design with compact calculator).

- Added permanent Discord username-copy and email actions next to the request button. The email template stays short; the full brief is copied locally. Success feedback depends on the clipboard result. Failure opens the existing preview for manual copying. Copying the username explicitly prompts copying the request again afterwards.
- Discord is the default requested contact. Direct-contact cards put Discord and email first. Telegram remains available among existing contacts.
- The artist explicitly confirmed that orders are always accepted. This status is independent of queue counts and is displayed in the desktop header and queue page; timing remains individually agreed.
- Queue loading and initial failure have distinct header explanations. A valid zero is not confused with a failure. Cached results remain labeled and refresh failures preserve the last snapshot. Backend/workbook access was not changed.
- Each route now has static title/description, canonical, Open Graph and Twitter Card metadata. Shared SFW PNG preview is 1200×630, using the existing supplied avatar and site colors. External services may retain cached link previews; their actual rendering has not been checked in signed-in messaging clients.
- Added robots.txt and a sitemap of the seven existing routes. Navigation and simple page CTAs use normal links. Mobile brand selectors were updated for the anchor element.
- Price rules, ToS, existing artwork and the retained page design are unchanged.

Checks: 29 queue/API assertions, 46 calculator/runtime assertions, 14 contact-flow assertions, structural/media validation and static metadata/navigation checks pass. Browser checks confirm the old pricing content, new action buttons, copy confirmation, Russian open-intake status and queue data. No message, email or order was sent; no ToS or age confirmation was accepted.

## Contact placement follow-up

The artist preferred intake status outside the header. The header badge is now hidden, with the status shown next to home-page contacts and on the queue page. Email actions now open an accessible native dialog with a visible address, address copying, a generic Gmail link and an explicitly labeled mail-app option. This also applies to the existing home and footer email links. The Gmail link does not promise a prefilled draft. A direct Discord profile link is pending the artist's numeric user ID; no guessed profile or server invite was added. Contact regression coverage is now 17 assertions.
