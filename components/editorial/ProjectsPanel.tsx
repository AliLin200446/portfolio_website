import { TransitionLink } from "@/interaction/components/ViewTransitions";
import { Develop } from "@/interaction/components/Develop";
import Image from "next/image";
import Link from "next/link";
import FramefieldLite from "./FramefieldLite";
import ProjectRow from "./ProjectRow";
import ClientProject from "./ClientProject";
import { expandedProjects } from "@/content/projects-expanded";

export default function ProjectsPanel() {
  return <>
    <section className="projects-intro"><h1>I translate visual judgment <em>into systems.</em></h1><p>Design engineer in New York. Real-time graphics, interface engineering, and the instrumentation in between.</p></section>
    <nav className="project-jumps" aria-label="Projects on this page"><span>Index</span>{expandedProjects.map((project, i) => <a key={project.id} href={`#${project.id}`}><span>0{i + 1}</span>{project.name}</a>)}</nav>
    <section aria-label="Selected work">{expandedProjects.map((project, i) => <ProjectRow id={project.id} key={project.id}>
      <div className="project-band-info">
        <div className="project-band-intro"><span className="project-number">0{i + 1} / {String(expandedProjects.length).padStart(2, "0")} · {project.year}</span><h2 id={`${project.id}-title`} style={{viewTransitionName:`title-${project.id}`}}>{project.name}</h2><p>{project.description}</p></div>
        <div className="project-band-details"><dl><div><dt>Discipline</dt><dd>{project.discipline}</dd></div><div><dt>Stack</dt><dd>{project.stack}</dd></div><div><dt>Status</dt><dd className={project.live ? 'project-live' : 'project-progress'}>{project.status}</dd></div></dl>
          <div className="project-band-actions">{project.id === "framefield" ? <a data-nav-item className="project-button primary" href={project.live!}>Open the library <span aria-hidden="true">↗</span></a> : <>{project.href ? <TransitionLink data-nav-item className="project-button primary" href={project.href} aria-label={`${project.name} case study`}>Open case <span aria-hidden="true">→</span></TransitionLink> : <details className="project-notes"><summary data-nav-item className="project-button">Read notes <span aria-hidden="true">→</span></summary><p>Project notes, technical stack, and media have not yet been published.</p></details>}{project.live && <a className="project-button" href={project.live} aria-label={`${project.name} live demo`}>Live demo ↗</a>}</>}</div>
        </div>
      </div>
      {project.id === "framefield" ? <FramefieldLite /> : <figure className={`project-band-media${project.image ? '' : ' is-pending'}`}><Develop identity={project.id} className="project-media-frame">{project.image ? <Image src={project.image} alt={project.alt} fill sizes="(max-width: 760px) 100vw, 65vw" loading="lazy" /> : <div className="project-media-pending"><span>{project.name} / Media forthcoming</span><p>{project.status}</p></div>}</Develop><figcaption>Fig. 0{i + 1}{!project.image && ` · ${project.status}`}</figcaption></figure>}
    </ProjectRow>)}</section>
    <ClientProject />
    <div className="projects-more"><Link href="/experiments">Interactive experiments ↗</Link></div>
  </>;
}
