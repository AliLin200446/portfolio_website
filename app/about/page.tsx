import AboutAvatar from "@/components/editorial/AboutAvatar";
import { CopyEmail } from "@/interaction/components/CopyEmail";
import { NYClock } from "@/interaction/components/Readout";
import type { Metadata } from "next";
import Link from "next/link";
import TabShell from "@/components/editorial/TabShell";
import AboutObject from "@/components/editorial/AboutObject";
import { experience, resumeProjects, skills } from "@/content/biography";
import { contactLinks } from "@/content/portfolio";
import "./contents.css";
export const metadata: Metadata = { title: "About" };
const objects = [
  "I photograph on 35mm, 120 and instant film.",
  "I built Latent to teach a browser how film behaves.",
  "I archived my father’s acupuncture practice: 136 points, 4,138 cases.",
  "I measure what AI fakes, then build what it can’t.",
  "I run Ali Lin Lab, an independent studio in New York.",
  "I studied Interactive Media Arts at NYU Tisch.",
  "alilin406@outlook.com",
];
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="contents-group" aria-label={title}><div className="contents-line contents-heading"><h2>{title}</h2></div>{children}</section>;
}
function Row({ meta, number, children }: { meta: string; number: string; children: React.ReactNode }) {
  return <div className="contents-line contents-row"><span className="contents-meta">{meta}</span><span className="contents-number">{number}</span><div>{children}</div></div>;
}
export default function AboutPage() {
  return <TabShell className="about-contents">
    <div className="contents-inner">
      <section className="about-avatar-hero" aria-label="About Ali Lin">
        <AboutAvatar />
        <div className="about-hero-text"><span className="about-hero-kicker">05 / About</span>
          <h1>Ali Lin<br /><em>design engineer</em></h1>
          <p>I&apos;m a Design Engineer building interactive tools with Generative AI and visual computing, which gives creators more control over the creative process.</p>
          <dl><div><dt>Based</dt><dd>New York</dd></div><div><dt>Status</dt><dd><span className="about-status-dot" />Open to full-time</dd></div><div><dt>Contact</dt><dd><a href="mailto:alilin406@outlook.com">Email ↗</a></dd></div></dl>
        </div>
      </section>
      <section className="contents-objects" aria-label="Seven objects"><div className="contents-line contents-heading"><h2>Seven objects</h2></div>{objects.map((text, i) => {
        const body = <><span className="contents-object"><AboutObject index={i} /></span><span className="contents-number">0{i + 1}</span><span>{text}</span></>;
        return i === 6 ? <a className="contents-line contents-object-row contents-email" href="mailto:alilin406@outlook.com" key={text}>{body}</a> : <div className="contents-line contents-object-row" key={text}>{body}</div>;
      })}</section>
      <Group title="Practice">
        <Row meta="WebGL2 · GLSL · Three.js" number="A">Real-time graphics, calibrated to physical references.</Row>
        <Row meta="Next.js · React Native · i18n" number="B">Interface engineering: design systems written as code.</Row>
        <Row meta="Benchmarks · spectral analysis" number="C">Instrumentation: measuring what models and APIs actually do.</Row>
      </Group>
      <Group title="Experience">{experience.map(job => <Row key={job.name} meta={job.role} number={job.date.includes('2024') ? '2024–25' : '2026'}><strong>{job.name}</strong><span className="contents-job-date">{job.date} · {job.location}</span><p>{job.points[0]}</p></Row>)}</Group>
      <Group title="Research & IP"><Row meta="Vestige" number="2026">A filed provisional covering the role-differentiated proof architecture. <Link href="/work/vestige">Read case ↗</Link></Row></Group>
      <Group title="Education"><Row meta="Interactive Media Arts · STEM" number="2026"><strong>New York University, Tisch School of the Arts</strong><p>Interactive Media Arts · May 2026 · GPA 3.85</p></Row></Group>
      <Group title="Tools">
        <Row meta="Daily" number="A">TypeScript, React, Next.js, WebGL2, GLSL, Three.js.</Row>
        <Row meta="Also" number="B">React Native, Figma, Python, Photoshop, Lightroom, Capture One.</Row>
        <Row meta="Analog" number="C">35mm, 120 and instant film.</Row>
      </Group>
      <Group title="Elsewhere"><div className="contents-line contents-links"><div>{contactLinks.map(link => <Link key={link.label} href={link.href}>{link.label} ↗</Link>)}<Link href="/photography">Photography ↗</Link><CopyEmail /></div></div></Group>
      <details id="resume-title" className="contents-resume"><summary>Resume / web edition <span>+</span></summary><div className="contents-resume-body"><h2>Professional experience</h2>{experience.map(job => <article key={job.name}><h3>{job.name}</h3><p>{job.role} · {job.date}</p><ul>{job.points.map(point => <li key={point}>{point}</li>)}</ul></article>)}<h2>Selected projects</h2>{resumeProjects.map(project => <article key={project.name}><h3><Link href={project.href}>{project.name} ↗</Link></h3><p>{project.stack}</p><ul>{project.points.map(point => <li key={point}>{point}</li>)}</ul></article>)}<h2>Skills</h2><dl>{skills.map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></div></details>
    </div>
    <div className="contents-footer"><span>© 2026 Ali Lin Lab LLC</span><span>Open to full-time roles</span><NYClock /></div>
  </TabShell>;
}
