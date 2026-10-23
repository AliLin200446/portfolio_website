# Generative V3.3 implementation

Existing column frame and shared navigation retained. Nine projects, two pages: 01–05 and 06–09 with an empty fifth desktop slot. All assets reused in place; no media duplication or dependencies added.

## Registry and media

### 01 Diesel Fashion Film

- Primary: `/generative/fashion-film/film.mp4`
- Poster: `/generative/fashion-film/poster.jpg`
- Supporting clips: None

### 02 Thread Studies

- Primary: `/generative/thread-studies/integrated.mp4`
- Poster: `/generative/thread-studies/integrated.jpg`
- Supporting clips: `/generative/thread-studies/1.mp4` (poster `/generative/thread-studies/1.jpg`), `/generative/thread-studies/2.mp4` (poster `/generative/thread-studies/2.jpg`), `/generative/thread-studies/3.mp4` (poster `/generative/thread-studies/3.jpg`), `/generative/thread-studies/4.mp4` (poster `/generative/thread-studies/4.jpg`), `/generative/thread-studies/5.mp4` (poster `/generative/thread-studies/5.jpg`), `/generative/thread-studies/6.mp4` (poster `/generative/thread-studies/6.jpg`)

### 03 LOEWE Perfume

- Primary: `/generative/loewe/film.mp4`
- Poster: `/generative/loewe/film.jpg`
- Supporting clips: None

### 04 Le Labo

- Primary: `/generative/lelabo/01.mp4`
- Poster: `/generative/lelabo/01.jpg`
- Supporting clips: `/generative/lelabo/02.mp4` (poster `/generative/lelabo/02.jpg`), `/generative/lelabo/03.mp4` (poster `/generative/lelabo/03.jpg`)

### 05 Parallel Personas

- Primary: `/generative/parallel-personas/1.mp4`
- Poster: `/generative/parallel-personas/1.jpg`
- Supporting clips: `/generative/parallel-personas/2.mp4` (poster `/generative/parallel-personas/2.jpg`), `/generative/parallel-personas/3.mp4` (poster `/generative/parallel-personas/3.jpg`)

### 06 The Score Cried First

- Primary: `/generative/the-score-cried-first/1.mp4`
- Poster: `/generative/the-score-cried-first/1.jpg`
- Supporting clips: `/generative/the-score-cried-first/2.mp4` (poster `/generative/the-score-cried-first/2.jpg`), `/generative/the-score-cried-first/3.mp4` (poster `/generative/the-score-cried-first/3.jpg`), `/generative/the-score-cried-first/4.mp4` (poster `/generative/the-score-cried-first/4.jpg`)

### 07 Nike

- Primary: `/generative/nike/film.mp4`
- Poster: `/generative/nike/poster.jpg`
- Supporting clips: None

### 08 Uma Wang

- Primary: `/generative/uma-wang/01.mp4`
- Poster: `/generative/uma-wang/01.jpg`
- Supporting clips: `/generative/uma-wang/04.mp4` (poster `/generative/uma-wang/04.jpg`), `/generative/uma-wang/02.mp4` (poster `/generative/uma-wang/02.jpg`), `/generative/uma-wang/03.mp4` (poster `/generative/uma-wang/03.jpg`)

### 09 Still Scenes

- Primary: `/generative/still-scenes/01.mp4`
- Poster: `/generative/still-scenes/01.jpg`
- Supporting clips: `/generative/still-scenes/02.mp4` (poster `/generative/still-scenes/02.jpg`)

## Adaptation

All projects use the same dynamically imported native video adapter. Resting columns show existing posters. Expanded panels and full-screen views mount only the selected clip. Cleanup saves time, mute, volume and intended playback state; removes listeners and observers; pauses and releases the video source. IntersectionObserver, document visibility and reduced-motion listeners suspend automatic playback. Under reduced motion, native controls still allow explicit playback. Native video sizing handles pixel density; object-fit contain preserves original video aspect ratios while poster thumbnails retain the existing crop. No original film or algorithm was modified.

The existing films export is re-exported through content/departments.ts for compatibility. The procedural generator had no other references and was removed. Dates and production tools remain unverified and are omitted. No invented seeds, counts, model names or credits are displayed. Clip counts come from the registry.

## Changed files

- lib/generative/pieces.ts: central media registry and ordered projects.
- lib/generative/video-adapter.ts: shared video lifecycle.
- components/editorial/GenerativeVideo.tsx: lazy adapter host and playback persistence.
- components/editorial/GenerativeColumns.tsx: registry consumption, clip selection and pagination.
- components/editorial/generative-art.ts: removed unused stand-ins.
- content/departments.ts: compatibility re-exports.
- app/generative/page.tsx: metadata.
- app/generative/columns.css: media containment, player controls, pagination and responsive gallery additions.

## Verification

All 26 clip/poster pairs exist. Browser checked primary playback, supporting-clip selection, rapid switching across all nine projects, zero video elements at rest, one active video after switching, full-screen open/close and playback-position preservation, Escape focus restoration, keyboard pagination, and mobile width without horizontal overflow. No WebGL or audio contexts are created by this implementation. Browser checks are not a long-duration memory profile.

Final production build and explicit TypeScript check pass. Lint reports only the pre-existing warning in scripts/check-no-em-dash.mjs:30. Diff whitespace check passes. Tablet resting state wraps into three columns with no horizontal overflow. Browser console contains no errors in the verification tab. Local preview: http://127.0.0.1:3000/generative. No deployment or deployment-configuration changes.
