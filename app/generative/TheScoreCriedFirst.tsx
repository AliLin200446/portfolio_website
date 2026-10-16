import editorial from "./generative.module.css";
import styles from "./the-score-cried-first.module.css";

export default function TheScoreCriedFirst() {
  return (
    <section className={styles.section} aria-labelledby="the-score-cried-first-title">
      <div className={editorial.heading}>
        <h2 id="the-score-cried-first-title" className={editorial.title}>THE SCORE CRIED FIRST</h2>
      </div>
      <div className={styles.grid}>
        {[1, 2, 3].map((id) => (
          <video key={id} width={960} height={1430} autoPlay muted loop playsInline
            preload="metadata" poster={`/generative/the-score-cried-first/${id}.jpg`}
            aria-label={`The Score Cried First, study ${id}`} className={editorial.video}>
            <source src={`/generative/the-score-cried-first/${id}.mp4`} type="video/mp4" />
          </video>
        ))}
      </div>
    </section>
  );
}
