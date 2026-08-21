#!/usr/bin/env node
/*
 * HERO DRIFT GUARD — a hero's PROBLEM must still be the case page's WHAT.
 *
 * WHAT THIS EXISTS FOR
 *
 * content/heroes/<slug>.ts and content/cases/<slug>.ts are separate
 * files, and the hero is the only part of a case page that most readers
 * ever see. When skeletal-silk's WHAT was rewritten for a reader who is
 * not a graphics programmer, the hero was not part of that change. The
 * rewrite landed at y=2279, two and a half screens down, and the
 * sentence it replaced stayed on the first screen. Measured overlap at
 * that moment: 0.10. The jargon had been removed from the place almost
 * nobody reaches and kept in the place everybody starts.
 *
 * Nothing failed. Both files were internally consistent, both built,
 * all three existing guards passed. Only the pair was wrong, and no
 * check looked at pairs.
 *
 * WHY IT COMPARES POSITIONS, NOT FILES
 *
 * The first design was an orphan-claim detector: flag a hero sentence
 * that shares almost nothing with ANYTHING in the case file. Tested
 * against the actual regression before shipping, it did not fire. The
 * old hero sentences scored 0.30 and 0.75 against the case file's HOW
 * section, because they were correctly sourced sentences sitting in the
 * wrong slot. A whole-file check cannot see position. It was replaced
 * rather than tuned: at a threshold low enough to catch 0.30 it would
 * have flagged most of the site.
 *
 * WHY SOLUTION IS NOT CHECKED AGAINST WHY
 *
 * Deliberate, not an omission. The SOLUTION quadrant answers "so what
 * did you build", because PROBLEM has already carried half the why and
 * a reader does not need it twice in one screen. Under that definition
 * SOLUTION and WHY are not supposed to overlap, so a guard comparing
 * them would fail correct pages: latent measures 0.11 and teardown 0.40
 * today, and both are right. If you came here looking for the missing
 * second rule, this paragraph is it.
 *
 * WHAT IT CANNOT DO
 *
 * This detects drift and divergence. It is blind to meaning. Negating
 * WHAT leaves the overlap near 1.00. It is a staleness check, not a
 * truth check.
 *
 * A note on the duplication it produces: PROBLEM and WHAT end up as the
 * same sentence in two files, and that repetition is the guard's
 * control. If the hero became the only place the sentence appeared,
 * there would be nothing left to compare it against.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const HEROES = "content/heroes";
const CASES = "content/cases";
const THRESHOLD = 0.5;

/* Words too common to carry a topic. Overlap is measured on the rest,
 * so a pair that agrees only on "the" and "is" scores zero. */
const STOP = new Set(
  ("a an the this that these those is are was were be been being it its of to in on " +
    "for with and or but not no so as at by from you your i my we our they them their " +
    "there here what why how one two does do can cannot").split(" ")
);

const terms = (t) =>
  new Set(
    (t.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(
      (w) => w.length > 2 && !STOP.has(w)
    )
  );

/* Overlap coefficient, not Jaccard: the two sentences are allowed to be
 * different lengths. A hero quadrant that is a faithful shortening of a
 * longer WHAT should score 1.00, and under Jaccard it would not. */
function overlap(a, b) {
  const A = terms(a);
  const B = terms(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n += 1;
  return n / Math.min(A.size, B.size);
}

/* Comments are stripped on the same reasoning as the other three
 * guards: they are notes to the author, not text a reader can reach,
 * and this file's own prose would otherwise match everything. */
const decomment = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const quadrant = (src, label) =>
  src.match(
    new RegExp(`label:\\s*"${label}",\\s*\\n\\s*body:\\s*"((?:[^"\\\\]|\\\\.)*)"`)
  )?.[1] ?? null;

const section = (src, key) => {
  const at = src.indexOf("sections:");
  const scope = at < 0 ? src : src.slice(at);
  return (
    scope.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1] ??
    scope.match(new RegExp(`${key}:\\s*\\n\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1] ??
    null
  );
};

const slugs = readdirSync(HEROES)
  .filter((f) => f.endsWith(".ts") && !f.startsWith("_"))
  .map((f) => f.replace(/\.ts$/, ""));

const fail = [];
const rows = [];
const exempt = [];

for (const slug of slugs) {
  let heroRaw, hero, kase;
  try {
    heroRaw = readFileSync(join(HEROES, `${slug}.ts`), "utf8");
    hero = decomment(heroRaw);
    kase = decomment(readFileSync(join(CASES, `${slug}.ts`), "utf8"));
  } catch {
    continue; // a hero without a case page is the router's problem, not this one
  }
  /* Per-file opt-out, declared in the hero file itself so it is
   * greppable from either end: grep -rn hero-drift-exempt content/heroes.
   * Modelled on the em dash guard's, and it exists for the same reason:
   * two rules collided and only one of them was still describing the
   * page. This guard asserts that a hero's PROBLEM is the case page's
   * WHAT, which held while all five pages used PROBLEM for the problem
   * statement. A page may instead use PROBLEM for the reader's pain and
   * WHAT for what the thing is; those are different sentences on
   * purpose, and no overlap threshold can tell that apart from drift.
   *
   * Measured before adding this rather than after: re-pointing the
   * guard at the hero's brief instead scores 0.60 on latent but 0.00,
   * 0.14 and 0.00 on teardown, material-memory and vestige. There is no
   * single pairing that fits all five, so the exemption is per page.
   *
   * A file that opts out has to say why, above the marker. */
  /* Tested against heroRaw, NOT hero. The marker lives in a comment,
   * and this guard strips comments before it reads anything, so testing
   * the stripped copy looks for a string it has just deleted. Written
   * that way first and caught by the build: the exemption was declared,
   * correct, and invisible. The em dash guard reads its own marker off
   * the raw source for exactly this reason. */
  if (heroRaw.includes("hero-drift-exempt")) {
    exempt.push(slug);
    continue;
  }

  const problem = quadrant(hero, "Problem");
  const what = section(kase, "what");
  if (problem === null || what === null) {
    fail.push(
      `${slug}: could not read ${problem === null ? "the hero's Problem quadrant" : "the case's WHAT"}. ` +
        `The guard reads these as plain string literals; if one is now built from a variable or a template, this guard has to be taught how.`
    );
    continue;
  }
  const score = overlap(problem, what);
  rows.push([slug, score]);
  if (score < THRESHOLD)
    fail.push(
      `${slug}: hero Problem and case WHAT have drifted apart (overlap ${score.toFixed(2)}, needs ${THRESHOLD}).\n` +
        `    hero Problem : ${problem}\n` +
        `    case WHAT    : ${what}\n` +
        `    The hero is the only part of this page most readers see. If WHAT was just rewritten, copy it here too.`
    );
}

if (fail.length) {
  console.error("\nHero drift guard FAILED:\n");
  for (const f of fail) console.error(`  ${f}\n`);
  process.exit(1);
}

console.log(
  `Hero drift guard passed: ${rows.length} hero(es) still state their case's WHAT ` +
    `(${rows.map(([s, v]) => `${s} ${v.toFixed(2)}`).join(", ")})` +
    (exempt.length ? `. ${exempt.length} opted out: ${exempt.join(", ")}` : ".")
);
