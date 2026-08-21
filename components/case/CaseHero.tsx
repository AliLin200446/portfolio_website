import { existsSync } from "node:fs";
import { join } from "node:path";
import { CASE_TOTAL, type CaseHero as CaseHeroData } from "@/content/heroes/_schema";

/*
 * CASE HERO: first screen of a project page. One component, one data
 * entry per project, zero per-project CSS.
 *
 * HAIRLINES. Every rule is a 1px border on a cell, never a pseudo
 * element, and every shared edge is owned by exactly ONE side so a join
 * cannot render 2px. The ownership map, in full:
 *
 *   meta bar      bottom edge, plus right edge on cells 1 and 2
 *   title block   bottom edge
 *   body right    left edge (desktop only)
 *   quadrant TL   right + bottom      quadrant TR   bottom
 *   quadrant BL   right               quadrant BR   none
 *   footer        top edge
 *
 * The quadrant cross is therefore four borders, not eight: the vertical
 * comes from the two left-hand cells, the horizontal from the two top
 * cells. Below 1024px those borders drop and each cell takes a top edge
 * instead, which is what stacks them.
 *
 * OXBLOOD. Used once on this screen, on the index number, per the
 * palette discipline in globals.css. The case page below this hero also
 * carries a seal, so the hero owning one is only correct because the
 * hero is its own full-height screen.
 *
 * COLOUR. slate #4E5B54 measures 6.37:1 on paper #F5F2EC, so it clears
 * AA at 13px without darkening. It is component-scoped rather than a
 * global token because nothing else in the site uses it yet.
 *
 * TITLE WEIGHT. This h1 is Spectral 600. Every other h1 in the repo is
 * 400, and that difference is DELIBERATE: this is a display title, not
 * a section heading. Do not reconcile the two in either direction.
 *
 * The 600 latin face is declared by app/layout.tsx, built, served and
 * preloaded, so this costs no extra request; it only activates a face
 * that was already on the wire. Note that document.fonts.check for a
 * weight nothing paints returns false because next/font activates faces
 * lazily. That is not a missing file, and it was nearly misread as one.
 *
 * HEIGHT. The spec asks for 100svh. The layout reserves 3.25rem of body
 * padding for the fixed site bar, so a literal 100svh would push the
 * footer hairline exactly 52px below the fold. Subtracting the bar is
 * what actually delivers one screen.
 *
 * SERVER COMPONENT. The missing-media fallback resolves at build time
 * with existsSync, so a broken path becomes a placeholder without
 * shipping an onError handler, and this whole screen costs zero JS.
 */
