import "./spatial.css";
import type { Metadata } from "next";
import TabShell from "@/components/editorial/TabShell";
import ExperimentsViews from "@/components/editorial/ExperimentsViews";
export const metadata: Metadata = { title: "Experiments" };
export default function ExperimentsPage() { return <TabShell className="experiments-spatial"><ExperimentsViews /></TabShell>; }
