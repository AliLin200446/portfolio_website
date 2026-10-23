# Generative composition restoration

Source of truth: existing `app/generative` components and their CSS modules, checked against Git history. No second screenshot was attached to this request. Le Labo's supplied diagram agrees with commit `412c7b6` and the current original component.

| Project / original component | Visible media and order | Original layout, spacing and playback |
|---|---|---|
| Diesel / FashionFilm.tsx | film.mp4 (1618×1080), then gs1–gs4.jpg | Full-width natural-ratio film; 2-column still strip, 24px gap, 48px above strip (mobile 12px horizontal gap). Muted loop, visibility/reduced-motion gating, optional sound. |
| Thread Studies / ThreadStudies.tsx | integrated.mp4 (1920×1052) | One full-width integrated film. Commit 6bc665e explicitly replaced the former six-video grid. Group readiness gate, muted loop. Six archive cuts remain on disk, outside the restored composition. |
| LOEWE / LoeweFilm.tsx | film.mp4 (1080×1920) | Centered natural portrait, max-width 480px. Muted loop with readiness/visibility gating. |
| Le Labo / LelaboStudies.tsx | 03 (720×898), 02 (720×902), 01 (960×1440) | Square spread, 1.66fr:1fr columns, 24px gap. 03 spans left rows, 02 right top, 01 right bottom. Original CSS explicitly crops with object-fit:cover; retained only for this composition. Mobile source order 03→02→01, natural ratios, 28px row gap. Independent muted loops. |
| Parallel Personas / ParallelPersonas.tsx | 1→2→3.mp4 (all 720×1280) | Three equal columns, 24px gap; original grouped canplay gate and common-time start. Mobile now stacks at 639px per request rather than keeping tiny columns. |
| The Score Cried First / TheScoreCriedFirst.tsx | 1→2→3.mp4 (all 960×1430) | Three equal columns, 24px gap, natural ratios. Original independent muted autoplay; now lifecycle guarded. Fourth archive cut remains on disk but is not in the original composition. Mobile stacks per request. |
| Nike / NikeFilm.tsx | film.mp4 (1920×1080) | Full-width natural landscape, muted loop, sound control, visibility/reduced-motion gating. |
| Uma Wang / UmaWang.tsx | 01 (1088×800), 04 (864×1268), 02 (1280×854), 03 (1280×854) | Opening centered max720; middle portrait/detail at 1.15fr:1fr, 64px row/48px column gap; closing centered max720. Portrait max480; mobile width82%, 40px row gaps. Independent visible muted loops. Uses current four-panel source, preserving existing uncommitted updates. |
| Still Scenes / StillScenes.tsx | 01→02.mp4 (1280×720 each) | Two centered stacked landscapes, max720, 32px gap. Independent muted loops. |

Implementation reuses original layout CSS modules, with a shared native-video lifecycle controller. Original page section margins/headings are replaced by the existing accordion's title/metadata shell. No original video files changed. Every active composition mounts all of its videos together; inactive projects only mount thumbnails. Parallel Personas alone gets the original common-time start. Others start when ready without seeking into synchronization. Hidden page, offscreen composition, reduced motion, switching, and unmount pause the players. Autoplay is muted and native timelines never enabled. Fullscreen mounts the same complete composition and restores saved clip positions.

Source duration captions are omitted rather than duplicating stale duration metadata. All nine original layouts were recovered. The multi-film registry retains archive clips but does not render them as selectable studies.
