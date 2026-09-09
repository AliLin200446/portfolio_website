import type { Metadata } from "next";
import { FolioBar } from "@/components/folio/FolioChrome";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About" };
const email = "mailto:alilin406@outlook.com";
const contact = [
  { label: "EMAIL", href: email },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/alilin406/" },
  { label: "GITHUB", href: "https://github.com/AliLin200446" },
];
const working = [
  { title: "INTERFACE", items: ["React", "TypeScript"] },
  { title: "GRAPHICS", items: ["WebGL / GLSL", "Three.js / React Three Fiber"] },
  { title: "AI", items: ["Generative image systems", "Model evaluation"] },
];
export default function AboutPage() {
  return (
    <main className={`mx-auto max-w-5xl px-6 ${styles.page}`}>
      <FolioBar backHref="/" />
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>ABOUT</h1>
      </header>

      <section className={styles.opening} aria-label="Introduction">
        <div className={styles.copy}>
          <div><h2 className={styles.name}>ALI LIN</h2><p className={styles.meta}>DESIGN ENGINEER · NEW YORK</p></div>
          <p>I&apos;m Ali Lin, a Design Engineer based in New York.</p>
          <p>I build creative tools across visual computing, generative AI, and real-time graphics.</p>
          <p>Currently, I research generative image systems for commercial production at Vision On.</p>
          <a className={styles.textLink} href={email}>EMAIL ↗</a>
        </div>
      </section>

      <div className={styles.profile}>
        <section className={styles.section} aria-labelledby="experience">
          <h2 id="experience" className={styles.sectionTitle}>EXPERIENCE</h2>
          <article className={styles.experience}>
            <div><h3 className={styles.lead}>VISION ON</h3><p className={styles.meta}>GENERATIVE IMAGE RESEARCH</p></div>
            <div className={styles.copy}><p className={styles.meta}>NEW YORK / CURRENT</p><p>Evaluating generative image systems for commercial retouching and production.</p></div>
          </article>
        </section>
        <div>
          <section className={styles.section} aria-labelledby="education">
            <h2 id="education" className={styles.sectionTitle}>EDUCATION</h2>
            <h3 className={styles.lead}>NEW YORK UNIVERSITY</h3>
            <p>Interactive Media Arts</p><p>BFA · 2026</p><p className={styles.location}>New York</p>
          </section>
          <section className={styles.section} aria-labelledby="working">
            <h2 id="working" className={styles.sectionTitle}>WORKING WITH</h2>
            <div className={styles.working}>{working.map((group) => <div key={group.title}><h3 className={styles.meta}>{group.title}</h3><ul className={styles.list}>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div>
          </section>
        </div>
      </div>

      <section className={styles.section} aria-labelledby="contact">
        <h2 id="contact" className={styles.sectionTitle}>CONTACT</h2>
        <div className={styles.contact}>{contact.map((item) => <a className={styles.textLink} key={item.label} href={item.href}>{item.label} ↗</a>)}</div>
      </section>
    </main>
  );
}
