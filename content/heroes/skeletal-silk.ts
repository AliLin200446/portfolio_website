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
    {
      label: "Problem",
      body: "A vision model's native output is language, which cannot drive a shader on its own.",
    },
    {
      label: "Solution",
      body: "There is one fixed GLSL shader, and the model writes uniforms rather than GLSL.",
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
