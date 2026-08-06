import { indexOf, validateHero, type CaseHero } from "./_schema";

/*
 * MATERIAL MEMORY hero.
 *
 * The percentages on the case page belong to the CATEGORY, not to this
 * engine, and none of them are repeated here. Nothing in this file makes
 * a measured claim the engine has not earned.
 *
 * MEDIA: material_memory/assets/MM_front_pic/MM_front_pic.png,
 * 3800x1678, converted to webp q82 and to sRGB.
 *
 * WARNING: this one crops badly. The 4/5 box keeps only the middle 26 to
 * 74 percent, which drops the sidebar with the Silk label and the FOLD
 * and MATERIALS controls, and what remains is the flat centre of an
 * undeformed sheet. It reads as an empty cream rectangle. A frame with
 * the cloth mid-fold, or an object-position shifted left to hold the
 * sidebar, would both fix it. Flagged rather than quietly shipped.
 */
const materialMemoryHero: CaseHero = validateHero({
  index: indexOf("material-memory"),
  slug: "material-memory",
  title: "Material Memory",
  meta: { left: "Ali Lin Lab", center: "Case Study", right: "2026" },
  brief:
    "E-commerce shows you what fabric looks like. Never what it moves like.",
  media: {
    src: "/case-assets/material-memory/hero-front.webp",
    type: "image",
    alt: "The Material Memory cloth panel filling the frame, a flat cream sheet carrying a faint woven grid, with a dark rule running along its top and bottom edges.",
  },
  quadrants: [
    {
      label: "Problem",
      body: "Luxury returns run high because a product page shows a still image.",
    },
    {
      label: "Solution",
      body: "A WebGL cloth simulation you can push, drop and drag, so a garment behaves before it is bought.",
    },
    {
      label: "Methods",
      body: "The fabric runs on Verlet cloth physics, integrated per frame in Three.js and GLSL.",
    },
    {
      label: "Next Step",
      body: "Computing real normals so the lighting responds to the surface instead of approximating it.",
    },
  ],
});

export default materialMemoryHero;
