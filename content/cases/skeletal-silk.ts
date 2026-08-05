import type { CaseData } from "./_schema";

/*
 * SKELETAL SILK: copy supplied by the author, verbatim.
 *
 * FACT GUARD: there is ONE fixed GLSL shader, driven by per-input
 * uniforms. An earlier draft said the tool authors new shader code for
 * each input. It does not, and that wording must never return in any
 * form. Nothing here may describe the shader as being written,
 * synthesised, or otherwise brought into existence by the model; the
 * model writes uniforms, never GLSL. The claim that carries weight is
 * the mapping from an unbounded vision-model reading to four bounded
 * numbers. The source is public, so the copy has to survive being
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
    "a vision model reads a fabric photo into four numbers that drive a material shader: live, and exportable",
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
      "upload a material · Claude Vision reads four properties · they drive the shader in real time: try it",
  },
  sections: {
    what: "A vision model's native output is language: descriptive, unbounded, useless as a shader input on its own.",
    why: "A technical artist who wants a specific material, a real fabric's exact drape and sheen, either hand-tunes shader parameters or settles for a preset. Skeletal Silk is a third path: photograph the material, and a vision model reads it into the numbers that drive the shader. The hard part isn't the render. The design problem is turning that reading into four bounded material parameters a GLSL material can actually consume in real time.",
    how: {
      summary: [
        "There is one fixed GLSL shader. The model writes uniforms, never GLSL. The mapping from an open-ended vision output to a fixed parameter set is the tool's core.",
      ],
      phases: [
        {
          title: "Phase 1 \u00b7 What the model returns",
          body: [
            "The model isn't asked to describe the fabric. It's constrained to measure it and return four material parameters, one of them a colour triple, not prose. That constraint is the work: a paragraph cannot drive a shader, four material parameters can.",
          ],
          figure: {
            kind: "code",
            lang: "json",
            code: `{ "rigidity": 0.48, "flow": 0.38,
  "specular": 0.12,
  "color": [0.8627450980392157,
            0.8431372549019608,
            0.8823529411764706] }

  rigidity  ->  uRigidity
  flow      ->  uFlow
  specular  ->  uSpecular
  color     ->  uColor

  cotton.jpg, second run, values as returned`,
            caption:
              "the model's reading, wired straight to the shader's uniforms. These are the endpoint's own key names: specular, not specularity, and color as three normalised channels",
            sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
            sourceLabel: "raw-responses.json",
          },
        },
        {
          title: "Phase 2 \u00b7 The pipeline",
          body: [
            "The four parameters feed a single GLSL material shader as uniforms: rigidity, flow, specular and a colour triple drive its behaviour in real time. Two different photos don't produce two shaders; they drive the same shader to two genuinely different materials.",
          ],
        },
        {
          title: "Phase 3 \u00b7 The control",
          body: [
            "The read is what changes: a forest photo and a fabric close-up return rigidity 0.20 and 0.75, flow 0.90 and 0.35, and the material responds accordingly.",
          ],
          figure: {
            kind: "code",
            code: `INPUT      RIGIDITY   FLOW   SPECULAR   COLOR
flat         0.45     0.40     0.15     [0.5882352941176471, 0.5882352941176471, 0.5647058823529412]
cotton       0.48     0.38     0.12     [0.8627450980392157, 0.8431372549019608, 0.8823529411764706]
knit         0.48     0.38     0.12     [0.13725490196078433, 0.13725490196078433, 0.1568627450980392]
brocade      0.78     0.22     0.52     [0.5686274509803921, 0.45098039215686275, 0.37254901960784315]

flat is a neutral grey square, the control, not a material.
cotton and knit differ only in color.`,
            caption: "tested on, second run, values as returned",
            sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
            sourceLabel: "raw-responses.json",
          },
        },
      ],
    },
  },
  what: [
    "A technical artist who wants a specific material, a real fabric's exact drape and sheen, either hand-tunes shader parameters or settles for a preset. Skeletal Silk is a third path: photograph the material, and a vision model reads it into the numbers that drive the shader.",
    "The hard part isn't the render. A vision model's native output is language: descriptive, unbounded, useless as a shader input on its own. The design problem is turning that reading into four bounded material parameters a GLSL material can actually consume in real time.",
  ],
  build: [
    {
      heading: "FOUR PARAMETERS, NOT A DESCRIPTION",
      body: "The model isn't asked to describe the fabric. It's constrained to measure it and return four material parameters, one of them a colour triple, not prose. That constraint is the work: a paragraph cannot drive a shader, four material parameters can. The mapping from an open-ended vision output to a fixed parameter set is the tool's core.",
      figure: {
        kind: "code",
        lang: "json",
        code: `{ "rigidity": 0.48, "flow": 0.38,
  "specular": 0.12,
  "color": [0.8627450980392157,
            0.8431372549019608,
            0.8823529411764706] }

  rigidity  ->  uRigidity
  flow      ->  uFlow
  specular  ->  uSpecular
  color     ->  uColor

  cotton.jpg, second run, values as returned`,
        caption:
          "the model's reading, wired straight to the shader's uniforms. These are the endpoint's own key names: specular, not specularity, and color as three normalised channels",
        sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
        sourceLabel: "raw-responses.json",
      },
    },
    {
      heading: "ONE SHADER, DRIVEN LIVE",
      body: "The four parameters feed a single GLSL material shader as uniforms: rigidity, flow, specular and a colour triple drive its behaviour in real time. Two different photos don't produce two shaders; they drive the same shader to two genuinely different materials. The read is what changes: a forest photo and a fabric close-up return rigidity 0.20 and 0.75, flow 0.90 and 0.35, and the material responds accordingly.",
      figure: {
        kind: "code",
        code: `INPUT      RIGIDITY   FLOW   SPECULAR   COLOR
flat         0.45     0.40     0.15     [0.5882352941176471, 0.5882352941176471, 0.5647058823529412]
cotton       0.48     0.38     0.12     [0.8627450980392157, 0.8431372549019608, 0.8823529411764706]
knit         0.48     0.38     0.12     [0.13725490196078433, 0.13725490196078433, 0.1568627450980392]
brocade      0.78     0.22     0.52     [0.5686274509803921, 0.45098039215686275, 0.37254901960784315]

flat is a neutral grey square, the control, not a material.
cotton and knit differ only in color.`,
        caption: "tested on, second run, values as returned",
        sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
        sourceLabel: "raw-responses.json",
      },
    },
  ],
  proof: {
    items: [
      {
        label: "THE SAME FOUR IMAGES, TWICE",
        claim:
          "Two independent runs, two minutes apart, both at temperature 0. All twelve scalar axes came back identical. So the numbers on this page are not one lucky sample, and the identical cotton and knit rows below are a property of what the tool returns rather than measurement jitter.",
        source: "raw-responses.json, second run",
      },
      {
        label: "A BLANK CONTROL",
        claim:
          "A neutral grey square with no texture and no hue returned 0.45 / 0.40 / 0.15. Cotton and knit landed within 0.03 of that on every axis. Brocade separated on all three. The control is what makes the brocade row believable instead of self-reported.",
        source: "raw-responses.json, flat.png",
        figure: {
          kind: "instrument",
          component: "silkcontrol",
          caption:
            "measured against the live endpoint, second run, values as returned. The three rules are the control's own numbers: cotton and knit sit on them, brocade does not",
          sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
          sourceLabel: "raw-responses.json",
        },
      },
      {
        label: "WHAT THE SEPARATION ACTUALLY MEANS",
        claim:
          "Cotton and knit returned identical physics, 0.48 / 0.38 / 0.12 for both, and differ only in colour. So this resolves coarse structure, not material identity. That is a smaller claim than the one I started with, and it is the one the measurements support.",
        source: "raw-responses.json, cotton.jpg and knit.jpg",
      },
    ],
    limits: [
      "Four properties, one shader, best on woven textiles. It doesn't segment the image, doesn't handle multi-material inputs, and assumes what you give it is a material to begin with.",
      "The endpoint's system prompt contains a written table of expected ranges by material type. The readings are vision plus a set of priors, not pure measurement. I have not isolated how much each contributes.",
      "On an earlier session I recorded knit rigidity at 0.52 and the control at 0.50. I did not keep those responses, and the images were recompressed between then and now, so I cannot tell whether that was model variance or different input bytes. Every number on this page comes from runs I kept.",
      "Two runs two minutes apart is a weak test of stability. It does not rule out caching, and it says nothing about whether the same image returns the same values a week later.",
      "Colour is returned as three normalised channels, not one number. The page calls these four material parameters, which is four fields, not four scalars.",
    ],
  },
  coda: "Skeletal Silk is the portfolio's one tool rather than one instrument. Latent and Teardown measure; Vestige proves; this one is meant to be used. The control is the point: a vision model's loose reading, pinned to four numbers you can drive and carry away.",
  context: "",
  byline: "Ali Lin",
  cta: {
    label: "the case is the tool → try it",
    href: "https://skeletal-silk.alilinlab.com",
  },
  prev: { label: "VESTIGE", href: "/work/vestige" },
  next: { label: "LATENT", href: "/work/latent" },
};
export default skeletalSilk;
