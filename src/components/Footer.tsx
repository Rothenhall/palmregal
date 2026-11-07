import Link from 'next/link';
import { nav, site } from '@/content/site';
import { Icon } from './Icons';
import { LiquidLayer } from './LiquidLayer';

export function Footer() {
  return (
    <footer className="foot foot--home">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-about"><h4>At home by the sea</h4><p>Living rooms, kitchenettes and private balconies. Palms outside, the sea a short walk away. A little more room to make Gopalpur your own.</p></div>
          <div><h4>Explore</h4><ul><li><Link href="/">Home</Link></li>{nav.filter(n => n.href !== '/#contact').map(n => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}<li><a href="/#faq">FAQs</a></li></ul></div>
          <div><h4>Find us</h4><address><span>{site.address}</span><a href="/#contact">Plan your stay <Icon id="i-arrow" /></a><a className="num" href={site.phoneHref}>{site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a></address></div>
          <div><h4>Follow</h4><p>The sea, the gardens and life at the resort.</p>
            <div className="socials">
              <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram @palmregalresort"><Icon id="i-ig" /></a>
            </div>
          </div>
        </div>
        <div className="foot-note"><span>Resort homestay · Gopalpur on Sea</span><a href="#main">Back to the top <span aria-hidden="true">↑</span></a></div>
      </div>
      <div className="water"><LiquidLayer /><Fireflies /><div className="bigword" aria-hidden="true" data-speed=".28" data-ptrigger=".foot"><img src="/img/emblem.png" alt="" />Palm <em>Regal</em></div></div>
      <div className="foot-bottom"><span>© {new Date().getFullYear()} Palm Regal Resort Homestay, Gopalpur</span><span>Website by Rothenhall</span></div>
    </footer>
  );
}

/* Night over the footer water: fireflies and garden lamps */
function Fireflies() {
  const f = Array.from({ length: 16 });
  return (
    <div className="flies" aria-hidden="true">
      {f.map((_, i) => <i key={i} style={{ left: `${(i * 61) % 100}%`, top: `${12 + ((i * 37) % 70)}%`, animationDelay: `${-(i * 1.3) % 9}s`, animationDuration: `${7 + (i % 5) * 1.6}s` }} />)}
      <b className="lamp l1" /><b className="lamp l2" /><b className="lamp l3" />
    </div>
  );
}
