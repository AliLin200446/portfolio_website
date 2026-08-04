/* em-dash-exempt: author-mandated verbatim copy, see scripts/check-no-em-dash.mjs
 *
 * ABOUT — the three circles. Copy is the author's, supplied whole, and
 * is not to be rewritten, polished or shortened. Six of the seven
 * blocks carry an em dash, which the site otherwise forbids; the
 * exemption is declared above rather than resolved by editing, because
 * only one of those two rules is about someone else's words.
 *
 * Keys are the seven regions of the Venn: three circles alone, three
 * pairwise overlaps, one centre. `center` is also the resting state.
 */

export type RegionKey =
  | "center"
  | "eye"
  | "hand"
  | "instrument"
  | "eye-hand"
  | "hand-instrument"
  | "eye-instrument";

export type Panel = { title: string; body: string };

/** Reading order for the list that phones and no-JS get: the middle
 *  first, because it is the claim, then the three parts, then the three
 *  overlaps. */
export const PANEL_ORDER: RegionKey[] = [
  "center",
  "eye",
  "hand",
  "instrument",
  "eye-hand",
  "hand-instrument",
  "eye-instrument",
];

export const INTRO = "Three circles. The middle one is the job.";

export const PANELS: Record<RegionKey, Panel> = {
  center: {
    title: "Design engineer",
    body: "I build instruments for things that used to be judged by feel. Most of my work sits where taste has to become a number: film physics calibrated against my own negatives, material properties read out of a photograph, an inference API taken apart and measured.",
  },
  eye: {
    title: "Eye — judgment",
    body: "Shooting film since 2022 — Canon AE-1P, Nikon FE2, Rolleiflex 3.5F, GFX 100S II. Also crochet, makeup, and the design system this site runs on. Different materials, one skill: knowing when something is off before you can say why.",
  },
  hand: {
    title: "Hand — build",
    body: "WebGL2, GLSL, React Three Fiber, real-time pipelines inside a 30fps budget. Four things shipped and live, not four case studies about things that could exist.",
  },
  instrument: {
    title: "Instrument — measurement",
    body: "Calibration against ground truth, benchmark protocols, variance testing, contrast audits with computed values rather than eyeballs. At Vision On I do this on AI image tools for a living: control the variables, publish the numbers, including the unflattering ones.",
  },
  "eye-hand": {
    title: "Design engineering",
    body: "Building with taste — the part most people mean when they say design engineer. Resonance, Skeletal Silk, and the component system behind this site.",
  },
  "hand-instrument": {
    title: "Tooling and observability",
    body: "Building the meter, not just the machine. Teardown №1: an inference API instrumented in public — 19.52 ms/step at R² = 0.9978, and the variance lives in the queue, not the model.",
  },
  "eye-instrument": {
    title: "Calibration",
    body: "Turning judgment into something measurable. Latent's film stocks are calibrated against scans of negatives I shot myself, so \"filmic\" stops being an opinion. This is the rarest of the three overlaps, and the one I would defend hardest.",
  },
};
