import { BERTH_ORDER } from "@/lib/bench";

/*
 * CASE HERO: the first screen of a project page. One component, one
 * data entry per project, no per-project CSS.
 *
 * The total is derived from BERTH_ORDER.length, never written as a
 * literal. lib/bench.ts already carries the scar from a hardcoded 6
 * that survived the ring dropping to five; the page indicator is the
 * same class of number and gets the same treatment.
 */
export type Quadrant = { label: string; body: string };

export type CaseHero = {
  /** "01" upward. Position in BERTH_ORDER, not a free-form label. */
  index: string;
  slug: string;
  /** Rendered uppercase by the component. Store it as written. */
  title: string;
  meta: { left: string; center: string; right: string };
  /** 220 to 300 characters, one paragraph. */
  brief: string;
  media: {
    src: string;
    type: "image" | "video";
    /** Required when type is video. */
    poster?: string;
    alt: string;
  };
  /** Fixed order: Problem, Solution, Methods, Next Step. */
  quadrants: [Quadrant, Quadrant, Quadrant, Quadrant];
};

/** Total case count, as the page indicator prints it. */
export const CASE_TOTAL = String(BERTH_ORDER.length).padStart(2, "0");

/** Position of a slug in the canonical order, as "01", "02" and so on. */
export function indexOf(slug: string): string {
  const i = BERTH_ORDER.indexOf(slug as (typeof BERTH_ORDER)[number]);
  if (i < 0) throw new Error(`case hero: ${slug} is not in BERTH_ORDER`);
  return String(i + 1).padStart(2, "0");
}

/*
 * Quadrant body length. The floor was 45 when the quadrants carried
 * paragraph copy; it is 8 now that they carry single sentences. The
 * ceiling came down 65 -> 25 so a later pass cannot quietly reintroduce
 * paragraph copy into a box sized for one sentence.
 */
const MAX_BRIEF_WORDS = 30;
const MIN_WORDS = 8;
const MAX_WORDS = 25;

const WORDS = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/*
 * Development only. These are copy-length rules, not correctness rules,
 * so they warn and never throw: a long body should not stop a build.
 * The three build guards remain the things that fail hard.
 */
export function validateHero(hero: CaseHero): CaseHero {
  if (process.env.NODE_ENV === "production") return hero;

  const briefWords = WORDS(hero.brief);
  if (briefWords > MAX_BRIEF_WORDS) {
    console.warn(
      `case hero ${hero.slug}: brief is ${briefWords} words, wants at most ${MAX_BRIEF_WORDS}`
    );
  }
  hero.quadrants.forEach((q) => {
    const n = WORDS(q.body);
    if (n < MIN_WORDS || n > MAX_WORDS) {
      console.warn(
        `case hero ${hero.slug}: ${q.label} body is ${n} words, wants ${MIN_WORDS} to ${MAX_WORDS}`
      );
    }
  });
  if (hero.media.type === "video" && !hero.media.poster) {
    console.warn(`case hero ${hero.slug}: video media needs a poster`);
  }
  if (hero.index !== indexOf(hero.slug)) {
    console.warn(
      `case hero ${hero.slug}: index ${hero.index} disagrees with BERTH_ORDER`
    );
  }
  return hero;
}
