import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="flex items-baseline justify-between py-6 font-mono text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-oxblood">
          ← Index
        </Link>
        <span>Ali Lin</span>
      </header>

      <section className="py-16">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          About
        </h1>

        <div className="mt-10 max-w-[68ch] space-y-4 text-[15px] leading-relaxed">
          <p>
            Ali Lin — Design Engineer and Creative Technologist. Interactive
            Media Arts @ NYU.
          </p>
        </div>

        <dl className="mt-14 max-w-[68ch] border-t border-line pt-6 font-mono text-sm">
          <div className="flex gap-6 py-1.5">
            <dt className="w-20 text-muted">Email</dt>
            <dd>
              <a
                href="mailto:alilin406@outlook.com"
                className="transition-colors hover:text-oxblood"
              >
                alilin406@outlook.com
              </a>
            </dd>
          </div>
          <div className="flex gap-6 py-1.5">
            <dt className="w-20 text-muted">LinkedIn</dt>
            <dd>
              <a
                href="https://www.linkedin.com/in/alilin406/"
                className="transition-colors hover:text-oxblood"
              >
                linkedin.com/in/alilin406
              </a>
            </dd>
          </div>
          <div className="flex gap-6 py-1.5">
            <dt className="w-20 text-muted">Twitter</dt>
            <dd>
              <a
                href="https://x.com/alilinlab"
                className="transition-colors hover:text-oxblood"
              >
                x.com/alilinlab
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
