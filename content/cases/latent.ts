import type { CaseData } from "./_schema";

/*
 * LATENT — the first page built on the template. Every sentence below
 * is the author's own copy, carried over from lib/projects.ts and the
 * earlier case data; nothing here is invented. Gaps the author has not
 * supplied stay visible as PENDING chips rather than being filled in.
 */
const latent: CaseData = {
  slug: "latent",
  name: "Latent",
  oneLine: "A film physics engine for images that never passed through a camera.",
  meta: {
    type: "Film physics engine",
    stack: "WebGL2 · GLSL",
    year: "2026",
    status: "shipped",
    live: "https://latentfilm.com",
  },
  claim: "Filmic can be measured.",
  hero: {
    kind: "instrument",
    component: "halation",
    caption:
      "halation radius, live · drag to compare",
  },
  what: [
    "AI video has a tell. Blacks that hit zero. Highlights that clip instead of roll. Static frames that sit dead still. Nothing in the image ever passed through a physical medium — and your eye knows, even when you can't say why.",
    "Latent puts the medium back. Halation, grain, highlight roll-off, dye crosstalk — simulated as physics, not filters. The hard part is that none of it is a look: every parameter has to come off a real negative, or the engine is just another filter stack with better vocabulary.",
  ],
  build: [
    {
      heading: "CALIBRATE AGAINST OWN NEGATIVES, NOT AGAINST TASTE",
      body: "A film emulation can be tuned until it looks right, which makes it unfalsifiable. I shot CineStill 800T at night, developed it, scanned it, and pulled the numbers off my own negatives instead: channel bias, halation radius in pixels, grain σ per luminance zone. The cost is that the engine can only claim what the scans support — and the third calibration round threw out the first two, because the probe was in the wrong place.",
      figure: {
        kind: "pending",
        note: "calibration comparison — evidence pack",
        caption:
          "shot at night on CineStill 800T · developed · scanned · numbers read off the negatives",
        pending: "batch and probe conditions",
      },
    },
    {
      heading: "BORROW THE FORENSICS MATH, RUN IT BACKWARDS",
      body: "Judging output by eye reintroduces the taste problem, so the engine needs a target it cannot argue with. A spectral analyzer fits the radial power spectrum of a frame against natural-image statistics — the same measure forensics researchers use to detect AI images. Turned around, it becomes a repair target: the engine moves a frame's spectral falloff from −3.2 toward the −2 of the natural world.",
      figure: {
        kind: "pending",
        note: "SPECTRUM diagnostic capture",
        caption:
          "radial power spectrum fit against natural-image statistics · repair target −2",
        pending: "sample and fit conditions",
      },
    },
    {
      heading: "SIMULATE THE PIPELINE IN ORDER, NOT AS A STACK OF FILTERS",
      body: "Film effects are not independent layers; halation happens in the emulsion before grain is developed, and applying them in the wrong order gives the right ingredients with the wrong result. Each frame runs a GLSL pipeline in physical order — spectral response, then halation, then grain — so a change to one stage propagates the way it would in the material.",
      figure: {
        kind: "code",
        lang: "text",
        code: "input → spectral response → halation → grain → output",
        caption: "pipeline order, as simulated per frame",
      },
    },
  ],
  proof: {
    items: [
      {
        claim:
          "Halation radius follows a power law, fit against my own scans.",
        pending: "halation power-law α — awaiting the fitted value",
      },
      {
        claim:
          "Every engine parameter traces to a measured negative — channel bias, halation radius in pixels, grain σ per luminance zone.",
        source: "CineStill 800T, shot / developed / scanned by the author",
      },
      {
        claim:
          "A frame's spectral falloff can be moved from −3.2 toward the −2 of the natural world.",
        source: "radial power spectrum vs natural-image statistics",
      },
      {
        claim:
          "Calibration rounds and sample size are recorded and will be stated here.",
        pending: "rounds and sample size",
      },
      {
        claim: "Shipped and running in the browser at latentfilm.com.",
        source: "WebGL2 · verify live",
      },
    ],
    limits: [
      "The hero comparator on this page is a demonstration, not a measurement: a procedural test pattern with the radius exaggerated so the effect reads at this size.",
      "Calibration covers CineStill 800T; other stocks are not claimed.",
      "Grain and halation are simulated per frame; no temporal grain correlation is claimed.",
    ],
  },
  context:
    "Latent is the first instrument in a line of them: I instrument what AI fakes. Dehancer assumes you've shot something. We assume you haven't — the engine exists for images with no negative behind them, and the negatives it was calibrated against are my own.",
  next: { label: "TEARDOWN № 1", href: "/work/teardown" },
};
export default latent;
