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
 * The rules carry no labels. Their three values are the control row's
 * own numbers, already printed in the values column at the top of the
 * same figure; printing them again under the plot said the same thing
 * twice, and it put 0.45 and 0.40 within 12px of each other, which
 * read as two levels of tick rather than one set of readings.
 *
 * Accent discipline: oxblood appears once, on brocade's deviation,
 * which is the one thing in the figure that is a finding.
 *
 * Two layouts, not one scaled down. At 390px the column is 342px wide,
 * so a 560 unit viewBox renders at 0.61 and the 8px axis labels land at
 * 4.9 CSS px, a third of the smallest type anywhere else on the site.
 * The narrow variant is 344 units wide, which is 1:1 in that column, so
 * 8px means 8px. It pays for that by dropping the per-row axis names to
 * a single line above the plot; the values column stays, because the
 * numbers are the evidence.
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

type L = {
  W: number;
  L: number;
  R: number;
  ROW_H: number;
  BAR_H: number;
  TOP: number;
  rowFS: number;
  valFS: number;
  tickFS: number;
  /** per-row axis names only fit in the wide layout */
  axisNames: boolean;
};

const WIDE: L = {
  W: 560, L: 92, R: 96, ROW_H: 46, BAR_H: 9, TOP: 34,
  rowFS: 11, valFS: 10, tickFS: 9, axisNames: true,
};
const NARROW: L = {
  W: 344, L: 62, R: 44, ROW_H: 42, BAR_H: 8, TOP: 44,
  rowFS: 10, valFS: 9, tickFS: 9, axisNames: false,
};

function Fig({ c }: { c: L }) {
  const PLOT = c.W - c.L - c.R;
  const H = c.TOP + ROWS.length * c.ROW_H;
  const px = (v: number) => c.L + v * PLOT;
  const base = c.TOP + ROWS.length * c.ROW_H;

  return (
    <svg
      viewBox={`0 0 ${c.W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Rigidity, flow and specular for a grey control, cotton, knit and brocade. Cotton and knit sit on the control values; brocade separates on all three."
    >
      {/* the narrow layout has no room for a name beside every bar, so
          the reading order is stated once */}
      {!c.axisNames && (
        <text
          x={c.L}
          y={16}
          fill={MUTED}
          fontSize="8"
          fontFamily="var(--font-geist-mono), monospace"
        >
          {AXES.join("  /  ")}, top to bottom
        </text>
      )}

      {[0, 0.5, 1].map((t) => (
        <text
          key={t}
          x={px(t)}
          y={c.TOP - 14}
          textAnchor="middle"
          fill={MUTED}
          fontSize={c.tickFS}
          fontFamily="var(--font-geist-mono), monospace"
        >
          {t.toFixed(1)}
        </text>
      ))}

      {/* the control's three values, carried the full height. This is
          the figure's argument: two rows land on these, one does not */}
      {REF.map((v, i) => (
        <line
          key={i}
          x1={px(v)}
          y1={c.TOP - 8}
          x2={px(v)}
          y2={base - 6}
          stroke={AXIS}
          strokeWidth="1"
        />
      ))}

      {ROWS.map((r, ri) => {
        const y0 = c.TOP + ri * c.ROW_H;
        return (
          <g key={r.name}>
            <text
              x={c.L - 12}
              y={y0 + 16}
              textAnchor="end"
              fill={r.control ? MUTED : INK}
              fontSize={c.rowFS}
              fontFamily="var(--font-geist-mono), monospace"
            >
              {r.name}
            </text>
            {r.control && (
              <text
                x={c.L - 12}
                y={y0 + 29}
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
              const y = y0 + ai * (c.BAR_H + 2);
              // brocade is the only row that leaves the control's
              // lines, so it carries the page's one accent
              const off = Math.abs(v - REF[ai]) > 0.05;
              const fill = r.control ? "none" : off ? OXBLOOD : INK;
              return (
                <g key={ai}>
                  <rect
                    x={c.L}
                    y={y}
                    width={Math.max(v * PLOT, 1)}
                    height={c.BAR_H}
                    fill={fill}
                    stroke={r.control ? MUTED : "none"}
                    strokeWidth={r.control ? 1 : 0}
                    strokeDasharray={r.control ? "3 2" : undefined}
                  />
                  <text
                    x={c.W - c.R + 8}
                    y={y + c.BAR_H - 1}
                    fill={off ? OXBLOOD : MUTED}
                    fontSize={c.valFS}
                    fontFamily="var(--font-geist-mono), monospace"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {v.toFixed(2)}
                  </text>
                  {c.axisNames && ri === 0 && (
                    <text
                      x={c.W - c.R + 46}
                      y={y + c.BAR_H - 1}
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

export default function SilkControl() {
  return (
    <>
      <div className="hidden sm:block">
        <Fig c={WIDE} />
      </div>
      <div className="sm:hidden">
        <Fig c={NARROW} />
      </div>
    </>
  );
}
