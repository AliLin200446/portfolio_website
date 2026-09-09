import { rolls, type Roll } from "./photography";

export type ColorPhoto = { roll: Roll; frameIndex: number; width: number; height: number; alt: string };
export type ColorSpread = { layout: "feature-left" | "feature-right" | "wide-pair" | "two-up" | "filmstrip"; images: ColorPhoto[] };

function photo(rollId: string, frame: string, width: number, height: number, alt: string): ColorPhoto {
  const roll = rolls.find((item) => item.id === rollId);
  const frameIndex = roll?.frames.findIndex((item) => item.n === frame) ?? -1;
  if (!roll || frameIndex < 0) throw new Error(`Missing photograph: ${rollId}/${frame}`);
  return { roll, frameIndex, width, height, alt };
}

// Editorial classification by visible palette. Move entries between spreads to re-edit.
// Intrinsic dimensions reserve space; original format/frame metadata stays in photography.ts.
export const colorSections: { id: string; title: string; spreads: ColorSpread[] }[] = [

  { id: "mono", title: "MONO", spreads: [
    { layout: "two-up", images: [
      photo("medium-format-digital", "08", 1500, 2000, "A monochrome figure beside a tall window."),
      photo("medium-format-digital", "14", 1500, 2000, "A monochrome portrait in a leaning mirror."),
    ] },
    { layout: "two-up", images: [
      photo("120film", "07", 2000, 1992, "A monochrome profile beside a gridded window."),
      photo("medium-format-digital", "10", 2000, 1500, "A monochrome portrait beneath a dark ceiling."),
    ] },
    { layout: "feature-left", images: [
      photo("digital", "08", 1080, 1620, "A monochrome figure and architectural shadows."),
      photo("135film", "03", 1628, 1080, "A figure and hard shadows outside a cafe."),
      photo("135film", "07", 1080, 1628, "A dark suit framed by street steam."),
    ] },
    { layout: "two-up", images: [
      photo("135film", "29", 1080, 1628, "A figure and shadows in a glass corridor."),
      photo("medium-format-digital", "05", 1500, 2000, "A desaturated snowy city street."),
    ] },
    { layout: "two-up", images: [
      photo("medium-format-digital", "06", 2000, 1500, "Figures outside a glass building at dusk."),
      photo("medium-format-digital", "12", 1499, 2000, "A tilted portrait among escalator reflections."),
    ] },
    { layout: "feature-right", images: [
      photo("medium-format-digital", "09", 2000, 1500, "A monochrome figure beneath a glass shelter."),
      photo("digital", "05", 1080, 1621, "A silhouette through a softly lit curtain."),
      photo("digital", "11", 1620, 1080, "A close portrait with dark sunglasses."),
    ] },
    { layout: "feature-right", images: [
      photo("digital", "19", 2000, 1333, "A dim portrait framed by a window."),
      photo("digital", "24", 1080, 1620, "A dark outfit against pale pavement."),
      photo("digital", "25", 1080, 1620, "A figure beside an iron gate and angular shadows."),
    ] },
    { layout: "filmstrip", images: [
      photo("polaroid", "01", 1080, 1324, "A monochrome instant portrait."),
      photo("polaroid", "02", 1066, 1305, "A monochrome seated instant portrait."),
      photo("polaroid", "06", 1080, 1318, "A monochrome instant cafe portrait."),
      photo("polaroid", "07", 922, 922, "A circular monochrome street portrait."),
    ] },
    { layout: "feature-left", images: [
      photo("polaroid", "08", 921, 921, "A circular monochrome crosswalk portrait."),
      photo("polaroid", "09", 926, 926, "A circular monochrome window portrait."),
      photo("polaroid", "10", 1640, 2000, "A circular muted waterfront portrait."),
    ] },
    { layout: "two-up", images: [
      photo("polaroid", "19", 1656, 2000, "A circular desaturated waterfront portrait."),
      photo("polaroid", "22", 1774, 1774, "A monochrome portrait beside vertical bars."),
    ] },
  ] },
  { id: "red", title: "RED", spreads: [
    { layout: "feature-left", images: [
      photo("135film", "22", 1500, 2000, "A red dress and long street shadow."),
      photo("135film", "24", 1326, 2000, "A seated figure framed by a red doorway."),
      photo("digital", "09", 1080, 1620, "A red top in golden backlight."),
    ] },
    { layout: "two-up", images: [
      photo("digital", "27", 1080, 1620, "A red top beneath a dark jacket."),
      photo("digital", "15", 2000, 1333, "A red coat among backlit pedestrians."),
    ] },
    { layout: "feature-right", images: [
      photo("digital", "12", 1080, 1620, "A red top beneath blue sky."),
      photo("135film", "17", 1326, 2000, "A red cardigan beside a yellow taxi."),
      photo("135film", "12", 1326, 2000, "A red bag held above a portrait."),
    ] },
    { layout: "two-up", images: [
      photo("135film", "06", 1326, 2000, "A portrait against a brick-red wall."),
      photo("135film", "32", 1327, 2000, "A figure outside a brick-red bookstore."),
    ] },
    { layout: "feature-left", images: [
      photo("135film", "21", 1500, 2000, "Red trousers outside a storefront."),
      photo("polaroid", "16", 1121, 1363, "A red-bordered instant photograph."),
      photo("135film", "13", 1326, 2000, "A red headpiece against a multicolor mural."),
    ] },
  ] },
  { id: "yellow-beige", title: "YELLOW + BEIGE", spreads: [
    { layout: "two-up", images: [
      photo("135film", "09", 1326, 2000, "A close portrait in golden backlight."),
      photo("135film", "10", 1326, 2000, "A sunlit figure on a city street."),
    ] },
    { layout: "wide-pair", images: [
      photo("135film", "05", 2000, 1326, "Passengers in a golden ferry cabin."),
      photo("135film", "28", 1326, 2000, "A portrait in an amber ferry cabin."),
      photo("135film", "31", 1545, 1024, "Golden light across a shop window."),
    ] },
    { layout: "two-up", images: [
      photo("digital", "06", 1080, 1620, "A portrait in an amber-lit clothing shop."),
      photo("120film", "06", 1244, 1244, "A warm silhouette against a ferry window."),
    ] },
    { layout: "two-up", images: [
      photo("digital", "23", 1080, 1620, "A close portrait in orange light."),
      photo("digital", "17", 1333, 2000, "An orange balloon beside a portrait."),
    ] },
    { layout: "feature-left", images: [
      photo("135film", "08", 1326, 2000, "A ginger cat against an amber wall."),
      photo("135film", "01", 1628, 1080, "Cafe tables in warm street light."),
      photo("135film", "18", 1326, 2000, "A portrait in a warm cafe interior."),
    ] },
    { layout: "two-up", images: [
      photo("135film", "19", 1327, 2000, "A brown coat on a sunlit street."),
      photo("135film", "23", 1326, 2000, "A waterfront portrait in warm sunlight."),
    ] },
    { layout: "two-up", images: [
      photo("135film", "14", 1326, 2000, "A patterned dress against a warm wall."),
      photo("135film", "26", 1326, 2000, "A figure in a beige telephone booth."),
    ] },
    { layout: "feature-right", images: [
      photo("135film", "30", 1326, 2000, "A white blouse in a covered walkway."),
      photo("medium-format-digital", "03", 1500, 2000, "A seated portrait in a warm cafe."),
      photo("medium-format-digital", "13", 2000, 1500, "Figures walking through a warm narrow alley."),
    ] },
    { layout: "two-up", images: [
      photo("digital", "01", 1080, 1440, "A reclining figure on a warm shop floor."),
      photo("digital", "02", 1080, 1620, "A striped outfit beside a wooden bench."),
    ] },
    { layout: "feature-left", images: [
      photo("digital", "07", 810, 1216, "A reclining figure in a cream studio."),
      photo("digital", "14", 1333, 2000, "A mirrored portrait among muted warm city colors."),
      photo("digital", "20", 810, 1216, "A cream-toned studio mirror portrait."),
    ] },
    { layout: "two-up", images: [
      photo("digital", "21", 1080, 1620, "A reclining close portrait in warm light."),
      photo("digital", "22", 1080, 1620, "A tilted portrait beside a wooden bench."),
    ] },
    { layout: "two-up", images: [
      photo("120film", "02", 2000, 1970, "A sunlit portrait beside cream brick."),
      photo("polaroid", "03", 1301, 1007, "An instant portrait in golden winter light."),
    ] },
    { layout: "filmstrip", images: [
      photo("polaroid", "11", 1175, 1427, "A golden-toned instant portrait."),
      photo("polaroid", "13", 1402, 1704, "A warm instant portrait beside bare trees."),
      photo("polaroid", "14", 1414, 1718, "A cream-toned instant cafe photograph."),
      photo("polaroid", "20", 1152, 1404, "A portrait through a yellow patterned foreground."),
    ] },
    { layout: "two-up", images: [
      photo("polaroid", "21", 1048, 1276, "A warm instant portrait with a net headpiece."),
      photo("135film", "27", 1080, 1629, "Legs crossing a boundary of light and shadow."),
    ] },
  ] },
  { id: "green", title: "GREEN", spreads: [
    { layout: "two-up", images: [
      photo("medium-format-digital", "15", 1440, 1920, "A green checked dress in neon light."),
      photo("medium-format-digital", "16", 1440, 1920, "A green checked dress against brick at night."),
    ] },
    { layout: "feature-left", images: [
      photo("135film", "15", 1326, 2000, "Mint clothing in striped sunlight."),
      photo("medium-format-digital", "02", 1080, 1440, "A portrait among foliage and pale flowers."),
      photo("135film", "11", 1325, 2000, "A figure reaching toward pale green flowers."),
    ] },
    { layout: "two-up", images: [
      photo("medium-format-digital", "04", 1500, 2000, "A figure in a leafy courtyard."),
      photo("120film", "04", 1097, 1080, "A seated figure beneath green foliage."),
    ] },
    { layout: "two-up", images: [
      photo("120film", "05", 1291, 1291, "A portrait framed by green ferry windows."),
      photo("135film", "25", 1326, 2000, "A portrait beneath dark green lights."),
    ] },
    { layout: "feature-right", images: [
      photo("medium-format-digital", "11", 2000, 1500, "A portrait reflected in a green-toned shop refrigerator."),
      photo("digital", "16", 2000, 1333, "A moving figure blurred against green lights."),
      photo("digital", "26", 1080, 1620, "A portrait behind deep green foliage."),
    ] },
    { layout: "two-up", images: [
      photo("polaroid", "15", 1080, 1080, "A softly focused green-toned portrait."),
      photo("polaroid", "18", 1410, 1714, "An instant portrait among green and amber lights."),
    ] },
  ] },
  { id: "blue", title: "BLUE", spreads: [
    { layout: "feature-left", images: [
      photo("digital", "03", 1080, 1620, "A tilted portrait against a cyan wall."),
      photo("digital", "13", 1620, 1080, "Two figures beside turquoise water."),
      photo("135film", "04", 1080, 1653, "A waterfront figure beneath blue sky."),
    ] },
    { layout: "two-up", images: [
      photo("120film", "03", 2000, 1970, "A portrait beneath blossoms and blue sky."),
      photo("120film", "01", 2000, 1971, "A waterfront portrait beneath pale blue sky."),
    ] },
    { layout: "wide-pair", images: [
      photo("medium-format-digital", "07", 2000, 1500, "A glass building under deep blue winter sky."),
      photo("135film", "02", 1326, 2000, "A portrait against blue subway tiles."),
      photo("digital", "04", 1080, 1620, "A waterfront portrait beneath a bridge."),
    ] },
    { layout: "filmstrip", images: [
      photo("polaroid", "12", 1162, 1412, "A blue waterfront instant photograph."),
      photo("polaroid", "05", 1283, 1010, "An instant portrait against blue snow shadows."),
      photo("polaroid", "23", 1277, 1021, "An instant portrait in blue winter light."),
      photo("polaroid", "17", 1056, 1281, "A blue-violet waterfront instant portrait."),
    ] },
  ] },
  { id: "mixed", title: "MIXED", spreads: [
    { layout: "feature-left", images: [
      photo("135film", "20", 1500, 2000, "A mirror portrait paired with a gas station."),
      photo("135film", "16", 1326, 2000, "Mint clothing beside a red bench."),
      photo("135film", "33", 1326, 2000, "A tilted portrait among colorful storefront signs."),
    ] },
    { layout: "feature-right", images: [
      photo("medium-format-digital", "01", 1440, 1920, "A green checked dress among colorful shop lights."),
      photo("digital", "10", 1080, 1620, "Red trousers against blue waterfront light."),
      photo("digital", "18", 1333, 2000, "A blue outfit and colorful balloons."),
    ] },
    { layout: "two-up", images: [
      photo("polaroid", "04", 2000, 1567, "An instant portrait among multicolor clothing."),
      photo("polaroid", "24", 2000, 1554, "An instant portrait in a colorful clothing shop."),
    ] },
  ] },
];

export const orderedPhotos = colorSections.flatMap((section) => section.spreads.flatMap((spread) => spread.images));
const sourcePaths = new Set(rolls.flatMap((roll) => roll.frames.map((frame) => frame.src)));
const editedPaths = orderedPhotos.map((image) => image.roll.frames[image.frameIndex].src);
if (new Set(editedPaths).size !== editedPaths.length || editedPaths.length !== sourcePaths.size || editedPaths.some((path) => !sourcePaths.has(path))) {
  throw new Error("Photography color edit must contain every source photograph exactly once.");
}
