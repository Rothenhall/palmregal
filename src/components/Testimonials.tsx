import type { Edit, SiteContent } from '@/content/types';
import { noEdit } from '@/lib/edit';
import { TestimonialNav } from './TestimonialNav';
import './testimonials.css';

/* Guest words, entered by the resort in the editor. Renders nothing while hidden or empty, so no empty heading ever shows. */
export function Testimonials({ content, f = noEdit }: { content: SiteContent; f?: Edit }) {
  const t = content.testimonials;
  if (!t?.show) return null;
  const items = (t.items ?? []).filter(i => i?.quote?.trim() && i?.name?.trim());
  if (!items.length) return null;
  const mode = items.length === 1 ? 'tm--1' : items.length <= 3 ? 'tm--grid' : 'tm--row';
  const rowId = 'tm-row';
  return (
    <section className={`sec tm ${mode}`} id="reviews" data-bg="dusk" aria-labelledby="tm-h">
      <div className="wrap">
        <div className="tm-head">
          {t.eyebrow && <p className="eyebrow" {...f(t, 'eyebrow')}>{t.eyebrow}</p>}
          {t.heading && <h2 id="tm-h" data-split {...f(t, 'heading')}>{t.heading}</h2>}
          {t.intro && <p className="lede" {...f(t, 'intro')}>{t.intro}</p>}
        </div>
        <div className="tm-wrap">
          <ul className="tm-list" id={rowId} {...(mode === 'tm--row' ? { tabIndex: 0, 'aria-label': 'Guest reviews, scroll sideways' } : {})}>
            {items.map((i, k) => {
              const stars = Math.round(Number(i.rating));
              const link = i.link && /^https?:\/\//i.test(i.link) ? i.link : '';
              const meta = [i.from, i.stayed && `Stayed ${i.stayed}`].filter(Boolean);
              return (
                <li key={k} className="tm-card">
                  <blockquote className="tm-quote" {...f(i, 'quote')}>{i.quote}</blockquote>
                  <div className="tm-by">
                    {i.photo && <img className="tm-photo" src={i.photo} alt="" width={48} height={48} loading="lazy" {...f(i, 'photo')} />}
                    <div>
                      <span className="tm-name" {...f(i, 'name')}>{i.name}</span>
                      {(meta.length > 0 || stars >= 1) && (
                        <span className="tm-meta">
                          {stars >= 1 && stars <= 5 && <span className="tm-stars" role="img" aria-label={`Rated ${stars} out of 5`} {...f(i, 'rating')}>{'★'.repeat(stars)}</span>}
                          {meta.length > 0 && <span {...f(i, i.from ? 'from' : 'stayed')}>{meta.join(' · ')}</span>}
                        </span>
                      )}
                      {(i.source || link) && (
                        link
                          ? <a className="tlink tm-src" href={link} target="_blank" rel="noopener noreferrer" {...f(i, 'link')}>Read on {i.source || 'the original site'}</a>
                          : <span className="tm-src" {...f(i, 'source')}>{i.source}</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {mode === 'tm--row' && <TestimonialNav target={rowId} />}
        </div>
      </div>
    </section>
  );
}
