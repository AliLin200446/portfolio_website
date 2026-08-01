/*
 * THE CONTROL FIGURE.
 *
 * Four rows, three bars each, one 0 to 1 scale. Every coordinate is
 * computed from the readings; nothing is placed by eye.
 *
 * The argument the figure has to make on its own is that cotton and
 * knit sit on the control's line and brocade does not. So the control
 * values are drawn as three reference rules running the full height,
 * and the control row itself is dashed and labelled, because a neutral
 * grey square is not a material and should not be read as one.
 *
 * Accent discipline: oxblood appears once, on brocade's deviation,
 * which is the one thing in the figure that is a finding.
 */

const INK = "#1a1714";
const MUTED = "#6B6357";
const AXIS = "#C9C1B2";
const OXBLOOD = "#9A3B22";

/** second run, values exactly as the endpoint returned them */
const ROWS = [
  { name: "flat", control: true, v: [0.45, 0.4, 0.15] },
  { name: "cotton", control: false, v: [0.48, 0.38, 0.12] },
  { name: "knit", control: false, v: [0.48, 0.38, 0.12] },
  { name: "brocade", control: false, v: [0.78, 0.22, 0.52] },
];
const AXES = ["rigidity", "flow", "specular"];
const REF = ROWS[0].v;

const W = 560;
const L = 92;
const R = 96;
const PLOT = W - L - R;
const ROW_H = 46;
const BAR_H = 9;
const TOP = 34;
const H = TOP + ROWS.length * ROW_H + 52;
const px = (v: number) => L + v * PLOT;

export default function SilkControl() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Rigidity, flow and specular for a grey control, cotton, knit and brocade. Cotton and knit sit on the control values; brocade separates on all three."
    >
      {[0, 0.5, 1].map((t) => (
        <text
          key={t}
          x={px(t)}
          y={20}
          textAnchor="middle"
          fill={MUTED}
          fontSize="9"
          fontFamily="var(--font-geist-mono), monospace"
        >
          {t.toFixed(1)}
        </text>
      ))}

      {/* the control's three values, carried the full height. This is
          the figure's argument: two rows land on these, one does not */}
      {REF.map((v, i) => (
        <g key={i}>
          <line
            x1={px(v)}
            y1={TOP - 8}
            x2={px(v)}
            y2={TOP + ROWS.length * ROW_H - 6}
            stroke={AXIS}
            strokeWidth="1"
          />
          <text
            x={px(v)}
            y={TOP + ROWS.length * ROW_H + (i === 1 ? 22 : 10)}
            textAnchor="middle"
            fill={MUTED}
            fontSize="8"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {v}
          </text>
        </g>
      ))}

      {ROWS.map((r, ri) => {
        const y0 = TOP + ri * ROW_H;
        return (
          <g key={r.name}>
            <text
              x={L - 12}
              y={y0 + 18}
              textAnchor="end"
              fill={r.control ? MUTED : INK}
              fontSize="11"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {r.name}
            </text>
            {r.control && (
              <text
                x={L - 12}
                y={y0 + 31}
                textAnchor="end"
                fill={MUTED}
                fontSize="8"
                letterSpacing="0.12em"
                fontFamily="var(--font-geist-mono), monospace"
              >
                CONTROL
              </text>
            )}

            {r.v.map((v, ai) => {
              const y = y0 + ai * (BAR_H + 2);
              // brocade is the only row that leaves the control's
              // lines, so it carries the page's one accent
              const off = Math.abs(v - REF[ai]) > 0.05;
              const fill = r.control ? "none" : off ? OXBLOOD : INK;
              return (
                <g key={ai}>
                  <rect
                    x={L}
                    y={y}
                    width={Math.max(v * PLOT, 1)}
                    height={BAR_H}
                    fill={fill}
                    stroke={r.control ? MUTED : "none"}
                    strokeWidth={r.control ? 1 : 0}
                    strokeDasharray={r.control ? "3 2" : undefined}
                  />
                  <text
                    x={W - R + 8}
                    y={y + BAR_H - 1}
                    fill={off ? OXBLOOD : MUTED}
                    fontSize="10"
                    fontFamily="var(--font-geist-mono), monospace"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {v.toFixed(2)}
                  </text>
                  {ri === 0 && (
                    <text
                      x={W - R + 46}
                      y={y + BAR_H - 1}
                      fill={MUTED}
                      fontSize="8"
                      fontFamily="var(--font-geist-mono), monospace"
                    >
                      {AXES[ai]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
