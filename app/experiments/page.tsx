import type { Metadata } from "next";
import ExperimentsIndex from "@/components/ExperimentsIndex";
import { FolioBar } from "@/components/folio/FolioChrome";
import styles from "./experiments.module.css";

export const metadata: Metadata = { title: "Experiments" };

export default function ExperimentsPage() {
  return (
    <main className={styles.page}>
      <FolioBar backHref="/" />
      <header className={styles.header}>
        <h1 className={styles.title}>EXPERIMENTS</h1>
      </header>
      <ExperimentsIndex />
    </main>
  );
}
