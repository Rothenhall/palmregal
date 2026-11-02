import type { Metadata } from 'next';
import { PageHero, Cta } from '@/components/Blocks';
import { SubNav } from '@/components/SubNav';
import { Todo } from '@/components/Todo';
import { facilities, facilityGroups } from '@/content/site';

export const metadata: Metadata = { title: 'Facilities', description: 'Pool, gym, theatre, gaming lounge, restaurant, play area, amphitheatre, sea view deck and more at Palm Regal, Gopalpur.' };

export default function Facilities() {
  return (
    <>
      <PageHero img="/img/pool.webp" alt="The pool at dusk" crumb="Facilities" eyebrow={`${facilities.length} resort delights`} title="Reasons to" em="stay in." lede="A pool, a gym, a theatre, a gaming lounge and lawns to wander. Everything is inside the property, a few steps from your suite." />
      <SubNav label="Facility groups" items={facilityGroups.map(g => ({ id: g.id, label: `${g.title} ${g.em.replace('.', '')}` }))} />
      {facilityGroups.map((g, gi) => {
        const list = facilities.filter(f => f.group === g.id).sort((a, b) => Number(!!b.img) - Number(!!a.img));
        return (
          <section key={g.id} id={g.id} className="sec" data-bg={gi % 2 ? 'sage' : 'mint'} aria-labelledby={`${g.id}-h`} style={gi === 0 ? { paddingTop: 'clamp(90px,10vw,140px)' } : undefined}>
            <div className="wrap">
              <div className="head-row" style={{ marginBottom: 'var(--head-gap)' }}>
                <div className="head"><p className="eyebrow">0{gi + 1} · {list.length} {list.length === 1 ? 'place' : 'places'}</p><h2 id={`${g.id}-h`} data-split>{g.title} <em>{g.em}</em></h2></div>
                <p className="lede">{g.text}</p>
              </div>
              <div className={'fcards n' + list.length}>
                {list.map(f => (
                  <article className="fcard" key={f.name} data-reveal>
                    <div className="img" data-gl={f.img ? 'photo' : undefined} data-depth="-120">
                      {f.img ? <img src={f.img} alt={f.name} loading="lazy" /> : <div className="none" aria-hidden="true" />}
                      {f.standIn && <span className="stand">Stand-in photo</span>}
                    </div>
                    <span className="fcard-shade" />
                    <div className="fcard-copy">
                      <h3>{f.name}{f.tag && <> <i>{f.tag}</i></>}</h3>
                      <p>{f.text}{!f.img && <Todo>Photo to come</Todo>}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}
      <Cta bg="teal" />
    </>
  );
}
