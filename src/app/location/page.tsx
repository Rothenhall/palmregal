import type { Metadata } from 'next';
import { PageHero, Cta } from '@/components/Blocks';
import { Icon, Shade } from '@/components/Icons';
import { Todo } from '@/components/Todo';
import { attractions, cities, nearby, site } from '@/content/site';

export const metadata: Metadata = { title: 'Location and things to do', description: "Palm Regal is five minutes' walk from Gopalpur beach, 25 minutes from Berhampur, near Chilika Lake and Tara Tarini Temple." };

export default function Location() {
  const q = encodeURIComponent(site.mapsQuery);
  return (
    <>
      <PageHero crumb="Location" eyebrow="Gopalpur on Sea, Odisha" title="Gopalpur, and" em="all around it." lede={`${site.addressShort}. A quiet beach town on the Bay of Bengal, about 25 minutes from Berhampur.`} />
      <section className="sec" data-bg="mint" style={{ paddingTop: 0 }} aria-label="Map">
        <div className="wrap">
          <div className="embed"><iframe title="Palm Regal on Google Maps" src={`https://www.google.com/maps?q=${q}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <a className="btn btn--teal" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener"><Icon id="i-map" />Get directions</a>
            <a className="btn btn--line" href={site.phoneHref}><Icon id="i-phone" />Call for directions</a>
          </div>
        </div>
      </section>
      <section className="sec" data-bg="sage" aria-labelledby="near-h">
        <div className="wrap loc">
          <div className="head" style={{ margin: 0 }}><p className="eyebrow">On foot and close by</p><h2 id="near-h" data-split data-drop>The beach is <em>five minutes away.</em></h2><p className="lede">Walk to Gopalpur&apos;s main beach, or cross the wooden bridge to the quieter one.</p></div>
          <div className="near" data-stagger>{nearby.map(n => <div key={n.name}><span>{n.name}</span><b>{n.dist}</b></div>)}</div>
        </div>
      </section>
      <section className="sec" data-bg="mint" aria-labelledby="att-h">
        <Shade />
        <div className="wrap">
          <div className="head"><p className="eyebrow">Day trips</p><h2 id="att-h" data-split data-drop>Worth the <em>drive.</em></h2></div>
          <div className="attr" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }} data-stagger>
            {attractions.map(a => <article key={a.name}><span className="km num">{a.km}<small>km</small></span><b>{a.name}</b><span>{a.text}{a.todo && <Todo>Confirm</Todo>}</span></article>)}
          </div>
        </div>
      </section>
      <section className="sec" data-bg="teal" aria-labelledby="get-h">
        <div className="wrap">
          <div className="head"><p className="eyebrow">Getting here</p><h2 id="get-h" data-split data-drop>Travel times <em>by car.</em></h2><p className="lede">The nearest railway station is Berhampur, about 25 minutes away. Reception can arrange a taxi at extra cost. <Todo>Distances to confirm</Todo></p></div>
          <div className="cities" data-stagger>{cities.map(c => <div key={c.name}><b>{c.time}</b><span>{c.name}</span></div>)}</div>
        </div>
      </section>
      <Cta />
    </>
  );
}
