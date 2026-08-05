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
    blurb:
      "A film physics engine that gives AI generated video real halation and grain, in a browser tab.",
  },
  {
    id: "skeletal-silk",
    label: "SKELETAL SILK",
    href: "/work/skeletal-silk",
    line: "AI as material interpreter, not image generator.",
    blurb:
      "Reads a fabric photo with a vision model, drives a live shader from it.",
  },
  {
    id: "teardown",
    label: "TEARDOWN",
    href: "/work/teardown", // LINK-WIRE: enter → case page; 外站唯一入口在 case HERO open live ↗
    blurb:
      "A published measurement study that turns \"it feels fast\" into numbers.",
  },
  {
    id: "vestige",
    label: "VESTIGE",
    href: "/work/vestige",
    line: "A digital product passport built to outlast the first sale.",
    blurb:
      "One cryptographic commitment. A regulator, a brand, and a customer each verify a different amount.",
  },
  {
    id: "material-memory",
    label: "MATERIAL MEMORY",
    href: "/work/material-memory", // CASE-NAV: 器物点击/揭帛 hook 有目的地
    line: "hand-written cloth physics",
    blurb:
      "Real time cloth simulation. A photograph cannot show you how fabric moves.",
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

/** World-unit spacing between berths along the rail X axis.
 *
 *  Measured, not chosen by eye. At the reading distance the frame is
 *  2.48 world units tall and 3.97 wide at 16:9, and an instrument is
 *  fitted to 86 percent of that width. A neighbour therefore clears the
 *  frame edge from 0.93 x frame width, which is 3.69 at 16:9. 5.2 holds
 *  that clearance out to roughly 2.2:1; past there the next instrument
 *  starts to show an edge. */
export const BERTH_SPACING = 5.2;
/** The far end of the rail. A hard stop, not a wrap. */
export const BERTH_MAX = (BERTH_ORDER.length - 1) * BERTH_SPACING;

/** Where instrument i stands on the rail. The single source of X for
 *  the objects, the camera, the hit boxes and the dive targets, so
 *  none of them can drift apart. */
export const railX = (i: number) => i * BERTH_SPACING;
