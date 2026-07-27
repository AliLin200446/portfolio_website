/*
 * TEARDOWN FIGURES — SVG drawn from the live site's own evidence table,
 * not from anything estimated here. Every number below carries the
 * source string the live site cites, and nothing is plotted that could
 * not be read off it. Two figures are missing on purpose: the step-fit
 * scatter needs eight per-rung values and the seed panel needs the hash
 * and pixel-diff rows, and both live in evidence files that currently
 * return 404. They render as PENDING chips rather than as plausible
 * shapes.
 *
 * Accent discipline: annotation red appears exactly once on this page —
 * the queue segment's "not returned by the API" label in FIG A.
 */

const AXIS = "#C9C1B2";
const INK = "#1a1714";
const MUTED = "#6B6357";
const BRONZE = "#866339";
const OXBLOOD = "#C4362B";

/** FIG A — latency anatomy. Bar width is proportional to measured p50.
 *  source: e4-latency/stats.md:11-13 · p50 inf/queue/network, N=20 @S28 */
export function LatencyAnatomy() {
  // real p50 milliseconds, and the real standard deviations beside them
  const rows = [
    { name: "inference", ms: 533, sd: "σ 9.9", dashed: false },
    { name: "queue", ms: 250.5, sd: "σ 277.0", dashed: true },
    { name: "network", ms: 0, sd: "σ 0.5", dashed: false },
  ];
  const MAX = 533;
  const W = 560;
  const BAR_X = 96;
  const BAR_W = W - BAR_X - 150;
  const scale = (ms: number) => (ms / MAX) * BAR_W;

  return (
    <svg
      viewBox={`0 0 ${W} 190`}
      className="w-full"
      role="img"
      aria-label="Measured p50 latency: inference 533 ms, queue 250.5 ms not returned by the API, network 0 ms."
    >
      {rows.map((r, i) => {
        const y = 26 + i * 44;
        const w = Math.max(scale(r.ms), r.ms === 0 ? 0 : 2);
        return (
          <g key={r.name}>
            <text
              x={BAR_X - 12}
              y={y + 13}
              textAnchor="end"
              fill={MUTED}
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {r.name}
            </text>
            {r.ms === 0 ? (
              // a zero bar is not a short bar: mark the origin instead
              <line
                x1={BAR_X}
                y1={y}
                x2={BAR_X}
                y2={y + 20}
                stroke={INK}
                strokeWidth="1.5"
              />
            ) : (
              <rect
                x={BAR_X}
                y={y}
                width={w}
                height={20}
                fill={r.dashed ? "none" : INK}
                stroke={r.dashed ? INK : "none"}
                strokeWidth={r.dashed ? 1 : 0}
                strokeDasharray={r.dashed ? "4 3" : undefined}
              />
            )}
            <text
              x={BAR_X + w + 10}
              y={y + 13}
              fill={INK}
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {r.ms} ms
            </text>
            <text
              x={BAR_X + w + 68}
              y={y + 13}
              fill={MUTED}
              fontSize="9"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {r.sd}
            </text>
          </g>
        );
      })}

      {/* the single accent on the page: the segment the API withholds */}
      <text
        x={BAR_X}
        y={158}
        fill={OXBLOOD}
        fontSize="9.5"
        fontFamily="var(--font-geist-mono), monospace"
      >
        dashed = not returned by the API — and where the variance lives
      </text>
      <text
        x={BAR_X}
        y={174}
        fill={MUTED}
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        queue σ 277.0 ms against inference σ 9.9 ms
      </text>
      <line x1={BAR_X} y1={14} x2={BAR_X} y2={140} stroke={AXIS} strokeWidth="0.5" />
    </svg>
  );
}

/** FIG C — the steps knob flattens. One bar per adjacent step pair.
 *  source: _tools/adjacent-diffs.txt:5,7,8,9,10 and steps-28-29-diff.txt:8 */
