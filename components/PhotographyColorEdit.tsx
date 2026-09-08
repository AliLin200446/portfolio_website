import Image from "next/image";
import { colorSections } from "@/content/photography-color-edit";
import type { Format, Roll } from "@/content/photography";
import styles from "@/app/photography/photography.module.css";

export default function PhotographyColorEdit({ format, onOpen }: {
  format: Format | null;
  onOpen: (roll: Roll, index: number) => void;
}) {
  return <div className={styles.edit}>
    {colorSections.map((section, sectionIndex) => {
      const spreads = section.spreads.map((spread) => ({ ...spread,
        images: spread.images.filter((image) => !format || image.roll.format === format),
      })).filter((spread) => spread.images.length);
      if (!spreads.length) return null;
      return <section key={section.id} aria-labelledby={`${section.id}-title`}>
        <h2 id={`${section.id}-title`} className={styles.chapter}>{String(sectionIndex + 1).padStart(2, "0")} / {section.title}</h2>
        <div className={styles.sequence}>
          {spreads.map((spread, spreadIndex) => <div key={spreadIndex} className={`${styles.spread} ${spread.layout === "feature" && spread.images.length === 3 ? styles.feature : styles.three}`}>
            {spread.images.map((photo, i) => {
              const frame = photo.roll.frames[photo.frameIndex];
              return <figure key={frame.src}>
                <a href={frame.src} className={styles.photoLink} onClick={(event) => { event.preventDefault(); onOpen(photo.roll, photo.frameIndex); }}>
                  <Image src={frame.src} alt={photo.alt} width={photo.width} height={photo.height}
                    sizes={`(min-width: 1024px) ${spread.layout === "feature" ? "488px" : "320px"}, (min-width: 640px) 50vw, 100vw`}
                    loading={sectionIndex === 0 && spreadIndex === 0 && i === 0 ? "eager" : "lazy"}
                    className={styles.image} />
                </a>
                <figcaption className={styles.caption}><span>{photo.roll.format}</span><span>{frame.n}</span></figcaption>
              </figure>;
            })}
          </div>)}
        </div>
      </section>;
    })}
  </div>;
}
