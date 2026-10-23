# Projects V3.1

Implemented the supplied expanded HTML reference on `/` only. Other departments, shared components, existing media and deployment configuration were preserved. No deployment.

## Changed files

- `app/page.tsx`: Projects-only shell class and stylesheet.
- `app/projects-expanded.css`: scoped palette, 72px header/hero, 52px jump index, 35/65 bands, responsive layouts, hover/focus and reduced-motion behavior.
- `components/editorial/ProjectsPanel.tsx`: replaced compact table/preview with five semantic project bands and jump links. Reuses Next Image/Link and existing TabShell/EditorialHeader/footer.
- `content/projects-expanded.ts`: centralized copy, metadata, destinations and media.
- This report and `artifacts/projects-v31/` screenshots.

## Assets and content

| Project | Existing asset | Status |
| --- | --- | --- |
| Latent | `/case-assets/latent/workbench.webp` | Live; calibration workbench used instead of outdated demo recording |
| FRAMEFIELD | None found | In progress; neutral media panel and notes disclosure |
| Color Diary | None found | In progress; neutral media panel and notes disclosure |
| Vestige | `/case-assets/vestige/hero-front.webp` | Live demo landing page reachable |
| Teardown №1 | `/case-assets/teardown/teardown-demo-poster.webp` | Live |

Images preserve their proportions with contain sizing in 16:10 panels and lazy loading. No large files copied or new imagery generated. FRAMEFIELD/Color Diary stack and unpublished notes are explicitly unavailable. Other stacks come from the existing case metadata; no performance results were added.

## Verification

- Build passes; lint has zero errors and one pre-existing warning in `scripts/check-no-em-dash.mjs:30`.
- Projects, all four other departments, `/work/latent`, `/work/vestige`, `/work/teardown`, and `/work/cacu` return HTTP 200.
- `https://latentfilm.com`, `https://vestige.alilinlab.com`, and `https://teardown.alilinlab.com` return HTTP 200. Vestige renders its secure-link onboarding in the browser; privacy consent was not submitted, so the downstream binding flow is not claimed as tested.
- Existing email, web resume, GitHub, X and LinkedIn destinations preserved. External social-account availability was not independently tested.
- All five project sections and anchors present. Desktop keyboard jump and mobile click jump checked; mobile offset corrected for the two-row sticky navigation (137px header / target at 148px).
- G toggles the existing grid. Keyboard Enter opens the native notes disclosure. Focus and reduced-motion rules included.
- All three project images loaded successfully; browser reported no console errors during checks.
- Desktop 1440, tablet 1024 and mobile 390 inspected; tablet/mobile have no horizontal page overflow. Mobile tabs and project index scroll independently.
- Desktop compared against the supplied HTML's dimensions: 48px canvas spacing, 72px heading, split hero, 52px index, 40px band padding, 44px titles, 35/65 columns, square 44px CTAs. Actual images replace illustrative reference placeholders. Mobile stacks content above media.

Screenshots: `artifacts/projects-v31/desktop-1440.jpg`, `tablet-1024.jpg`, `mobile-390.jpg`.

Local preview: http://127.0.0.1:3000/
