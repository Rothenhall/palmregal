import type { Edit, SiteContent, Testimonial } from '@/content/types';
import { noEdit } from '@/lib/edit';
import { TestimonialsReveal } from './TestimonialsReveal';
import './testimonials.css';

/* Guest words as a bento wall: columns of cards in three tones (light mint with a faint grid, sea, night), large cards
   on the outside and three smaller ones in the middle. The cards blur into place one after another as the wall
   comes into view. Every card is entered by the resort (admin panel or the website editor); the section renders
   nothing while it is switched off or empty, so no empty heading ever shows. */

type Tone = 'light' | 'sea' | 'night';
/* tones by position inside a block of seven, matching the layout: big light cards at the corners, sea beside them */
const TONES: Tone[] = ['light', 'sea', 'night', 'night', 'night', 'sea', 'light'];
/* how many cards go in each column, for a block of n cards */
const COLS: Record<number, number[]> = { 1: [1], 2: [1, 1], 3: [1, 1, 1], 4: [2, 2], 5: [2, 1, 2], 6: [2, 2, 2], 7: [2, 3, 2] };

/* placeholders shown until real reviews are added (see below); each is labelled as a sample; lengths vary like real reviews */
const SAMPLES: Testimonial[] = [
  { quote: 'Sample review. We woke up to the sound of the sea every morning and walked to the beach in minutes. The suite had everything we needed for a week with the children, and the staff remembered how we liked our tea by the second day.', name: 'Sample Guest A', from: 'Kolkata', stayed: 'January 2026', rating: 5, source: 'Google' },
  { quote: 'Sample review. Spacious, spotless and quiet. Perfect for a long weekend.', name: 'Sample Guest B', from: 'Bhubaneswar', rating: 5, source: 'Booking.com' },
  { quote: 'Sample review. The kitchenette made it easy to travel with our parents.', name: 'Sample Guest C', from: 'Hyderabad', rating: 4 },
  { quote: 'Sample review. Friendly team, great directions to Tara Tarini and Chilika.', name: 'Sample Guest D', stayed: 'March 2026', rating: 5, source: 'MakeMyTrip' },
  { quote: 'Sample review. We brought our dog and he was welcomed like family.', name: 'Sample Guest E', from: 'Visakhapatnam', rating: 5 },
  { quote: 'Sample review. A calm base for exploring Gopalpur and the coast.', name: 'Sample Guest F', from: 'Raipur', rating: 4, source: 'Google' },
  { quote: 'Sample review. From the welcome at the gate to the evening walks on the sand, every detail felt cared for. The balcony was our favourite place: coffee at sunrise, the breeze in the afternoon. We are already planning to come back.', name: 'Sample Guest G', from: 'Bengaluru', stayed: 'December 2025', rating: 5, source: 'Direct / guest book' },
];

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

