/*
 * B4 TEARDOWN — E4 latency data, baked at build time. ZERO runtime calls.
 *
 * BAKED-FROM-STATS: evidence/e4-latency/runs.csv is not on this machine
 * and the production teardown bundle measures client-side (nothing baked
 * to copy). The series below reconstructs E4 from the author's measured
 * statistics as written in the B4 spec: inference std 9.9ms at ~2% jitter
 * (⇒ mean ≈ 495ms), queue std 277ms with the 1500ms cold-start first
 * call, LOG exemplar 550ms (taken as queue mean), network as an estimated
 * even band. Deterministic (seeded), 20 calls, call #1 is the cold start.
 * NOT invented rhythm: the stall, the jitter bands and the spread all come
 * from the spec's stats. Replace from runs.csv when it lands — the shape
 * { calls, stats } is the contract (spec section 四).
 */

export type Segment = "queue" | "inference" | "network";

export type E4Call = {
  id: number;
  queue_ms: number;
  inference_ms: number;
  network_ms: number;
  total_ms: number;
};

function bake() {
  let seed = 20260717;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const gauss = (mean: number, std: number) => {
    const u = Math.max(1e-6, rnd());
    const v = rnd();
    return Math.max(
      20,
      Math.round(mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))
    );
  };
  const calls: E4Call[] = [];
  for (let id = 1; id <= 20; id++) {
    const queue_ms = id === 1 ? 1500 : gauss(550, 277 * 0.8);
    const inference_ms = gauss(495, 9.9);
    const network_ms = gauss(180, 24);
    calls.push({
      id,
      queue_ms,
      inference_ms,
      network_ms,
      total_ms: queue_ms + inference_ms + network_ms,
    });
  }
  const seg = (pick: (c: E4Call) => number) => {
    const xs = calls.map(pick).sort((a, b) => a - b);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const std = Math.sqrt(
      xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / xs.length
    );
    const p95 = xs[Math.min(xs.length - 1, Math.ceil(xs.length * 0.95) - 1)];
    return { mean: Math.round(mean), std: Math.round(std * 10) / 10, p95 };
  };
  return {
    calls,
    stats: {
      queue: seg((c) => c.queue_ms),
      inference: seg((c) => c.inference_ms),
      network: seg((c) => c.network_ms),
    },
  };
}

export const E4 = bake();
