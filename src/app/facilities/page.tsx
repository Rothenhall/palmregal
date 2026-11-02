import type { Metadata } from 'next';
import { PageHero, Cta } from '@/components/Blocks';
import { Todo } from '@/components/Todo';
import { facilities } from '@/content/site';

export const metadata: Metadata = { title: 'Facilities', description: 'Pool, gym, theatre, gaming lounge, restaurant, play area, amphitheatre, sea view deck and more at Palm Regal, Gopalpur.' };

export default function Facilities() {
  return (
    <>
      <PageHero crumb="Facilities" eyebrow={`${facilities.length} resort delights`} title="Reasons to" em="stay in." lede="A pool, a gym, a theatre, a gaming lounge and lawns to wander. Everything is inside the property, a few steps from your suite." />
      <section className="sec" data-bg="mint" style={{ paddingTop: 0 }} aria-label="All facilities">
        <div className="wrap fac">
          {facilities.map((f, i) => (
            <article key={f.name} data-reveal>
              <div className="img" data-gl={f.img ? 'photo' : undefined}>
                {f.img ? <img src={f.img} alt={f.name} loading="lazy" /> : <div className="none">{f.name}</div>}
                {f.standIn && <span className="stand">Stand-in photo</span>}
              </div>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{f.name}{f.tag && <>, <i>{f.tag}</i></>}</h3>
              <p>{f.text}{!f.img && <Todo>Photo to come</Todo>}</p>
            </article>
          ))}
        </div>
      </section>
      <Cta bg="teal" />
    </>
  );
}
