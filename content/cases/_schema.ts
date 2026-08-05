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
    | {
        kind: "live";
        url: string;
        caption: string;
        poster?: string;
        /** an animated loop standing in for the resting state. When
         *  present the hero moves on its own and the live engine is one
         *  click behind it; `motionStill` is what reduced-motion sees. */
        motion?: string;
        motionStill?: string;
      }
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
    | {
        kind: "code";
        lang?: string;
        code: string;
        caption: string;
        /** a code figure can cite a source too: these are readings, not
         *  illustrations */
        sourceHref?: string;
        sourceLabel?: string;
      }
    | {
        kind: "instrument";
        component: "halation" | "latency" | "stepdelta" | "stepfit" | "seed" | "passstack" | "expspace" | "silkcontrol";
        /** an array renders one line per entry; a plain string keeps the
         *  single-line path byte for byte */
        caption: string | string[];
        /** live evidence file this figure was plotted from */
        sourceHref?: string;
        sourceLabel?: string;
      }
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
  /** short caps label; the sentence that follows stays in normal case.
   *  A whole sentence set in caps stops reading as a sentence. */
  label?: string;
  /** the claim, stated plainly */
  claim: string;
  /** where the number comes from: file, method, sample size */
  source?: string;
  figure?: Figure;
};

/** One stage of HOW: a titled step that folds.
 *
 *  The title row is always visible. The body and its evidence are
 *  always IN THE DOM, folded by a details element alone, never
 *  conditionally rendered and never fetched on open. Three things
 *  depend on that: find-in-page, search engines, and
 *  scripts/check-claims.mjs, which reads this file as text and would
 *  be blind to anything that only existed after a click.
 *
 *  Phases are the physical stages a reader already understands, not
 *  the pass numbers the code uses. */
export type Phase = {
  /** the one line on the summary row, always visible */
  title: string;
  /** always rendered into the DOM, folded or not */
  body: string[];
  figure?: Figure;
  /** measured lines belonging to this stage, mono */
  data?: string[];
};

/* No phase opens on load, and there is deliberately no field to ask
 * for one. React 19 strips a server-rendered `open` attribute during
 * hydration and suppressHydrationWarning does not stop it, so honouring
 * such a field would need a client component to hold the state. A flag
 * that quietly does nothing is worse than no flag: if a phase should
 * ever open by default, that decision comes back with its own fix. */

export type CaseData = {
  slug: string;
  /** ① masthead */
  name: string;
  oneLine: string;
  meta: { type: string; stack: string; year: string; status: string; live?: string };
  /** ② one sentence, no hedging. An array renders one line per entry
   *  inside the claim block; a plain string keeps the old single-line
   *  path unchanged. */
  claim: string | string[];
  /** ③ the strongest single visual */
  hero: Figure;
  /** ④ two short paragraphs, followable by a smart non-specialist */
  what: string[];
  whatFigure?: Figure;
  /** ⑤ 2–4 decisions */
  build: Decision[];
  /** ⑥ evidence + limits; the section label may be renamed per page */
  proofLabel?: string;
  buildLabel?: string;
  /** findings sit beside their figure instead of above it */
  proofSplit?: boolean;
  contextParas?: string[];
  proof: {
    /** prose that sets up the evidence, before the itemised claims */
    intro?: string[];
    items: Proof[];
    limits: string[];
  };
  /** THE NEW STRUCTURE: WHAT / WHY / HOW / PROOF / LIMITS.
   *
   *  Present means the page renders this and ignores `what`, `build`,
   *  `context` and `contextParas`. Absent means the original six
   *  section order, unchanged. Both paths ship until all five cases
   *  have moved, so a pilot cannot break the other four. */
  sections?: {
    /** one line: what the problem is */
    what: string;
    /** one line: why the existing answers fall short, and where this
     *  one sits */
    why: string;
    how: {
      /** two or three lines before the phases open */
      summary: string[];
      phases: Phase[];
    };
  };
  /** The closing note under the new structure: one short unfolded
   *  paragraph beneath a rule, no heading, three or four lines.
   *
   *  The test for what belongs is whether only this author could have
   *  written it. Market sizing, moats and category positioning are
   *  things any competent person can argue, so they go. Why it was
   *  this person who built it, and whether the work continues, cannot
   *  be borrowed, so they stay. */
  coda?: string;
  /** ⑦ one paragraph of placement */
  context: string;
  byline?: string;
  /** the page's closing move. Present only when the work itself is the
   *  argument and the reader should go use it rather than read on. */
  cta?: { label: string; href: string };
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
};
