import Link from 'next/link';
import { sections } from './sections';

export const metadata = { title: 'Overview' };

export default function Overview() {
  return (
    <>
      <header className="adm-head"><h1>Overview</h1><p>Welcome back. Pick a place to start.</p></header>
      <div className="adm-grid">
        {sections.filter(s => s.label !== 'Overview').map(s => (
          <Link key={s.href} href={s.href} className="adm-card adm-tile"><h2>{s.label}</h2><p>{s.blurb}</p></Link>
        ))}
      </div>
    </>
  );
}
