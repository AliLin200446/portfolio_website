import type { Metadata } from "next";
import { FolioBar } from "@/components/folio/FolioChrome";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About" };

const experience = [
  {
    name: "Vision On", location: "New York, NY", role: "AI Image Research Intern", date: "July 2026 – Present",
    points: [
      "Built production benchmarks to evaluate 20+ AI image models for commercial retouching, testing model strengths and failure modes across 10 production scenarios with senior retouchers.",
      "Built a model-selection taxonomy mapping production tasks to model capabilities and failure modes; adopted into the studio’s AI retouching pipeline.",
      "Shipped 100+ client-facing AI assets and 10+ advertising videos, turning model experiments into repeatable production workflows.",
    ],
  },
  {
    name: "Ali Lin Lab LLC", location: "New York, NY", role: "Founder · Design Engineer", date: "June 2026 – Present",
    points: [
      "Built ACUBOT with Expo and React Native, creating a bilingual learning system covering 136 acupuncture points and 4,000+ clinical cases; designed the search, content architecture, and interaction system. Currently in closed beta.",
      "Rebuilt a Texas acupuncture clinic’s website from WordPress to a static Vercel deployment, redesigning the information architecture around five patient-centered service pathways.",
    ],
  },
  {
    name: "HFunds", location: "Remote", role: "AI Creative Engineer Intern", date: "Dec 2024 – Apr 2025",
    points: [
      "Built an end-to-end AI content pipeline with OpenAI and Hugging Face APIs, cutting per-asset turnaround by roughly 30 percent across the creative team.",
      "Bridged ML capabilities and product design, translating model behavior into production-ready creative workflows under tight launch timelines.",
    ],
  },
];
const projects = [
  { name: "Latentfilm", href: "https://latentfilm.com", stack: "WebGL · GLSL · TypeScript · React", points: [
    "Built a real-time film physics engine in WebGL and GLSL, modeling halation, grain structure, and film response for AI-generated video entirely in the browser GPU.",
    "Calibrated film profiles against original CineStill 800T and Portra 400 scans, using measured film behavior rather than published LUTs.",
  ] },
  { name: "Teardown", href: "/work/teardown", stack: "TypeScript · React · fal.ai API", points: [
    "Built an interactive tool to instrument diffusion inference end-to-end, exposing latency, convergence, sampling behavior, and queue dynamics hidden behind hosted APIs.",
    "Measured 47 inference calls and isolated the dominant source of latency variance: queue time (277 ms std) versus inference (9.9 ms std), with raw measurements shipped alongside the report.",
  ] },
  { name: "Skeletal Silk", href: "/work/skeletal-silk", stack: "Claude Vision · GLSL · TypeScript", points: [
    "Built a vision-to-shader pipeline that extracts material parameters from fabric images with Claude Vision and drives a real-time GLSL material simulation.",
    "Added validation, rate limiting, error handling, and shader export to make the prototype production-ready.",
  ] },
];
const skills = [
  ["AI", "Claude Code, Cursor, Anthropic API, OpenAI, Hugging Face, fal.ai, Replicate, diffusion evaluation, VLM pipelines"],
  ["Languages", "TypeScript, JavaScript, Python, GLSL, Solidity"],
  ["Graphics", "WebGL2, GLSL, Three.js, React Three Fiber, shader authoring, color science, WebCodecs"],
  ["Frontend", "React, Next.js, semantic HTML, modern CSS, Tailwind, Expo, React Native"],
  ["Tools", "Git, Weavy, Figma, Photoshop, Lightroom, Capture One"],
  ["Photography", "Medium-format film & digital. Four years of editorial work across three NYU publications; 100+ commissioned shoots."],
];
const contact = [
  { label: "Email", value: "alilin406@outlook.com", href: "mailto:alilin406@outlook.com" },
  { label: "Phone", value: "617-818-6562", href: "tel:+16178186562" },
  { label: "Website", value: "alilinlab.com", href: "https://alilinlab.com" },
  { label: "X", value: "@alilinlab", href: "https://x.com/alilinlab" },
  { label: "LinkedIn", value: "Ali Lin", href: "https://www.linkedin.com/in/alilin406/" },
  { label: "GitHub", value: "AliLin200446", href: "https://github.com/AliLin200446" },
];

export default function AboutPage() {
  return (
    <main className={`mx-auto max-w-5xl px-6 ${styles.page}`}>
      <FolioBar backHref="/" />
      <div className={styles.layout}>
        <section className={styles.resume} aria-labelledby="resume-title">
          <h2 id="resume-title" className={styles.columnTitle}>Resume</h2>
          <section className={styles.section} aria-labelledby="education-title">
            <h3 id="education-title" className={styles.sectionTitle}>Education</h3>
            <article className={styles.entry}>
              <h4 className={styles.entryTitle}>New York University</h4>
              <p>Interactive Media Arts (STEM)</p>
              <p className={styles.meta}>New York, NY · May 2026 · GPA 3.85</p>
            </article>
          </section>
          <section className={styles.section} aria-labelledby="experience-title">
            <h3 id="experience-title" className={styles.sectionTitle}>Work Experience</h3>
            {experience.map((job) => <article key={job.name} className={styles.entry}>
              <h4 className={styles.entryTitle}>{job.name}</h4>
              <p>{job.role}</p>
              <p className={styles.meta}>{job.location} · {job.date}</p>
              <ul className={styles.points}>{job.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </article>)}
          </section>
          <section className={styles.section} aria-labelledby="projects-title">
            <h3 id="projects-title" className={styles.sectionTitle}>Projects</h3>
            {projects.map((project) => <article key={project.name} className={styles.entry}>
              <h4 className={styles.entryTitle}><a className={styles.textLink} href={project.href}>{project.name} ↗</a></h4>
              <p className={styles.meta}>{project.stack}</p>
              <ul className={styles.points}>{project.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </article>)}
          </section>
          <section className={styles.section} aria-labelledby="skills-title">
            <h3 id="skills-title" className={styles.sectionTitle}>Technical Skills</h3>
            <dl>{skills.map(([label, value]) => <div key={label} className={styles.skill}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          </section>
        </section>
        <div className={styles.personal}>
          <section aria-labelledby="about-title">
            <h1 id="about-title" className={styles.columnTitle}>About Me</h1>
            <div className={styles.introduction}>
              <h2 className={styles.name}>Ali Lin</h2>
              <p className={styles.meta}>Design Engineer · New York</p>
              <div className={styles.copy}>
                <p>I build creative tools across visual computing, generative AI, and real-time graphics.</p>
                <p>My work connects visual judgment with technical systems: film physics in the browser, material simulation from photographs, and tools for measuring generative models.</p>
                <p>Currently, I research AI image systems for commercial production at Vision On and build independent tools through Ali Lin Lab.</p>
                <p>Photography is part of my practice, spanning medium-format film, digital images, and four years of editorial work across three NYU publications.</p>
              </div>
            </div>
          </section>
          <section className={styles.contact} aria-labelledby="contact-title">
            <h2 id="contact-title" className={styles.columnTitle}>Contact</h2>
            <dl>{contact.map((item) => <div key={item.label} className={styles.contactRow}>
              <dt>{item.label}</dt><dd><a className={styles.textLink} href={item.href}>{item.value} ↗</a></dd>
            </div>)}</dl>
          </section>
        </div>
      </div>
    </main>
  );
}
