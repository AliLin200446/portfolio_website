import type { Metadata } from "next";
import TabShell from "@/components/editorial/TabShell";
import Photobook from "@/components/editorial/Photobook";
import "./photobook.css";
export const metadata: Metadata = { title: "Photography" };
export default function PhotographyPage() { return <TabShell className="photobook-page"><Photobook /></TabShell>; }
