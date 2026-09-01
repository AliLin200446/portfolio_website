import { indexOf, validateHero, type CaseHero } from "./_schema";

/*
 * TEARDOWN hero. Every sentence is lifted from content/cases/teardown.ts;
 * the source line for each is in the sourcing table in the report.
 *
 * The 47 calls and five experiments are the case file's own numbers, not
 * recounted here. Nothing in this file introduces a figure that is not
 * already published on the case page below it.
 */
const teardownHero: CaseHero = validateHero({
  index: indexOf("teardown"),
  slug: "teardown",
  title: "Teardown No 1",
  meta: { left: "Ali Lin Lab", center: "Case Study", right: "2026" },
  brief:
    "An API's documentation tells you what it returns. Only measurement tells you what it withholds.",
  media: {
    src: "/case-assets/teardown/teardown-demo-poster.webp",
    type: "image",
    alt: "The Teardown harness cropped to its middle 60 percent, showing the prompt, seed and guidance controls down the left, a timing readout for fal-ai/flux/dev in the centre, and two generated garment images on the right.",
  },
  /* hero-drift-exempt
   *
   * scripts/check-hero-drift.mjs asserts that a hero's PROBLEM is the
   * case page's WHAT. That held while PROBLEM restated the problem and
   * WHAT repeated it. It no longer does: PROBLEM is what these APIs
   * withhold from you, and WHAT is what this study is. Different
   * sentences on purpose, so the overlap check cannot tell them from
   * drift.
   *
   * Same shape as latent's exemption and for the same reason. The
   * pages still using the old structure keep the check; delete this
   * block if PROBLEM and WHAT ever become one claim again.
   */
  quadrants: [
    {
      label: "Problem",
      body: "These APIs publish what they can do and withhold what they cost you. The one timing the response returns is the one that never moves.",
    },
    {
      label: "Solution",
      body: "Turning \"it feels quick\" into segments of numbers.",
    },
    {
      label: "Methods",
      body: "I made 47 structured calls across five experiments and logged every measurement to disk.",
    },
    {
      label: "Next Step",
      body: "The method ports to any inference API, but the findings do not.",
    },
  ],
});

export default teardownHero;
