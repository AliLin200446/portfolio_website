import { indexOf, validateHero, type CaseHero } from "./_schema";

/*
 * LATENT hero.
 *
 * Every parameter below was read out of the engine, not recalled:
 * threshold 0.55, radius 4.9, intensity 1.01, tint 1.2 / 0.03 / 0.03,
 * five GL passes, N = round(radius squared / 4) giving six gaussian
 * passes. The pass count is five, not six; six is the number of PLANES
 * the pass-stack figure draws, and the two have been confused on this
 * page before.
 *
 * MEDIA: the calibration workbench still. The demo recording is
 * deliberately NOT used here: it is the asset pending a re-record, and
 * its panel shows a threshold this page does not claim. No build guard
 * can read a video frame, so that one has to be kept out by hand.
 *
 * The alt text describes the CROP, not the file, and the crop moves
 * with the viewport: the 4/5 box shrinks to fit the row, so the visible
 * window of this 1952x1066 source runs from 9 to 91 percent at 1440 but
 * only 18 to 82 percent at 1512. The alt is written against the
 * NARROWEST of those, so it stays true at every size.
 *
 * That window reaches the parameter panel's labels but stops short of
 * its right-aligned values. The alt therefore names the controls and
 * quotes no numbers. Two earlier drafts got this wrong in opposite
 * directions: one described a panel a 3/4 crop removed entirely, the
 * next described numbers that are still off frame.
 */
const latentHero: CaseHero = validateHero({
  index: indexOf("latent"),
  slug: "latent",
  title: "Latent",
  meta: {
    left: "Ali Lin Lab",
    center: "Case Study",
    right: "2026",
  },
  brief:
    "Latent is a film physics engine that runs in your browser. It models halation and grain the way film does.",
  media: {
    src: "/case-assets/latent/workbench.webp",
    type: "image",
    alt: "The Latent calibration workbench: on the left a reference film scan of a tiled subway platform with orange halation blooming off the overhead light, in the centre the engine OUTPUT panel rendering the same kind of scene, and at the right edge the halation control panel, of which only the parameter names are in frame.",
  },
  /* hero-drift-exempt
   *
   * scripts/check-hero-drift.mjs asserts that a hero's PROBLEM is the
   * case page's WHAT. That held while this page used PROBLEM for the
   * problem statement and WHAT repeated it. It no longer does: PROBLEM
   * is the reader's pain ("that is why it looks fake") and WHAT is what
   * the thing is ("a film physics engine that gives AI video real
   * halation and grain"). Those are different sentences on purpose, and
   * they measure 0.38 against a 0.5 threshold, which is the guard doing
   * exactly what it was built to do and being wrong about this page.
   *
   * The exemption is per file rather than a lowered threshold, because
   * the other four pages still use the old structure and still want the
   * check. If this page's PROBLEM and WHAT ever become the same claim
   * again, delete this block and the guard resumes.
   */
  quadrants: [
    {
      label: "Problem",
      body: "AI generated video has film looks, not film physics. That's why it looks fake.",
    },
    {
      label: "Solution",
      body: "Latent models the film optics instead.",
    },
    {
      label: "Methods",
      body: "Use 5 GLSL passes to resemble the actual film physics. Calibrated against film I shot and scanned myself.",
    },
    {
      label: "Next Step",
      body: "More calibrations by different film stocks.",
    },
  ],
});

export default latentHero;
