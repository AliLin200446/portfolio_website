import type { LabFolioData } from "@/lib/labfolio";
import type { SpecimenData } from "@/components/folio/SpecimenLabel";
import { berthOf } from "@/lib/bench";
import type { ProjectContent } from "./_schema";
import acubot from "./acubot";
import latent from "./latent";
import resonance from "./resonance";
import skeletalSilk from "./skeletal-silk";
import teardown from "./teardown";
import vestige from "./vestige";

/* Registry + adapters: data files in, the ALREADY-ACCEPTED components
 * out (LabFolio / SpecimenLabel keep their prop shapes — new projects
 * are data files, zero component edits). null = template not filled
 * yet → the route keeps whatever body it had before. */

export const projectContent: Record<string, ProjectContent | null> = {
  latent,
  resonance,
  "skeletal-silk": skeletalSilk,
  teardown,
  vestige,
  acubot,
};

const joinMeta = (name: string, meta: string[]) =>
  [name.toUpperCase(), ...meta].join(" · ");

export function toLabFolio(slug: string, c: ProjectContent): LabFolioData {
  if (c.body.kind !== "folio") throw new Error(`${slug}: not a folio`);
  return {
    slug,
    title: c.colophon.name,
    meta: joinMeta(c.colophon.name, c.colophon.meta),
    claim: c.colophon.claim,
    exhibits: c.body.exhibits.map((e) => ({
      no: e.id.replace(/^EXHIBIT\s*/i, ""),
      heading: e.heading,
      paras: e.paras,
      note: e.marginNote || undefined,
      caption: e.caption,
      visual: e.asset.type === "instrument" ? "instrument" : "placeholder",
      src: e.asset.src,
      placeholderLabel: `[EVIDENCE: ${e.id}]`,
    })),
    findings: c.body.findings.map((f) => f.text),
    couplet: c.colophon.signoff_zh || undefined,
    year: c.colophon.year,
    next: c.colophon.next,
    backHref: `/?berth=${berthOf(slug)}`,
  };
}

export function toSpecimen(slug: string, c: ProjectContent): SpecimenData {
  if (c.body.kind !== "specimen") throw new Error(`${slug}: not a specimen`);
  return {
    slug,
    title: c.colophon.name,
    meta: joinMeta(c.colophon.name, c.colophon.meta),
    piece: {
      src: c.body.piece.src ?? null,
      poster: c.body.piece.poster,
      placeholder: `[EVIDENCE: ${slug} · 录屏待作者]`,
      live: c.body.piece.liveHref ? { url: c.body.piece.liveHref } : undefined,
    },
    labelText: c.body.label,
    specs: c.body.specs,
    documents: c.body.documents?.length ? c.body.documents : undefined,
    couplet: c.colophon.signoff_zh || undefined,
    year: c.colophon.year,
    next: c.colophon.next,
    backHref: `/?berth=${berthOf(slug)}`,
  };
}
