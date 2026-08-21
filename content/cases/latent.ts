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
    what: "A film physics engine that gives AI video real halation and grain, running in a browser tab.",
    who: "AI artists who want film quality. Prompting \"35mm CineStill 800T\" does not produce it.",
    why: [
      "A LUT maps one pixel value to another and cannot see the pixel next to it. Halation is entirely about the neighbourhood.",
      "Plugins like Dehancer model it properly, but they sit outside the browser and break the generation loop. Latent runs in the tab you are already in.",
    ],
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
          title: "Phase 2 · Five GL Passes",
          body: [],
          figure: {
            kind: "instrument",
            component: "passes",
            caption:
              "the five passes in order, first to last \u00b7 hover a row to isolate its plane in the stack",
          },
        },
      ],
    },
    /* Was "Phase 3 · Calibration, and one thing my eye could not catch",
     * folded inside HOW. It is its own section now, under its own label,
     * and the phase title is gone because the label replaced it. The
     * body, the calibration date and the workbench figure are unchanged. */
    calibration: {
      label: "CALIBRATION",
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
          "the calibration workbench \u00b7 reference scan on the left, engine output on the right, the parameter panel on the right edge",
        selfCaptioned: true,
        attribution:
          "the workbench \u00b7 the panel reads threshold 0.55, radius 4.90, intensity 1.01, tint 1.20 / 0.03 / 0.03, the same values this page quotes",
      },
    },
  },
  byline: "Ali Lin",
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default latent;
