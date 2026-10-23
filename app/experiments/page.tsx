import "./notice-board.css";
import type { Metadata } from "next";
import TabShell from "@/components/editorial/TabShell";
import ExperimentsPanel from "@/components/editorial/ExperimentsPanel";
export const metadata: Metadata = { title: "Experiments" };
export default function ExperimentsPage() { return <TabShell className="experiments-notice"><ExperimentsPanel /></TabShell>; }
