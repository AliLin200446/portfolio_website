import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CasePage from "@/components/folio/CasePage";
import { casePages } from "@/content/case/casepages";

/*
 * CASE-v2-MERGE Step 5: the single dispatch. content/case/casepages.ts
 * is the ONLY data source; content/projects/ and the legacy notebook
 * body are gone (their content migrated or preserved in casepages.ts —
 * see the PRESERVED CONTENT block there). Old templates live in
 * components/folio/_archive/, off the routes.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(casePages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const cp = casePages[(await params).slug];
  return cp ? { title: cp.name, description: cp.claim } : {};
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const cp = casePages[(await params).slug];
  if (!cp) notFound();
  return <CasePage data={cp} />;
}
