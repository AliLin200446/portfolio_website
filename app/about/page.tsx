import type { Metadata } from "next";
import { FOOTNOTE } from "@/content/about";
import Venn from "@/components/about/Venn";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "About" };

/*
 * ABOUT — three circles, and the middle one is the job.
 *
 * The page makes one argument: design engineer is not design plus
 * engineering, it is the intersection of judgment, build and
 * measurement. So the diagram is the argument rather than an
 * illustration beside it, and every one of the seven regions has
 * something to say.
 *
 * Copy lives in content/about.ts and is the author's, verbatim.
 */

const CONTACT: { label: string; href: string; text: string; away?: boolean }[] =
  [
    { label: "Email", href: "mailto:alilin406@outlook.com", text: "alilin406@outlook.com" },
    { label: "GitHub", href: "https://github.com/AliLin200446", text: "github.com/AliLin200446", away: true },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alilin406/", text: "linkedin.com/in/alilin406", away: true },
    { label: "X", href: "https://x.com/alilinlab", text: "x.com/alilinlab", away: true },
    { label: "Instagram", href: "https://instagram.com/alilinlab", text: "instagram.com/alilinlab", away: true },
  ];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <FolioBar backHref="/" />

      <section className="pt-16 pb-4">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">ABOUT</h1>
      </section>

      <Venn />

      {/* the footnote: where the disposition came from, once, at the
          bottom, in the smaller face. It is context, not a claim. */}
      <section
        className="mt-16 border-t border-line pt-8"
        style={{ borderTopWidth: "0.5px" }}
      >
        <p className="max-w-[68ch] text-[13px] leading-relaxed text-ink/70">
          {FOOTNOTE}
        </p>
      </section>

      <section
        className="mt-10 border-t border-line pt-6"
        style={{ borderTopWidth: "0.5px" }}
      >
        <nav
          aria-label="Contact"
          className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted"
        >
          {CONTACT.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.away ? "_blank" : undefined}
              rel={c.away ? "noreferrer" : undefined}
              className="transition-colors hover:text-bronze-text"
            >
              {c.text}
            </a>
          ))}
        </nav>
      </section>

      <div className="pb-24" />
    </main>
  );
}
