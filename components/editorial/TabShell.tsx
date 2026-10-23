import '@/app/fluid-viewport.css';
import '@/app/site-shell.css';
import { CopyEmail } from "@/interaction/components/CopyEmail";
import Link from "next/link";
import EditorialHeader from "./EditorialHeader";
import { contactLinks } from "@/content/portfolio";

export default function TabShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`editorial-page tab-page site-shell ${className}`}>
    <EditorialHeader />
    <main id="main-content">{children}</main>
    <footer className="tab-footer"><CopyEmail />{contactLinks.map(link => <Link key={link.label} href={link.href}>{link.label} ↗</Link>)}<span>© 2026 Ali Lin Lab LLC</span></footer>
  </div>;
}
