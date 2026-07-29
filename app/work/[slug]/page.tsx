import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseTemplate from "@/components/case/CaseTemplate";
import latent from "@/content/cases/latent";
import materialMemory from "@/content/cases/material-memory";
import vestige from "@/content/cases/vestige";
import teardown from "@/content/cases/teardown";
import skeletalSilk from "@/content/cases/skeletal-silk";
import type { CaseData } from "@/content/cases/_schema";

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
  return <CaseTemplate data={c} />;
}
