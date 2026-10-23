# Photography V3.2 — editorial photobook

Only Photography was redesigned. Shared navigation/logo components, the other four department pages, original photographs, and deployment configuration are unchanged. No deployment was made.

## Files and components

- `app/photography/page.tsx`: uses the new Photobook with a Photography-only shell class; existing metadata retained.
- `app/photography/photobook.css`: scoped book/interface styles, 3:4 pages, gutter/shadow, responsive single-page mode, reduced-motion support.
- `components/editorial/Photobook.tsx`: Photobook controller, reusable BookPage, Plate and ChapterOpening components; chapter/thumbnail controls and adjacent-spread loading.
- `content/photobook.ts`: centralized asset adapter, chapter descriptions, deliberate opening edit and spread manifest. Imports the original dimensions, alt text, paths and palette sequence.
- `artifacts/photobook-v32/`: verified asset inventory, spread inventory, five contact sheets, and four requested screenshots.
- This report.

The original PhotoSheet and photography manifests remain intact for reuse.

## Inventory and edit

All 107 source images were opened with Sharp to verify file validity and intrinsic dimensions against the existing manifest. Full-size derivative and thumbnail paths are recorded in `asset-inventory.json`. All five contact sheets were inspected before choosing the opening edit.

| Collection | Valid photographs | Chapter |
| --- | ---: | --- |
| 35mm film | 33 | I |
| 120 film | 7 | II |
| Instant | 24 | III |
| Digital | 27 | IV |
| Medium-format digital | 16 | IV |

37 spreads / 72 reading pages: cover, 13 film spreads, 3 medium-format film spreads, 4 instant spreads, 15 digital spreads, colophon. Every photograph appears exactly once in the spread manifest, enforced by a validation assertion. The frame count is derived from that manifest.

The opening red dress echoes the oxblood cover, followed by red accents, street shadows, and monochrome portraits. Later sequences preserve the existing color edit rather than filename order. Instant scans retain their actual borders without additional frames. Digital includes both digital collections with their distinct format captions.

All eight layout types are implemented: cover, chapter opener, landscape across gutter, portrait with stacked pair, full bleed, instant grid, digital editorial, and colophon. The single full-bleed page uses a controlled portrait crop; other images preserve their complete proportions. On mobile, the landscape appears whole on one page with its description on the facing reading page.

## Navigation and performance

Chapter buttons select their first spread. Previous/Next, clickable thumbnails, ArrowLeft/ArrowRight, Home/End are functional, with correct first/last disabled states. Text editing fields and modifier shortcuts are excluded. Active chapters and thumbnails scroll into view after selection and mobile layout changes. The existing G grid toggle remains available.

Desktop/tablet show two pages; mobile shows one 3:4 page and advances by page. Mobile starts on the cover title page and ends at the colophon, skipping blank cover boards. Swipe handling is implemented with horizontal-distance and direction checks; tap controls provide an alternative.

Page changes use a 280ms opacity/position animation, disabled for reduced motion. Current images load eagerly; only neighboring spreads are preloaded at responsive sizes with low priority. Distant thumbnails use existing small derivatives and lazy loading. Originals were neither overwritten nor recompressed.

## Validation

- Production build passed after final edits.
- Lint: zero errors; one existing warning in `scripts/check-no-em-dash.mjs:30`.
- All five department routes return HTTP 200.
- Chapter jumps, previous/next, thumbnail jump, ArrowLeft/ArrowRight, Home/End and endpoint disabled states tested in browser.
- Desktop cover, film opener, landscape and instant compositions visually inspected against the supplied reference. At 1440px the shell has 48px outer spacing, the book is 1120px wide, and each page is 3:4.
- Tablet at 1024px retains the two-page proportions; mobile at 390px shows exactly one page with no horizontal document overflow.
- Selected spread images loaded successfully. A temporary React hot-reload dependency warning occurred during editing; the final clean-tab load and navigation reported no console errors.
- Touch swipe handling is implemented but not verified on physical touch hardware. Keyboard and tap-button alternatives were verified.

## Metadata and limits

Camera bodies, film stocks, locations, image titles and photograph dates are not documented in the source data and are not invented. Captions use verified format/frame identifiers, with existing descriptive alt text. 2026 denotes this requested digital edition, not the photographs' capture dates. The colophon offers print inquiries without claiming print availability. The reference's eight placeholder spreads were expanded to 37 to retain the complete collection. The volume label uses a middle dot to comply with the repository's typography guard.

Preview: http://127.0.0.1:3000/photography
