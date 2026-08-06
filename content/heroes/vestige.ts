import { indexOf, validateHero, type CaseHero } from "./_schema";

/*
 * VESTIGE hero.
 *
 * DISCLOSURE BOUNDARY, inherited from content/cases/vestige.ts: the
 * architecture may be described, the cryptographic construction may not.
 * Nothing here touches hash formulas, circuit leaf structure or
 * nullifier derivation. Wording held exactly as the case file holds it:
 * "a filed provisional", singular, and the EU rollout is never dated
 * 2026. Neither phrase appears here, and neither may be introduced.
 *
 * MEDIA: Vestige/assets/front_pic/vestige_front_pic.png, 3208x1916,
 * converted to webp q82 and to sRGB. The 4/5 box keeps the middle 17 to
 * 83 percent, which holds the whole passport panel with margin either
 * side. The frame carries no date and no construction detail, so it
 * stays inside the disclosure boundary above.
 */
const vestigeHero: CaseHero = validateHero({
  index: indexOf("vestige"),
  slug: "vestige",
  title: "Vestige",
  meta: { left: "Ali Lin Lab", center: "Case Study", right: "2026" },
  brief: "One commitment, three audiences. Each sees only what it is allowed to.",
  media: {
    src: "/case-assets/vestige/hero-front.webp",
    type: "image",
    alt: "The Vestige consumer passport, showing the consumer, regulator and brand perspective tabs, a concentric identity anchor graphic, a zk-proof verified badge, and the product identification rows beneath it.",
  },
  quadrants: [
    {
      label: "Problem",
      body: "For luxury, the very facts that prove compliance are the ones a brand cannot reveal.",
    },
    {
      label: "Solution",
      body: "From a single cryptographic commitment it generates role-differentiated zero-knowledge proofs.",
    },
    {
      label: "Methods",
      body: "A verified NFC tap becomes a presence receipt that updates the commitment.",
    },
    {
      label: "Next Step",
      body: "The full multi-circuit prover is specified but not yet shipped end to end.",
    },
  ],
});

export default vestigeHero;
