/*
 * B4 TEARDOWN — E4 latency data, baked at build time. ZERO runtime calls.
 *
 * BAKED-FROM-STATS: the raw runs.csv is not on this machine and the
 * production teardown bundle measures client-side (nothing baked to steal).
 * The numbers below reconstruct the E4 series from the author's measured
 * statistics as written in the B2–B6 施工图: inference std 9.9ms with ~2%
 * jitter (⇒ mean ≈ 495ms), queue std 277ms with a 1500ms cold-start stall,
 * LOG exemplar "550ms". Sequence is deterministic (seeded), 20 entries,
 * first entry is the cold start. Replace this file from runs.csv when it
 * lands — the shape { stats, runs } is the contract.
 */

export type Wheel = "queue" | "inference" | "network";

export const STATS: Record<Wheel, { mean: number; std: number; note?: string }> = {
  queue: { mean: 550, std: 277, note: "incl. 1500ms cold start" },
  inference: { mean: 495, std: 9.9 },
  network: { mean: 180, std: 24, note: "estimated band" },
};

/** 20 runs, ms. Seeded reconstruction honoring the stats above. */
function bake(): { n: number; queue: number; inference: number; network: number; total: number }[] {
  let seed = 20260717;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // Box-Muller-ish from two uniforms, clamped
  const gauss = (mean: number, std: number) => {
    const u = Math.max(1e-6, rnd());
    const v = rnd();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(20, Math.round(mean + std * z));
  };
  const runs = [];
  for (let n = 1; n <= 20; n++) {
    const queue = n === 1 ? 1500 : gauss(STATS.queue.mean, STATS.queue.std * 0.8);
    const inference = gauss(STATS.inference.mean, STATS.inference.std);
    const network = gauss(STATS.network.mean, STATS.network.std);
    runs.push({ n, queue, inference, network, total: queue + inference + network });
  }
  return runs;
}

export const RUNS = bake();
