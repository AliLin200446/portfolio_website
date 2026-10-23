# Experiments inventory restoration

Audited `content/experiments.ts`, `content/departments.ts`, `content/portfolio.ts`, `content/projects-expanded.ts`, `components/ExperimentsIndex.tsx`, existing case routes, public asset directories, and the full Git history of the experiments registry. Current count: 11. All listed live URLs returned HTTP 200 during this audit; Coodie required a browser User-Agent (the default Python client received HTTP 403).

| Project | Source found | Original media (under public/) | Live URL | Status |
|---|---|---|---|---|
| Skeletal Silk | content/departments.ts; content/portfolio.ts | case-assets/skeletal-silk/hero-front.webp | https://skeletal-silk.alilinlab.com | Already present |
| Material Memory | content/experiments.ts; ExperimentsIndex.tsx | experiments/material-memory.webp | https://material-memory.alilinlab.com | Already present; Material Simulator is not a separate verified project |
| Cyber I Ching | content/experiments.ts | experiments/cyber-i-ching.webp | https://iching.alilinlab.com/ | Already present |
| Resonance | content/experiments.ts; content/departments.ts | experiments/resonance.webp | https://resonance.alilinlab.com | Already present |
| Coodie | existing notice-board registry and supplied reference | No original image recovered; existing typographic poster retained | https://coodie.ai | Already present; original media and experimental classification remain unverified |
| arua-api | Aura API entry in content/experiments.ts | experiments/aura-api.webp | https://arua-api.alilinlab.com | Already present; existing public spelling retained |
| Tailor's Time | components/ExperimentsIndex.tsx; user-supplied URL/type | experiments/tailors-time/preview.png | https://tailorstime.alilinlab.com | Restored; WebGL clock |
| RUNS | content/experiments.ts; commit b47a3cd | experiments/runs.webp | https://runs.alilinlab.com/ | Restored; interactive motion study |
| Project Lethe | content/experiments.ts; commit 6a78cbb | experiments/project-lethe.webp | https://lethe-river.alilinlab.com/ | Restored; interactive ritual |
| Consensus Couture | content/experiments.ts; commit 6a68199 | experiments/consensus-couture.webp | https://consensus-couture.alilinlab.com/ | Restored; experimental voting interface |
| Vestige | content/experiments.ts; commits 9cb7aa2 and 8ff71c1; content/cases/vestige.ts | experiments/vestige.webp | https://vestige.alilinlab.com | Restored; explicitly moved into Experiments by old portfolio history; not in current Projects |

Original descriptions of newly restored entries are retained in the registry, imported from existing data where possible. Tailor's Time's description comes from ExperimentsIndex.tsx. No dates or claims were added. All existing case routes remain available, including Vestige, Material Memory and Resonance.

## Exclusions and uncertainty

- THE BENCH: explicitly excluded by user; source and assets preserved.
- Latent, Teardown, Preserve, FRAMEFIELD: assigned to current Projects; not duplicated.
- All nine generative film projects: assigned to Generative; not duplicated.
- Color Diary: draft without an image, demo or usable presentation; not added.
- CACU Clinic: clinical product case study, not primarily an interactive-art/creative-coding experiment; not added.
- ACUBOT archive: unpublished/confidential entry, not a usable public experiment; not added.
- Photography: remains in its own tab.
- Material Simulator / Material Memory and Tailor's Clock / Tailor's Time: no evidence of separate projects; not duplicated.
- Coodie: retained as instructed, but original thumbnail and a repository-backed description/classification are missing.
- Aura API's old description is marked DRAFT in its source. No new public description was invented.
- Site shaders and bench geometry components are portfolio implementation assets, not independently presented experiments.

## Files changed

- content/experiment-board.ts: append verified inventory, preserve first six numbers, derive added positions and board height.
- components/editorial/ExperimentsPanel.tsx: width-relative positioning and dynamic board dimensions; both counts still derive from registry.
- app/experiments/notice-board.css: extend physical board downward; irregular two-column tablet reflow and staggered mobile cards.
- docs/experiments-inventory.md: audit and exclusions.

No original assets, other tabs, shared navigation, or deployment configuration changed.

Validation: production build and TypeScript passed. Lint: zero errors, one existing warning in scripts/check-no-em-dash.mjs. Browser checks at 1440px, 900px and 390px found 11 cards, all ten image assets loaded, no card collisions, no horizontal overflow, and all cards within board bounds. No console errors. Screenshots saved in artifacts/experiments-complete/.
