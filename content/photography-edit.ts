import { rolls } from "./photography";

export type EditorialPhoto = {
  rollId: string;
  frame: string;
  width: number;
  height: number;
  alt: string;
};

export type SpreadLayout = "triptych" | "feature-right" | "editorial-grid" | "two-up";
export type EditorialSpread = { layout: SpreadLayout; photos: EditorialPhoto[] };

// Existing archive references and measured WebP dimensions. No crops or offsets.
const photos = {
  "135film/22": {"rollId":"135film","frame":"22","width":1500,"height":2000,"alt":"A figure in a bright red dress on a sunlit street, with a long diagonal shadow."},
  "135film/17": {"rollId":"135film","frame":"17","width":1326,"height":2000,"alt":"A red cardigan against the yellow body of a taxi."},
  "135film/24": {"rollId":"135film","frame":"24","width":1326,"height":2000,"alt":"A seated figure framed by a red doorway."},
  "135film/15": {"rollId":"135film","frame":"15","width":1326,"height":2000,"alt":"Mint clothing and striped sunlight against a brick wall."},
  "medium-format-digital/01": {"rollId":"medium-format-digital","frame":"01","width":1440,"height":1920,"alt":"A green checked dress beside brightly lit shelves, photographed on a diagonal."},
  "135film/04": {"rollId":"135film","frame":"04","width":1080,"height":1653,"alt":"A small figure in red trousers beneath a bridge and a cyan sky."},
  "120film/05": {"rollId":"120film","frame":"05","width":1291,"height":1291,"alt":"Warm sunlight on a portrait beside a green-framed ferry window."},
  "135film/05": {"rollId":"135film","frame":"05","width":2000,"height":1326,"alt":"Passengers seated in a ferry cabin filled with golden light."},
  "medium-format-digital/07": {"rollId":"medium-format-digital","frame":"07","width":2000,"height":1500,"alt":"An illuminated glass building and snow beneath a deep blue evening sky."},
  "135film/31": {"rollId":"135film","frame":"31","width":1545,"height":1024,"alt":"A lone seated figure outside a storefront in low, slanting sunlight."},
  "135film/03": {"rollId":"135film","frame":"03","width":1628,"height":1080,"alt":"A seated figure in silhouette among café chairs and pavement shadows."},
  "135film/27": {"rollId":"135film","frame":"27","width":1080,"height":1629,"alt":"Cropped legs and shoes crossing a sharp boundary between sun and shade."},
  "medium-format-digital/08": {"rollId":"medium-format-digital","frame":"08","width":1500,"height":2000,"alt":"Black-and-white portrait of a standing figure beside a tall studio window."},
  "120film/07": {"rollId":"120film","frame":"07","width":2000,"height":1992,"alt":"A black-and-white profile silhouetted against a gridded window."},
  "digital/25": {"rollId":"digital","frame":"25","width":1080,"height":1620,"alt":"A figure beside an iron gate and its angular shadow on stone."},
  "135film/07": {"rollId":"135film","frame":"07","width":1080,"height":1628,"alt":"A dark-suited figure against white street steam and a yellow taxi."},
  "120film/03": {"rollId":"120film","frame":"03","width":2000,"height":1970,"alt":"A backlit portrait under pale blossoms and blue sky."},
  "120film/06": {"rollId":"120film","frame":"06","width":1244,"height":1244,"alt":"A figure reduced to a warm silhouette inside a sunlit ferry."},
  "medium-format-digital/14": {"rollId":"medium-format-digital","frame":"14","width":1500,"height":2000,"alt":"A black-and-white portrait with a face reflected in a leaning mirror."},
  "digital/11": {"rollId":"digital","frame":"11","width":1620,"height":1080,"alt":"A close portrait with narrow black sunglasses and red lips."},
  "digital/03": {"rollId":"digital","frame":"03","width":1080,"height":1620,"alt":"A tilted close portrait against a curved cyan-blue wall."},
  "digital/12": {"rollId":"digital","frame":"12","width":1080,"height":1620,"alt":"A red top and windblown hair against a vivid blue sky."},
  "135film/12": {"rollId":"135film","frame":"12","width":1326,"height":2000,"alt":"A translucent red bag held above a face against pale blue fabric."},
  "digital/17": {"rollId":"digital","frame":"17","width":1333,"height":2000,"alt":"A flash-lit portrait with an orange balloon and a white net headpiece."},
  "digital/18": {"rollId":"digital","frame":"18","width":1333,"height":2000,"alt":"A reclining portrait with blue and orange balloons and a white net headpiece."},
  "polaroid/20": {"rollId":"polaroid","frame":"20","width":1152,"height":1404,"alt":"An instant photograph with a figure fragmented by yellow light and a striped foreground."},
  "polaroid/21": {"rollId":"polaroid","frame":"21","width":1048,"height":1276,"alt":"An instant photograph isolating a face and neck in a bright band of light."},
} satisfies Record<string, EditorialPhoto>;

// Each group is a complete spread, read left-to-right, then down.
// Change the references here to re-edit; reusable layouts own all placement.
const spread = (layout: SpreadLayout, ...ids: (keyof typeof photos)[]): EditorialSpread => ({
  layout, photos: ids.map((id) => photos[id]),
});

export const editorialSections = [
  { id: "color", title: "COLOR", spreads: [
    // Red dress -> red cardigan/yellow taxi -> red doorway.
    spread("triptych", "135film/22", "135film/17", "135film/24"),
    // Golden cabin -> warm skin/green window -> mint against brick.
    spread("feature-right", "135film/05", "120film/05", "135film/15"),
    // Green dress -> cyan skyline -> deep blue evening architecture.
    spread("triptych", "medium-format-digital/01", "135film/04", "medium-format-digital/07"),
  ] },
  { id: "figure-light", title: "FIGURE & LIGHT", spreads: [
    // Two seated silhouettes face a tight study of legs and hard shadow.
    spread("feature-right", "135film/31", "135film/03", "135film/27"),
    // Window grids and a gate connect three monochrome figure studies.
    spread("triptych", "medium-format-digital/08", "120film/07", "digital/25"),
    // Steam, blossom and ferry glare dissolve the figure's surroundings.
    spread("triptych", "135film/07", "120film/03", "120film/06"),
  ] },
  { id: "artifice", title: "ARTIFICE", spreads: [
    // Mirror and sunglasses above a continuous cyan/red portrait sequence.
    spread("editorial-grid", "medium-format-digital/14", "digital/11", "digital/03", "digital/12", "135film/12"),
    // Paired flash portraits resolve into two warm instant-film details.
    spread("two-up", "digital/17", "digital/18", "polaroid/20", "polaroid/21"),
  ] },
];

export const editorialCount = editorialSections.reduce(
  (count, section) => count + section.spreads.reduce((n, spread) => n + spread.photos.length, 0), 0
);

export function resolvePhoto(photo: EditorialPhoto) {
  const roll = rolls.find((r) => r.id === photo.rollId);
  const frame = roll?.frames.find((f) => f.n === photo.frame);
  if (!roll || !frame) throw new Error(`Unknown editorial photograph: ${photo.rollId}/${photo.frame}`);
  return { src: frame.src, format: roll.format, frame: frame.n };
}
