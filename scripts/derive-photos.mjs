/*
 * PHOTO-QUICKHANG · 构建期派生。原图留在仓库根的 photography/(不进
 * public,不上线),这里只产出两档 WebP 到 public/photography/:
 *   thumb ≤400px 长边(小样)· full ≤2000px 长边(loupe)
 * 硬闸:sharp 不调 withMetadata 时丢弃全部输入元数据,故派生图零
 * EXIF、零 GPS —— 派生后逐张复核并打印。
 */
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = "photography";
const OUT = "public/photography";
const rolls = await readdir(SRC, { withFileTypes: true });
const report = [];

for (const r of rolls.filter((d) => d.isDirectory())) {
  const files = (await readdir(path.join(SRC, r.name)))
    .filter((f) => /\.(jpe?g|png|tiff?|heic)$/i.test(f))
    .sort();
  await mkdir(path.join(OUT, r.name), { recursive: true });
  let i = 0;
  for (const f of files) {
    i += 1;
    const n = String(i).padStart(2, "0");
    const src = path.join(SRC, r.name, f);
    for (const [tag, size, q] of [["t", 400, 78], ["f", 2000, 82]]) {
      const dst = path.join(OUT, r.name, `${n}-${tag}.webp`);
      await sharp(src)
        .rotate()
        .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
        .webp({ quality: q })
        .toFile(dst);
      const { size: bytes } = await stat(dst);
      const meta = await sharp(dst).metadata();
      report.push({ tag, kb: Math.round(bytes / 1024), long: Math.max(meta.width, meta.height), exif: meta.exif ? "有" : "无" });
    }
  }
}
const pick = (t) => report.filter((x) => x.tag === t);
const sum = (t) => pick(t).reduce((a, x) => a + x.kb, 0);
console.log(`派生 ${report.length / 2} 张 × 2 档`);
for (const t of ["t", "f"])
  console.log(`${t === "t" ? "thumb" : "full "} 合计 ${sum(t)} KB · 均 ${Math.round(sum(t) / pick(t).length)} KB · 最大 ${Math.max(...pick(t).map((x) => x.kb))} KB · 最长边 ${Math.max(...pick(t).map((x) => x.long))} px`);
console.log("派生图 EXIF 残留:", [...new Set(report.map((x) => x.exif))].join(","));
