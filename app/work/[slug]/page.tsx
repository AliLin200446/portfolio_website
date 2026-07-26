import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CasePage from "@/components/folio/CasePage";
import { casePages } from "@/content/case/casepages";
import CaseTemplate from "@/components/case/CaseTemplate";
import latent from "@/content/cases/latent";
import type { CaseData } from "@/content/cases/_schema";

/* CASE-TEMPLATE: one template, six content files. Slugs present here
 * render the new template; the rest keep the previous body until their
 * copy is ported. */
const cases: Record<string, CaseData> = { latent };

/*
 * CASE-v2-MERGE Step 5: the single dispatch. content/case/casepages.ts
 * is the ONLY data source; content/projects/ and the legacy notebook
 * body are gone (their content migrated or preserved in casepages.ts —
 * see the PRESERVED CONTENT block there). Old templates live in
 * components/folio/_archive/, off the routes.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return [...new Set([...Object.keys(casePages), ...Object.keys(cases)])].map(
    (slug) => ({ slug })
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const c = cases[slug];
  if (c) return { title: c.name.toUpperCase(), description: c.claim };
  const cp = casePages[slug];
  return cp ? { title: cp.name, description: cp.claim } : {};
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  // CASE-TEMPLATE first; un-ported slugs keep their previous body
  const ported = cases[slug];
  if (ported) return <CaseTemplate data={ported} />;
  const cp = casePages[slug];
  if (!cp) notFound();
  return <CasePage data={cp} />;
}
