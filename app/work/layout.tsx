import EditorialHeader from '@/components/editorial/EditorialHeader';
import '@/app/site-shell.css';
import './case-study.css';

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <div className="editorial-page tab-page site-shell case-study-shell">
    <EditorialHeader />
    {children}
  </div>;
}
