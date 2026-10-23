import type { Metadata } from "next";
import Image from "next/image";
import { FolioBar } from "@/components/folio/FolioChrome";
import { cacu } from "@/content/projects/cacu";

export const metadata: Metadata = { title: cacu.label, description: cacu.blurb };
const label = "font-mono text-[length:var(--text-meta)] uppercase tracking-wide text-muted";

export default function CacuPage() {
  return <main id="main-content" className="case-simple mx-auto max-w-5xl px-6 pb-24 pt-8 sm:pt-0">
    <FolioBar backHref="/" />
    <header className="py-10">
      <p className={label}>{cacu.category} · {cacu.year}</p>
      <h1 className="mt-4 max-w-[20ch] font-serif text-[length:var(--text-title)] leading-tight sm:text-[length:var(--text-display)]">{cacu.label}</h1>
      <p className="mt-6 max-w-[55ch] text-[length:var(--text-body)] leading-relaxed">{cacu.blurb}</p>
      <p className={`mt-4 ${label}`}>ROLE / {cacu.role}</p>
      <a href={cacu.liveHref} target="_blank" rel="noreferrer" className="mt-6 inline-block border-b border-line font-mono text-[length:var(--text-meta)] text-bronze-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">VISIT SITE ↗</a>
    </header>
    <figure><Image {...cacu.preview} alt={cacu.preview.alt} sizes="(min-width: 1024px) 976px, 100vw" priority className="h-auto w-full border border-line" /><figcaption className={`mt-3 ${label}`}>PRODUCTION WEBSITE / CACUCLINIC.COM</figcaption></figure>
    <div className="mt-10 grid gap-8 sm:grid-cols-2">
      <section className="border-t border-line pt-4"><h2 className={label}>01 / CONTEXT</h2><p className="mt-4 text-[length:var(--text-body)] leading-relaxed">A website for an acupuncture practice serving Georgetown and the Austin area. The design connects the clinic&apos;s Chinese-medicine heritage with clear, practical information for patients.</p></section>
      <section className="border-t border-line pt-4"><h2 className={label}>02 / INFORMATION ARCHITECTURE</h2><p className="mt-4 text-[length:var(--text-body)] leading-relaxed">Services, practitioner information, testimonials and FAQs support the decision to seek care. Contact, insurance verification and appointment booking provide clear next steps.</p></section>
    </div>
  </main>;
}
