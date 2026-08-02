/*
 * PHOTOGRAPHY 数据 — 作者只填这个文件。一卷=一次拍摄=一组元数据,
 * 分组本身即策展,无需另写文案。
 * 三条闸(不可跳过):
 * ① GPS 剥离 — 图经 next/image 重编码出片,EXIF/GPS 全剥;原始 GFX
 *   全尺寸绝不进 public(放 content 外目录或对象存储,构建期派生)。
 * ② 人像须获授权 — 任何可辨识人物,逐卷确认(commissioned/刊发尤其)。
 * ③ 图注写条件不写好看 — note 是条件,不是形容。
 */

export type Format = "135" | "120" | "digital" | "instant";

export type Roll = {
  id: string; // 'venice-2026-portra'
  camera: string; // 'Rolleiflex 3.5F'
  stock: string; // 'Portra 400' | 'digital — GFX 100S II'
  format: Format;
  place: string;
  year: string;
  /** src = loupe 尺寸(≤2000px), thumb = 小样(≤400px);两档均由
   *  scripts/derive-photos.mjs 于构建期从 photography/ 原图派生(WebP,
   *  零 EXIF/GPS)。原图不进 public。 */
  frames: { n: string; src: string; thumb?: string; note?: string }[];
};

export const FORMATS: Format[] = ["135", "120", "digital", "instant"];

/* PHOTO-QUICKHANG:先挂上看效果。分卷取自作者自己的文件夹归类(画幅/
 * 介质是真信息);机身/片种/地点/年份未给 → 一律 `DRAFT:` 前缀直接上屏,
 * 一眼看得见哪些是假的。清扫:grep -rn "DRAFT" content/ */
