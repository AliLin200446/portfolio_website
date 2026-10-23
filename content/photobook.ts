import { colorSections, type ColorPhoto } from './photography-color-edit';
import type { Roll } from './photography';
export type ChapterId = 'cover' | 'mono' | 'red' | 'yellow-beige' | 'green' | 'blue' | 'mixed' | 'colophon';
export type Photograph = { id: string; src: string; thumb: string; alt: string; category: ChapterId; format: string; frame: string; width: number; height: number; aspectRatio: number; metadata: Roll };
const formats = { '135': '35mm film', '120': '120 film', instant: 'Instant', digital: 'Digital' };
const idOf = (p: ColorPhoto) => `${p.roll.id}-${p.roll.frames[p.frameIndex].n}`;
export const photographs: Photograph[] = colorSections.flatMap(section => section.spreads.flatMap(spread => spread.images.map(p => {
  const f = p.roll.frames[p.frameIndex];
  return { id: idOf(p), src: f.src, thumb: f.thumb ?? f.src, alt: p.alt, category: section.id as ChapterId, format: formats[p.roll.format], frame: f.n, width: p.width, height: p.height, aspectRatio: p.width / p.height, metadata: p.roll };
})));
export const photoById = Object.fromEntries(photographs.map(p => [p.id, p]));
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const titles = ['Mono', 'Red', 'Yellow + Beige', 'Green', 'Blue', 'Mixed'];
export const chapters: { id: ChapterId; label: string; title: string; description: string }[] = [
  { id: 'cover', label: 'Cover', title: 'Cover', description: '' },
  ...colorSections.map((section, i) => ({ id: section.id as ChapterId, label: `${numerals[i]}. ${titles[i]}`, title: titles[i], description: '' })),
  { id: 'colophon', label: 'Colophon', title: 'Colophon', description: '' },
];
export type Layout = 'panorama' | 'floating-hero' | 'portrait-diptych' | 'unequal-diptych' | 'triptych' | 'contact-sheet' | 'dark-editorial' | 'image-silence' | 'edge-portrait' | 'vertical-sequence' | 'offset' | 'typographic-interlude';
export type Placement = { photoId: string; page: 0 | 1 | 'both'; x: number; y: number; width: number; height: number; scale: number; crop: 'contain' | 'cover'; objectPosition: string; caption: string; captionPosition: 'below' | 'vertical' | 'none' };
export type Spread = { id: string; chapter: ChapterId; layout: Layout | 'cover' | 'colophon'; photographIds: string[]; pageNumbers: [number, number]; placements: Placement[]; background: [string,string]; intention: string; opener?: boolean };
type Box = [Placement['page'], number, number, number, number];
// Coordinates are percentages of a single page, except cross-gutter compositions.
// Each template has its own scale hierarchy and caption register, not just a new name.
const boxes: Record<Layout, Box[]> = {
  'panorama': [['both',0,0,100,100]],
  'floating-hero': [['both',17,19,73,62]],
  'portrait-diptych': [[0,7,8,85,85],[1,13,11,63,34],[1,13,53,63,34]],
  'unequal-diptych': [[0,13,25,57,57],[1,8,9,84,83]],
  'triptych': [[0,8,17,41,57],[0,56,31,36,51],[1,12,9,76,82]],
  'contact-sheet': [[0,9,13,37,34],[0,54,13,37,34],[1,9,44,37,34],[1,54,44,37,34]],
  'dark-editorial': [[0,8,8,84,83],[1,19,39,65,44]],
  'image-silence': [[0,12,15,76,73]],
  'edge-portrait': [[0,0,0,100,100],[1,25,40,54,40]],
  'vertical-sequence': [[0,16,8,62,37],[0,16,51,62,37],[1,24,24,55,56]],
  'offset': [[0,9,9,74,67],[1,24,39,62,49]],
  'typographic-interlude': [[1,18,19,66,68]],
};
const edit: Spread[] = [];
function add(chapter: ChapterId, layout: Spread['layout'], ids: string[], intention: string, opener = false, overrides: Partial<Placement>[] = []) {
  const page = edit.length * 2;
  const placements: Placement[] = ids.map((id,i) => {
    const [side,x,y,width,height] = boxes[layout as Layout][i];
    const p = photoById[id];
    const captionPosition = layout === 'panorama' || (layout === 'edge-portrait' && i === 0) ? 'none' : layout === 'offset' ? 'vertical' : 'below';
    const availableHeight = captionPosition === 'below' ? Math.min(height, 87 - y) : height;
    const ratio = side === 'both' ? 1.5 : .75;
    const fittedWidth = layout === 'panorama' ? width : Math.min(width, availableHeight * p.aspectRatio / ratio);
    const fittedHeight = layout === 'panorama' ? height : fittedWidth * ratio / p.aspectRatio;
    return { photoId:id,page:side,x:x+(width-fittedWidth)/2,y:y+(availableHeight-fittedHeight)/2,width:fittedWidth,height:fittedHeight,scale:1,crop:layout === 'panorama' ? 'cover' : 'contain',objectPosition:'50% 50%',caption:`${p.format} / ${p.frame}`,captionPosition,...overrides[i] };
  });
  edit.push({ id:`${chapter}-${edit.length}`, chapter, layout, photographIds:ids, pageNumbers:[page,page+1], placements, background:layout === 'dark-editorial' ? ['#191b1a','#191b1a'] : ['#fff','#fff'], intention, opener });
}
add('cover','cover',[],'Original cover');
// Explicit visual decisions keyed to the existing color edit's photograph groups.
// No filename sorting, random choice, or modulo template cycling.
const directions: Record<string, [Layout,string][]> = {
  mono: [
    ['image-silence','Mirror portrait isolated after the window opener.'],
    ['dark-editorial','Two dark architectural portraits; square profile balances a low horizontal ceiling.'],
    ['portrait-diptych','Hard architectural shadows connect the full figure, cafe and street steam.'],
    ['offset','Corridor diagonals sit high; the snowy city drops toward the outer edge.'],
    ['unequal-diptych','Small glass facade against the larger escalator portrait.'],
    ['triptych','Shelter and curtain silhouettes lead into a bright close portrait.'],
    ['vertical-sequence','Window, pavement and gate form a descending shadow sequence.'],
    ['contact-sheet','Four monochrome instant frames kept together with their print edges.'],
    ['triptych','Circular street views lead to the single waterfront face.'],
    ['offset','The soft circular waterfront portrait contrasts with a dark architectural frame.'],
  ],
  red: [
    ['unequal-diptych','Red doorway recedes; warm backlit red portrait takes the opposite page.'],
    ['edge-portrait','Red top leads at full page height; street movement is a small counterpoint.'],
    ['triptych','Three red accents move from blue sky through taxi yellow to the red headpiece.'],
    ['offset','Brick textures and hard shadows set opposing heights.'],
    ['portrait-diptych','Red trousers anchor a print with red border and a red headpiece.'],
  ],
  'yellow-beige': [
    ['image-silence','One sunlit street portrait after the intimate opening face.'],
    ['panorama','Ferry cabin landscape is almost exactly the open-book ratio; retain the full width.'],
    ['unequal-diptych','Warm shop texture contrasted with the quiet square ferry silhouette.'],
    ['offset','Orange light and balloon share color but differ in gesture.'],
    ['portrait-diptych','Ginger cat and cafe details stay together as a warm domestic sequence.'],
    ['unequal-diptych','Sunlit street and waterfront portraits share golden edge light.'],
    ['edge-portrait','Patterned dress at full page height; telephone-booth figure held smaller.'],
    ['vertical-sequence','Covered walkway, cafe and alley move from solitary to populated spaces.'],
    ['offset','Reclining shop pose answers the low seated bench pose.'],
    ['triptych','Three cream studio and mirror figures alternate body scale and reflections.'],
    ['unequal-diptych','Two reclining portraits, with the closer face allowed more air.'],
    ['offset','Cream brick portrait high left; winter instant print low right.'],
    ['contact-sheet','Four warm instant prints stay in a related material sequence.'],
    ['unequal-diptych','Net headpiece and shadowed legs close the chapter with contrasting details.'],
  ],
  green: [
    ['image-silence','Second green night portrait held alone opposite silence.'],
    ['portrait-diptych','Mint clothing and two flower portraits form a botanical group.'],
    ['unequal-diptych','Leafy courtyard and softly backlit seated figure use unequal scale.'],
    ['offset','Two green window portraits move from bright ferry daylight to night.'],
    ['vertical-sequence','Refrigerator reflections, blurred movement, and foliage form layered depth.'],
    ['dark-editorial','Two soft night portraits close on a quiet dark ground.'],
  ],
  blue: [
    ['unequal-diptych','Waterfront figures small; distant skyline vertical large.'],
    ['offset','Blossoms and open water alternate high and low horizons.'],
    ['floating-hero','Blue winter architecture floats across the gutter with full composition intact.'],
    ['contact-sheet','Four blue instant prints keep their original white frames.'],
  ],
  mixed: [
    ['offset','Red bench and tilted signage establish an energetic diagonal opening.'],
    ['triptych','Neon shop, red trousers and blue balloons build three contrasting color weights.'],
    ['unequal-diptych','Two instant shop portraits close with varied scale and untrimmed print edges.'],
  ],
};
for (const section of colorSections) {
  const chapter = section.id as ChapterId;
  add(chapter,'typographic-interlude',[idOf(section.spreads[0].images[0])],'Chapter title and a single color-defining portrait.',true);
  section.spreads.forEach((group,i) => {
    const images = i === 0 ? group.images.slice(1) : group.images;
    const ids = images.map(idOf);
    const [layout,intention] = directions[section.id][i];
    if (group.layout === 'wide-pair') {
      add(chapter,layout,ids.slice(0,1),intention);
      add(chapter,chapter === 'yellow-beige' ? 'offset' : 'unequal-diptych',ids.slice(1),'Continue the preceding environment through two quieter portraits.');
    } else add(chapter,layout,ids,intention);
  });
}
add('colophon','colophon',[],'Original colophon');
export const spreads = edit;
const usedIds = spreads.flatMap(s => s.photographIds);
if (usedIds.length !== photographs.length || new Set(usedIds).size !== photographs.length || usedIds.some(id => !photoById[id])) throw new Error('Photobook must include each photograph exactly once.');
for (const [i,s] of spreads.entries()) {
  if (i > 0 && s.layout === spreads[i-1].layout) throw new Error(`Repeated adjacent layout: ${s.id}`);
  if (s.photographIds.some(id => photoById[id].category !== s.chapter)) throw new Error(`Incorrect chapter: ${s.id}`);
}
