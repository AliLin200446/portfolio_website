import Image from "next/image";
import type { CSSProperties } from "react";
import { colorSections, type ColorSpread, type ColorPhoto } from "@/content/photography-color-edit";
import styles from "@/app/photography/photography.module.css";

export function photoCaption(photo: ColorPhoto) {
  const { roll } = photo;
  const format = { "135": "35MM FILM", "120": "120 FILM", digital: "DIGITAL", instant: "INSTANT FILM" }[roll.format];
  return [format, roll.camera, roll.stock, roll.year].filter(value => value && !value.startsWith("DRAFT")).join(" · ");
}

const ratio = (photo: ColorPhoto) => photo.width / photo.height;

// Size columns from intrinsic geometry so unlike frames share a balanced spread.
function spreadStyle({ layout, images }: ColorSpread): CSSProperties {
  let columns = "repeat(4, minmax(0, 1fr))";
  if (layout === "two-up") columns = `${ratio(images[0])}fr ${ratio(images[1])}fr`;
  if (layout === "wide-pair") columns = `${ratio(images[1])}fr ${ratio(images[2])}fr`;
  if (layout === "feature-left") columns = `${ratio(images[0]) * (1 / ratio(images[1]) + 1 / ratio(images[2]))}fr 1fr`;
  if (layout === "feature-right") columns = `1fr ${ratio(images[2]) * (1 / ratio(images[0]) + 1 / ratio(images[1]))}fr`;
  return { "--spread-columns": columns } as CSSProperties;
}

export default function PhotographyColorEdit({ onOpen, sectionIndex }: { onOpen: (photo: ColorPhoto) => void; sectionIndex: number }) {
  return <>
    <div className={styles.edit}>
      {[colorSections[sectionIndex]].map((section) => <section key={section.id} id="color-collection" className={styles.colorSection} aria-labelledby={`${section.id}-title`}>
        <h2 id={`${section.id}-title`} className={styles.chapter}>{String(sectionIndex + 1).padStart(2, "0")} / {section.title}</h2>
        <div className={styles.sequence}>
          {section.spreads.map((spread, spreadIndex) => <div key={spreadIndex} className={`${styles.spread} ${styles[spread.layout]}`} style={spreadStyle(spread)}>
            {spread.images.map((photo, i) => {
              const frame = photo.roll.frames[photo.frameIndex];
              return <figure key={frame.src}>
                <a href={frame.src} className={styles.photoLink} onClick={(event) => { event.preventDefault(); onOpen(photo); }}>
                  <Image src={frame.src} alt={photo.alt} width={photo.width} height={photo.height}
                    sizes={`(max-width: 759px) 92vw, ${spread.layout === "wide-pair" && i === 0 ? "90vw" : spread.layout === "filmstrip" ? "24vw" : "60vw"}`}
                    loading={spreadIndex === 0 && i < 2 ? "eager" : "lazy"} className={styles.image} />
                </a>
                <figcaption className={styles.caption}><span>{photoCaption(photo)}</span><span>{frame.n}</span></figcaption>
              </figure>;
            })}
          </div>)}
        </div>
      </section>)}
    </div>
  </>;
}
