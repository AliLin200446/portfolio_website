import type { CaseData } from "./_schema";

/*
 * SKELETAL SILK — copy supplied by the author, verbatim.
 *
 * FACT GUARD: there is ONE fixed GLSL shader, driven by per-input
 * uniforms. An earlier draft said the tool authors new shader code for
 * each input. It does not, and that wording must never return in any
 * form. Nothing here may describe the shader as being written,
 * synthesised, or otherwise brought into existence by the model; the
 * model writes uniforms, never GLSL. The claim that carries weight is
 * the mapping from an unbounded vision-model reading to four bounded
 * numbers — the source is public, so the copy has to survive being
 * read against it.
 *
 * The tested-on figure carries only readings the author supplied as
 * real. The remaining materials render a PENDING chip rather than
 * plausible-looking values.
 */
const skeletalSilk: CaseData = {
  slug: "skeletal-silk",
  name: "SKELETAL SILK",
  oneLine:
    "a vision model reads a fabric photo into four numbers that drive a material shader — live, and exportable",
  meta: {
    type: "material tool",
    stack: "Claude Vision / GLSL / Three.js",
    year: "2026",
    status: "live",
    live: "https://skeletal-silk.alilinlab.com",
  },
  claim: "A vision model can describe silk. This makes it drive one.",
  hero: {
    kind: "live",
    url: "https://skeletal-silk.alilinlab.com",
    caption:
      "upload a material · Claude Vision reads four properties · they drive the shader in real time — try it",
  },
  what: [
    "A technical artist who wants a specific material — a real fabric's exact drape and sheen — either hand-tunes shader parameters or settles for a preset. Skeletal Silk is a third path: photograph the material, and a vision model reads it into the numbers that drive the shader.",
    "The hard part isn't the render. A vision model's native output is language — descriptive, unbounded, useless as a shader input on its own. The design problem is turning that reading into four bounded numbers a GLSL material can actually consume in real time.",
  ],
  build: [
    {
      heading: "FOUR NUMBERS, NOT A DESCRIPTION",
      body: "The model isn't asked to describe the fabric. It's constrained to measure it — rigidity, flow, specularity, colour — and return four bounded values, not prose. That constraint is the work: a paragraph can't drive a shader, four numbers can. The mapping from an open-ended vision output to a fixed parameter set is the tool's core.",
      figure: {
        kind: "code",
        lang: "json",
        code: `{ "rigidity": 0.75, "flow": 0.35,
  "specularity": …, "colour": … }

  rigidity     →  uRigidity
  flow         →  uFlow
  specularity  →  uSpecularity
  colour       →  uColour

  one shader · four uniforms · updated per read`,
        caption:
          "the model's reading, wired straight to the shader's uniforms",
        pending: "specularity and colour values from a live read",
      },
    },
    {
      heading: "ONE SHADER, DRIVEN LIVE",
      body: "The four numbers feed a single GLSL material shader as uniforms — rigidity, flow, specularity, colour drive its behaviour in real time. Two different photos don't produce two shaders; they drive the same shader to two genuinely different materials. The read is what changes: a forest photo and a fabric close-up return rigidity 0.20 and 0.75, flow 0.90 and 0.35, and the material responds accordingly.",
      figure: {
        kind: "code",
        code: `INPUT             RIGIDITY   FLOW
forest photo        0.20      0.90
fabric close-up     0.75      0.35

same shader, both times — only the uniforms differ`,
        caption:
          "tested on · two inputs, two readings, one shader",
        pending: "further tested-on materials and their detected values",
      },
    },
  ],
  proof: {
    items: [
      {
        claim:
          "IT READS, IT DOESN'T MATCH TO A PRESET. Different photos return different parameter sets — the model interprets the image rather than snapping it to a fixed library entry. The four numbers, and the resulting material, are exportable: you take the shader and its parameters, not a screenshot.",
      },
      {
        claim:
          "IT KNOWS ITS EDGE. The tool assumes the input is a material — it reads properties, it doesn't verify the photo is fabric. Hand it a forest and it reads a material out of it anyway. Stated plainly on the tool, because the honest boundary is what separates a tool from a demo.",
      },
    ],
    limits: [
      "Four properties, one shader, best on woven textiles. It doesn't segment the image, doesn't handle multi-material inputs, and assumes what you give it is a material to begin with.",
    ],
  },
  context:
    "Skeletal Silk is the portfolio's one tool rather than one instrument. Latent and Teardown measure; Vestige proves; this one is meant to be used. The through-line is the same — take an AI capability and make it controllable — but here the control is the point: a vision model's loose reading, pinned to four numbers you can drive and carry away.",
  byline: "Ali Lin, design engineer",
  cta: {
    label: "the case is the tool → try it",
    href: "https://skeletal-silk.alilinlab.com",
  },
  prev: { label: "VESTIGE", href: "/work/vestige" },
  next: { label: "LATENT", href: "/work/latent" },
};
export default skeletalSilk;
