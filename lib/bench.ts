/** THE RAIL — five instruments on one straight line, shown one at a
 *  time. The order below is an argument, not a menu: it does not loop,
 *  because a loop would say every position is equivalent.
 *  RESONANCE left the rail for the experiments cabinet; its tuning fork
 *  now rests on top of that cabinet instead. */
export type Station = {
  id: string;
  label: string;
  /** Absent = no destination yet (nav renders a plain label). */
  href?: string;
  external?: boolean;
  /** One-line used by the DOM list fallback. Existing copy only. */
  line?: string;
  /** Hover-card line (CAROUSEL §决策C): NAME · positioning · status ·
   *  stack/media. Facts only, no adjectives. */
  hover?: string;
  /** The two-to-three line description under the instrument on the
   *  rail, and under the name in the phone list. One claim, one number
   *  or one limit. Never a feature list. */
  blurb?: string;
};

export const STATIONS: Station[] = [
  {
    id: "latent",
    label: "LATENT",
    href: "/work/latent",
    line: "Dehancer assumes you've shot something. We assume you haven't.",
    hover: "LATENT · film physics engine · shipped Jul 2026 · WebGL/GLSL · latentfilm.com",
    blurb:
      "A film physics engine in a browser tab. Halation, grain, and film response, calibrated against my own negatives rather than a preset.",
  },
  {
    id: "skeletal-silk",
    label: "SKELETAL SILK",
    href: "/work/skeletal-silk",
    line: "AI as material interpreter, not image generator.",
    hover: "SKELETAL SILK · AI as material interpreter · live · SSS/silk maps · skeletal-silk.alilinlab.com",
    blurb:
      "A vision model reads four material parameters out of a fabric photo and drives a live shader. I ran a blank control to find out what it actually resolves.",
  },
  {
    id: "teardown",
    label: "TEARDOWN",
    href: "/work/teardown", // LINK-WIRE: enter → case page; 外站唯一入口在 case HERO open live ↗
    hover: "TEARDOWN №1 · an API, instrumented · live · fal/flux E4 · teardown.alilinlab.com",
    blurb:
      "47 structured calls into a hosted diffusion API. The segment carrying nearly all the latency variance is the one the API does not return.",
  },
  {
    id: "vestige",
    label: "VESTIGE",
    href: "/work/vestige",
    line: "A digital product passport built to outlast the first sale.",
    hover: "VESTIGE · provenance for physical goods · a filed provisional · NFC/zk",
    blurb:
      "One cryptographic commitment, three levels of disclosure. A regulator proves a verdict, a brand a category, a consumer neither.",
  },
  {
    id: "material-memory",
    label: "MATERIAL MEMORY",
    href: "/work/material-memory", // CASE-NAV: 器物点击/揭帛 hook 有目的地
    line: "hand-written cloth physics",
    hover: "MATERIAL MEMORY · hand-written cloth physics · live · material-memory.alilinlab.com",
    blurb:
      "Hand written Verlet cloth. You cannot see how fabric moves from a photograph, so the physics runs instead of being described.",
  },
];

/** Rail order, left to right. Hardcoded and deliberate: this is the
 *  sequence a visitor is walked through, so it is kept apart from
 *  STATIONS, which stays the narrative order for nav and the phone
 *  list.
 *
 *  Every count in the rail comes off BERTH_ORDER.length. A literal
 *  count shipped here once as `% 6` after the ring dropped to five,
 *  which silently mapped a click to the wrong instrument and was
 *  invisible until somebody tried it by hand. */
export const BERTH_ORDER = [
  "latent",
  "teardown",
  "skeletal-silk",
  "material-memory",
  "vestige",
] as const;

export const berthOf = (id: string) => BERTH_ORDER.indexOf(id as (typeof BERTH_ORDER)[number]);
/** Landing berth: the first step of the argument, not a middle. */
export const HOME_BERTH = berthOf("latent");

/** World-unit spacing between berths along the rail X axis. Wide enough
 *  that a neighbour sits fully outside the frame at rest, so a visitor
 *  reads one instrument rather than a row of them. */
export const BERTH_SPACING = 3.2;
/** The far end of the rail. A hard stop, not a wrap. */
export const BERTH_MAX = (BERTH_ORDER.length - 1) * BERTH_SPACING;

/** Where instrument i stands on the rail. The single source of X for
 *  the objects, the camera, the hit boxes and the dive targets, so
 *  none of them can drift apart. */
export const railX = (i: number) => i * BERTH_SPACING;
