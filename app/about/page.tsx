import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

/*
 * ABOUT — same type law as the case pages: Spectral roman for prose,
 * Geist Mono for every label and address, prose capped at 68ch, no
 * italics. The page is a pitch, not a biography: one positioning line,
 * two short paragraphs, a compact NOW block, one approach paragraph,
 * then addresses. Anything longer stops being read.
 */

const LABEL = "font-mono text-xs uppercase tracking-widest text-bronze-text";
const PROSE = "max-w-[68ch] font-serif text-[17px] leading-relaxed";

/** NOW and CONTACT share one row shape: mono key, aligned, value in the
 *  medium it belongs to — serif for facts, mono for addresses. */
function Row({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[9rem_1fr] sm:gap-6">
      <dt className="font-mono text-[11px] uppercase tracking-widest text-bronze-text">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "font-mono text-[13px] leading-relaxed"
            : "font-serif text-[16px] leading-relaxed"
        }
      >
        {children}
      </dd>
    </div>
  );
}

const link =
  "border-b border-line pb-px transition-colors hover:text-bronze-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="sticky top-[3.25rem] z-[3] -mx-6 border-b border-line bg-paper/90 px-6 backdrop-blur-sm flex items-baseline justify-between py-3 font-mono text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-bronze-text">
          ← Index
        </Link>
        <span>Ali Lin</span>
      </header>

      <section className="py-16">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          About
        </h1>

        {/* WHO. The positioning line that used to sit above this was
            removed; the first paragraph now opens the page. */}
        <div className="mt-10 pt-2">
          <p className={PROSE}>
            Ali Lin — design engineer in Manhattan. I work at the seam
            between design and code: WebGL shaders, measurement harnesses,
            and live tools you can open and run. Everything I make ships
            live, with the numbers open.
          </p>
          <p className={`${PROSE} mt-5`}>
            Before this I spent years as an editorial photographer, shooting
            medium-format digital and film. That&rsquo;s not a side note —
            it&rsquo;s why I calibrate a film emulator against my own
            negatives instead of a preset, and why I trust a measured
            highlight over a described one.
          </p>
        </div>

        {/* ③ NOW */}
        <div className="mt-14 border-t border-line pt-8">
          <p className={LABEL}>NOW</p>
          <dl className="mt-6 max-w-[68ch]">
            <Row label="Education">
              NYU Tisch, Interactive Media Arts (BFA, STEM), 2026
            </Row>
            <Row label="Currently">
              AI research intern at Vision On · building through Ali Lin Lab
              LLC
            </Row>
            <Row label="Also">photographer — Lin Chenan Photography</Row>
          </dl>
        </div>

        {/* ④ APPROACH */}
        <div className="mt-14 border-t border-line pt-8">
          <p className={LABEL}>APPROACH</p>
          <p className={`${PROSE} mt-6`}>
            The through-line across the work: take an AI capability and make
            it controllable, measurable, or verifiable. A film engine
            calibrated to real stock. An API teardown where every number
            traces to a source file — and the raw files ship with the report. A
            product passport that proves what it
            can&rsquo;t reveal. I&rsquo;m drawn to the point where a
            generative system&rsquo;s output stops being a demo and becomes
            something you can audit, drive, and take away.
          </p>
        </div>

        {/* ⑤ CONTACT */}
        <div className="mt-14 border-t border-line pt-8">
          <p className={LABEL}>CONTACT</p>
          <dl className="mt-6 max-w-[68ch]">
            <Row label="Email" mono>
              <a href="mailto:alilin406@outlook.com" className={link}>
                alilin406@outlook.com
              </a>
            </Row>
            <Row label="GitHub" mono>
              <a
                href="https://github.com/AliLin200446"
                target="_blank"
                rel="noreferrer"
                className={link}
              >
                github.com/AliLin200446
              </a>
              {/* the repo was checked unauthenticated, with a 404 control
                  on a nonexistent name, so 200 means genuinely public */}
              <span className="mt-1 block text-muted">
                selected code:{" "}
                <a
                  href="https://github.com/AliLin200446/teardown"
                  target="_blank"
                  rel="noreferrer"
                  className={link}
                >
                  github.com/AliLin200446/teardown
                </a>
              </span>
            </Row>
            <Row label="LinkedIn" mono>
              <a
                href="https://www.linkedin.com/in/alilin406/"
                target="_blank"
                rel="noreferrer"
                className={link}
              >
                linkedin.com/in/alilin406
              </a>
            </Row>
            <Row label="X" mono>
              <a
                href="https://x.com/alilinlab"
                target="_blank"
                rel="noreferrer"
                className={link}
              >
                x.com/alilinlab
              </a>
            </Row>
            <Row label="Instagram" mono>
              <a
                href="https://instagram.com/alilinlab"
                target="_blank"
                rel="noreferrer"
                className={link}
              >
                instagram.com/alilinlab
              </a>
            </Row>
          </dl>
        </div>
      </section>
      <div className="pb-24" />
    </main>
  );
}
