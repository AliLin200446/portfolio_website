import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resonance",
};

/*
 * RESONANCE: deliberately not a case page. It sits on a static route
 * rather than in the case registry so it cannot inherit the five-section
 * template and start looking like evidence it does not have.
 *
 * Three claims were struck and must not return. Nothing here may say
 * the piece runs a solver, that it computes anything in the frequency
 * domain, or that it scores the quality of a generation: none of those
 * are true, and the readout that displayed such numbers was removed
 * with them, since the numbers were not measurements. What is left is
 * what is true: a closed loop.
 */

const link =
  "border-b border-bronze pb-px transition-colors hover:text-bronze-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]";

export default function ResonancePage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="sticky top-[3.25rem] z-[3] -mx-6 border-b border-line bg-paper/90 px-6 backdrop-blur-sm flex items-baseline justify-between py-3 font-mono font-medium text-[length:var(--text-meta)] text-muted">
        <Link href="/experiments" className="transition-colors hover:text-bronze-text">
          ← Experiments
        </Link>
        <Link href="/" className="transition-colors hover:text-bronze-text">
          Ali Lin
        </Link>
      </header>

      <section className="py-16">
        <h1 className="font-serif text-[length:var(--text-display)] tracking-tight sm:text-[length:var(--text-display)]">
          RESONANCE
        </h1>
        <p className="mt-5 max-w-[52ch] font-serif text-[length:var(--text-lead)] text-muted">
          an interface for steering generative video: closed human-in-the-loop
          generation.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-mono font-medium text-[length:var(--text-meta)] text-muted">
          <span>experiment</span>
          <span aria-hidden>·</span>
          <span>Three.js / WebGL</span>
          <span aria-hidden>·</span>
          <span>2026</span>
          <span aria-hidden>·</span>
          <a
            href="https://resonance.alilinlab.com"
            target="_blank"
            rel="noreferrer"
            className={link}
          >
            open live ↗
          </a>
        </p>

        {/* the one visual: the loop itself, which is the whole idea */}
        <figure className="my-12 max-w-[68ch]">
          <pre className="overflow-x-auto border border-line bg-[#EDE9E0] p-6 font-mono font-medium text-[length:var(--text-meta)] leading-relaxed text-ink">
{`   ┌──────────────────────────────────────┐
   │                                      │
   ▼                                      │
 render  ──►  generate  ──►  re-ingest  ──┘
 (canvas)     (video model)  (next frame
                              conditions
                              the next)`}
          </pre>
          <figcaption className="mt-3 font-mono font-medium text-[length:var(--text-meta)] leading-relaxed tracking-wide text-muted">
            the loop · what is rendered conditions what is generated, and what
            is generated is rendered back in
          </figcaption>
        </figure>

        <div className="max-w-[68ch] border-t border-line pt-8">
          <p className="font-serif text-[length:var(--text-lead)] leading-relaxed">
            Most generative video is open-loop: you write a prompt, wait, and
            accept or discard what returns. Resonance closes the loop. What is
            on the canvas is fed back as the condition for the next generation,
            so the output becomes something you steer continuously rather than
            re-roll. The interface exists to make that steering direct. You
            adjust the surface, and the next generation inherits it.
          </p>
          <p className="mt-5 font-serif text-[length:var(--text-lead)] leading-relaxed text-muted">
            This one is an experiment, not an instrument. Nothing here is
            measured or benchmarked, and no claim is made about output quality. It demonstrates a control loop and stops there.
          </p>
        </div>

        <div className="mt-14 max-w-[68ch] border-t border-line pt-8">
          <p className="font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-bronze-text">
            THE MEASURED SIBLINGS
          </p>
          <p className="mt-5 font-serif text-[length:var(--text-lead)] leading-relaxed">
            Where this one demonstrates,{" "}
            <Link href="/work/latent" className={link}>
              Latent
            </Link>{" "}
            calibrates against real film stock and{" "}
            <Link href="/work/teardown" className={link}>
              Teardown № 1
            </Link>{" "}
            publishes every number with its source file. Those two carry the
            evidence; this one carries the idea.
          </p>
        </div>
      </section>
      <div className="pb-24" />
    </main>
  );
}
