# Fluid viewport layout audit

## Root causes

Each of the five tab-specific styles capped the shell at 1344px with 48px outer margins. Wide monitors therefore gained gutters rather than usable content width. Generative compositions scaled solely with width; descriptions and controls followed the entire composition. The normal accordion also assumed a 760px stage. Photography used a 1120px-wide book plus 88px stage padding without a viewport-height budget. Projects added 96px intro top padding and width-driven 16:10 media boxes. About had 120px top padding and one long information column. The notice board used width-relative coordinates, so merely widening it also increased its total height.

## Rules

- Five-tab shell: 24px outer margins, no max-width; mobile retains 12px. Typography, logo, borders, navigation and tokens unchanged.
- Generative desktop: title, short description, fullscreen action and group playback controls precede media. Available media height is `max(320px, 100dvh - 340px)`, reserving the existing 72px navigation plus compact title/actions and shell spacing. Each composition converts that height into a different width using its own proportions. The 320px floor avoids tiny media on short windows, where natural scrolling is allowed.
- Le Labo retains the 1.66:1 left/right arrangement and all three clips, but uses contain instead of the former cover crop. Original source pixels remain visible. Parallel Personas and The Score Cried First keep three columns. LOEWE stays a centered portrait. Diesel retains its hero plus 2×2 still strip; a 480px desktop floor preserves readability. Uma Wang's long four-panel composition remains scrollable. Controls stay above all of these. Mobile uses natural dimensions and scrolling.
- Photography: book width is `min(100%, max(320px, 100dvh - 310px) * 1.5)`. The 1.5 ratio comes from two 3:4 pages. Stage padding reduced to 16px; controls and the start of thumbnails fit desktop heights. Thumbnail strip remains contained and horizontally scrollable. Original page imagery/layouts untouched.
- Experiments: at 1200px+, four irregular positions per added row, cards capped at 300px, board height derived from inventory. Tablet retains irregular paired columns; mobile staggered stack. Existing notes, pins and swatches remain.
- Projects: shorter intro padding; media boxes use `clamp(320px,58dvh,680px)` with existing contain images, keeping 35:65 text/media split.
- About: reduced top padding, readable line limits, two information columns at 1600px+.

## Validation

Actual `innerWidth/innerHeight` were read in the resized browser tab at 1920×1080, 1600×900, 1440×900, 1280×800 and 390×844. All five tabs were captured at each size. Generative checks include Diesel, Le Labo and Parallel Personas; Photography includes cover and an interior spread. All checked sizes have no document horizontal overflow. Notice-board card rectangles do not overlap. Generative media use contain, not cover. Desktop group playback controls finish around y=266–290; Photography next/previous controls finish at y=1006, 826, 826 and 726 respectively, inside each viewport, with thumbnail navigation beginning immediately below.

The source composition can still require vertical scrolling: Diesel's supporting stills and Uma Wang's four panels at shorter desktop heights, and all long mobile projects. This is intentional rather than shrinking them into unreadable thumbnails. Existing intentional full-bleed Photography layouts are preserved.

Screenshots: `artifacts/fluid-viewport/`. `before-generative.png` is the original 1920px Le Labo full page; compare with `1920-Le-Labo.png`. `before-photography.png` is the original 1280px capture; compare with `1280-photo-cover.png`. Other named files cover the complete breakpoint matrix.

## Changed files

- app/fluid-viewport.css: scoped shared sizing and page-specific responsive rules.
- components/editorial/TabShell.tsx: loads the responsive stylesheet.
- components/editorial/ExperimentsPanel.tsx: inventory-driven wide-board coordinates and height.
- docs/fluid-viewport.md: diagnosis, rules and validation.

No assets, dependencies, deployment configuration, content ordering or media playback logic changed. No deployment performed.
