import type { CaseData } from "./_schema";

/*
 * LATENT: copy supplied by the author, verbatim.
 *
 * Every parameter here was checked against lib/latent-gl before this
 * rewrite landed: threshold 0.55, radius 4.9, tint [1.2, 0.03, 0.03],
 * intensity 1.01, calibrated 2026-07-10, and N = round(radius^2 / 4)
 * giving 6 passes at about sigma 30 full-res. Zero mismatch. If the
 * engine moves, this file is wrong until it moves with it.
 */
const latent: CaseData = {
  slug: "latent",
  name: "LATENT",
  oneLine: "a film physics engine that runs in your browser",
  meta: {
    type: "film physics engine",
    stack: "WebGL2 / GLSL / WebCodecs",
    year: "2026",
    status: "shipped July 2026",
    live: "https://latentfilm.com",
  },
  claim: [
    "AI video gets light wrong.",
    "The light does not follow optics.",
    "The grain does not follow chemistry.",
  ],
  hero: {
    kind: "video",
    src: "/case-assets/latent/latent-demo.mp4",
    poster: "/case-assets/latent/latent-demo-poster.webp",
    caption:
      "the engine running, 19.5s · click to play",
  },
  sections: {
    what: "AI generated video has film looks. It does not have film physics.",
    why: "Existing filters recolour each pixel on its own, so they cannot spread light the way film does. The tools that can are paid desktop plugins.",
    how: {
      summary: [
        "Five GL passes on WebGL2, on your GPU, in a browser tab. Their order is where each step happens on real film.",
      ],
      phases: [
        {
          title: "Phase 1 · The physical mechanism",
          body: [
            "CineStill 800T halates red because the remjet backing is gone and the red sensitive layer sits closest to the film base.",
          ],
          figure: {
            kind: "image",
            src: "/case-assets/latent/exhibit-01-halation.png",
            caption:
              "halation on a clipped highlight, engine output against the negative it was calibrated to",
            width: 1379,
            height: 844,
            selfCaptioned: true,
            attribution:
              "EXHIBIT 01 · halation measured off my own 800T negatives, not fitted to a curve",
          },
        },
        {
          title: "Phase 2 · The pipeline",
          body: [
            "Five GLSL passes on your GPU. No server, no upload, no API key; export runs locally through WebCodecs.",
            "No running cost, no queue, no quota. The only limit is your graphics card.",
            "Halation grows from clipped highlights in the frame, grain refreshes every frame, gate weave shifts the frame. Nothing is pasted on top.",
            "Radius is an iteration count, not a pixel count: N = round(radius squared / 4) separable passes at quarter resolution.",
            "Grain is a PCG3D hash reseeded every frame, so a still source still boils. It runs last because it is developed crystal structure, not exposure.",
          ],
          /* The two rows the source supports. See the report: a third
             row would mean computing an effective sigma that no file
             states. */
          data: [
            "radius 4.9   |   N 6   |   effective sigma about 30",
            "radius 9.8   |   N 24   |   the MAX_BLUR_ITERATIONS ceiling",
          ],
          figure: {
            kind: "instrument",
            component: "passstack",
            caption:
              "the five passes as six planes · drag to turn the stack, select a pass to isolate it · the source plane carries the gate weave, which is why it is the one thing moving at rest",
          },
        },
        {
          title: "Phase 3 · Calibration, and one thing my eye could not catch",
          body: [
            "I shot and scanned 800T myself and matched the engine to the negatives: threshold 0.55, radius 4.9, intensity 1.01, tint 1.2 / 0.03 / 0.03. Green and blue near zero, so the halo is almost pure red, not the warm orange most filters give you.",
            "Above the 9.8 radius cap, three settings produced the same image and my eye could not tell them apart.",
            "A dark field R minus B metric caught it numerically.",
          ],
          data: ["calibration date 2026-07-10, stored with the source data"],
          figure: {
            kind: "image",
            src: "/case-assets/latent/workbench.webp",
            width: 1952,
            height: 1066,
            caption:
              "the calibration workbench · reference scan on the left, engine output on the right, the parameter panel on the right edge",
            selfCaptioned: true,
            attribution:
              "the workbench · the panel reads threshold 0.55, radius 4.90, intensity 1.01, tint 1.20 / 0.03 / 0.03, the same values this page quotes",
          },
        },
        {
          title: "Phase 4 · Calibrating the claims",
          body: [
            "Published parameters had drifted from the engine, so I added a build guard that fails on any mismatch.",
            "I tested the guard by planting failures on purpose, not by watching one clean run pass.",
          ],
        },
      ],
    },
  },
  proofLabel: "CALIBRATION",
  proof: {
    intro: [
      "Every parameter points to a source file, which is a measurement of my own film. That means it can be wrong. A tool you cannot check is a toy.",
    ],
    items: [
      {
        label: "THE 800T PARAMETER SET",
        claim:
          "halation threshold 0.55, radius 4.9, tint [1.2, 0.03, 0.03], intensity 1.01. Copied word for word from the calibration file, long decimals included, not retyped by hand.",
        source: "lib/latent-gl/stocks.ts, CINESTILL_800T",
      },
      {
        label: "WHAT RADIUS 4.9 ACTUALLY DOES",
        claim:
          "It is a dimensionless step, not a pixel count. N = round(radius squared / 4) resolves it to 6 separable gaussian passes at quarter resolution, about sigma 30 at full resolution.",
        source: "lib/latent-gl/renderer.ts, blur iteration count",
      },
      {
        label: "THE DATE IS PART OF THE CLAIM",
        claim:
          "Calibrated 2026-07-10 against 800T negatives I shot and scanned myself. A parameter set without a date is not a measurement.",
        source: "calibration JSON, stored with the source data",
      },
    ],
    limits: [
      "One stock, calibrated by one person, from one shoot. The method ports to other film stocks; these numbers do not.",
    ],
    },
  coda: "Four years of editorial photography is a measuring skill that converts into engineering parameters. Observe, measure, build, then let the thing be checked.",
  byline: "Ali Lin",
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default latent;
