import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PhotoSheet from "@/components/PhotoSheet";
import { FolioBar } from "@/components/folio/FolioChrome";
import PhotographyEdit from "@/components/PhotographyEdit";
import { editorialCount, editorialSections } from "@/content/photography-edit";
import styles from "./photography.module.css";

export const metadata: Metadata = { title: "Photography" };

/* A selected edit precedes the complete, format-filtered contact sheets. */
export default function PhotographyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-8 sm:pt-0">
      <FolioBar backHref="/" />
      <section className="pt-10 pb-10 sm:pt-16 sm:pb-12">
        <h1 className={`${styles.title} font-serif tracking-tight`}>PHOTOGRAPHY</h1>
        <p className="mt-4 font-serif text-[length:var(--text-lead)] text-muted">
          Studies in figure, light, and color.
        </p>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 font-mono font-medium text-[length:var(--text-meta)] text-muted">
          <span>{editorialCount} SELECTED PHOTOGRAPHS</span>
          <nav aria-label="Photography chapters" className="flex flex-wrap gap-x-5 gap-y-3">
            {editorialSections.map((section, i) => (
              <a key={section.id} href={`#${section.id}`} className="hover:text-bronze">
                0{i + 1} / {section.title}
              </a>
            ))}
            <a href="#archive" className="hover:text-bronze">ARCHIVE ↓</a>
          </nav>
        </div>
      </section>
      <PhotographyEdit />
      <div className="mt-20 flex flex-wrap items-baseline justify-between gap-6 border-t border-line py-10 font-mono font-medium text-[length:var(--text-meta)] text-muted sm:mt-32">
        <p>The eye came before the instrument.</p>
        <Link href="/work/latent" className="hover:text-bronze">
          NEXT / LATENT →
        </Link>
      </div>
      <section id="archive" aria-labelledby="archive-title" className={`${styles.archive} pt-12`}>
        <h2 id="archive-title" className="mb-6 font-serif text-[length:var(--text-title)]">ARCHIVE</h2>
        <Suspense>
          <PhotoSheet />
        </Suspense>
      </section>
      <div className="pb-24" />
    </main>
  );
}
