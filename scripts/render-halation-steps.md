# Halation step frames: how they were generated

The five frames in `public/case-assets/latent/halation/` are engine
output, not stills of a screen. They are evidence on the Latent case
page, so the procedure is recorded here rather than left in someone's
shell history.

## Source

`latent/800Tfilm_ref/3ee69a8f848b78a5b5e3a083bea14f93.jpg`, a 2376x3584
CineStill 800T scan. Crop C, `extract({left:0, top:250, width:2376,
height:1188})`, resized to 1920x960. Two clipped ceiling tubes across a
dark field: clipping 12.58 percent of area, mean luma 70.

## Engine

`lib/latent-gl/renderer.ts`, driven in a real browser because it needs a
GL context. A temporary route mounted `LatentRenderer` on a 1920x960
canvas, called `setImage()` on the crop, then per step set
`params.radius`, called `renderExportFrame()`, waited one rAF, and
posted `canvas.toDataURL("image/png")` to a temporary API route that
wrote the bytes to disk. Both routes were deleted afterwards; nothing
was screenshotted, so no display colour management or browser zoom is
baked in.

Every parameter other than radius stayed at the CINESTILL_800T
calibration: threshold 0.55, tint [1.2, 0.03, 0.03], intensity 1.01.

## Why these five steps

`MAX_BLUR_ITERATIONS = 24` and `N = round(radius^2 / 4)`, so radius
saturates at sqrt(96) which is about 9.8. A first attempt used 4.9, 9,
14, 20 and 28; the last three all clamped to N = 24 and rendered
identically, which a file hash does NOT catch, because the grain pass
reseeds from `u_frame` every frame and changes the hash regardless.

The steps below each resolve to a different iteration count:

| radius | N  | dark-field mean R-B |
|--------|----|---------------------|
| 4.9    | 6  | 14.40  (calibrated) |
| 6.3    | 10 | 17.10               |
| 7.7    | 15 | 19.89               |
| 8.8    | 19 | 21.83               |
| 9.8    | 24 | 23.97  (engine max) |

Dark-field mean R-B is the verification metric: mean of (R - B) over
pixels whose luma in the SOURCE is below 60, so it measures red spill
into the dark field and is immune to grain reseeding. It rises
monotonically, which is what proves the radius actually took effect.

## Output

webp q80 at 1920 wide: 141, 117, 112, 117, 117 KB, plus the untouched
scan at 276 KB for the before side. 879 KB for all six.
