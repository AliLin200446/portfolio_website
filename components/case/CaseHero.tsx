import { existsSync } from "node:fs";
import { join } from "node:path";
import { type CaseHero as CaseHeroData } from "@/content/heroes/_schema";

/** The shared editorial introduction preserves each project's original media and summary. */
export default function CaseHero({ data }: { data: CaseHeroData }) {
  const mediaPresent = existsSync(join(process.cwd(), "public", data.media.src));
  return <section className="case-feature" aria-labelledby={`hero-${data.slug}`}>
    <p className="case-feature-meta">{data.index} · {data.meta.left} · {data.meta.center} · {data.meta.right}</p>
    <h1 id={`hero-${data.slug}`}>{data.title}</h1>
    <p className="case-feature-lead">{data.brief}</p>
    {mediaPresent && <figure className="case-feature-media">
      {data.media.type === "video" ? <video src={data.media.src} poster={data.media.poster} aria-label={data.media.alt} autoPlay muted loop playsInline /> :
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.media.src} alt={data.media.alt} />}
    </figure>}
    <div className="case-feature-summary">{data.quadrants.map(q => <div key={q.label}><h2>{q.label}</h2><p>{q.body}</p></div>)}</div>
  </section>;
}
