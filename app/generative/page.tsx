import LelaboStudies from "./LelaboStudies";
import FashionFilm from "./FashionFilm";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = {
  title: "Generative",
  description: "Generative images, films, and visual studies by Ali Lin.",
};

export default function GenerativePage() {
  const available = (file: string) => existsSync(path.join(process.cwd(), "public/generative/fashion-film", file));
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-8 sm:pt-0">
      <FolioBar backHref="/" />
      <header className="pb-8 pt-16">
        <h1 className="font-serif text-[length:min(8.7vw,75px)] tracking-tight">
          GENERATIVE
        </h1>
      </header>
      <FashionFilm assets={{ video: available("film.mp4"), poster: available("poster.jpg"), stills: [1, 2, 3, 4].map((id) => available(`gs${id}.jpg`)) }} />
      <LelaboStudies />
    </main>
  );
}
