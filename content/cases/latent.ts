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
    kind: "instrument",
    component: "halation",
    caption:
      "the halation comparator, live · drag to change the blur radius",
  },
  what: [
    "If you want to add film texture to AI video, you have three options today: LUTs, filters, or film emulation inside professional color software. The last is hard to learn, complex, and slow.",
    "Latent sits between the cheap filter and the pro plugin. It is a film physics engine that runs in your browser.",
    "You upload your footage. It goes through a pipeline that models real film chemistry. Halation grows out of the clipped highlights already in your frame. Grain refreshes every frame with the statistics of real film. Gate weave shifts the frame the way a real projector does. Nothing is pasted on top.",
  ],
  build: [
    {
      heading: "CLIENT SIDE ONLY",
      body: "The pipeline is six GLSL passes on WebGL2. All of it runs on your GPU. No server. No upload. No API key. Video export uses WebCodecs, also local. Your footage never leaves your machine.",
      body2:
        "That is not only a privacy stance. It means the tool has no running cost, no queue, and no quota. The only limit is your graphics card.",
    },
    {
      heading: "PARAMETERS COME FROM MEASUREMENT, NOT TASTE",
      body: "The CineStill 800T values in the engine are halation threshold 0.55, radius 4.9, tint [1.2, 0.03, 0.03], intensity 1.01. I did not tune those until they looked good. I got them by calibrating against 800T negatives I shot and scanned myself.",
      data: "calibration date 2026-07-10, stored with the source data",
    },
    {
      heading: "IT CAN BE PROVEN WRONG",
      body: "Every parameter points to a source file, which is a measurement of my own film. That means it can be wrong. A tool you cannot check is a toy.",
    },
    {
      heading: "ARCHITECTURE",
      body: "Six passes in a chain: linearize input, halation, grain, color response, gate weave, output encode.",
      figure: {
        kind: "code",
        code: `linearize input
  -> halation
  -> grain
  -> color response
  -> gate weave
  -> output encode`,
        caption:
          "the six-pass chain · WebGL2, all of it on the GPU · NEEDS REDRAWING: this is a placeholder list, not the original diagram",
      },
    },
    {
      heading: "HALATION",
      body: "In physics this is a wide, soft spread of light. A large gaussian blur is too expensive for a real time pipeline. So Latent maps the radius parameter to an iteration count instead.",
      body2:
        "The radius resolves through N = round(radius squared / 4) into N separable gaussian passes. Each pass runs at quarter resolution. Sigma stacks with each pass. Radius 4.9 resolves to 6 passes, which is about sigma 30 in full resolution pixels.",
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
      heading: "GRAIN",
      body: "Generated with a PCG3D hash, refreshed on its own 24fps clock. Even if your footage is 30 or 60 frames per second, the grain still moves at the rate of film, because that is what a projector does.",
      body2:
        "On its own this detail is tiny. Stacked with the others it becomes the thing you cannot name but can feel.",
    },
  ],
  proofLabel: "CALIBRATION",
  proof: {
    intro: [
      "I shot real 800T. Night scenes with clipped light sources. I scanned it. Then I put the scan next to the engine output in a workbench I wrote for this.",
      "I compared one light source parameter by parameter. Is the halo the right size. Is the red shift strong enough. Does the falloff have the same shape. I kept going until the engine matched the scan on every measurable axis.",
      "PROOFREADING. The case page had copy errors from an early draft. Several published parameters and units did not match the real values in the engine. Nothing was visibly broken, so nobody noticed for a long time.",
      "After fixing the copy, I added a build guard. If any public claim drifts from the source code, the build fails. I tested the guard by planting failures on purpose, not by watching one clean run pass.",
      "This changed what I think calibration means. Calibration does not only happen inside the engine. What you say in public has to match what the code says. Otherwise the project is wrong, even if the engine is right.",
    ],
    items: [
      {
        label: "THE WORKBENCH",
        claim:
          "The scan and the engine output sat side by side while I compared one light source parameter by parameter. This is that comparison.",
        figure: {
          kind: "pending",
          note: "WORKBENCH SCREENSHOT · drop the file at public/case-assets/latent/workbench.png",
          caption:
            "the calibration workbench · scan against engine output, one light source at a time",
          pending: "screenshot not supplied yet",
        },
      },
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
  context:
    "AI video output is exploding. But the frames all share one look. Too clean. No optical root.",
  contextParas: [
    "AI video output is exploding. But the frames all share one look. Too clean. No optical root.",
    "At the same time people want film texture more than ever. On one side there is a flood of images with no physical basis. On the other side there is real demand for physical texture. There is no bridge between them.",
    "The current options cannot be that bridge. A LUT cannot model a spatial effect, by design. A filter is a sticker. A pro plugin has a workflow cost. So Latent is not a better filter. It is a new category. A film physics layer that is checkable and runs natively in the browser.",
    "THE MOAT IS IN TWO PLACES. The calibration data: the parameters come from real negatives measured under controlled conditions. That requires film shooting, a scanning chain, and modeling, all in one person. That overlap is small. To copy these numbers you have to go shoot, scan, and measure them yourself.",
    "Verifiability as a position. Every tool in this market says cinematic and film grade. A tool that publishes its calibration date, its source data, and what each parameter actually means is standing somewhere nobody else is standing. The price of standing there is agreeing to be checked, and marketing language exists to avoid being checked.",
    "This position gets more valuable as the market matures. The more your users know, the more it is worth to be checkable.",
    "FOR ME PERSONALLY. Latent is also proof. It proves that four years of editorial photography is not a decorative line on a resume. It is a measuring skill that converts directly into engineering parameters. It proves you can go from seeing that something is wrong, to measuring why it is wrong, to building something that is right.",
    "That path is observe, measure, build, then let the thing be checked. Latent taught me to work that way. It is now how I work on everything.",
  ],
  byline: "Ali Lin, design engineer",
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default latent;
