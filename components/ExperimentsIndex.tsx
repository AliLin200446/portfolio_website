import Image from "next/image";
import { experiments } from "@/content/experiments";
import styles from "@/app/experiments/experiments.module.css";

// Keep featured-first ordering. Old tag URLs now show the complete index.
export default function ExperimentsIndex() {
  const visible = experiments.filter((e) => e.href || e.repo);
  const ordered = [...visible.filter((e) => e.featured), ...visible.filter((e) => !e.featured)];

  return (
    <>
      {ordered.length > 0 ? (
        <div className={styles.grid}>
          {ordered.map((experiment) => {
            const to = experiment.href ?? experiment.repo!;
            const away = !to.startsWith("/");
            const index = ordered.indexOf(experiment) + 1;
            return (
              <a key={experiment.name} href={to} target={away ? "_blank" : undefined}
                rel={away ? "noopener noreferrer" : undefined} className={styles.cell}
                aria-labelledby={`experiment-${index}`}>
                <div className={styles.visual}>
                  {experiment.shot ? (
                    <Image src={experiment.shot} alt="" width={1600} height={1000}
                      sizes="(min-width: 1280px) 258px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      loading={index === 1 ? "eager" : "lazy"}
                      className={`${styles.image} ${experiment.name === "Consensus Couture" ? styles.diagram : ""}`} />
                  ) : <span className={styles.empty}>No capture yet</span>}
                </div>
                <div className={styles.metadata}>
                  <div className={styles.facts}><span>{String(index).padStart(2, "0")}</span><span>{experiment.year}</span></div>
                  <h2 id={`experiment-${index}`} className={styles.name}>{experiment.name}</h2>
                  <p className={styles.category}>{experiment.stack ?? experiment.tags.join(" / ")}</p>
                  {away && <span className="sr-only">Opens in a new tab</span>}
                </div>
              </a>
            );
          })}
        </div>
      ) : <p role="status" className={styles.empty}>No experiments published yet.</p>}
    </>
  );
}
