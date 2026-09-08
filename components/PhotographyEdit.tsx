import Image from "next/image";
import { SectionHeader } from "@/components/editorial/Editorial";
import {
  editorialSections,
  resolvePhoto,
  type EditorialPhoto,
  type SpreadLayout,
} from "@/content/photography-edit";
import styles from "@/app/photography/photography.module.css";

function Photograph({ photo, layout, index, opening }: {
  photo: EditorialPhoto;
  layout: SpreadLayout;
  index: number;
  opening: boolean;
}) {
  const image = resolvePhoto(photo);
  const span = layout === "triptych" ? 4 : layout === "editorial-grid" ? (index === 1 ? 8 : 4) : 6;
  const mobilePair = (layout === "triptych" && index > 0) ||
    (layout === "two-up" && index > 1) || (layout === "editorial-grid" && index > 2);
  return (
    <figure className={styles.photograph}>
      <a href={image.src} className={styles.imageLink}>
        <Image
          src={image.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={`(max-width: 379px) 92vw, (max-width: 639px) ${mobilePair ? "46vw" : "92vw"}, (max-width: 1023px) ${Math.ceil(span / 12 * 100)}vw, ${Math.ceil(976 * span / 12)}px`}
          className="block h-auto w-full"
          priority={opening && index === 0}
          loading={opening ? "eager" : "lazy"}
        />
      </a>
      <figcaption className="mt-3 flex justify-between font-mono font-medium text-[length:var(--text-meta)] uppercase text-muted">
        <span>{image.format}</span>
        <span>{image.frame}</span>
      </figcaption>
    </figure>
  );
}

export default function PhotographyEdit() {
  return (
    <div>
      {editorialSections.map((section, i) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className={styles.chapter}>
          <SectionHeader id={`${section.id}-title`} index={String(i + 1).padStart(2, "0")} title={section.title} />
          <div className={styles.sequence}>
            {section.spreads.map((spread, spreadIndex) => (
              <div key={spread.photos.map((photo) => `${photo.rollId}/${photo.frame}`).join("-")} className={`${styles.spread} ${styles[spread.layout]}`}>
                {spread.photos.map((photo, index) => (
                  <Photograph key={`${photo.rollId}/${photo.frame}`} photo={photo} layout={spread.layout} index={index} opening={i === 0 && spreadIndex === 0} />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
