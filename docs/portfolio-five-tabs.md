# Five-tab Swiss editorial implementation

## Audit and reference decisions

The existing project uses Next.js 15 App Router, React 19, TypeScript, Tailwind, and CSS modules. Phase 01 added scoped editorial tokens and components. The five attached HTML wireframes were inspected before edits, alongside the existing case studies, experiment metadata, photography manifest, and generative components. `CaseStudy.dc.html` exists in Downloads and was inspected in Phase 01. `Main.dc.html` was not found. No other named tab reference files were present in the repository; the supplied attachments served as those references.

The implementation follows the wireframes' 1344px bordered surface, 64px tab bar, compact Projects split, Experiments gallery, dark Generative stage/index, Photography sidebar, and About portrait/facts layout. The written request takes precedence over illustrative reference content: oxblood palette and 2px active underline; FRAMEFIELD and Color Diary as drafts; no invented award, PRESERVE page, employer, film tools, or live interaction. An experiment workbench was added above the gallery to implement the requested selection behavior. Films use a real video player rather than the reference's illustrative reseed controls.

## Routes and components

| Route | Implementation |
| --- | --- |
| `/` | Compact introduction, five-row project index, hover/focus preview, direct case/live links, recruitment footer |
| `/experiments` | Ten-entry experiment manifest, filters, compact selector, large preview, technical details, opt-in live simulator, gallery |
| `/generative` | Nine film collections, 26 original clips, one player, native controls plus keyboard-accessible Play/Pause, cut selector, source artworks and process notes |
| `/photography` | All 107 original photographs, six collection filters, original color-edit filters/order, editorial/contact-sheet views, load more, modal viewer |
| `/about` | Existing biography and full resume content reorganized into introduction, facts/education, experience, capabilities, approach, resume and contact |

New: `TabShell`, `ProjectsPanel`, `ExperimentsPanel`, `FilmPlayer`. Reused/extended: `EditorialHeader`, `BrandMark`, `PhotoSheet`, the photography content manifest and intrinsic dimensions, existing contact links, Next Image/Link, Geist and Spectral. Existing case renderers and legacy generative/bench components remain intact.

## Files changed in this phase

- `app/page.tsx`
- `app/experiments/page.tsx`
- `app/generative/page.tsx`
- `app/photography/page.tsx`
- `app/about/page.tsx`
- `app/layout.tsx` (import shared tab stylesheet)
- `app/tabs.css` (new)
- `components/editorial/EditorialHeader.tsx`
- `components/editorial/TabShell.tsx` (new)
- `components/editorial/ProjectsPanel.tsx` (new)
- `components/editorial/ExperimentsPanel.tsx` (new)
- `components/editorial/FilmPlayer.tsx` (new)
- `components/PhotoSheet.tsx`
- `content/portfolio.ts`
- `content/departments.ts` (new central experiment/film manifest and photography exports)
- `content/biography.ts` (existing resume data extracted intact)
- This report and `artifacts/five-tabs/` screenshots.

Pre-existing user edits, Phase 01 files, deployment configuration, and all original media were preserved. No dependency was added. No files were deployed.

## Existing media reused

Projects: Latent workbench, Vestige hero, Teardown demo poster. FRAMEFIELD and Color Diary use labeled neutral draft previews.

Experiments: Material Memory and Skeletal Silk hero images; Resonance's existing claim-safe experiment image; Tailor's Time preview PNG; RUNS, Cyber I Ching, Aura API, Project Lethe, Consensus Couture, and Vestige thumbnails. Material Memory's real remote simulator loads only after an explicit button press and is unloaded when selection changes or the preview closes. Other experiments link to existing live destinations or case pages; they do not simulate unsupported behavior.

Generative: Diesel Fashion Film and four source artworks, Le Labo, Thread Studies (integrated film plus six studies), LOEWE Perfume, Parallel Personas, The Score Cried First, Nike, Uma Wang, and Still Scenes. All 26 MP4s and their existing posters are referenced in place. No autoplay; selection unmounts the previous video.

Photography: all 33 35mm, 7 medium-format film, 24 instant, 27 digital, and 16 medium-format digital photographs. Original image proportions, descriptions, and color-edit order are retained. Only the first 18 filtered photographs render initially, with 24 more per request. No inferred stock/date/location is displayed.

## Interactions and accessibility

- Actual Next links and pathname-derived `aria-current` keep tabs synchronized with direct navigation and browser back/forward.
- Mobile tab strip scrolls horizontally; active item is revealed on route and width changes.
- 180ms project tint/6px accent edge and arrow movement, with keyboard focus equivalents.
- G/button overlay, 12 desktop columns and 4 mobile columns; pointer-events disabled. Shortcut ignores typing and open dialogs.
- Experiment category filter and compact selector update media, title, description, stack, interaction copy, and available links/controls.
- One native video player; Play/Pause, selection and cuts are keyboard accessible; no multiple-video autoplay.
- Photography filters, contact-sheet mode, previous/next and arrow-key modal navigation, Escape close, background scroll lock, and focus restoration.
- Visible focus styles, touch-sized main controls, reduced-motion rules, lazy below-fold images, and no decorative animation dependencies.

## Validation

- Production build and lint passed. Lint retains one pre-existing unused-expression warning in `scripts/check-no-em-dash.mjs`; zero errors.
- All 173 referenced media paths exist: ten experiment images, 26 film/poster pairs, four source artworks, and 107 photographs.
- All five department routes and all seven existing work routes return HTTP 200 in final checks. A transient Photography 500 during hot recompilation was rechecked successfully after edits settled.
- Desktop at 1440px, tablet at 834px, and mobile at 390px inspected. Mobile Photography overflow was found and fixed by allowing the sidebar/grid to shrink; final checks show no horizontal page overflow.
- Route-derived active state, back/forward, grid toggle, experiment selection/filtering, single-player selection/play/pause, film cuts, photography collection/color filtering, lightbox arrows/Escape/focus return checked.
- Material Memory embedded successfully; its Fold button responded. The external-link fallback remains available.
- A stale Next.js development manifest error appeared during repeated route checks. Restarting the local development server resolved it; the five routes rendered successfully afterward. The production build passed independently.
- Screenshots saved for each desktop route at 1440px and mobile navigation at 390px.

## Missing assets and limits

- No verified self-portrait was found: About has a neutral, labeled portrait placeholder.
- No resume PDF was found: Resume opens the existing content as a web edition.
- FRAMEFIELD and Color Diary have no local case pages or media; both remain drafts without invented routes.
- Tailor's Time has an image only, with no documented stack or live URL.
- Several film collections lack production/tool attribution; they explicitly say “Not documented.” Provisional Latent processing credit was not promoted to a verified claim.
- Existing external URLs are retained; broad third-party uptime and Lighthouse scores are not claimed.
- Project detail content remains in its existing templates; Latent retains the shared editorial header from Phase 01.

Preview: http://127.0.0.1:3000 (existing local development server reused).
