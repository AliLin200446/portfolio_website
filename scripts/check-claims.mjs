#!/usr/bin/env node
/*
 * CLAIM GUARD — fails the build if a retracted claim reappears where a
 * visitor can read it. Same principle as the CJK guard: comments are
 * author-facing and exempt, strings and JSX are not.
 *
 * These rules exist because each of these phrases was wrong once and
 * got fixed by hand. Hand-fixing does not survive a copy-paste six
 * months from now; a failing build does.
 *
 * SCOPING MATTERS. "physics engine" is not bannable outright — Latent
 * genuinely is a film physics engine and that copy is approved. The
 * claim that was retracted is Resonance's, so that rule fires only on
 * lines or files that concern Resonance. A blanket ban would have
 * failed the build on correct copy and taught everyone to bypass it.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "content", "lib"];
// content/archive holds copy pulled out of deleted files so it is not
// lost to git history alone. It is never routed and never rendered, and
// by definition has not been through disclosure or claim review, so
// scanning it would report faults in text that cannot reach a reader.
const SKIP = new Set(["node_modules", ".next", "_archive", "archive"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".glsl"]);

const RULES = [
  {
    id: "presented-not-validated",
    re: /\bvalidated\b/i,
    why: 'the engagement was a presentation to leads — use "presented to leads at"',
  },
  {
    id: "one-filed-provisional",
    re: /\b(?:2|two)\s+(?:provisional|patents)|\b(?:2|two)\s+provisional\s+patents?\b/i,
    why: "there is ONE merged filed provisional, never a plural count",
  },
  {
    id: "presented-not-partnered",
    re: /\b(?:partnered\s+with|in\s+partnership\s+with)\b/i,
    why: "no partnership exists — the work was presented, not partnered",
  },
  {
    id: "resonance-no-solver",
    re: /physics\s+engine/i,
    scope: /resonance/i, // Latent's film physics engine is approved copy
    why: "Resonance runs no solver; this claim was retracted",
  },
  {
    id: "resonance-no-health-metric",
    re: /generation\s+health/i,
    why: "no such metric is measured; this claim was retracted",
  },
  {
    id: "resonance-no-spectral-map",
    re: /spectral\s+frequency\s+map/i,
    why: "nothing is computed in the frequency domain; this claim was retracted",
  },
];

/** Blank out comments, preserving newlines so line numbers stay true.
 *  What survives is text that ships. */
function stripComments(src) {
  let out = "";
  let i = 0;
  let mode = "code";
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === "code") {
      if (c === "/" && n === "/") { mode = "line"; out += "  "; i += 2; continue; }
      if (c === "/" && n === "*") { mode = "block"; out += "  "; i += 2; continue; }
      if (src.startsWith("{/*", i)) {
        const end = src.indexOf("*/}", i);
        const seg = src.slice(i, end < 0 ? src.length : end + 3);
        out += seg.replace(/[^\n]/g, " ");
        i += seg.length;
        continue;
      }
      if (c === "'") mode = "s";
      else if (c === '"') mode = "d";
      else if (c === "`") mode = "t";
      out += c; i++; continue;
    }
    if (mode === "line") { if (c === "\n") { mode = "code"; out += c; } else out += " "; i++; continue; }
    if (mode === "block") {
      if (c === "*" && n === "/") { mode = "code"; out += "  "; i += 2; continue; }
      out += c === "\n" ? c : " "; i++; continue;
    }
    const q = mode === "s" ? "'" : mode === "d" ? '"' : "`";
    if (c === "\\") { out += c + (n ?? ""); i += 2; continue; }
    if (c === q) mode = "code";
    out += c; i++;
  }
  return out;
}

/** Escapes are text too. A file that has been generated or serialised
 *  carries its strings as \uXXXX, which no amount of regex over the raw
 *  bytes will ever match. Decode first, then judge. */
function decodeEscapes(src) {
  return src.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const hits = [];
for (const root of ROOTS) {
  let files;
  try { files = walk(root); } catch { continue; }
  for (const file of files) {
    if (!EXTS.has(extname(file))) continue;
    const raw = decodeEscapes(readFileSync(file, "utf8"));
    // .md and .glsl ship whole: neither has an author-only tier, so
    // nothing is stripped before judging
    const ext = extname(file);
    const shipped = ext === ".md" || ext === ".glsl" ? raw : stripComments(raw);
    // path-level, not content-level: a passing mention of Resonance in
    // some other file's comment must not make that file's own approved
    // copy fail. Latent's "film physics engine" lives next to such a
    // comment in lib/bench.ts and is correct.
    const isResonanceFile = /resonance/i.test(file);
    shipped.split("\n").forEach((line, i) => {
      for (const rule of RULES) {
        if (!rule.re.test(line)) continue;
        if (rule.scope && !(rule.scope.test(line) || isResonanceFile)) continue;
        hits.push({ file, line: i + 1, id: rule.id, why: rule.why, text: line.trim().slice(0, 88) });
      }
    });
  }
}

if (hits.length) {
  console.error(`\nCLAIM GUARD FAILED — ${hits.length} retracted claim(s) reachable by a reader:\n`);
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  [${h.id}]`);
    console.error(`    ${h.text}`);
    console.error(`    → ${h.why}\n`);
  }
  process.exit(1);
}
console.log("Claim guard passed: no retracted claims in shipped text.");