function Card({ t, tone, big, i, f }: { t: Testimonial; tone: Tone; big: boolean; i: number; f: Edit }) {
  const stars = Math.round(Number(t.rating));
  const link = t.link && /^https?:\/\//i.test(t.link) ? t.link : '';
  const meta = [t.from, t.stayed && `Stayed ${t.stayed}`].filter(Boolean).join(' · ');
  return (
    <li className={`tm-card tm-card--${tone}${big ? ' tm-card--big' : ''}`} style={{ ['--i' as string]: i }} data-tilt="">
      {tone === 'light' && <span className="tm-grid" aria-hidden="true" />}
      {tone === 'sea' && <svg className="tm-wave" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q 50 8 100 30 T 200 30 T 300 30 T 400 30 V60 H0Z" /><path d="M0 40 Q 50 22 100 40 T 200 40 T 300 40 T 400 40 V60 H0Z" /></svg>}
      <span className="tm-glow" aria-hidden="true" />
      <span className="tm-mark" aria-hidden="true">“</span>
      {stars >= 1 && stars <= 5 && (
        <span className="tm-stars" role="img" aria-label={`Rated ${stars} out of 5`} {...f(t, 'rating')}>
          {[1, 2, 3, 4, 5].map(k => <i key={k} className={k <= stars ? 'on' : ''} style={{ ['--s' as string]: k }} aria-hidden="true">★</i>)}
        </span>
      )}
      <blockquote className="tm-quote" {...f(t, 'quote')}>{t.quote.trim()}</blockquote>
      <div className="tm-by">
        <div className="tm-who">
          <span className="tm-name" {...f(t, 'name')}>{t.name}</span>
          {meta && <span className="tm-meta" {...f(t, t.from ? 'from' : 'stayed')}>{meta}</span>}
          {(t.source || link) && (link
            ? <a className="tm-src" href={link} target="_blank" rel="noopener noreferrer" {...f(t, 'link')}>Read on {t.source || 'the original site'} ↗</a>
            : <span className="tm-src" {...f(t, 'source')}>Via {t.source}</span>)}
        </div>
        {t.photo
          ? <img className="tm-photo" src={t.photo} alt="" width={64} height={64} loading="lazy" decoding="async" {...f(t, 'photo')} />
          : <span className="tm-photo tm-initials" aria-hidden="true">{initials(t.name)}</span>}
      </div>
    </li>
  );
}

export function Testimonials({ content, f = noEdit }: { content: SiteContent; f?: Edit }) {
  const t = content.testimonials;
  const real = (t?.items ?? []).filter(i => i?.quote?.trim() && i?.name?.trim());
  /* While there are no real reviews yet, clearly marked samples fill the wall (live site included, as the resort
     asked), so the layout can be judged. Each one stays labelled "Sample" so no visitor takes it for a real guest.
     They disappear by themselves as soon as one real review is added in Admin → Testimonials. */
  const sample = !real.length;
  if (!sample && (!t?.show || !real.length)) return null;
  const items = sample ? SAMPLES : real;

  /* blocks of seven; each block is split into its columns */
  const blocks: Testimonial[][][] = [];
  for (let s = 0; s < items.length; s += 7) {
    const block = items.slice(s, s + 7);
    let at = 0;
    blocks.push(COLS[block.length].map(n => { const col = block.slice(at, at + n); at += n; return col; }));
  }

  const rated = items.map(i => Number(i.rating)).filter(r => r >= 1 && r <= 5);
  const avg = rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;
  const sources = [...new Set(items.map(i => i.source).filter((x): x is string => !!x && x !== 'Other'))];
  const towns = [...new Set(items.map(i => i.from?.trim()).filter((x): x is string => !!x))];

  let n = -1;
  return (
    <section className="sec tm" id="reviews" data-bg="dusk" aria-labelledby="tm-h">
      <TestimonialsReveal />
      <div className="wrap">
        <div className="tm-head">
          {t.eyebrow && <p className="eyebrow tm-rise" style={{ ['--i' as string]: 0 }} {...f(t, 'eyebrow')}>{t.eyebrow}</p>}
          {t.heading && <h2 id="tm-h" className="tm-rise" style={{ ['--i' as string]: 1 }} {...f(t, 'heading')}>{t.heading}</h2>}
          {t.intro && <p className="lede tm-rise" style={{ ['--i' as string]: 2 }} {...f(t, 'intro')}>{t.intro}</p>}
          {avg > 0 && (
            <div className="tm-score tm-rise" style={{ ['--i' as string]: 3 }}>
              <b className="tm-score-n">{avg.toFixed(1)}</b>
              <span className="tm-score-txt">
                <span className="tm-score-stars" role="img" aria-label={`Average ${avg.toFixed(1)} out of 5`}><i style={{ ['--fill' as string]: `${(avg / 5) * 100}%` }} aria-hidden="true">★★★★★</i></span>
                <small className="tm-score-long">{sample ? 'Sample average' : 'Average'} from {rated.length} {rated.length === 1 ? 'review' : 'reviews'}{sources.length ? ` · ${sources.join(', ')}` : ''}</small>
                {/* phones: a shorter caption that fits the pill, without the list of sources */}
                <small className="tm-score-short">{sample ? 'Sample average' : 'Average'} · {rated.length} {rated.length === 1 ? 'review' : 'reviews'}</small>
              </span>
            </div>
          )}
        </div>
        {blocks.map((cols, b) => (
          <div className={`tm-bento tm-bento--${cols.length}`} key={b}>
            {cols.map((col, c) => (
              <ul className={`tm-col${c === cols.length - 1 && cols.length > 1 ? ' tm-col--last' : ''}`} key={c} role="list">
                {col.map((item, k) => {
                  n += 1;
                  const pos = cols.slice(0, c).reduce((s, x) => s + x.length, 0) + k;
                  /* in a two-card column the big card is on top, except in the last column where it sits below */
                  const big = items.length === 1 || (col.length === 2 && (c === cols.length - 1 && cols.length > 2 ? k === 1 : k === 0));
                  return <Card key={k} t={item} tone={TONES[pos] ?? 'night'} big={big} i={n} f={f} />;
                })}
              </ul>
            ))}
          </div>
        ))}
        {towns.length >= 3 && (
          <div className="tm-towns" aria-label={`Guests from ${towns.join(', ')}`}>
            <div className="tm-towns-track" aria-hidden="true">
              {[0, 1].map(r => <span key={r}>{towns.map(x => <em key={x}>Guests from <b>{x}</b></em>)}</span>)}
            </div>
          </div>
        )}
        <div className="tm-rule" aria-hidden="true" />
      </div>
    </section>
  );
}
