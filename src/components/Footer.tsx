import Link from 'next/link';
import { nav, site } from '@/content/site';
import { Icon } from './Icons';
import { Todo } from './Todo';
import { Fireflies } from "./Sections";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div><h4>Palm Regal</h4><p>A resort homestay of serviced suites in Gopalpur on Sea, among palms and lawns, a short walk from the Bay of Bengal.</p></div>
          <div><h4>Explore</h4><ul><li><Link href="/">Home</Link></li>{nav.map(n => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}</ul></div>
          <div><h4>Contact</h4><address><span>{site.address}</span><a className="num" href={site.phoneHref}>{site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a></address></div>
          <div><h4>Follow</h4><p>The sea, the gardens and life at the resort.</p>
            <div className="socials">
              <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram @palmregalresort"><Icon id="i-ig" /></a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`} target="_blank" rel="noopener" aria-label="Palm Regal on Google Maps"><Icon id="i-map" /></a>
            </div>
          </div>
        </div>
        <p className="notice">Please book only through this website, our official phone number or {site.email}. <Todo>Optional notice, wording from the resort</Todo></p>
      </div>
      <div className="water" data-gl="water"><Fireflies /><div className="bigword" aria-hidden="true" data-speed=".28" data-ptrigger=".foot"><img src="/img/emblem.png" alt="" />Palm <em>Regal</em></div></div>
      <div className="foot-bottom"><span>© {new Date().getFullYear()} Palm Regal Resort Homestay, Gopalpur</span><span>Website by Rothenhall</span></div>
    </footer>
  );
}
