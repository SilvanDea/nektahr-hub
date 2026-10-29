# Compact presentation — test branch only

Base: production commit 05166a736cb816bca94363225b0c96ac31466735.

## Changes to review

- Pricing: short finish/price/description cards, no repeated status or turnaround paragraphs; adopt blueprint placeholders removed. Existing artwork examples remain visible. Fan-art examples sit with the other examples.
- Calculator remains in the right column. A single package selector replaces the duplicate package buttons. Character slider remains visible. Optional controls are grouped under clearly named disclosures with option hints and a selected-count badge; their open state survives rebuilding the calculator within the page. No pricing formulas changed.
- One short ordering note links to the complete existing terms. Included alternatives and AB inclusions remain visible in the calculator; unpriced background work still gets a separate-quote notice.
- Catalog cards focus on artwork, title, type, availability and price; IDs, repeated sales rules and weapon notes are removed from the grid but remain in item details or the catalog introduction. Sold/reserved/reference notices and the adult-content controls remain.
- Home and gallery introductions are shorter. Contact descriptors, secondary hero paragraph and decorative explanatory content are removed from the main reading flow.
- All new copy has EN/RU/ES versions. Existing ToS and FAQ content is preserved.

## Verification

- Queue/API regression suite: 24 assertions pass.
- Existing calculator/runtime regression suite: 46 assertions pass.
- Structural validator: seven routes, 133 local HTML references, 125 image files, 68 catalog entries, 87 work models; pass.
- Browser: custom full render $200 + NSFW $50 + expression $25 = $275; YCH AB $160 auto-includes NSFW and lowers paid futa to $25. Changing language/category rebuilds the compact controls without losing package state. Adopt AB remains $500 after choosing furry as its included alternative while NSFW stays included. Catalog loads its 12-card first page and local images. EN/RU/ES copy checked in the UI.

Scope: presentation changes only. Production hosting and main are not updated by this change. No real order, payment, age confirmation or ToS acceptance was submitted during QA.
