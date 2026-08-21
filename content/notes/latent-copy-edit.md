# LATENT case page: all visitor-facing text

Edit the lines below and hand this back. Keep the `[ID]` markers on
their own line above each block; that is how each string maps back to
its file. Everything is exactly as it ships today, so a diff is
meaningful.

Three files feed this page. Which one a string lives in does not change
what you do here, but it is noted so nothing gets lost:

- **H** = `content/heroes/latent.ts` (the first screen)
- **P** = `components/case/latent/PassBreakdown.tsx` (the five passes)
- **C** = `content/cases/latent.ts` (everything below the passes)

Two notes before you start.

`[H4]` is enforced: a build guard checks the hero's Problem still matches
the case page's WHAT `[C7]`. Change one and the other has to change with
it, or the build fails. That is deliberate.

`[H3]`, `[P2]`, `[C15]` and `[C21]` are **alt text**, read aloud by screen
readers and never seen. They describe the image, not the argument. They
should stay true to what is actually in frame.

---

## 1. HERO, the first screen

[H1] title
Latent

[H2] brief, one line under the title
Latent is a film physics engine that runs in your browser. It models halation and grain the way film does.

[H3] alt text for the workbench still
The Latent calibration workbench: on the left a reference film scan of a tiled subway platform with orange halation blooming off the overhead light, in the centre the engine OUTPUT panel rendering the same kind of scene, and at the right edge the halation control panel, of which only the parameter names are in frame.

[H4] quadrant PROBLEM, must stay in step with [C7]
AI generated video has film looks, not film physics.

[H5] quadrant SOLUTION, three lines max, about 80 characters
Latent models the optics instead, in a browser tab with no server and no upload.

[H6] quadrant METHODS
I shot CineStill 800T, scanned it, and matched the engine. Also, built five GL passes on WebGL2.

[H7] quadrant NEXT STEP
More calibrations by different film stocks.

---

## 2. THE FIVE PASSES

[P1] section heading
Five GL Passes

[P2] alt text for the exploded diagram
An exploded stack of five planes, one per GLSL pass, the first pass at the bottom and the last at the top.

[P3] pass 1 name
Threshold

[P4] pass 1 body
Masks highlights with a smoothstep on gamma-space luma, so the threshold tracks perceived brightness.

[P5] pass 2 name
Blur

[P6] pass 2 body
Five texture fetches per direction, run horizontally then vertically as a separable gaussian.

[P7] pass 3 name
Composite

[P8] pass 3 body
Screen blends the tinted glow over the base in linear light, adding energy without hard clipping.

[P9] pass 4 name
Color Response

[P10] pass 4 body
Applies the stock's dye-layer crosstalk matrix, then its characteristic curve.

[P11] pass 5 name
Grain

[P12] pass 5 body
Granularity rises with developed density and saturates, seeded by a pcg3d integer hash.

---

## 3. MASTHEAD

[C1] name
LATENT

[C2] one line under the name
a film physics engine that runs in your browser

[C3] meta, type
film physics engine

[C4] meta, stack
WebGL2 / GLSL / WebCodecs

[C5] meta, status
shipped July 2026

---

## 4. THE CLAIM, three lines, set large

[C6a]
AI video gets light wrong.

[C6b]
The light does not follow optics.

[C6c]
The grain does not follow chemistry.

---

## 5. WHAT / WHY / HOW

[C7] WHAT, must stay in step with [H4]
AI generated video has film looks. It does not have film physics.

[C8] WHY
Existing filters recolour each pixel on its own, so they cannot spread light the way film does. The tools that can are paid desktop plugins.

[C9] HOW, summary
Five GL passes on WebGL2, on your GPU, in a browser tab. Their order is where each step happens on real film.

---

## 6. PHASES

[C10] phase 1 title
Phase 1 · The physical mechanism

[C11] phase 1 body
CineStill 800T halates red because the remjet backing is gone and the red sensitive layer sits closest to the film base.

[C12] phase 1 figure caption
halation on a clipped highlight, engine output against the negative it was calibrated to

[C13] phase 1 figure attribution
EXHIBIT 01 · halation measured off my own 800T negatives, not fitted to a curve

[C14] phase 2 title
Phase 2 · The pipeline

[C15a] phase 2 body, paragraph 1
Five GLSL passes on your GPU. No server, no upload, no API key; export runs locally through WebCodecs.

[C15b] phase 2 body, paragraph 2
No running cost, no queue, no quota. The only limit is your graphics card.

[C15c] phase 2 body, paragraph 3
Halation grows from clipped highlights in the frame, grain refreshes every frame, gate weave shifts the frame. Nothing is pasted on top.

[C15d] phase 2 body, paragraph 4
Radius is an iteration count, not a pixel count: N = round(radius squared / 4) separable passes at quarter resolution.

