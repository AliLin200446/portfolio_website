import Image from "next/image";
import Link from "next/link";
import EditorialHeader from "./EditorialHeader";
import { contactLinks, labProjects, latentMedia, photographs, selectedProjects } from "@/content/portfolio";

function SectionLabel({ number, children, note }: { number: string; children: React.ReactNode; note?: string }) {
  return <div className="ed-section-label"><h2><span>{number}</span>{children}</h2>{note && <span>{note}</span>}</div>;
}
export default function EditorialHome() {
  return <div className="editorial-page ed-home">
    <EditorialHeader />
    <main id="main-content">
      <section className="ed-hero" aria-labelledby="intro-title">
        <div className="ed-hero-top"><span>Independent practice / New York</span><span>Portfolio · 2026</span></div>
        <h1 id="intro-title">I translate visual<br />judgment <em>into systems.</em></h1>
        <div className="ed-hero-bottom"><span className="ed-cross" aria-hidden="true">+</span><p>Design engineer in New York. Real-time graphics, interface engineering, and the instrumentation in between.</p><a href="#work">Explore selected work <span aria-hidden="true">↓</span></a></div>
      </section>
      <div className="ed-metadata"><div><span>Currently</span>FRAMEFIELD <small>In progress</small></div><Link href="/work/latent"><span>Latest</span>Latent ↗</Link><div><span>Education</span>NYU Tisch IMA</div></div>
      <section id="work" className="ed-work"><SectionLabel number="02" note="Selected projects / 01–05">Selected work</SectionLabel>
        <div className="ed-index-head" aria-hidden="true"><span>Year</span><span>Selected work</span><span>Type of work</span><span>What it does</span><span>Open</span></div>
        <ol className="ed-projects">{selectedProjects.map((project, i) => {
          const content = <><span className="ed-project-year">{project.year}</span><span className="ed-project-name"><sup>{String(i + 1).padStart(2, "0")}</sup>{project.name}</span><span className="ed-project-type">{project.type}</span><span className="ed-project-description">{project.description}</span><span className={project.draft ? "ed-draft" : "ed-arrow"}>{project.draft ? "Draft" : "↗"}</span></>;
          return <li key={project.name}>{project.href ? <Link className="ed-project-row" href={project.href}>{content}</Link> : <div className="ed-project-row ed-project-draft">{content}</div>}</li>;
        })}</ol>
        <div className="ed-index-tail"><p>Selected systems, from image formation to material behavior.</p><Link href="/experiments">Full experiment index ↗</Link><Link href="/work/teardown">Teardown case study ↗</Link><Link href="/work/cacu">Client work / CACU ↗</Link></div>
      </section>
      <section id="latent" className="ed-feature"><SectionLabel number="03" note="Featured / Latent">The material is alive.</SectionLabel><div className="ed-feature-body">
        <figure><div className="ed-feature-image"><Image src={latentMedia.src} alt={latentMedia.alt} fill sizes="(max-width: 767px) 100vw, 65vw" /></div><figcaption><span>01 / Calibration workbench</span><span>Reference scan ↔ Engine output</span></figcaption></figure>
        <div className="ed-feature-copy"><span className="ed-eyebrow">Real-time film physics</span><h3>Beyond the<br /><em>film look.</em></h3><p>Latent models how film responds to light. Halation and grain, calibrated against negatives I shot and scanned myself.</p><dl><div><dt>Pipeline</dt><dd>Threshold → Blur → Composite → Color response → Grain</dd></div><div><dt>Film stock</dt><dd>CineStill 800T calibration</dd></div><div><dt>Built with</dt><dd>WebGL2 / GLSL / WebCodecs</dd></div></dl><div className="ed-feature-links"><Link href="/work/latent">Read case study <span>↗</span></Link><a href="https://latentfilm.com">Live website <span>↗</span></a></div></div>
      </div></section>
      <section className="ed-capabilities"><SectionLabel number="04">What I do</SectionLabel><div className="ed-three-columns">{[
        ["A", "Real-time Graphics", "Shader pipelines, visual computing, optical simulation."], ["B", "Interface Engineering", "Interactive tools, design systems, web and native interfaces."], ["C", "Instrumentation", "Model evaluation, visual analysis, performance measurement."],
      ].map(([letter, title, description]) => <article key={letter}><span className="ed-capability-letter">{letter}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section id="lab" className="ed-lab"><SectionLabel number="05" note="Tests, tools & open questions">From the lab</SectionLabel><div className="ed-lab-grid">{labProjects.map((project, i) => <Link href={project.href} key={project.name}><div className="ed-lab-image"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 767px) 46vw, 25vw" /></div><div className="ed-lab-caption"><span>0{i + 1} / {project.type}</span><h3>{project.name}<span>↗</span></h3></div></Link>)}</div></section>
      <section id="photography" className="ed-photography"><SectionLabel number="06" note="Observation before simulation">Photographic practice</SectionLabel><div className="ed-photo-grid">{photographs.map(photo => <figure key={photo.src}><Link href="/photography"><div className="ed-photo-image"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 46vw, 25vw" /></div></Link><figcaption>{photo.label}</figcaption></figure>)}<div className="ed-photo-copy"><span className="ed-eyebrow">From silver to silicon</span><h3>The scans Latent is calibrated against.</h3><p>A photographic practice informs the engineering. Selected frames from the film archive; calibration references are documented in the Latent case study.</p><Link href="/photography">View photography ↗</Link></div></div></section>
      <section id="contact" className="ed-contact"><SectionLabel number="07" note="Open to full-time roles">Let’s build something precise.</SectionLabel><a className="ed-email" href="mailto:alilin406@outlook.com">alilin406@outlook.com <span>↗</span></a><div className="ed-contact-bottom"><p>Design judgment. Engineering rigor.</p><nav aria-label="Contact links">{contactLinks.map(link => <Link href={link.href} key={link.label}>{link.label} ↗</Link>)}</nav></div></section>
    </main>
    <footer className="ed-footer"><span>© 2026 Ali Lin</span><span>The system is precise. The material is alive.</span><a href="#main-content">Back to top ↑</a></footer>
  </div>;
}
