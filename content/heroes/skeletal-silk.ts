import { indexOf, validateHero, type CaseHero } from "./_schema";

/*
 * SKELETAL SILK hero.
 *
 * FACT GUARD, inherited from content/cases/skeletal-silk.ts: there is ONE
 * fixed GLSL shader and the model writes uniforms, never GLSL. Nothing
 * here may describe the shader as being written, synthesised or produced
 * by the model, in any wording.
 *
 * MEDIA: SS/assets/front_pic/SS_front_pic.png, 3838x1910, converted to
 * webp q82 and to sRGB. The 4/5 box keeps the middle 23 to 77 percent,
 * which centres the shaded preview sphere and keeps its export button
 * and caption whole. Nothing is cut mid-word.
 */
const skeletalSilkHero: CaseHero = validateHero({
  index: indexOf("skeletal-silk"),
  slug: "skeletal-silk",
  title: "Skeletal Silk",
  meta: { left: "Ali Lin Lab", center: "Case Study", right: "2026" },
  brief: "A vision model can describe silk. This makes it drive one.",
  media: {
    src: "/case-assets/skeletal-silk/hero-front.webp",
    type: "image",
    alt: "The Skeletal Silk preview surface, a large grey sphere lit from the upper left and centred on black, with an export shader and parameters button beneath it.",
  },
  quadrants: [
    /* PROBLEM is the case page's WHAT, verbatim, and scripts/check-hero-drift.mjs
     * enforces that. It used to be a separate sentence written here and
     * never revisited: when WHAT was rewritten for a reader who is not a
     * graphics programmer, this file was not part of that change, so the
     * rewrite landed at y=2279 and the sentence it replaced stayed on
     * the first screen. The jargon was removed from the place almost
     * nobody reaches and kept in the place everybody starts.
     *
     * SOLUTION is deliberately NOT the WHY, and no guard compares them.
     * The slot answers "so what did you build", because PROBLEM has
     * already carried half the why and a reader does not need it twice
     * in one screen. It is written in the same plain language as the
     * rewrite rather than reverting to the shader jargon that was the
     * whole fault here.
     *
     * The FACT GUARD above still holds: the photograph and its four
     * numbers drive the shader. The model does not write it. */
    {
      label: "Problem",
      body: "Ask a model to describe silk and you get a paragraph, which no renderer can use.",
    },
    {
      label: "Solution",
      body: "This turns a photograph into the four numbers a renderer needs, driving one fixed shader.",
    },
    {
      label: "Methods",
      body: "The model returns four material parameters, one of them a colour triple, not prose.",
    },
    {
      label: "Next Step",
      body: "I have not isolated how much of each reading is vision and how much is priors.",
    },
  ],
});

export default skeletalSilkHero;