[C15e] phase 2 body, paragraph 5
Grain is a PCG3D hash reseeded every frame, so a still source still boils. It runs last because it is developed crystal structure, not exposure.

[C16a] phase 2 data row 1, mono, alignment by spaces
radius 4.9   |   N 6   |   effective sigma about 30

[C16b] phase 2 data row 2
radius 9.8   |   N 24   |   the MAX_BLUR_ITERATIONS ceiling

[C17] phase 2 figure caption
the five passes as six planes · drag to turn the stack, select a pass to isolate it · the source plane carries the gate weave, which is why it is the one thing moving at rest

[C18] phase 3 title
Phase 3 · Calibration, and one thing my eye could not catch

[C19a] phase 3 body, paragraph 1
I shot and scanned 800T myself and matched the engine to the negatives: threshold 0.55, radius 4.9, intensity 1.01, tint 1.2 / 0.03 / 0.03. Green and blue near zero, so the halo is almost pure red, not the warm orange most filters give you.

[C19b] phase 3 body, paragraph 2
Above the 9.8 radius cap, three settings produced the same image and my eye could not tell them apart.

[C19c] phase 3 body, paragraph 3
A dark field R minus B metric caught it numerically.

[C20] phase 3 data row
calibration date 2026-07-10, stored with the source data

[C21] phase 3 figure caption
the calibration workbench · reference scan on the left, engine output on the right, the parameter panel on the right edge

[C22] phase 3 figure attribution
the workbench · the panel reads threshold 0.55, radius 4.90, intensity 1.01, tint 1.20 / 0.03 / 0.03, the same values this page quotes

[C23] phase 4 title
Phase 4 · Calibrating the claims

[C24a] phase 4 body, paragraph 1
Published parameters had drifted from the engine, so I added a build guard that fails on any mismatch.

[C24b] phase 4 body, paragraph 2
I tested the guard by planting failures on purpose, not by watching one clean run pass.

---

## 7. CALIBRATION, the evidence section

[C25] section label
CALIBRATION

[C26] intro
Every parameter points to a source file, which is a measurement of my own film. That means it can be wrong. A tool you cannot check is a toy.

[C27] item 1 label
THE 800T PARAMETER SET

[C28] item 1 claim
halation threshold 0.55, radius 4.9, tint [1.2, 0.03, 0.03], intensity 1.01. Copied word for word from the calibration file, long decimals included, not retyped by hand.

[C29] item 1 source
lib/latent-gl/stocks.ts, CINESTILL_800T

[C30] item 2 label
WHAT RADIUS 4.9 ACTUALLY DOES

[C31] item 2 claim
It is a dimensionless step, not a pixel count. N = round(radius squared / 4) resolves it to 6 separable gaussian passes at quarter resolution, about sigma 30 at full resolution.

[C32] item 2 source
lib/latent-gl/renderer.ts, blur iteration count

[C33] item 3 label
THE DATE IS PART OF THE CLAIM

[C34] item 3 claim
Calibrated 2026-07-10 against 800T negatives I shot and scanned myself. A parameter set without a date is not a measurement.

[C35] item 3 source
calibration JSON, stored with the source data

---

## 8. LIMITS

[C36]
One stock, calibrated by one person, from one shoot. The method ports to other film stocks; these numbers do not.

---

## 9. CLOSING

[C37] video caption, under the hero video lower on the page
the engine running, 19.5s · click to play

[C38] coda, the last line of the page
Four years of editorial photography is a measuring skill that converts into engineering parameters. Observe, measure, build, then let the thing be checked.

[C39] byline
Ali Lin

[C40] next case link
TEARDOWN № 1

---

## Not included, and why

**The rail description on the home page.** It lives in `lib/bench.ts`,
not on this page, and it was rewritten separately. For reference, it
currently reads: "A film physics engine that gives AI video real
halation and grain, running in a browser tab."

**Chrome shared by all five case pages.** `← Index`, `Ali Lin`,
`CASE STUDY`, `01/05`, `WHAT / WHY / HOW` rail labels, `© 2026 Ali Lin`.
Editing those changes every case page, not just this one, so they are
out of scope here. Say so if you want them and I will pull them
separately.

## Constraints that will be checked when this goes back

- Zero CJK and zero em dashes in shipped copy. Use `·` if you want a
  separator; the middle dot is already used throughout.
- Every number here was verified against `lib/latent-gl` when the page
  was written: threshold 0.55, radius 4.9, tint [1.2, 0.03, 0.03],
  intensity 1.01, calibrated 2026-07-10, N = round(radius squared / 4)
  giving 6 passes at about sigma 30. If you change a figure, say so
  explicitly and I will re-check it against the engine rather than
  assume the new one is right.
- `[H5]` has a hard three-line cap at 1440. About 80 characters.
- `[C16a]`, `[C16b]` and `[C20]` render in mono. Runs of spaces collapse
  there, so the `|` separators are doing the alignment, not the spacing.
