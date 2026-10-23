# Compact Experiments board

The previous wide board reserved 1480px and spaced card bands roughly 440px apart. Replaced those Experiments-only rules with three staggered bands (4 / 4 / 3), per-card positions and 130–210px size tiers. No whole-board scaling. Desktop height is max(660px, 100dvh - 228px), reserving navigation, section heading, footer and outer margins. The 660px floor preserves 12px labels on shorter displays. Decoration occupies unused spaces, including the final band's fourth slot.

| Viewport | Board dimensions | Card widths | Complete cards above fold |
|---|---|---|---|
| 1920×1080 | 1870×852 | 150–210px | 11 / 11 |
| 1600×900 | 1550×672 | 130–180px | 11 / 11 |
| 1440×900 | 1390×672 | 130–180px | 11 / 11 |
| 1280×800 | 1215×660 | 130–180px | 11 / 11 |
| 900×1000 | 835×2070 | 190px | 4 / 11 |
| 390×844 | 349×1519 | 156px | 3 / 11 |

At 1280×800 the board's bottom and footer require about 90px of scrolling, but all project cards fit within the initial viewport. Tablet uses two staggered columns with natural scrolling; mobile uses two columns at 360px+ and a single column below that. No horizontal overflow or clipping was found. All eleven cards and ten original thumbnail assets remain; Coodie retains its existing typography. Cards and decoration were checked for rectangle intersections, and the narrow-desktop sticky note was moved clear. Keyboard J navigation gives visible focus. All eleven links returned HTTP 200 with a browser User-Agent.

Changed files:
- components/editorial/ExperimentsPanel.tsx: compact placement/size variables and dynamic tablet row count.
- app/experiments/notice-board.css: viewport sizing, card tiers, decorative placement and responsive rules.
- app/fluid-viewport.css: removed only its obsolete Experiments-specific wide-board block. Other tabs unchanged.
- docs/compact-experiments.md: validation report.

TypeScript and production build passed. Lint: zero errors, one existing warning in scripts/check-no-em-dash.mjs. Browser console had no errors. Screenshots are in artifacts/compact-experiments/. No assets, links, ordering, shared navigation, or deployment settings changed. No deployment.