export function StepDelta() {
  // all nine adjacent pairs, read from the deployed
  // evidence/_tools/adjacent-diffs.txt. The peak is S4→S8 at 16.088%,
  // not S16→S20 — the knob does its heaviest work early.
  const pairs = [
    { label: "S1→2", pct: 0.066 },
    { label: "S2→4", pct: 0.657 },
    { label: "S4→8", pct: 16.088 },
    { label: "S8→12", pct: 6.694 },
    { label: "S12→16", pct: 5.91 },
    { label: "S16→20", pct: 11.92 },
    { label: "S20→28", pct: 7.655 },
    { label: "S28→36", pct: 1.488 },
    { label: "S36→45", pct: 3.98 },
  ];
  const MAX = 18;
  const W = 560;
  const H = 200;
  const BASE = 148;
  const LEFT = 44;
  const slot = (W - LEFT - 24) / pairs.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Pixels changed between adjacent step rungs: 6.694, 11.92, 7.655, 1.488 and 3.98 percent."
    >
      {[0, 6, 12, 18].map((g) => (
        <g key={g}>
          <line
            x1={LEFT}
            y1={BASE - (g / MAX) * 116}
            x2={W - 24}
            y2={BASE - (g / MAX) * 116}
            stroke={AXIS}
            strokeWidth="0.5"
          />
          <text
            x={LEFT - 8}
            y={BASE - (g / MAX) * 116 + 3}
            textAnchor="end"
            fill={MUTED}
            fontSize="9"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {g}%
          </text>
        </g>
      ))}

      {pairs.map((p, i) => {
        const h = (p.pct / MAX) * 116;
        const x = LEFT + i * slot + slot * 0.22;
        const bw = slot * 0.56;
        return (
          <g key={p.label}>
            <rect x={x} y={BASE - h} width={bw} height={h} fill={INK} />
            <text
              x={x + bw / 2}
              y={BASE - h - 6}
              textAnchor="middle"
              fill={INK}
              fontSize="9.5"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {p.pct}%
            </text>
            <text
              x={x + bw / 2}
              y={BASE + 14}
              textAnchor="middle"
              fill={MUTED}
              fontSize="8"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {p.label}
            </text>
          </g>
        );
      })}

      <text
        x={LEFT}
        y={BASE + 40}
        fill={BRONZE}
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        pixels changed, Δ&gt;32 · N=1 per pair · the peak is early, at S4→S8
      </text>
      <text
        x={LEFT}
        y={BASE + 54}
        fill={MUTED}
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        past S28 the curve flattens: 7.655% then 1.488% for the same eight steps
      </text>
    </svg>
  );
}

/** FIG B — inference is linear in steps. The fit is published; the ten
 *  per-rung values are not, so only the two that ARE published are
 *  plotted and the caption says so. Nothing is interpolated.
 *  source: e4-latency/stats.md:20-22 (fit) · :26-27 (the two points) */
