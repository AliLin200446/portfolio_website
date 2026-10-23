import type { Metadata } from 'next';
import { Oswald } from 'next/font/google';
import TabShell from '@/components/editorial/TabShell';
import GenerativeColumns from '@/components/editorial/GenerativeColumns';
import './columns.css';
const oswald = Oswald({ subsets: ['latin'], weight: '600', variable: '--font-oswald' });
export const metadata: Metadata = { title: 'Generative', description: 'Nine generative films and visual studies by Ali Lin.' };
export default function GenerativePage() { return <TabShell className={`generative-columns ${oswald.variable}`}><GenerativeColumns /></TabShell>; }
