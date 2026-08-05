import type { CaseData } from "./_schema";

/*
 * MATERIAL MEMORY: copy supplied by the author, verbatim.
 * Every percentage here belongs to the CATEGORY, not to this engine
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
    motion: "/case-assets/material-memory/hero-loop.webp",
    motionStill: "/case-assets/material-memory/hero-still.webp",
    caption:
      "the shipping simulator · the FOLD test, looping · push, drop and drag it yourself: click to run live",
  },
  what: [
    "Luxury returns run high because a product page shows a still image. Drape, weight, sheen, the way cloth catches light when it moves, none of it survives a photograph. About half of apparel returns cite fit and material mismatch (NRF / Statista, 2025–26). Material Memory closes that gap: a WebGL cloth simulation you can push, drop, and drag, so a garment behaves before it's bought.",
    "One engine, two readings. For the shopper it ends the guessing. For the brand it ends the returning. The same simulation that answers “how does this move” is the thing that keeps it from coming back.",
  ],
  build: [
    {
      heading: "CLOTH THAT DRAPES, NOT A LOOP OF FRAMES",
      body: "The fabric runs on Verlet cloth physics. A mass-spring mesh under distance constraints, integrated per frame in Three.js and GLSL, so the cloth holds together while it drapes, swings, and settles. Real-time, driven by the user's push and drag, not a pre-baked animation.",
      body2:
        "The material feel, drape and weight and sheen and how light rolls across a fold, I tuned by hand, iterating against how real cloth falls. Not measured off a reference; judged by eye, the way you judge whether a fabric hangs right. Latent measures; this one is felt.",
      /* A recording was ruled out: the demo is high-motion cloth, which
       * compresses badly. A soft 480p loop undersells the material it
       * exists to show. The figure runs the real engine instead, mounted
       * only on click, with a still poster once one is exported. */
      figure: {
        kind: "live",
        url: "https://material-memory.alilinlab.com",
        caption:
          "the cloth under a user's hand · real-time Verlet simulation · click to run the real thing",
      },
    },
  ],
  proof: {
    items: [
      {
        claim:
          "TACTILE PREVIEW IS A PROVEN LEVER: FOR THE CATEGORY. Apparel leads e-commerce returns at roughly 25%, and fit and material drive about half of them (NRF / Statista, 2025–26). Products with 3D/AR previews see up to 40% fewer returns and markedly higher conversion (Shopify platform data). Material Memory is an implementation of that lever for fabric. The numbers belong to the category, and the engine is built to capture them, not a measured result of its own.",
        source:
          "apparel return ~25%: NRF/Statista 2025–26 · fit/material ~50% of apparel returns · 3D/AR up to −40% returns: Shopify platform data",
      },
      {
        claim:
          "THE GAP IS SPECIFICALLY TACTILE. Over half of all e-commerce returns come from clothing, and the recurring reason a product page can't fix is that a still image shows what fabric looks like, never how it moves. That is the exact gap Material Memory closes.",
        source: "clothing = 56%+ of e-commerce returns (industry benchmarks)",
      },
      {
        claim:
          "BUILT AROUND THE DOMINANT SHOPPER. Maya, 27, is the shopper a product page cannot reach. She can't feel the fabric, so she guesses, and the guess is wrong often enough to drive the category's return rate. Material Memory isn't a feature for some shoppers; it's infrastructure for the default one.",
      },
    ],
    limits: [],
  },
  context:
    "Material Memory is the product-facing end of the same practice: Latent and Teardown measure what generative systems do; this one takes a hand-built physics engine and points it at a business number returns can't otherwise reach. Where those instruments prove rigor, this one proves the rigor aims at something someone pays for.",
  byline: "Ali Lin",
  prev: { label: "LATENT", href: "/work/latent" },
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default materialMemory;