export default function CaseHero({ data }: { data: CaseHeroData }) {
  const mediaPresent = existsSync(join(process.cwd(), "public", data.media.src));

  return (
    <section
      aria-labelledby={`hero-${data.slug}`}
      style={
        {
          "--hero-hair": "color-mix(in srgb, var(--ink) 14%, transparent)",
          "--hero-slate": "#4E5B54",
        } as React.CSSProperties
      }
      className="flex min-h-[calc(100svh-3.25rem)] flex-col bg-paper px-5 sm:pl-10 sm:pr-8 lg:max-h-[calc(100svh-3.25rem)] xl:pl-[132px]"
    >
      {/* ROW 1 · meta bar. 25 / 50 / 25 on desktop; the centre cell is
          dropped below 640px, leaving two equal cells. */}
      <div className="grid h-[35px] shrink-0 grid-cols-2 border-b border-[color:var(--hero-hair)] font-mono text-[length:var(--text-meta)] font-medium uppercase tracking-[0.12em] text-[color:var(--hero-slate)] sm:grid-cols-4">
        <div className="flex items-center gap-2 border-r border-[color:var(--hero-hair)] pr-3">
          <span className="text-oxblood">{data.index}</span>
          <span>{data.meta.left}</span>
        </div>
        <div className="hidden items-center border-r border-[color:var(--hero-hair)] px-3 sm:col-span-2 sm:flex">
          {data.meta.center}
        </div>
        <div className="flex items-center justify-end sm:justify-start sm:pl-3">
          {data.meta.right}
        </div>
      </div>

      {/* ROW 2 · title. Wipes up from its own bottom edge on mount. */}
      <div className="shrink-0 border-b border-[color:var(--hero-hair)] pb-[26px] pt-8">
        <h1
          id={`hero-${data.slug}`}
          className="hero-wipe whitespace-normal font-serif text-[clamp(32px,5.2vw,90px)] font-semibold uppercase leading-[0.92] tracking-tight text-ink lg:whitespace-nowrap lg:text-[clamp(38px,5.2vw,90px)]"
        >
          {data.title}
        </h1>
      </div>

      {/* ROW 3 · body. 12 columns, gap 0, so the hairlines can meet. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        {/* columns 1 to 6: brief, then media. A flex column with
            min-h-0 so the media yields height instead of pushing the
            footer off the screen. */}
        <div className="flex min-h-0 flex-col pt-[26px] lg:col-span-6 lg:pr-[38px]">
          <p className="max-w-[52ch] shrink-0 font-serif text-[length:var(--text-lead)] text-muted">
            {data.brief}
          </p>
          {/* The 4/5 box is the PREFERRED size. min-h-0 plus shrink lets
              flexbox cap it at whatever the row has left, which is the
              computed max-height: no hardcoded pixel ceiling. */}
          <div className="hero-fade mt-8 min-h-0 shrink overflow-hidden aspect-[4/5]">
            {!mediaPresent ? (
              /* Missing asset: a flat 14 percent block, never a broken
                 image icon. Same footprint, so layout does not move. */
              <div
                aria-hidden="true"
                className="h-full w-full bg-[color:var(--hero-hair)]"
              />
            ) : data.media.type === "video" ? (
              <video
                src={data.media.src}
                poster={data.media.poster}
                aria-label={data.media.alt}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={data.media.src}
                alt={data.media.alt}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* columns 7 to 12: the four quadrants. The split is 6/6,
            chosen as integer columns: going 5->6 on the left is +20%
            while 7->6 on the right is -14.3%, so the two percentages
            do not mirror each other. The boundary, and the vertical
            hairline that marks it, move together. */}
        <div className="hero-quads grid grid-cols-1 lg:col-span-6 lg:grid-cols-2 lg:grid-rows-2 lg:border-l lg:border-[color:var(--hero-hair)]">
          {data.quadrants.map((q, i) => (
            <div
              key={q.label}
              className={[
                "hero-quad border-t border-[color:var(--hero-hair)] p-[19px] lg:border-t-0",
                // the cross: vertical from the left column, horizontal
                // from the top row. Four borders, no doubled joins.
                i === 0 &&
                  "lg:border-b lg:border-r lg:border-[color:var(--hero-hair)]",
                i === 1 && "lg:border-b lg:border-[color:var(--hero-hair)]",
                i === 2 && "lg:border-r lg:border-[color:var(--hero-hair)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* The blur AND the mount animation both land HERE, not on
                  the cell. Two reasons, and the second one was a bug.
                  First: the cell owns the hairline borders, and a filter
                  on that element smears the 1px rules into a grey haze.
                  Second: hero-rise fills forwards to transform:none, and
                  a CSS animation outranks a normal declaration, so while
                  it sat on the cell it permanently suppressed the hover
                  scale. Measured as matrix(1,0,0,1,0,0) with the
                  animation live and matrix(1.06,...) with it disabled.
                  Moving it here also stops the mount fading the
                  hairlines, which the palette rules forbid. */}
              <div
                className="hero-quad-inner hero-rise"
                style={{ animationDelay: `${200 + i * 70}ms` }}
              >
                <h2 className="mb-[14px] font-mono text-[length:var(--text-meta)] font-medium uppercase tracking-[0.12em] text-bronze-text">
                  {q.label}
                </h2>
                {/* The outcome quadrant is set one level up, at lead
                    rather than body. That is the whole point of the
                    scale change: at a quarter scale all four quadrants
                    used to be identical grey rectangles, so a reader
                    squinting at the page could not tell which one held
                    the conclusion. Size does that job here, not colour,
                    because the palette is not available to spend on it.
                    SOLUTION is the slot that answers "so what did you
                    build", which is the thing worth finding first.
                    Matched on the label rather than the index so that
                    reordering the quadrants cannot silently promote the
                    wrong one. Copy in this slot has about 70 characters
                    before it runs past three lines in the 277px column
                    at 1440; past that it reads as crowding. */}
                <p
                  className={`font-serif leading-[1.6] text-[color:var(--hero-slate)] ${
                    q.label.toUpperCase() === "SOLUTION"
                      ? "text-[length:var(--text-lead)]"
                      : "text-[length:var(--text-body)]"
                  }`}
                >
                  {q.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4 · footer. Total comes off BERTH_ORDER.length. */}
      <div className="flex h-8 shrink-0 items-center justify-end border-t border-[color:var(--hero-hair)] font-mono text-[length:var(--text-meta)] font-medium uppercase tracking-[0.12em] text-[color:var(--hero-slate)]">
        {data.index}/{CASE_TOTAL}
      </div>
    </section>
  );
}