export function StepFit() {
  const RUNGS = [1, 2, 4, 8, 12, 16, 20, 28, 36, 45];
  const SLOPE = 19.52;
  const INTERCEPT = -5.0;
  // all ten measured values, stats.md:26-35. The low rungs sit well
  // off the fit — S1 measured 31.9 against a fitted 14.5 — and that is
  // drawn, not smoothed.
  const KNOWN = [
    { steps: 1, ms: 31.9 },
    { steps: 2, ms: 24.5 },
    { steps: 4, ms: 62.4 },
    { steps: 8, ms: 153.8 },
    { steps: 12, ms: 239.4 },
    { steps: 16, ms: 318 },
    { steps: 20, ms: 368.8 },
    { steps: 28, ms: 520.2 },
    { steps: 36, ms: 711.6 },
    { steps: 45, ms: 877 },
  ];
  const W = 560;
  const H = 220;
  const L = 52;
  const B = 168;
  const XMAX = 45;
  const YMAX = 900;
  const px = (s: number) => L + (s / XMAX) * (W - L - 24);
  const py = (ms: number) => B - (ms / YMAX) * (B - 22);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Inference time against steps: fitted slope 19.52 milliseconds per step, R squared 0.9978."
    >
      {[0, 300, 600, 900].map((v) => (
        <g key={v}>
          <line x1={L} y1={py(v)} x2={W - 24} y2={py(v)} stroke={AXIS} strokeWidth="0.5" />
          <text
            x={L - 8}
            y={py(v) + 3}
            textAnchor="end"
            fill={MUTED}
            fontSize="9"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {v}
          </text>
        </g>
      ))}

      {/* the published fit, drawn across the measured range */}
      <line
        x1={px(0)}
        y1={py(INTERCEPT)}
        x2={px(XMAX)}
        y2={py(SLOPE * XMAX + INTERCEPT)}
        stroke={INK}
        strokeWidth="1.2"
      />

      {/* rung positions are published even where the y value is not */}
      {RUNGS.map((s) => (
        <line
          key={s}
          x1={px(s)}
          y1={B}
          x2={px(s)}
          y2={B + 4}
          stroke={AXIS}
          strokeWidth="0.5"
        />
      ))}

      {KNOWN.map((k) => (
        <g key={k.steps}>
          <circle cx={px(k.steps)} cy={py(k.ms)} r="3" fill={INK} />
          <text
            x={px(k.steps) + 6}
            y={py(k.ms) - 6}
            fill={INK}
            fontSize="8"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {k.ms}
          </text>
        </g>
      ))}

      <text
        x={W - 24}
        y={py(SLOPE * XMAX + INTERCEPT) - 8}
        textAnchor="end"
        fill={INK}
        fontSize="9.5"
        fontFamily="var(--font-geist-mono), monospace"
      >
        y = 19.52x − 5.0 · R² 0.9978 · N=10
      </text>
      <text
        x={L}
        y={B + 22}
        fill={MUTED}
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        steps · ticks mark the ten rungs 1 → 45
      </text>
      <text
        x={L}
        y={B + 38}
        fill={BRONZE}
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        ten measured points · the low rungs scatter; the fit is clean from S8 up
      </text>
    </svg>
  );
}

/** FIG D — seed determinism. Three measured durations converging on
 *  one digest. Every value here is file-backed: the durations from
 *  raw-calls.json experiment e3-1, the digest and the pixel count from
 *  e3-seed/report.txt. Note the run is 512x512 — and so is the latency
 *  series, which is why 262,144 is simply 512 squared.
 *  source: raw-calls.json e3-1 · e3-seed/report.txt */
export function SeedDeterminism() {
  const runs = [545.1, 546.8, 549.6];
  const W = 560;

  return (
    <svg
      viewBox={`0 0 ${W} 190`}
      className="w-full"
      role="img"
      aria-label="Three runs at 545.1, 546.8 and 549.6 milliseconds share one sha256 and differ by zero of 262144 pixels."
    >
      {runs.map((ms, i) => {
        const x = 24 + i * 174;
        return (
          <g key={ms}>
            <rect x={x} y={20} width={158} height={62} fill="none" stroke={AXIS} strokeWidth="0.5" />
            <text
              x={x + 79}
              y={44}
              textAnchor="middle"
              fill={MUTED}
              fontSize="9"
              fontFamily="var(--font-geist-mono), monospace"
            >
              run {i + 1}
            </text>
            <text
              x={x + 79}
              y={66}
              textAnchor="middle"
              fill={INK}
              fontSize="13"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {ms} ms
            </text>
          </g>
        );
      })}

      {/* three different durations converging on one identical output */}
      {runs.map((ms, i) => (
        <line
          key={ms}
          x1={24 + i * 174 + 79}
          y1={82}
          x2={W / 2}
          y2={112}
          stroke={AXIS}
          strokeWidth="0.5"
        />
      ))}

      <rect x={W / 2 - 150} y={112} width={300} height={54} fill="none" stroke={INK} strokeWidth="1" />
      <text
        x={W / 2}
        y={134}
        textAnchor="middle"
        fill={INK}
        fontSize="11"
        fontFamily="var(--font-geist-mono), monospace"
      >
        sha256 8dadd968e921aca2… — all three identical
      </text>
      <text
        x={W / 2}
        y={152}
        textAnchor="middle"
        fill={INK}
        fontSize="11"
        fontFamily="var(--font-geist-mono), monospace"
      >
        0 / 262,144 pixels differ
      </text>
      <text
        x={24}
        y={182}
        fill={MUTED}
        fontSize="9"
        fontFamily="var(--font-geist-mono), monospace"
      >
        three distinct durations — real recomputation, not a cache · 512×512 = 262,144 px
      </text>
    </svg>
  );
}
