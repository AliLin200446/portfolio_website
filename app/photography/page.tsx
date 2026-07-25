import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PhotoSheet from "@/components/PhotoSheet";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "Photography" };

/* PHOTOGRAPHY — the contact sheet the darkroom would actually print.
 * 决策C: one signature line, no sub-brand. Data: content/photography.ts. */
export default function PhotographyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <FolioBar backHref="/" />
      <section className="pt-16 pb-8">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">PHOTOGRAPHY</h1>
        <p className="mt-2 font-serif text-lg">Lin Chenan Photography</p>
        <p className="mt-3 font-mono text-xs tracking-wide text-muted">〔回填:一句定位〕</p>
      </section>
      <Suspense>
        <PhotoSheet />
      </Suspense>
      {/* 交叉证据链: these negatives are LATENT's calibration samples */}
      <p className="border-t border-line py-10 font-mono text-xs" style={{ borderTopWidth: "0.5px" }}>
        <Link href="/work/latent" className="text-muted transition-colors hover:text-bronze">
          these negatives calibrate LATENT ↗
        </Link>
      </p>
      <div className="pb-24" />
    </main>
  );
}
