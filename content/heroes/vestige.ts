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
      /* 62 characters, three lines at 21px in the 277px quadrant
       * column at 1440. Was 94 and four lines.
       *
       * "zero-knowledge" went, and that is a judgement worth writing
       * down rather than leaving to be re-argued. The property is
       * already established twice above this slot: the brief says each
       * audience sees only what it is allowed to, and Problem says the
       * facts that prove compliance are the ones a brand cannot
       * reveal. Role-differentiated proofs, read after those two
       * sentences, is the same claim. The term itself is not lost from
       * the page: content/cases/vestige.ts still carries
       * "zero-knowledge proofs" in HOW, where the mechanism is the
       * subject. No guard depends on the phrase. */
      body: "One cryptographic commitment generates role-differentiated proofs.",
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
