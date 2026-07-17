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
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <div className="flex items-center gap-3">
              <span>© 2026 Ali Lin</span>
              {/* Year seal: the footer's single static cinnabar element. */}
              <span
                aria-hidden
                className="grid h-6 w-6 select-none grid-cols-2 place-items-center bg-oxblood font-serif text-[9px] leading-none text-paper"
              >
                <span>二</span>
                <span>〇</span>
                <span>二</span>
                <span>六</span>
              </span>
            </div>
            <nav className="flex gap-6">
              <Link href="/" className="transition-colors hover:text-bronze">
                Index
              </Link>
              <Link
                href="/about"
                className="transition-colors hover:text-bronze"
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
