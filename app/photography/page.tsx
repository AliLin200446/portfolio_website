import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PhotoSheet from "@/components/PhotoSheet";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "Photography" };

/* PHOTOGRAPHY. The contact sheet the darkroom would actually print.
 * 决策C: one signature line, no sub-brand. Data: content/photography.ts. */
export default function PhotographyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <FolioBar backHref="/" />
      <section className="pt-16 pb-8">
        <h1 className="font-serif text-[length:var(--text-display)] tracking-tight sm:text-[length:var(--text-display)]">PHOTOGRAPHY</h1>
      </section>
      <Suspense>
        <PhotoSheet />
      </Suspense>
      {/* 交叉证据链: these negatives are LATENT's calibration samples */}
      <p className="border-t border-line py-10 font-mono font-medium text-[length:var(--text-meta)]" style={{ borderTopWidth: "0.5px" }}>
        <Link href="/work/latent" className="text-muted transition-colors hover:text-bronze">
          these negatives calibrate LATENT ↗
        </Link>
      </p>
      <div className="pb-24" />
    </main>
  );
}
