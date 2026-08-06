import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseTemplate from "@/components/case/CaseTemplate";
import latent from "@/content/cases/latent";
import materialMemory from "@/content/cases/material-memory";
import vestige from "@/content/cases/vestige";
import teardown from "@/content/cases/teardown";
import skeletalSilk from "@/content/cases/skeletal-silk";
import type { CaseData } from "@/content/cases/_schema";
import CaseHero from "@/components/case/CaseHero";
import latentHero from "@/content/heroes/latent";
import teardownHero from "@/content/heroes/teardown";
import skeletalSilkHero from "@/content/heroes/skeletal-silk";
import materialMemoryHero from "@/content/heroes/material-memory";
import vestigeHero from "@/content/heroes/vestige";
import type { CaseHero as CaseHeroData } from "@/content/heroes/_schema";
import PassBreakdown from "@/components/case/latent/PassBreakdown";

/*
 * Hero registry. All five slugs now carry the first screen. The map is
 * kept rather than folded into CaseData because the hero is a separate
 * concern with its own length rules, and because a slug can be pulled
 * out of it without touching the case content.
 */
const heroes: Record<string, CaseHeroData> = {
  latent: latentHero,
  teardown: teardownHero,
  "skeletal-silk": skeletalSilkHero,
  "material-memory": materialMemoryHero,
  vestige: vestigeHero,
};

/*
 * One dispatch, one registry. Every case slug resolves through
 * content/cases/ and renders with CaseTemplate; anything else is a 404.
 * The legacy casepages fallback and its CasePage renderer are gone,
 * their registry having emptied as the last pages were ported. The one
 * archived entry that lived in it is at content/archive/acubot.md.
 */
const cases: Record<string, CaseData> = { latent, "material-memory": materialMemory, vestige, "skeletal-silk": skeletalSilk, teardown };

/*
 * CASE-v2-MERGE Step 5: the single dispatch. content/case/casepages.ts
 * is the ONLY data source; content/projects/ and the legacy notebook
 * body are gone (their content migrated or preserved in casepages.ts —
 * see the PRESERVED CONTENT block there). Old templates live in
 * components/folio/_archive/, off the routes.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(cases).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const c = cases[slug];
  if (!c) return {};
  return {
    title: c.name.toUpperCase(),
    description: Array.isArray(c.claim) ? c.claim.join(" ") : c.claim,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const c = cases[slug];
  if (!c) notFound();
  const hero = heroes[slug];
  return (
    <>
      {hero ? <CaseHero data={hero} /> : null}
      {/* LATENT only. The five-pass breakdown is specific to that
          pipeline, so it is mounted by slug rather than added to the
          shared template. */}
      {slug === "latent" ? <PassBreakdown /> : null}
      <CaseTemplate data={c} />
    </>
  );
}