export const rolls: Roll[] = [
  {
    id: "135film",
    camera: "DRAFT: camera",
    stock: "DRAFT: stock",
    format: "135",
    place: "DRAFT: place",
    year: "DRAFT",
    frames: [
      { n: "01", thumb: "/photography/135film/01-t.webp", src: "/photography/135film/01-f.webp" },
      { n: "02", thumb: "/photography/135film/02-t.webp", src: "/photography/135film/02-f.webp" },
      { n: "03", thumb: "/photography/135film/03-t.webp", src: "/photography/135film/03-f.webp" },
      { n: "04", thumb: "/photography/135film/04-t.webp", src: "/photography/135film/04-f.webp" },
      { n: "05", thumb: "/photography/135film/05-t.webp", src: "/photography/135film/05-f.webp" },
      { n: "06", thumb: "/photography/135film/06-t.webp", src: "/photography/135film/06-f.webp" },
      { n: "07", thumb: "/photography/135film/07-t.webp", src: "/photography/135film/07-f.webp" },
      { n: "08", thumb: "/photography/135film/08-t.webp", src: "/photography/135film/08-f.webp" },
      { n: "09", thumb: "/photography/135film/09-t.webp", src: "/photography/135film/09-f.webp" },
      { n: "10", thumb: "/photography/135film/10-t.webp", src: "/photography/135film/10-f.webp" },
      { n: "11", thumb: "/photography/135film/11-t.webp", src: "/photography/135film/11-f.webp" },
      { n: "12", thumb: "/photography/135film/12-t.webp", src: "/photography/135film/12-f.webp" },
      { n: "13", thumb: "/photography/135film/13-t.webp", src: "/photography/135film/13-f.webp" },
      { n: "14", thumb: "/photography/135film/14-t.webp", src: "/photography/135film/14-f.webp" },
      { n: "15", thumb: "/photography/135film/15-t.webp", src: "/photography/135film/15-f.webp" },
      { n: "16", thumb: "/photography/135film/16-t.webp", src: "/photography/135film/16-f.webp" },
      { n: "17", thumb: "/photography/135film/17-t.webp", src: "/photography/135film/17-f.webp" },
      { n: "18", thumb: "/photography/135film/18-t.webp", src: "/photography/135film/18-f.webp" },
      { n: "19", thumb: "/photography/135film/19-t.webp", src: "/photography/135film/19-f.webp" },
      { n: "20", thumb: "/photography/135film/20-t.webp", src: "/photography/135film/20-f.webp" },
      { n: "21", thumb: "/photography/135film/21-t.webp", src: "/photography/135film/21-f.webp" },
      { n: "22", thumb: "/photography/135film/22-t.webp", src: "/photography/135film/22-f.webp" },
      { n: "23", thumb: "/photography/135film/23-t.webp", src: "/photography/135film/23-f.webp" },
      { n: "24", thumb: "/photography/135film/24-t.webp", src: "/photography/135film/24-f.webp" },
      { n: "25", thumb: "/photography/135film/25-t.webp", src: "/photography/135film/25-f.webp" },
      { n: "26", thumb: "/photography/135film/26-t.webp", src: "/photography/135film/26-f.webp" },
      { n: "27", thumb: "/photography/135film/27-t.webp", src: "/photography/135film/27-f.webp" },
      { n: "28", thumb: "/photography/135film/28-t.webp", src: "/photography/135film/28-f.webp" },
      { n: "29", thumb: "/photography/135film/29-t.webp", src: "/photography/135film/29-f.webp" },
      { n: "30", thumb: "/photography/135film/30-t.webp", src: "/photography/135film/30-f.webp" },
      { n: "31", thumb: "/photography/135film/31-t.webp", src: "/photography/135film/31-f.webp" },
      { n: "32", thumb: "/photography/135film/32-t.webp", src: "/photography/135film/32-f.webp" },
      { n: "33", thumb: "/photography/135film/33-t.webp", src: "/photography/135film/33-f.webp" },
    ],
  },
  {
    id: "medium-format-digital",
    camera: "DRAFT: camera",
    stock: "DRAFT: stock",
    format: "digital",
    place: "DRAFT: place",
    year: "DRAFT",
    frames: [
      { n: "01", thumb: "/photography/medium-format-digital/01-t.webp", src: "/photography/medium-format-digital/01-f.webp" },
      { n: "02", thumb: "/photography/medium-format-digital/02-t.webp", src: "/photography/medium-format-digital/02-f.webp" },
      { n: "03", thumb: "/photography/medium-format-digital/03-t.webp", src: "/photography/medium-format-digital/03-f.webp" },
      { n: "04", thumb: "/photography/medium-format-digital/04-t.webp", src: "/photography/medium-format-digital/04-f.webp" },
      { n: "05", thumb: "/photography/medium-format-digital/05-t.webp", src: "/photography/medium-format-digital/05-f.webp" },
      { n: "06", thumb: "/photography/medium-format-digital/06-t.webp", src: "/photography/medium-format-digital/06-f.webp" },
      { n: "07", thumb: "/photography/medium-format-digital/07-t.webp", src: "/photography/medium-format-digital/07-f.webp" },
      { n: "08", thumb: "/photography/medium-format-digital/08-t.webp", src: "/photography/medium-format-digital/08-f.webp" },
      { n: "09", thumb: "/photography/medium-format-digital/09-t.webp", src: "/photography/medium-format-digital/09-f.webp" },
      { n: "10", thumb: "/photography/medium-format-digital/10-t.webp", src: "/photography/medium-format-digital/10-f.webp" },
      { n: "11", thumb: "/photography/medium-format-digital/11-t.webp", src: "/photography/medium-format-digital/11-f.webp" },
      { n: "12", thumb: "/photography/medium-format-digital/12-t.webp", src: "/photography/medium-format-digital/12-f.webp" },
      { n: "13", thumb: "/photography/medium-format-digital/13-t.webp", src: "/photography/medium-format-digital/13-f.webp" },
      { n: "14", thumb: "/photography/medium-format-digital/14-t.webp", src: "/photography/medium-format-digital/14-f.webp" },
      { n: "15", thumb: "/photography/medium-format-digital/15-t.webp", src: "/photography/medium-format-digital/15-f.webp" },
      { n: "16", thumb: "/photography/medium-format-digital/16-t.webp", src: "/photography/medium-format-digital/16-f.webp" },
    ],
  },
  {
    id: "digital",
    camera: "DRAFT: camera",
    stock: "DRAFT: stock",
    format: "digital",
    place: "DRAFT: place",
    year: "DRAFT",
    frames: [
      { n: "01", thumb: "/photography/digital/01-t.webp", src: "/photography/digital/01-f.webp" },
      { n: "02", thumb: "/photography/digital/02-t.webp", src: "/photography/digital/02-f.webp" },
      { n: "03", thumb: "/photography/digital/03-t.webp", src: "/photography/digital/03-f.webp" },
      { n: "04", thumb: "/photography/digital/04-t.webp", src: "/photography/digital/04-f.webp" },
      { n: "05", thumb: "/photography/digital/05-t.webp", src: "/photography/digital/05-f.webp" },
      { n: "06", thumb: "/photography/digital/06-t.webp", src: "/photography/digital/06-f.webp" },
      { n: "07", thumb: "/photography/digital/07-t.webp", src: "/photography/digital/07-f.webp" },
      { n: "08", thumb: "/photography/digital/08-t.webp", src: "/photography/digital/08-f.webp" },
      { n: "09", thumb: "/photography/digital/09-t.webp", src: "/photography/digital/09-f.webp" },
      { n: "10", thumb: "/photography/digital/10-t.webp", src: "/photography/digital/10-f.webp" },
      { n: "11", thumb: "/photography/digital/11-t.webp", src: "/photography/digital/11-f.webp" },
      { n: "12", thumb: "/photography/digital/12-t.webp", src: "/photography/digital/12-f.webp" },
      { n: "13", thumb: "/photography/digital/13-t.webp", src: "/photography/digital/13-f.webp" },
      { n: "14", thumb: "/photography/digital/14-t.webp", src: "/photography/digital/14-f.webp" },
      { n: "15", thumb: "/photography/digital/15-t.webp", src: "/photography/digital/15-f.webp" },
      { n: "16", thumb: "/photography/digital/16-t.webp", src: "/photography/digital/16-f.webp" },
      { n: "17", thumb: "/photography/digital/17-t.webp", src: "/photography/digital/17-f.webp" },
      { n: "18", thumb: "/photography/digital/18-t.webp", src: "/photography/digital/18-f.webp" },
      { n: "19", thumb: "/photography/digital/19-t.webp", src: "/photography/digital/19-f.webp" },
      { n: "20", thumb: "/photography/digital/20-t.webp", src: "/photography/digital/20-f.webp" },
      { n: "21", thumb: "/photography/digital/21-t.webp", src: "/photography/digital/21-f.webp" },
      { n: "22", thumb: "/photography/digital/22-t.webp", src: "/photography/digital/22-f.webp" },
      { n: "23", thumb: "/photography/digital/23-t.webp", src: "/photography/digital/23-f.webp" },
      { n: "24", thumb: "/photography/digital/24-t.webp", src: "/photography/digital/24-f.webp" },
      { n: "25", thumb: "/photography/digital/25-t.webp", src: "/photography/digital/25-f.webp" },
      { n: "26", thumb: "/photography/digital/26-t.webp", src: "/photography/digital/26-f.webp" },
      { n: "27", thumb: "/photography/digital/27-t.webp", src: "/photography/digital/27-f.webp" },
    ],
  },
  {
    id: "120film",
    camera: "DRAFT: camera",
    stock: "DRAFT: stock",
    format: "120",
    place: "DRAFT: place",
    year: "DRAFT",
    frames: [
      { n: "01", thumb: "/photography/120film/01-t.webp", src: "/photography/120film/01-f.webp" },
      { n: "02", thumb: "/photography/120film/02-t.webp", src: "/photography/120film/02-f.webp" },
      { n: "03", thumb: "/photography/120film/03-t.webp", src: "/photography/120film/03-f.webp" },
      { n: "04", thumb: "/photography/120film/04-t.webp", src: "/photography/120film/04-f.webp" },
      { n: "05", thumb: "/photography/120film/05-t.webp", src: "/photography/120film/05-f.webp" },
      { n: "06", thumb: "/photography/120film/06-t.webp", src: "/photography/120film/06-f.webp" },
      { n: "07", thumb: "/photography/120film/07-t.webp", src: "/photography/120film/07-f.webp" },
    ],
  },
  {
    id: "polaroid",
    camera: "DRAFT: camera",
    stock: "DRAFT: stock",
    format: "instant",
    place: "DRAFT: place",
    year: "DRAFT",
    frames: [
      { n: "01", thumb: "/photography/polaroid/01-t.webp", src: "/photography/polaroid/01-f.webp" },
      { n: "02", thumb: "/photography/polaroid/02-t.webp", src: "/photography/polaroid/02-f.webp" },
      { n: "03", thumb: "/photography/polaroid/03-t.webp", src: "/photography/polaroid/03-f.webp" },
      { n: "04", thumb: "/photography/polaroid/04-t.webp", src: "/photography/polaroid/04-f.webp" },
      { n: "05", thumb: "/photography/polaroid/05-t.webp", src: "/photography/polaroid/05-f.webp" },
      { n: "06", thumb: "/photography/polaroid/06-t.webp", src: "/photography/polaroid/06-f.webp" },
      { n: "07", thumb: "/photography/polaroid/07-t.webp", src: "/photography/polaroid/07-f.webp" },
      { n: "08", thumb: "/photography/polaroid/08-t.webp", src: "/photography/polaroid/08-f.webp" },
      { n: "09", thumb: "/photography/polaroid/09-t.webp", src: "/photography/polaroid/09-f.webp" },
      { n: "10", thumb: "/photography/polaroid/10-t.webp", src: "/photography/polaroid/10-f.webp" },
      { n: "11", thumb: "/photography/polaroid/11-t.webp", src: "/photography/polaroid/11-f.webp" },
      { n: "12", thumb: "/photography/polaroid/12-t.webp", src: "/photography/polaroid/12-f.webp" },
      { n: "13", thumb: "/photography/polaroid/13-t.webp", src: "/photography/polaroid/13-f.webp" },
      { n: "14", thumb: "/photography/polaroid/14-t.webp", src: "/photography/polaroid/14-f.webp" },
      { n: "15", thumb: "/photography/polaroid/15-t.webp", src: "/photography/polaroid/15-f.webp" },
      { n: "16", thumb: "/photography/polaroid/16-t.webp", src: "/photography/polaroid/16-f.webp" },
      { n: "17", thumb: "/photography/polaroid/17-t.webp", src: "/photography/polaroid/17-f.webp" },
      { n: "18", thumb: "/photography/polaroid/18-t.webp", src: "/photography/polaroid/18-f.webp" },
      { n: "19", thumb: "/photography/polaroid/19-t.webp", src: "/photography/polaroid/19-f.webp" },
      { n: "20", thumb: "/photography/polaroid/20-t.webp", src: "/photography/polaroid/20-f.webp" },
      { n: "21", thumb: "/photography/polaroid/21-t.webp", src: "/photography/polaroid/21-f.webp" },
      { n: "22", thumb: "/photography/polaroid/22-t.webp", src: "/photography/polaroid/22-f.webp" },
      { n: "23", thumb: "/photography/polaroid/23-t.webp", src: "/photography/polaroid/23-f.webp" },
      { n: "24", thumb: "/photography/polaroid/24-t.webp", src: "/photography/polaroid/24-f.webp" },
    ],
  },
  // 模板(照抄):
  // {
  //   id: "venice-2026-portra",
  //   camera: "Rolleiflex 3.5F",
  //   stock: "Portra 400",
  //   format: "120",
  //   place: "Venice",
  //   year: "2026",
  //   frames: [
  //     { n: "03", src: "/photos/venice-2026/03.jpg" },
  //   ],
  // },
];
