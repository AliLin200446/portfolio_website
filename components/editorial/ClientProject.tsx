import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Develop } from "@/interaction/components/Develop";
import ProjectRow from "./ProjectRow";

function Screenshot({ device }: { device: "desktop" | "mobile" }) {
  const src = `/work/cac/${device}.webp`;
  const available = existsSync(path.join(process.cwd(), "public", src));
  return <div className={`client-screenshot client-screenshot-${device}`}>
    {available ? <Image src={src} alt={`Chinese Acupuncture Clinic website on ${device}`} fill sizes={device === "desktop" ? "(max-width: 760px) 80vw, 50vw" : "(max-width: 760px) 24vw, 15vw"} /> : <span>{device === "desktop" ? "Desktop" : "Mobile"} screenshot forthcoming</span>}
  </div>;
}

export default function ClientProject() {
  return <section className="client-work" aria-labelledby="client-work-title">
    <h2 id="client-work-title" className="client-work-label">Client Work</h2>
    <ProjectRow id="clinic-client" className="project-band-client">
      <div className="project-band-info">
        <div className="project-band-intro">
          <span className="project-number">CLIENT</span>
          <h2 id="clinic-client-title">Chinese Acupuncture Clinic</h2>
          <p>Website rebuild for an acupuncture clinic in Georgetown, TX.</p>
        </div>
        <div className="project-band-details">
          <dl><div><dt>Role</dt><dd>Redesign + Rebuild</dd></div><div><dt>Year</dt><dd>2026</dd></div><div><dt>Stack</dt><dd>Vercel, static site</dd></div></dl>
          <p className="client-work-description">Moved the site from WordPress to a static Vercel deployment and rebuilt the information architecture around five patient-centred service pathways.</p>
          <div className="project-band-actions"><a data-nav-item className="project-button" href="https://cacuclinic.com/" target="_blank" rel="noopener noreferrer">Visit site ↗</a></div>
        </div>
      </div>
      <figure className="project-band-media">
        <Develop identity="clinic-client" className="project-media-frame client-media-frame"><Screenshot device="desktop" /><Screenshot device="mobile" /></Develop>
        <figcaption>As delivered, Sep 2026.</figcaption>
      </figure>
    </ProjectRow>
  </section>;
}
