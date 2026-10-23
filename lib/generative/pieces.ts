export type FilmClip = { label: string; src: string; poster: string };
export type Film = { id: string; name: string; type: string; description: string; tools: string; pipeline: string; clips: FilmClip[]; stills?: string[] };
const clips = (folder: string, ids: string[]): FilmClip[] => ids.map(id => ({ label: `Study ${id}`, src: `/generative/${folder}/${id}.mp4`, poster: `/generative/${folder}/${id}.jpg` }));
export const films: Film[] = [
  { id: "fashion-film", name: "Diesel Fashion Film", type: "AI fashion film", description: "An AI-generated fashion film exploring continuous camera movement, material reflection, and cinematic image sequencing.", tools: "Generative video / model not documented", pipeline: "Source artworks → motion sequence → web film. Four source artworks are preserved below; they are not asserted to be film timestamps.", clips: [{ label: "Film", src: "/generative/fashion-film/film.mp4", poster: "/generative/fashion-film/poster.jpg" }], stills: [1, 2, 3, 4].map(n => `/generative/fashion-film/gs${n}.jpg`) },
  { id: "lelabo", name: "Le Labo", type: "Generative film studies", description: "Three films from the Le Labo visual study.", tools: "Not documented", pipeline: "Three existing cuts, preserved as individual films.", clips: clips("lelabo", ["01", "02", "03"]) },
  { id: "thread-studies", name: "Thread Studies", type: "Generative motion", description: "The integrated Thread Studies film.", tools: "Not documented", pipeline: "Individual motion studies → integrated film.", clips: [{ label: "Integrated film", src: "/generative/thread-studies/integrated.mp4", poster: "/generative/thread-studies/integrated.jpg" }, ...clips("thread-studies", ["1", "2", "3", "4", "5", "6"])] },
  { id: "loewe", name: "LOEWE Perfume", type: "Generative film", description: "The integrated LOEWE perfume film.", tools: "Not documented", pipeline: "Existing finished film; production details forthcoming.", clips: [{ label: "Film", src: "/generative/loewe/film.mp4", poster: "/generative/loewe/film.jpg" }] },
  { id: "parallel-personas", name: "Parallel Personas", type: "Visual studies", description: "Three parallel persona studies from the generative archive.", tools: "Not documented", pipeline: "Three individual studies, available in sequence.", clips: clips("parallel-personas", ["1", "2", "3"]) },
  { id: "the-score-cried-first", name: "The Score Cried First", type: "Generative film studies", description: "Three films from The Score Cried First.", tools: "Not documented", pipeline: "Individual studies preserved in their original aspect ratios.", clips: clips("the-score-cried-first", ["1", "2", "3", "4"]) },
  { id: "nike", name: "Nike", type: "Generative film", description: "A generative film from the Nike visual study.", tools: "Not documented", pipeline: "Existing finished film; production details forthcoming.", clips: [{ label: "Film", src: "/generative/nike/film.mp4", poster: "/generative/nike/poster.jpg" }] },
  { id: "uma-wang", name: "Uma Wang", type: "Generative motion studies", description: "Portrait, full-length look, fabric detail, and a collar transforming into a floral pattern.", tools: "Not documented", pipeline: "Opening portrait → full-length look → fabric detail → closing transformation.", clips: clips("uma-wang", ["01", "04", "02", "03"]) },
  { id: "still-scenes", name: "Still Scenes", type: "Night scenes", description: "A softly lit laundromat and a late-night corner shop reflected in wet pavement.", tools: "Not documented", pipeline: "Two generative night scenes, preserved as individual motion studies.", clips: clips("still-scenes", ["01", "02"]) },
];

export const pieces = ['fashion-film', 'thread-studies', 'loewe', 'lelabo', 'parallel-personas', 'the-score-cried-first', 'nike', 'uma-wang', 'still-scenes'].map((id, index) => {
  const film = films.find(item => item.id === id)!;
  return { id, title: film.name, order: index + 1, description: film.description,
    mediaType: film.type, tools: undefined as string | undefined, date: undefined as string | undefined,
    objectPosition: 'center' as string, primary: film.clips[0], supporting: film.clips.slice(1), background: '#111111', foreground: '#E8E8E3',
    renderer: () => import('./video-adapter') };
});
export type GenerativePiece = typeof pieces[number];
