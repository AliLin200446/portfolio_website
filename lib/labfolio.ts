/*
 * LAB-FOLIO v2 data (Latent sample). Discipline: every exhibit body
 * sentence is the author's own copy (lib/projects.ts, verbatim or
 * near-verbatim); the margin note is the author's supplied quote; the
 * findings restate measured claims already in the copy. Nothing here
 * is generated narrative. Evidence images await the author's evidence
 * pack — placeholders are labeled, never AI-filled.
 */

export type Exhibit = {
  no: string;
  heading: string;
  paras: string[];
  /** author's real aside, right-edge margin note — never invented */
  note?: string;
  /** caption states the CONDITIONS of measurement, not how it looks */
  caption: string;
  /** placeholder = labeled empty frame; instrument = the live halation
   *  comparator (SVG, §6-safe) */
  visual: "placeholder" | "instrument";
  /** cross-evidence link rendered under the caption (e.g. latent
   *  EXHIBIT 01 ⇄ /photography — the negatives live there) */
  crossHref?: string;
  crossLabel?: string;
  /** evidence image once the author supplies it; absent = placeholder */
  src?: string;
  placeholderLabel?: string;
};

export type LabFolioData = {
  slug: string;
  title: string;
  meta: string;
  claim: string;
  exhibits: Exhibit[];
  findings: string[];
  couplet?: string;
  year: string;
  next?: { label: string; href: string };
  backHref: string;
};

// data moved to content/projects/latent.ts (FOLIO-TEMPLATE) —
// this file now only carries the component prop types.
