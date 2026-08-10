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
    why: "Wanting a real fabric's drape and sheen means hand-tuning shader parameters or taking a preset. The problem is turning an unbounded reading into four bounded parameters.",
    how: {
      summary: [
        "One fixed GLSL shader; the model writes uniforms, never GLSL. Mapping an open-ended vision output onto a fixed parameter set is the tool's core.",
      ],
      phases: [
        {
          title: "Phase 1 \u00b7 What the model returns",
          body: [
            "The model returns four material parameters, one a colour triple, not prose. A paragraph cannot drive a shader; four parameters can.",
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

  cotton.jpg, values as returned`,
            caption:
              "the model's reading, wired straight to the shader's uniforms. These are the endpoint's own key names: specular, not specularity, and color as three normalised channels",
            sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
            sourceLabel: "raw-responses.json",
          },
        },
        {
          title: "Phase 2 \u00b7 The pipeline",
          body: [
            "Rigidity, flow, specular and a colour triple feed one shader as uniforms. Two photos do not make two shaders, only two materials.",
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
            caption: "tested on, values as returned",
            sourceHref: "https://alilinlab.com/case-assets/skeletal-silk/raw-responses.json",
            sourceLabel: "raw-responses.json",
          },
        },
      ],
    },
  },
  proof: {
    items: [
      {
        label: "NOTHING HERE IS RETYPED",
        claim:
          "Four images, one call each, every response logged with its timestamp and HTTP status. The bodies are published exactly as the endpoint returned them, unedited and unreordered, so all twelve scalar axes on this page can be read back off the file instead of taken on trust.",
        /* Rewritten. The old claim was about two runs agreeing; the
           published file is one run, so a reader following the citation
           found no comparison to check. What the file does establish is
           provenance: its own _note states the bodies are unmodified,
           and records[0..3] carry the twelve axes with timestamps and
           HTTP 200s. */
        source: "raw-responses.json, _note and records[0..3]",
      },
      {
        label: "A BLANK CONTROL",
        claim:
          "A neutral grey square with no texture and no hue returned 0.45 / 0.40 / 0.15. Cotton and knit landed within 0.03 of that on every axis. Brocade separated on all three. The control is what makes the brocade row believable instead of self-reported.",
        /* The claim compares four inputs, so it cites four records.
           flat.png alone carried only the control's own numbers and
           none of the three comparisons the claim rests on. Verified:
           cotton and knit sit within 0.03 of the control on all three
           scalar axes, brocade at 0.33 / 0.18 / 0.37. */
        source:
          "raw-responses.json, records[0..3]: brocade.jpg, knit.jpg, cotton.jpg, flat.png",
        figure: {
          kind: "instrument",
          component: "silkcontrol",
          caption:
            "measured against the live endpoint, values as returned. The three rules are the control's own numbers: cotton and knit sit on them, brocade does not",
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
      "There is no stability test here at all. Each image was called once and only those four responses were kept, so nothing on this page shows whether the same image returns the same values twice. Repeating the four calls and publishing both sets would close it.",
      "Colour is returned as three normalised channels, not one number. The page calls these four material parameters, which is four fields, not four scalars.",
    ],
  },
  coda: "A vision model's loose reading, pinned to four numbers you can drive and carry away.",
  byline: "Ali Lin",
  cta: {
    label: "the case is the tool → try it",
    href: "https://skeletal-silk.alilinlab.com",
  },
  prev: { label: "VESTIGE", href: "/work/vestige" },
  next: { label: "LATENT", href: "/work/latent" },
};
export default skeletalSilk;
