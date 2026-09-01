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
        component: "halation" | "latency" | "stepdelta" | "stepfit" | "seed" | "passstack" | "passes" | "expspace" | "silkcontrol";
        /** an array renders one line per entry; a plain string keeps the
         *  single-line path byte for byte */
        caption: string | string[];
        /** live evidence file this figure was plotted from */
        sourceHref?: string;
        sourceLabel?: string;
      }
    | { kind: "pending"; note: string; caption: string }
  );

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
   *  path unchanged.
   *
   *  OPTIONAL as of the latent rewrite. The section and its 38svh of
   *  height disappear together when it is absent, so a page without a
   *  claim does not render an empty band. It also fed the route's
   *  meta description, which falls back to oneLine rather than going
   *  empty: a page with no description is worse than a short one. */
  claim?: string | string[];
  /** ③ the strongest single visual. Optional: a page whose strongest
   *  visual is already somewhere else does not need a second one, and
   *  the section disappears rather than rendering an empty band. The
   *  live link sits after this section rather than inside it, so it
   *  still follows whatever visual the page does have. */
  hero?: Figure;
  /** ⑥ evidence + limits; the section label may be renamed per page.
   *
   *  OPTIONAL as of the latent rewrite. It was required, because all
   *  five pages carried evidence and a required field is the cheapest
   *  way to keep it that way. A page without it makes claims a reader
   *  cannot check, and the section's own intro line used to say so.
   *  The type no longer enforces that; whoever drops it is choosing to.
   *  The index rail and the section both disappear when it is absent,
   *  so nothing renders an empty shell. */
  proofLabel?: string;
  /** findings sit beside their figure instead of above it */
  proofSplit?: boolean;
  proof?: {
    /** prose that sets up the evidence, before the itemised claims */
    intro?: string[];
    items: Proof[];
    limits: string[];
  };
  /** WHAT / WHY / HOW / PROOF / LIMITS. Required: all five cases are
   *  on it and the older six-section path is gone. It was kept behind
   *  an optional field only long enough to pilot one page without
   *  breaking the other four. */
  sections: {
    /** one line: what the problem is */
    what: string;
    /** who this is for, and what they try that does not work. Optional:
     *  it renders as its own section between WHAT and WHY, with its own
     *  entry in the index rail, and is skipped entirely when absent so
     *  the pages without it are unchanged. An array renders one
     *  paragraph per entry, for a page whose answer is two audiences
     *  rather than one. */
    who?: string | string[];
    /** why the existing answers fall short, and where this one sits.
     *  An array renders one paragraph per entry; a plain string keeps
     *  the single-paragraph path every other page uses. It was a bare
     *  string, which is why an earlier compression pass could not split
     *  a three line WHY into two paragraphs and said so in the report
     *  rather than restructuring for it. */
    why: string | string[];
    /** Optional. A page may answer "how" with METHODS below instead,
     *  which is a numbered list of what was run rather than folded
     *  phases of how it was built. Absent removes the section and its
     *  index entry together. */
    how?: {
      /** two or three lines before the phases open */
      summary: string[];
      phases: Phase[];
    };
    /** The alternative to HOW: a numbered list of the things that were
     *  run, each a name and the question it answers. A study whose
     *  method IS its experiment list wants this; a build whose method
     *  is a sequence of stages wants `how`. A page may carry either,
     *  and carrying both would give a reader two answers to one
     *  question, so nothing renders both. */
    methods?: {
      label: string;
      /** the line above the list, e.g. how many experiments */
      lead?: string;
      items: { name: string; question: string }[];
    };
    /** What the methods found, in the same numbered form. Deliberately
     *  the same shape as `methods`: a reader who has just read five
     *  numbered questions should meet the answers in the same
     *  typography, not in a different component with its own
     *  behaviour. Renders after METHODS. */
    findings?: {
      label: string;
      items: { name: string; body: string }[];
    };
    /** A labelled block after HOW, for material that is a stage of the
     *  argument rather than one of the build's phases. It is flat, not
     *  a list of phases: the section label is its heading, so a phase
     *  title underneath would be a second heading for the same thing.
     *  Optional, and the section and its index entry disappear together
     *  when it is absent. */
    calibration?: {
      label: string;
      body: string[];
      data?: string[];
      figure?: Figure;
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
  byline?: string;
  /** the page's closing move. Present only when the work itself is the
   *  argument and the reader should go use it rather than read on. */
  cta?: { label: string; href: string };
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
};
