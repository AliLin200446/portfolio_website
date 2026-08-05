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
    why: "A LUT maps one pixel value to another and cannot see the pixel next to it, but halation is entirely about the neighbourhood. Plugins do this properly, and they are paid, installed, and outside the browser. Latent sits in the gap.",
    how: {
      summary: [
        "Five GL passes on WebGL2, running entirely on the GPU in a browser tab. The order of the passes is not an implementation detail. It is where each step happens on real film.",
      ],
      phases: [
        {
          title: "Phase 1 · The physical mechanism",
          body: [
            "Light passes through the emulsion, hits the back of the film base, reflects, and exposes the layer a second time. The red sensitive layer sits closest to the base, so it catches the most of that returning light. This is why halation appears only around clipped sources, and why it is red.",
            "CineStill 800T is Vision3 500T with the remjet removed. Remjet is the antihalation backing. Strip it so the stock can run C-41, and nothing stops the light from coming back.",
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
            "The pipeline is five GLSL passes on WebGL2. All of it runs on your GPU. No server. No upload. No API key. Video export uses WebCodecs, also local. Your footage never leaves your machine.",
            "That is not only a privacy stance. It means the tool has no running cost, no queue, and no quota. The only limit is your graphics card.",
            "You upload your footage. It goes through a pipeline that models real film chemistry. Halation grows out of the clipped highlights already in your frame. Grain refreshes every frame with the statistics of real film. Gate weave shifts the frame the way a real projector does. Nothing is pasted on top.",
            "Five GL passes: highlight threshold at quarter resolution, a separable gaussian run N times, composite where the halation glow is screened back in linear light, film colour response, then grain. Gate weave is applied where the source is first sampled, so the whole chain sees the same weaved frame. Linearize and encode are not passes. Every shader decodes and re-encodes sRGB inline.",
            "In physics halation is a wide, soft spread of light. A large gaussian blur is too expensive for a real time pipeline. So Latent maps the radius parameter to an iteration count instead. The radius resolves through N = round(radius squared / 4) into N separable gaussian passes. Each pass runs at quarter resolution. Sigma stacks with each pass. Radius 4.9 resolves to 6 passes, which is about sigma 30 in full resolution pixels.",
            "Grain is generated with a PCG3D hash and reseeded on every rendered frame. A fresh noise field each time, so there is no fixed pattern anywhere in the image. A still source still boils, the way film does. Grain is last because it is the developed crystal structure, not an exposure effect.",
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
            "I shot 800T, scanned it, and matched the engine against my own negatives parameter by parameter until halo size, red shift, and falloff all agreed. Threshold 0.55, radius 4.9, intensity 1.01, tint 1.2 / 0.03 / 0.03. Green and blue near zero: real 800T halation is almost pure red, not the warm orange most filters give you.",
            "Then a bug I could not see. MAX_BLUR_ITERATIONS is 24, which caps the effective radius at the square root of 96, about 9.8. Three settings above that produced the same image and my eye could not tell them apart. What caught it was a dark field R minus B metric I wrote to compare frames numerically.",
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
            "PROOFREADING. The case page had copy errors from an early draft. Several published parameters and units did not match the real values in the engine. Nothing was visibly broken, so nobody noticed for a long time.",
            "After fixing the copy, I added a build guard. If any public claim drifts from the source code, the build fails. I tested the guard by planting failures on purpose, not by watching one clean run pass.",
            "This changed what I think calibration means. Calibration does not only happen inside the engine. What you say in public has to match what the code says. Otherwise the project is wrong, even if the engine is right.",
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
  coda: "Latent is also proof. It proves that four years of editorial photography is not a decorative line on a resume. It is a measuring skill that converts directly into engineering parameters. That path is observe, measure, build, then let the thing be checked. It is now how I work on everything.",
  byline: "Ali Lin",
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default latent;
