/** THE BENCH — five stations along the bench X axis. Order is bench order. */
export type Station = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  /** One-line used by the DOM list fallback. Existing copy only. */
  line?: string;
};

export const STATIONS: Station[] = [
  {
    id: "latent",
    label: "LATENT",
    href: "/work/latent",
    line: "Dehancer assumes you've shot something. We assume you haven't.",
  },
  {
    id: "resonance",
    label: "RESONANCE",
    href: "/work/resonance",
    line: "A physical feedback interface for world model outputs.",
  },
  {
    id: "skeletal-silk",
    label: "SKELETAL SILK",
    href: "/work/skeletal-silk",
    line: "AI as material interpreter, not image generator.",
  },
  {
    id: "teardown",
    label: "TEARDOWN",
    href: "https://teardown.alilinlab.com",
    external: true,
  },
  {
    id: "vestige",
    label: "VESTIGE",
    href: "/work/vestige",
    line: "A digital product passport built to outlast the first sale.",
  },
];

/** World-unit spacing between berths on the bench. */
export const BERTH_SPACING = 3.2;
export const BERTH_MAX = (STATIONS.length - 1) * BERTH_SPACING;
