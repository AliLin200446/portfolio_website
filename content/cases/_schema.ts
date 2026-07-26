/*
 * CASE TEMPLATE — one shape, six pages. Six sections in one fixed
 * order: MASTHEAD · CLAIM · HERO · WHAT · BUILD · PROOF · MORE.
 * Copy lives here; layout lives in components/case/CaseTemplate.tsx.
 * Changing copy never touches layout; changing layout never touches
 * copy. Every figure carries a Geist Mono caption. Prose is Spectral
 * roman at a 68ch measure, single column — no italics anywhere.
 */

/** A figure: a live embed, a video, a still, a code block, or a
 *  labelled placeholder while the asset is missing. Caption states
 *  what it shows — condition, not compliment. */
/** Anything still awaiting a real value carries `pending`: the template
 *  renders it as a loud PENDING chip, never a quiet blank. A missing
 *  number stays missing and stays visible — it must be impossible to
 *  ship one by accident. */
type Pending = { pending?: string };

export type Figure = Pending &
  (
    | { kind: "live"; url: string; caption: string }
    | { kind: "video"; src: string; poster?: string; caption: string }
    | {
        kind: "image";
        src: string;
        caption: string;
        width?: number;
        height?: number;
        /** the figure carries its own title and method notes — the
         *  template then prints only a one-line attribution, so the
         *  page never says the same thing twice */
        selfCaptioned?: boolean;
        attribution?: string;
      }
    | { kind: "code"; lang?: string; code: string; caption: string }
    | { kind: "instrument"; component: "halation"; caption: string }
    | { kind: "pending"; note: string; caption: string }
  );

/** ⑤ BUILD: one decision per subsection — what I hit, what I chose,
 *  why. Never a feature list. */
export type Decision = {
  /** Geist Mono subheading naming the decision */
  heading: string;
  /** one serif paragraph: the problem, the choice, the tradeoff */
  body: string;
  /** a second paragraph where the decision needed one */
  body2?: string;
  /** the measured line, Geist Mono */
  data?: string;
  /** a value inside the data line that is NOT cleared: rendered as a
   *  PENDING-IP chip between `data` and `dataTail`, never as text */
  dataPending?: string;
  dataTail?: string;
  /** method caveat, mono, quieter than the data line */
  note?: string;
  figure?: Figure;
};

/** ⑥ PROOF: evidence a skeptic would demand. */
export type Proof = Pending & {
  /** the claim, stated plainly */
  claim: string;
  /** where the number comes from: file, method, sample size */
  source?: string;
  figure?: Figure;
};

export type CaseData = {
  slug: string;
  /** ① masthead */
  name: string;
  oneLine: string;
  meta: { type: string; stack: string; year: string; status: string; live?: string };
  /** ② one sentence, no hedging */
  claim: string;
  /** ③ the strongest single visual */
  hero: Figure;
  /** ④ two short paragraphs, followable by a smart non-specialist */
  what: string[];
  whatFigure?: Figure;
  /** ⑤ 2–4 decisions */
  build: Decision[];
  /** ⑥ evidence + limits; the section label may be renamed per page */
  proofLabel?: string;
  proof: { items: Proof[]; limits: string[] };
  /** ⑦ one paragraph of placement */
  context: string;
  byline?: string;
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
};
