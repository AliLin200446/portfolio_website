"use client";

import Link from "next/link";
import { Tabs } from "@/interaction/components/Tabs";
import { InspectToggle } from "@/interaction/components/InspectMode";
import { CommandToggle } from "@/interaction/components/InteractionProvider";
import BrandMark from "@/components/BrandMark";

const tabs = [["Projects", "/"], ["Experiments", "/experiments"], ["Generative", "/generative"], ["Photography", "/photography"], ["About", "/about"]];

export default function EditorialHeader({ caseStudy = false }: { caseStudy?: boolean }) {
  return <>
    <a className="ed-skip" href={caseStudy ? "#hero-latent" : "#main-content"}>Skip to content</a>
    <header className="tab-header">
      <Link className="tab-brand" href="/" aria-label="Ali Lin, Projects"><BrandMark /><span>ALI LIN</span></Link>
      <Tabs items={tabs.map(([label,href])=>({label,href}))} />
      <span className="tab-availability"><i />Open to full-time roles</span>
      <CommandToggle />
      <InspectToggle className="tab-grid" />
    </header>
    {caseStudy && <nav className="ed-breadcrumb" aria-label="Breadcrumb"><Link href="/">Ali Lin</Link><span>/</span><Link href="/">Projects</Link><span>/</span><span aria-current="page">01 Latent</span><Link href="https://latentfilm.com">Live website ↗</Link></nav>}

  </>;
}
