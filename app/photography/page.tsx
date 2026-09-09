import type { Metadata } from "next";
import styles from "./photography.module.css";
import PhotoSheet from "@/components/PhotoSheet";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "Photography" };

export default function PhotographyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-8 sm:pt-0">
      <FolioBar backHref="/" />
      <section className="pt-16 pb-8">
        <h1 className={`${styles.title} font-serif tracking-tight`}>PHOTOGRAPHY</h1>
      </section>
      <PhotoSheet />
      <div className="pb-24" />
    </main>
  );
}
