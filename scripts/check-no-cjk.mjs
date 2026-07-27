#!/usr/bin/env node
/*
 * CJK GUARD — fails the build on CJK that a visitor could see.
 *
 * The distinction that matters is not "is there CJK" but "can a reader
 * of the site reach it". Chinese in a code comment is a note to the
 * author and harms nobody; Chinese in a JSX text node, a rendered
 * string, an SVG <text>, or an alt/aria attribute ships to the page.
 * So this strips comments before judging .ts/.tsx, and treats markup
 * files (.svg) as visible throughout, since anything in an SVG can be
 * painted.
 *
 * Run standalone (`node scripts/check-no-cjk.mjs`) or via `npm run
 * build`, which calls it before next build.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "content", "lib", "public"];
const SKIP = new Set(["node_modules", ".next", "_archive"]);
const CJK = /[一-鿿　-〿＀-￯]/;

/** Comments are author-facing; string and JSX content is not. Blank the
 *  comments out (preserving newlines so line numbers stay true) and
 *  whatever CJK survives is reachable by a reader. */
function stripComments(src) {
  let out = "";
  let i = 0;
  const N = src.length;
  let mode = "code"; // code | line | block | s | d | t
  while (i < N) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === "code") {
      if (c === "/" && n === "/") { mode = "line"; out += "  "; i += 2; continue; }
      if (c === "/" && n === "*") { mode = "block"; out += "  "; i += 2; continue; }
      if (c === "{" && src.startsWith("{/*", i)) {
        // JSX comment: {/* ... */}
        const end = src.indexOf("*/}", i);
        const seg = src.slice(i, end < 0 ? N : end + 3);
        out += seg.replace(/[^\n]/g, " ");
        i += seg.length;
        continue;
      }
      if (c === "'") mode = "s";
      else if (c === '"') mode = "d";
      else if (c === "`") mode = "t";
      out += c; i++; continue;
    }
    if (mode === "line") {
      if (c === "\n") { mode = "code"; out += c; } else out += " ";
      i++; continue;
    }
    if (mode === "block") {
      if (c === "*" && n === "/") { mode = "code"; out += "  "; i += 2; continue; }
      out += c === "\n" ? c : " ";
      i++; continue;
    }
    // inside a string literal: keep it, it is shippable text
    const q = mode === "s" ? "'" : mode === "d" ? '"' : "`";
    if (c === "\\") { out += c + (n ?? ""); i += 2; continue; }
    if (c === q) mode = "code";
    out += c; i++;
  }
  return out;
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

const CHECKED = new Set([".ts", ".tsx", ".js", ".jsx", ".svg", ".css", ".html"]);
const hits = [];

for (const root of ROOTS) {
  let files;
  try { files = walk(root); } catch { continue; }
  for (const file of files) {
    const ext = extname(file);
    if (!CHECKED.has(ext)) continue;
    const raw = readFileSync(file, "utf8");
    if (!CJK.test(raw)) continue;
    // markup paints its content but not its comments: <!-- --> in
    // svg/html and /* */ in css are as author-facing as a // in code
    const blank = (m) => m.replace(/[^\n]/g, " ");
    const visible =
      ext === ".svg" || ext === ".html"
        ? raw.replace(/<!--[\s\S]*?-->/g, blank)
        : ext === ".css"
          ? raw.replace(/\/\*[\s\S]*?\*\//g, blank)
          : stripComments(raw);
    visible.split("\n").forEach((line, i) => {
      if (CJK.test(line)) hits.push({ file, line: i + 1, text: line.trim().slice(0, 90) });
    });
  }
}

if (hits.length) {
  console.error(`\nCJK GUARD FAILED — ${hits.length} visitor-visible instance(s):\n`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.text}`);
  console.error("\nComments are exempt. This is text a reader can reach.\n");
  process.exit(1);
}
console.log("CJK guard passed: no visitor-visible CJK.");
