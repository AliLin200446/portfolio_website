import { pinnedExperiments } from '@/content/experiment-board';

export type Experiment = { id: string; no: string; title: string; href: string; image: string; tags: string[] };
// TODO: Fill in author-supplied tags by project ID. No categories are inferred.
const tags: Record<string, string[]> = {};
export const experiments: Experiment[] = pinnedExperiments.map((item, index) => ({
  id: item.id, no: String(index + 1).padStart(2, '0'), title: item.name,
  href: item.href, image: `/experiments/spatial/${item.id}.webp`, tags: tags[item.id] ?? [],
}));
