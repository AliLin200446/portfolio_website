# Photography book V4 review

## Scope and references

Only book internals changed. Global navigation, chapter bar, cover, colophon, two-page proportions, stage sizing, controls, thumbnail navigation, keyboard handling and mobile cursor behavior remain intact. No source photographs were modified.

Primary visual study: the three supplied reference composites. Twelve distinct compositions were inspected: framed cross-gutter landscape; large portrait with stacked details; edge portrait with two detail images; small floating photograph opposite full-page portrait; fashion triptych; full-page figure opposite horizontal image; dark closing spread; narrow centered portrait across the fold; typographic collage beside a large image; offset monochrome/color pairing; mixed-scale portrait sequence with a narrow vertical accent; atmospheric full-width landscape. The related monochrome variant of the centered portrait was not counted as a distinct composition.

Supplementary design descriptions read:

- [Prefix Photo / Underline Studio](https://abduzeedo.com/editorial-design-prefix-photo-underline-studio): alternating image density, borders, and sparse marginal typography.
- [Anders Krisár / Amanda Thomsson](https://www.amandathomsson.com/projects/asymmetric-typography-for-sculpter): asymmetric grids and photography as the primary subject.
- [Arkansas / LOMAXcreative](https://www.lomaxcreative.com/arkansas-case-study): deliberate image scale and quiet captions.

The Behance NYCAHM page returned 403. Several linked reference image endpoints were unavailable. These are not claimed as visually inspected; the supplied composites were the visual source.

## Model

`content/photobook.ts` retains the existing color registry and its photograph order/groups. Each spread contains ID, chapter, layout, photograph IDs, placements, paper backgrounds, page numbers, and a short internal art-direction rationale. A placement includes page, percentage x/y/width/height, scale, contain/cover crop mode, object position, caption and caption orientation. Placement overrides are supported by the spread builder.

Twelve reusable compositions: panorama, floating hero, portrait + diptych, unequal diptych, triptych, contact sheet, dark editorial, image + silence, edge portrait, vertical sequence, offset composition, typographic interlude. Explicit assignments are recorded for every source group. No random or repeating template cycle is used. Geometry fits the intrinsic photograph ratio within its assigned area and reserves a caption register.

| Chapter | Photographs | Spreads |
| --- | ---: | ---: |
| Mono | 26 | 11 |
| Red | 13 | 6 |
| Yellow + Beige | 34 | 16 |
| Green | 14 | 7 |
| Blue | 12 | 6 |
| Mixed | 8 | 4 |
| Cover + colophon | 0 | 2 |
| Total | 107 | 52 |

## Image integrity

All 107 existing photographs occur exactly once and remain in their original color category. No new classification is needed. Existing Mono includes desaturated color pictures, intentionally retained from the prior registry.

Only the ferry cabin photograph `135film-05` uses cover fitting on desktop. Its 2000:1326 ratio closely matches the 3:2 spread, trimming approximately 0.5% of total image width, without cutting faces. It uses contain on mobile. Edge portraits occupy the full page height with their original proportions, retaining narrow side margins rather than trimming subjects. All other images use contain. Original scans and embedded instant-film print edges are preserved.

## QA and artifacts

All 52 spreads were visited, captured and visually inspected using the three review sheets. All active images were checked for successful loading. Adjacent identical layouts, duplicates, omissions and wrong chapter assignments are guarded in the manifest.

Mobile checks covered all twelve layout types at 390 x 844: exactly one visible book page and no horizontal overflow. Cross-gutter photographs are complete on the first mobile page; the facing page carries their existing description. Next, Home and End were exercised. All thumbnail buttons were used during the capture pass. Desktop fit checked at 1440 x 900 and 1920 x 1080. Browser console had no errors.

- Full contact sheet: `artifacts/photobook-v4/contact-sheet.png`
- Individual spreads: `artifacts/photobook-v4/spread-01.png` through `spread-52.png`
- Opener/interlude: 02; image + silence: 03; dark: 04; portrait + diptych: 05; offset: 06; unequal diptych: 07; triptych: 08; vertical sequence: 09; contact sheet: 10; edge portrait: 15; panorama: 21; floating hero: 45.
- Desktop proof: `desktop-1440.png`, `desktop-1920.png`
- Mobile cross-gutter proof: `mobile-panorama.png`
- Full manifest and internal intentions: `manifest.json`

No photographs remain technically blocked or newly require classification. The full contact sheet is available for subjective author review of the sequencing.

## Changed implementation files

- `content/photobook.ts`
- `components/editorial/Photobook.tsx`
- `app/photography/photobook.css`

Preview: http://127.0.0.1:3000/photography

Validation: `npx tsc --noEmit`, production build, and `git diff --check` passed. ESLint reported zero errors and the existing `scripts/check-no-em-dash.mjs:30` unused-expression warning.
