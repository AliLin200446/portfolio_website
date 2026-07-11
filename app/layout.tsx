import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Ali Lin — Design Engineer",
    template: "%s — Ali Lin",
  },
  description:
    "Design Engineer and Creative Technologist building digital experience and AI-driven visual systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}
    >
      <body>
        {children}
        <footer className="mx-auto max-w-5xl border-t border-line px-6 py-8">
          <div className="flex items-baseline justify-between font-mono text-xs text-muted">
            <span>© 2026 Ali Lin</span>
            <nav className="flex gap-6">
              <Link href="/" className="transition-colors hover:text-oxblood">
                Index
              </Link>
              <Link
                href="/about"
                className="transition-colors hover:text-oxblood"
              >
                About
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
