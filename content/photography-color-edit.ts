import { rolls, type Roll } from "./photography";

export type ColorPhoto = { roll: Roll; frameIndex: number; width: number; height: number; alt: string };
export type ColorSpread = { layout: "three" | "feature"; images: ColorPhoto[] };

function photo(rollId: string, frame: string, width: number, height: number, alt: string): ColorPhoto {
  const roll = rolls.find((r) => r.id === rollId);
  const frameIndex = roll?.frames.findIndex((f) => f.n === frame) ?? -1;
  if (!roll || frameIndex < 0) throw new Error(`Missing curated photograph: ${rollId}/${frame}`);
  return { roll, frameIndex, width, height, alt };
}

// Ordered by observed color and composition, not by filename. Sources stay in the archive.
export const colorSections: { id: string; title: string; spreads: ColorSpread[] }[] = [
  { id: "red-warm", title: "RED + WARM", spreads: [
    { layout: "three", images: [
      photo("135film", "22", 1500, 2000, "A red dress and long shadow on a sunlit street."),
      photo("135film", "17", 1326, 2000, "A red cardigan against a yellow taxi."),
      photo("135film", "24", 1326, 2000, "A seated figure framed by a deep red doorway."),
    ] },
    { layout: "feature", images: [
      photo("135film", "28", 1326, 2000, "Orange sunlight across a figure inside a ferry."),
      photo("135film", "05", 2000, 1326, "Passengers in a ferry cabin filled with golden light."),
      photo("120film", "06", 1244, 1244, "A warm silhouette against a bright ferry window."),
    ] },
  ] },
  { id: "green", title: "GREEN", spreads: [
    { layout: "three", images: [
      photo("medium-format-digital", "01", 1440, 1920, "A green checked dress beside brightly lit shop shelves."),
      photo("medium-format-digital", "16", 1440, 1920, "A green checked dress against a brick wall at night."),
      photo("135film", "15", 1326, 2000, "Mint clothing against brick and striped sunlight."),
    ] },
    { layout: "three", images: [
      photo("medium-format-digital", "04", 1500, 2000, "A seated figure in a courtyard edged with green leaves."),
      photo("medium-format-digital", "02", 1080, 1440, "A portrait among soft green foliage and pale blossoms."),
      photo("135film", "11", 1325, 2000, "A figure reaching toward pale flowers against dark green foliage."),
    ] },
  ] },
  { id: "blue-cyan", title: "BLUE + CYAN", spreads: [
    { layout: "feature", images: [
      photo("digital", "03", 1080, 1620, "A tilted portrait against a curved cyan wall."),
      photo("medium-format-digital", "07", 2000, 1500, "An illuminated glass building under a deep blue winter sky."),
      photo("digital", "13", 1620, 1080, "Two figures on pale sand beside turquoise water."),
    ] },
    { layout: "three", images: [
      photo("digital", "12", 1080, 1620, "A red top beneath a bright blue sky and pale clouds."),
      photo("120film", "01", 2000, 1971, "A backlit waterfront portrait under pale blue sky."),
      photo("polaroid", "05", 1283, 1010, "An instant portrait against blue shadows on snow."),
    ] },
  ] },
  { id: "neutral-mono", title: "NEUTRAL + MONO", spreads: [
    { layout: "feature", images: [
      photo("medium-format-digital", "14", 1500, 2000, "A black-and-white portrait reflected in a leaning mirror."),
      photo("digital", "19", 2000, 1333, "A dim interior portrait framed by a window and curtain."),
      photo("medium-format-digital", "09", 2000, 1500, "A black-and-white figure beneath a glass shelter and bare branches."),
    ] },
    { layout: "three", images: [
      photo("135film", "27", 1080, 1629, "Legs crossing a hard boundary of sunlight and shadow."),
      photo("120film", "07", 2000, 1992, "A monochrome profile beside a tall gridded window."),
      photo("digital", "25", 1080, 1620, "A figure beside an iron gate and its angular shadow."),
    ] },
  ] },
];
