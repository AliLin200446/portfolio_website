/** THE BENCH — five stations along the bench X axis. Order is bench order. */
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
};

export const STATIONS: Station[] = [
  {
    id: "latent",
    label: "LATENT",
    href: "/work/latent",
    line: "Dehancer assumes you've shot something. We assume you haven't.",
    hover: "LATENT · film physics engine · shipped Jul 2026 · WebGL/GLSL · latentfilm.com",
  },
  {
    id: "resonance",
    label: "RESONANCE",
    href: "/work/resonance",
    line: "A physical feedback interface for world model outputs.",
    hover: "RESONANCE · a physical feedback interface for world model outputs · live · resonance.alilinlab.com",
  },
  {
    id: "skeletal-silk",
    label: "SKELETAL SILK",
    href: "/work/skeletal-silk",
    line: "AI as material interpreter, not image generator.",
    hover: "SKELETAL SILK · AI as material interpreter · live · SSS/silk maps · skeletal-silk.alilinlab.com",
  },
  {
    id: "teardown",
    label: "TEARDOWN",
    href: "https://teardown.alilinlab.com",
    external: true,
    hover: "TEARDOWN №1 · an API, instrumented · live · fal/flux E4 · teardown.alilinlab.com",
  },
  {
    id: "vestige",
    label: "VESTIGE",
    href: "/work/vestige",
    line: "A digital product passport built to outlast the first sale.",
    hover: "VESTIGE · provenance for physical goods · 2 provisional patents · NFC/zk",
  },
  {
    id: "material-memory",
    label: "MATERIAL MEMORY",
    href: "/work/material-memory", // CASE-NAV: 器物点击/揭帛 hook 有目的地
    line: "hand-written cloth physics",
    hover: "MATERIAL MEMORY · 〔回填:定位句〕 · live · material-memory.alilinlab.com",
  },
];

/** Spatial order along the rail (BENCH-LAYOUT): the film canister sits
 *  center as the landing berth, wings spread outward, the figure closes.
 *  Decoupled from STATIONS, which stays the narrative order for nav and
 *  the DOM list. */
export const BERTH_ORDER = [
  "resonance",
  "skeletal-silk",
  "latent",
  "teardown",
  "vestige",
  "material-memory",
] as const;

export const berthOf = (id: string) => BERTH_ORDER.indexOf(id as (typeof BERTH_ORDER)[number]);
/** Landing berth: the film canister, dead center. */
export const HOME_BERTH = berthOf("latent");

/** World-unit spacing between berths on the bench. */
export const BERTH_SPACING = 3.2;
export const BERTH_MAX = (BERTH_ORDER.length - 1) * BERTH_SPACING;
