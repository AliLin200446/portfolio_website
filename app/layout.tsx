import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Spectral } from "next/font/google";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import BrandMark from "@/components/BrandMark";
import "./globals.css";

/* CASE-TEMPLATE: the document serif is Spectral, ROMAN ONLY. The
 * italic axis is not loaded, so no component can reach for it. */
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
});

export const viewport: Viewport = { themeColor: "#F5F2EC" };

export const metadata: Metadata = {
  metadataBase: new URL("https://alilinlab.com"),
  title: {
    default: "Ali Lin",
    template: "%s, Ali Lin",
  },
  description:
    "Building digital experience and AI-driven visual systems.",
  manifest: "/brand/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Ali Lin",
    type: "website",
    title: "Ali Lin",
    description:
      "Building digital experience and AI-driven visual systems.",
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/og.png"],
    title: "Ali Lin",
    description:
      "Building digital experience and AI-driven visual systems.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${spectral.variable}`}
    >
      <body>
        {/* Nav lived only inside HomeShell, so every subpage was a dead
            end. You had to go back to the index to move anywhere. It
            belongs in the layout, where every route gets it. HomeShell
            still draws its own bar over the 3D canvas, so this one hides
            on the index to avoid two navs. */}
        {/* ONE bar for every route. The element itself is full-bleed so
            it reaches both screen edges; only its inner row is capped at
            the content measure, which is what keeps the type aligned
            with the page below it.
            z-[4] on purpose: above page content and the 3D canvas (z-0),
            but below the bench loader (z-5) and the transition veil
            (z-6). A full-screen cut has to cover the bar, not sit
            under it. */}
        <header className="site-bar fixed inset-x-0 top-0 z-[4] border-b border-line bg-paper/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-x-8 px-6 py-3.5">
            <Link
              href="/"
              aria-label="Ali Lin Lab, home"
              className="group flex items-center gap-3 font-mono font-medium text-[length:var(--text-meta)]"
            >
              <BrandMark />
              <span className="text-ink">ALI LIN</span>
            </Link>
            <TopNav />
          </div>
        </header>
        {children}
        {/* Hidden on the index. The home page is a fixed, full-viewport
            scene with its own footer already in it; this one appeared
            under the work grid as a second footer with a rule above it,
            reachable by scrolling past the bottom of the grid. Hidden
            rather than removed, because every other route still wants
            it. See the rule in globals.css. */}
        <footer className="site-footer mx-auto max-w-5xl border-t border-line px-6 py-8">
          <div className="flex items-center justify-between font-mono font-medium text-[length:var(--text-meta)] text-muted">
            <div className="flex items-center gap-3">
              <span>© 2026 Ali Lin</span>
              {/* Year seal: the footer's single static cinnabar element. */}
              <span
                aria-hidden
                className="grid h-6 w-6 select-none place-items-center bg-oxblood font-mono font-medium text-[length:var(--text-meta)] leading-none text-paper"
              >
                2026
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
