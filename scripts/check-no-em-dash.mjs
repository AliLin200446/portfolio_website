#!/usr/bin/env node
/*
 * EM DASH GUARD — no U+2014 in visitor-visible copy.
 *
 * Hyphens in compound words and en dashes in numeric ranges are fine
 * and are not touched; only the em dash goes. Comments are exempt on
 * the same reasoning as the CJK and claim guards: they are notes to the
 * author, not text a reader can reach.
 *
 * NOT wired into the build yet: 145 instances remain in shipped copy,
 * and each wants a rewrite rather than a substitution, since an em dash
 * usually joins two ideas that read better apart. Wiring this before
 * that pass would break every build.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const ROOTS=["app","components","content","lib"];
// content/archive is recovered copy from deleted files: never routed,
// never reviewed, and not something a reader can reach
const SKIP=new Set(["node_modules",".next","_archive","archive"]);
const EXTS=new Set([".ts",".tsx",".js",".jsx",".md",".css"]);
function strip(src){let o="",i=0,m="code";while(i<src.length){const c=src[i],n=src[i+1];
if(m==="code"){if(c==="/"&&n==="/"){m="line";o+="  ";i+=2;continue;}
if(c==="/"&&n==="*"){m="block";o+="  ";i+=2;continue;}
if(src.startsWith("{/*",i)){const e=src.indexOf("*/}",i);const g=src.slice(i,e<0?src.length:e+3);o+=g.replace(/[^\n]/g," ");i+=g.length;continue;}
if(c==="'")m="s";else if(c==='"')m="d";else if(c==="`")m="t";o+=c;i++;continue;}
if(m==="line"){if(c==="\n"){m="code";o+=c;}else o+=" ";i++;continue;}
if(m==="block"){if(c==="*"&&n==="/"){m="code";o+="  ";i+=2;continue;}o+=c==="\n"?c:" ";i++;continue;}
const q=m==="s"?"'":m==="d"?'"':"`";if(c==="\\"){o+=c+(n??"");i+=2;continue;}if(c===q)m="code";o+=c;i++;}return o;}
function walk(d,a=[]){for(const n of readdirSync(d)){if(SKIP.has(n))continue;const p=join(d,n);statSync(p).isDirectory()?walk(p,a):a.push(p);}return a;}
const hits=[];const exempt=[];
for(const r of ROOTS){let fs2;try{fs2=walk(r);}catch{continue;}
for(const f of fs2){if(!EXTS.has(extname(f)))continue;const raw=readFileSync(f,"utf8");if(!raw.includes("—"))continue;
// Per-file opt-out, declared in the file itself so it is greppable from
// either end: `grep -rn em-dash-exempt app components content lib`.
// The one case it exists for is copy an author supplied whole and
// forbade anyone to rewrite. Two rules collided there and only one of
// them was about someone else's words. It is not a licence to keep
// writing em dashes: a file that opts out has to say why, above.
if(raw.includes("em-dash-exempt")){exempt.push(f);continue;}
const vis=extname(f)===".css"?raw.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g," ")):extname(f)===".md"?raw:strip(raw);
vis.split("\n").forEach((l,i)=>{if(l.includes("—"))hits.push({f,line:i+1,n:(l.match(/—/g)||[]).length});});}}
const byFile={};hits.forEach(h=>{byFile[h.f]=(byFile[h.f]||0)+h.n;});
const total = hits.reduce((a, h) => a + h.n, 0);
if (total) {
  console.error("\nEM DASH GUARD FAILED: " + total + " in visitor-visible copy\n");
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .forEach(([f, n]) => console.error("  " + String(n).padStart(3) + "  " + f));
  console.error("\nRewrite the sentence; do not swap the character.\n");
  process.exit(1);
}
console.log(
  "Em dash guard passed: none in shipped copy." +
    (exempt.length ? ` (${exempt.length} file(s) opted out: ${exempt.join(", ")})` : "")
);
