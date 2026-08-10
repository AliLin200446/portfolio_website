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
  sections: {
    what: "Luxury returns run high because a product page shows a still image. Drape, weight and sheen do not survive a photograph.",
    why: "About half of apparel returns cite fit and material mismatch (NRF / Statista, 2025\u201326). A cloth simulation you can push and drag lets a garment behave before it is bought.",
    how: {
      summary: [
        "The same simulation that answers \u201chow does this move\u201d is the thing that keeps it from coming back.",
      ],
      phases: [
        {
          title: "Phase 1 \u00b7 Cloth that drapes, not a loop of frames",
          body: [
            "Verlet cloth physics: a mass-spring mesh under distance constraints.",
            "Integrated per frame in Three.js and GLSL, driven by your push, not pre-baked.",
          ],
        },
        {
          title: "Phase 2 \u00b7 The material feel, judged by eye",
          body: [
            "Drape, weight, sheen and how light rolls across a fold, tuned by hand against how real cloth falls. Judged by eye, not measured off a reference.",
          ],
          figure: {
            kind: "live",
            url: "https://material-memory.alilinlab.com",
            caption:
              "the cloth under a user's hand \u00b7 real-time Verlet simulation \u00b7 click to run the real thing",
          },
        },
      ],
    },
  },
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
    ],
    limits: [
      "The cloth never computes normals. Lighting in the fragment shader is derived procedurally from wrinkle and uv values, so what looks like a surface responding to light is a pattern that happens to read as one.",
      "Depth range is narrow. Across a fold, z spans roughly three to eight percent of the frame width. The cloth reads as fabric mostly because of motion, not because of relief.",
      "The settle relaxation that keeps the cloth from tearing also pulls vertices back toward the grid in x and y. Wrinkles therefore live almost entirely in z. There is no silhouette deformation and the sheet never occludes itself.",
      "Everything here was tuned by hand and judged by eye. Latent has calibration files. This one has my opinion.",
    ],
  },
  coda: "A hand-built physics engine pointed at a business number that returns cannot otherwise reach.",
  byline: "Ali Lin",
  prev: { label: "LATENT", href: "/work/latent" },
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default materialMemory;
