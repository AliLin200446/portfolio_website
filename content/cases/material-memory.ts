import type { CaseData } from "./_schema";

/*
 * MATERIAL MEMORY — copy supplied by the author, verbatim.
 * Every percentage here belongs to the CATEGORY, not to this engine:
 * the copy attributes it to industry studies of 3D product previews and
 * never claims it as a measured result of its own. The citations
 * themselves have not been supplied, so they render as PENDING chips
 * rather than as an unsourced number wearing a percent sign.
 */
const materialMemory: CaseData = {
  slug: "material-memory",
  name: "MATERIAL MEMORY",
  oneLine:
    "a real-time fabric simulator that lets a buyer feel a garment before they buy it",
  meta: {
    type: "material simulator",
    stack: "Three.js / GLSL",
    year: "2026",
    status: "shipped",
    live: "https://material-memory.alilinlab.com",
  },
  claim: "E-commerce shows you what fabric looks like. Never what it moves like.",
  hero: {
    kind: "live",
    url: "https://material-memory.alilinlab.com",
    caption:
      "the shipping simulator · push, drop and drag the cloth · click to run it live",
  },
  what: [
    "Luxury returns run high because a product page shows a still image — drape, weight, sheen, the way cloth catches light when it moves, none of it survives a photograph. Over half of returns cite fit and material mismatch. Material Memory closes that gap: a WebGL cloth simulation you can push, drop, and drag, so a garment behaves before it's bought.",
    "One engine, two readings. For the shopper it ends the guessing. For the brand it ends the returning — the same simulation that answers “how does this move” is the thing that keeps it from coming back.",
  ],
  build: [
    {
      heading: "CLOTH THAT DRAPES, NOT A LOOP OF FRAMES",
      body: "The fabric runs on Verlet cloth physics — a mass-spring mesh under distance constraints, integrated per frame in Three.js and GLSL, so the cloth holds together while it drapes, swings, and settles. Real-time, driven by the user's push and drag, not a pre-baked animation.",
      body2:
        "The material feel — drape, weight, sheen, how light rolls across a fold — I tuned by hand, iterating against how real cloth falls. Not measured off a reference; judged by eye, the way you judge whether a fabric hangs right. Latent measures; this one is felt.",
      figure: {
        kind: "pending",
        note: "live demo recording — push, drop, drag",
        caption: "the cloth under a user's hand · real-time Verlet simulation",
      },
    },
  ],
  proof: {
    items: [
      {
        claim:
          "TACTILE PREVIEW IS A PROVEN LEVER — FOR THE CATEGORY. Industry studies of 3D product previews report 20–36% lower return rates and up to 40% higher conversion. Material Memory is an implementation of that lever for fabric, not a measured result of its own — the number belongs to the category, and the engine is built to capture it.",
        pending: "study, publisher and year for the 20–36% / 40% figures",
      },
      {
        claim:
          "BUILT AROUND THE DOMINANT SHOPPER. Maya, 27 — one of the 24–40% who return, one of the 53% citing fit and material, one of the 70% of luxury spend from her generation. Material Memory isn't a feature for some shoppers; it's infrastructure for the default one.",
        pending: "sources for the 24–40% / 53% / 70% figures",
      },
    ],
    limits: [],
  },
  context:
    "Material Memory is the product-facing end of the same practice: Latent and Teardown measure what generative systems do; this one takes a hand-built physics engine and points it at a business number returns can't otherwise reach. Where those instruments prove rigor, this one proves the rigor aims at something someone pays for.",
  byline: "Ali Lin — design engineer",
  prev: { label: "LATENT", href: "/work/latent" },
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default materialMemory;
