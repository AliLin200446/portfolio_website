/*
 * PHOTOGRAPHY 数据 — 作者只填这个文件。一卷=一次拍摄=一组元数据,
 * 分组本身即策展,无需另写文案。
 * 三条闸(不可跳过):
 * ① GPS 剥离 — 图经 next/image 重编码出片,EXIF/GPS 全剥;原始 GFX
 *   全尺寸绝不进 public(放 content 外目录或对象存储,构建期派生)。
 * ② 人像须获授权 — 任何可辨识人物,逐卷确认(commissioned/刊发尤其)。
 * ③ 图注写条件不写好看 — note 是条件,不是形容。
 */

export type Format = "135" | "120" | "digital";

export type Roll = {
  id: string; // 'venice-2026-portra'
  camera: string; // 'Rolleiflex 3.5F'
  stock: string; // 'Portra 400' | 'digital — GFX 100S II'
  format: Format;
  place: string;
  year: string;
  frames: { n: string; src: string; note?: string }[];
};

export const FORMATS: Format[] = ["135", "120", "digital"];

export const rolls: Roll[] = [
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
