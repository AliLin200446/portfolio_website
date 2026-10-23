# Portfolio V3, Phase 01

## Scope and audit

Implemented in the existing Next.js 15 / React 19 / TypeScript repository. The Desktop workspace path is a symlink to `/Users/alilin/Applications/portfolio`.

The existing homepage mounted a React Three Fiber bench through HomeShell. The new homepage is server-rendered editorial content with a small client header. Existing bench components, assets, project content, and unrelated uncommitted edits are preserved. No dependencies or deployment configuration changed. The supplied CaseStudy.dc.html informed borders, color, spacing, and navigation; its unresolved placeholders and illustrative claims were not imported.

Existing reusable pieces: Geist Sans, Geist Mono, Spectral, Next Image/Link, shared CaseHero/CaseTemplate, Latent's interactive pipeline and calibration figures, photography archive, and experiment metadata. The new visual system is scoped to the homepage and Latent.

## Project and media inventory

| Project | Preserved destination | Existing media / decision |
| --- | --- | --- |
| Latent | /work/latent; https://latentfilm.com | Workbench WebP, demo MP4/poster, halation variants, two exhibit PNGs. Feature uses workbench in full aspect ratio: strongest documented calibration overview. Existing source warns the video requires re-recording. |
| Material Memory | /work/material-memory | Hero front, motion WebP/still, experiment thumbnail. Use existing thumbnail for square lab crop. This is the existing Material Simulator. |
| Vestige | /work/vestige | Hero front and experiment thumbnail. Selected project row retains its actual name and route. |
| Skeletal Silk | /work/skeletal-silk | Hero front WebP and raw response JSON. Existing hero represents its shader material in the lab. |
| Teardown | /work/teardown | Demo MP4/poster and interactive findings. Linked beneath selected work. |
| Resonance | /work/resonance | Existing experiment WebP and work poster. Use the experiment image already cropped to avoid superseded claims. |
| CACU | /work/cacu | Homepage screenshot, existing client project content. Linked beneath selected work. |
| RUNS | https://runs.alilinlab.com/ | Existing portrait/composition thumbnail used for the fourth lab entry. |
| Cyber I Ching | https://iching.alilinlab.com/ | Existing experiment WebP; remains in /experiments. |
| Aura API | https://arua-api.alilinlab.com/ | Existing experiment WebP; original spelling and draft metadata preserved in /experiments. |
| Project Lethe | https://lethe-river.alilinlab.com/ | Existing experiment WebP; remains in /experiments. |
| Consensus Couture | https://consensus-couture.alilinlab.com/ | Existing experiment WebP; remains in /experiments. |
| FRAMEFIELD / Color Diary | No routes | Brief-supplied descriptions displayed as clearly marked, unlinked drafts. |

The /generative archive retains Fashion Film, Thread Studies, Parallel Personas, Still Scenes, Le Labo, LOEWE, Nike, The Score Cried First, and Uma Wang with existing JPG/MP4 media. The /photography archive retains 135, 120, instant, digital, and medium-format digital media. Homepage selections: 135 frames 01 and 11, 120 frame 03. Their complementary lighting and portrait compositions connect observational photography with imaging. Captions name only known formats and frame numbers; no unsupported film stock, location, or date attribution.

## Files and components

- `app/page.tsx`: mount EditorialHome.
- `components/editorial/EditorialHome.tsx`: sections S01–S07; local SectionLabel helper.
- `components/editorial/EditorialHeader.tsx`: wireframe, New York clock, grid control, native details navigation, case breadcrumbs.
- `content/portfolio.ts`: central project, media, photography, and contact data.
- `app/editorial.css`: scoped tokens, responsive layout, focus/hover/reduced-motion rules.
- `app/layout.tsx`: load editorial CSS and real Spectral italic; existing SEO metadata retained.
- `app/work/[slug]/page.tsx`: wrap only Latent in editorial chrome; preserve renderer/content.
- `eslint.config.mjs`: ignore existing `.next-build` generated output, matching the repository's existing separate production build directory.
- `artifacts/phase-01`: review screenshots.

## Interactions and loading

- Project hover/focus: 6px oxblood indicator, tint, arrow translation, 180ms transitions.
- G or button toggles pointer-transparent 12-column overlay; four columns on mobile. Keyboard shortcut ignores typing and modifier combinations.
- Menu works with native keyboard controls; Escape closes and restores summary focus; outside click closes.
- Smooth section links and restrained image scaling, with reduced-motion overrides.
- Below-fold images use Next Image lazy loading and responsive sizes. No new videos autoplay, media copies, or fabricated comparisons.
- Resume links to the existing About resume section. Existing GitHub, X, LinkedIn, and email destinations retained.

## Validation

- Production build passed, including content guards, type checking, and all 15 static pages. Homepage route is 1.65 kB / 113 kB first-load JS in the build report.
- ESLint passed with zero errors and one pre-existing unused-expression warning in `scripts/check-no-em-dash.mjs`. Initial lint picked up generated `.next-build` output; ignore fixed.
- HTTP 200: homepage, all seven work routes, About, Experiments, Generative, Photography.
- Browser checks at 1440, 834, and 390 CSS pixels: no horizontal overflow. Latent also checked at 390px.
- All eight homepage images loaded. No browser console errors observed. Next Image emitted a development LCP advisory when the entire page fit in an unusually large zoomed-out preview; the feature is below fold at intended desktop/mobile dimensions.
- Grid click and G toggle confirmed; menu Enter/Escape confirmed; homepage-to-Latent navigation confirmed; keyboard focus and anchor navigation inspected.
- Screenshots: desktop 1440px, mobile 390px, full desktop page. Preview browser's origin-specific zoom issue was isolated by using 127.0.0.1.

## Limitations / next phase

FRAMEFIELD and Color Diary need real project content. The supplied attachment is a case-study wireframe; a separate homepage reference was not supplied, so the perspective header interprets the written brief. No authenticated film before/after pair is asserted. Other case studies retain their previous design. No Lighthouse score or performance benchmark is claimed. External destination availability was not re-audited. No deployment performed.

Local preview: http://127.0.0.1:3000 (existing development server reused).
