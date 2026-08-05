import type { Metadata } from "next";
import Venn from "@/components/about/Venn";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "About" };

/*
 * ABOUT — three circles, and the middle one is the job.
 *
 * The page makes one argument: the job is not one discipline plus
 * another, it is the intersection of judgment, build and measurement. So the diagram is the argument rather than an
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

      {/* addresses, one per line and labelled. A bare row of URLs makes
          the reader work out which is which from the domain. */}
      <section
        className="mt-16 border-t border-line pt-6"
        style={{ borderTopWidth: "0.5px" }}
      >
        <dl className="font-mono text-[13px]">
          {CONTACT.map((c) => (
            <div key={c.label} className="flex gap-2 py-1">
              <dt className="text-muted">{c.label}:</dt>
              <dd>
                <a
                  href={c.href}
                  target={c.away ? "_blank" : undefined}
                  rel={c.away ? "noreferrer" : undefined}
                  className="border-b border-line pb-px transition-colors hover:text-bronze-text"
                >
                  {c.text}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="pb-24" />
    </main>
  );
}
