import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Cta } from '@/components/Blocks';
import { SuiteGallery } from '@/components/Gallery';
import { Icon } from '@/components/Icons';
import { Todo } from '@/components/Todo';
import { inEverySuite, site, suites } from '@/content/site';
import { SubNav } from '@/components/SubNav';
import { DRAFT } from '@/lib/book';

export const metadata: Metadata = { title: 'Suites', description: 'One and two bedroom serviced suites in Gopalpur, each with a living room, kitchenette and private balcony.' };

export default function Suites() {
  return (
    <>
      <PageHero img="/img/living-room.webp" alt="A suite living room" crumb="Suites" eyebrow={`${suites.length} suite types`} title="Room to live," em="not just sleep." lede="Every suite has its own living room, a kitchenette and a private balcony over the gardens. Choose the size that fits your trip." />
      <SubNav label="Suites on this page" items={[...suites.map(x => ({ id: x.slug, label: x.name })), { id: 'good-to-know', label: 'Good to know' }]} />
      <section className="sec" data-bg="dusk" style={{ paddingTop: 'clamp(40px,5vw,70px)' }} aria-label="All suites">
        <div className="wrap">
          <div className="compare" data-reveal>
            <div className="cmp-row cmp-head"><span /> {suites.map(x => <a key={x.slug} href={`#${x.slug}`}><small>{x.no}</small>{x.name}</a>)}</div>
            <div className="cmp-row"><span>Guests</span>{suites.map(x => <b key={x.slug}>{x.guests || '—'}</b>)}</div>
            <div className="cmp-row"><span>Size</span>{suites.map(x => <b key={x.slug} className="num">{x.size || '—'}</b>)}</div>
            <div className="cmp-row"><span>Outdoors</span>{suites.map(x => <b key={x.slug}>{x.outdoor}</b>)}</div>
            <div className="cmp-row"><span>Best for</span>{suites.map(x => <b key={x.slug}>{x.bestFor}</b>)}</div>
          </div>
          <div className="every" data-stagger style={{ margin: '28px 0 40px' }}>{inEverySuite.map(x => <span className="chip" key={x}>{x}</span>)}</div>
          <div className="suites-stack" data-stack>
          {suites.map(s => (
            <article className={'suite' + (s.todo ? ' suite--tbc' : '')} id={s.slug} key={s.slug}>
              <SuiteGallery photos={s.photos} todo={s.todo} />
              <div>
                <span className="suite-no">{s.no}</span>
                <h2 data-split data-drop>{s.name}</h2>
                <p>{s.long} {s.todo && <Todo>Description from the resort</Todo>}</p>
                <div className="specs num">
                  {(s.guests || DRAFT) && <div><small>Guests</small><b>{s.guests}{s.todo && <Todo>TBC</Todo>}</b></div>}
                  {(s.size || DRAFT) && <div><small>Size</small><b>{s.size}{s.todo && <Todo>TBC</Todo>}</b></div>}
                  <div><small>Outdoors</small><b>{s.outdoor}</b></div>
                  <div><small>Kitchen</small><b>Kitchenette</b></div>
                </div>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link className="btn btn--teal" href="/#book">Book this suite</Link>
                  <Link className="tlink" href="/contact/">Ask about it <Icon id="i-arrow" /></Link>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </section>
      <section className="sec" data-bg="teal" id="good-to-know" aria-labelledby="pol-h">
        <div className="wrap">
          <div className="head"><p className="eyebrow">Before you book</p><h2 id="pol-h" data-split data-drop>Good to <em>know.</em></h2></div>
          <div className="policy" data-stagger>
            <article><h3>Check-in <em>{site.checkIn}</em></h3><p>Check-out is at {site.checkOut}. Early check-in and late check-out depend on availability: just ask.</p></article>
            <article><h3>Free <em>cancellation</em></h3><p>Individual bookings can cancel free up to 24 hours before arrival. Groups of 5 or more rooms, up to 7 days before.</p></article>
            <article><h3>Pets <em>welcome</em></h3><p>Bring your furry companions. Meals come from The Shack, or cook your own in the kitchenette.</p></article>
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
