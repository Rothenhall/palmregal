import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { BookBar } from '@/components/BookForm';
import { Delights } from '@/components/Delights';
import { DayStory } from '@/components/DayStory';
import { Faq } from '@/components/Faq';
import { Icon, Shade } from '@/components/Icons';
import { Todo } from '@/components/Todo';
import { Cta, SketchMap } from '@/components/Blocks';
import { attractions, facilities, nearby, pillars, suites } from '@/content/site';

export default function Home() {
  return (
    <>
      <Hero />

      <section className="book" id="book" data-bg="night" aria-label="Check availability">
        <div className="wrap">
          <BookBar />
          <p className="book-msg">Book direct with the resort: your dates go straight to reception. <Todo>Booking engine or WhatsApp: question for Jahnavi</Todo></p>
        </div>
      </section>

      <section className="sec" data-bg="mint" aria-labelledby="intro-h">
        <Shade />
        <div className="wrap">
          <h2 id="intro-h" className="sr">About Palm Regal</h2>
          <div className="statement-row">
            <p className="statement" data-words>Serviced suites with their own living room, kitchenette and balcony, set among <em>palms and lawns,</em> five minutes&apos; walk from Gopalpur beach. And your pets are welcome too.</p>
            <div className="badges" data-stagger><span className="chip">Pet friendly</span><span className="chip">5 min walk to the beach</span><span className="chip">Doctor on call</span><span className="chip">EV charging on request</span></div>
          </div>
          <figure className="para" data-gl="photo" data-depth="-150" data-lens data-par>
            <img src="/img/exterior-1.webp" alt="Palm Regal building with landscaped lawns and palms" loading="lazy" />
            <figcaption><i />The lawns at Palm Regal, Gopalpur on Sea</figcaption>
          </figure>
        </div>
      </section>

      <section className="sec" data-bg="sage" aria-labelledby="host-h">
        <div className="wrap host">
          <div className="host-media">
            <div className="img main" data-gl="photo" data-lens><img src="/img/view-2.webp" alt="Balcony looking over the gardens" loading="lazy" /><span className="stand">Host photo to come</span></div>
            <div className="sig"><b>Welcome home</b><small>Your hosts at Palm Regal</small></div>
          </div>
          <div>
            <p className="eyebrow">Your hosts</p>
            <h2 id="host-h" data-split data-drop>A stay that feels <em>looked after.</em></h2>
            <div className="host-copy" data-reveal>
              <p>Palm Regal is a resort homestay: suites with room to live, cook and slow down, and a team that knows your name. We look after every stay ourselves, from the first message to the last morning.</p>
              <p>Tell us what you need before you arrive, whether it&apos;s an early check-in, a meal from The Shack or a taxi to Chilika, and we&apos;ll have it ready. <Todo>Host photo and words from Jahnavi</Todo></p>
            </div>
            <Link className="btn btn--teal" href="/contact/">Say hello <Icon id="i-arrow" /></Link>
          </div>
        </div>
      </section>

      <section className="sec" data-bg="mint" aria-labelledby="pil-h">
        <Shade left />
        <div className="wrap">
          <div className="head center"><p className="eyebrow">What Palm Regal is about</p><h2 id="pil-h" data-split data-drop>Green, sea <em>and home.</em></h2></div>
          <div className="pillars" data-stagger>
            {pillars.map((p, i) => (
              <article className="pillar" key={p.key}>
                <span className="n">0{i + 1}</span>
                <Icon id={`p-${p.key}`} />
                <div><h3>{p.title}</h3><p>{p.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" data-bg="sage" id="suites" aria-labelledby="suites-h">
        <div className="wrap">
          <div className="head-row" style={{ marginBottom: 'clamp(44px,6vw,80px)' }}>
            <div className="head"><p className="eyebrow">Our suites</p><h2 id="suites-h" data-split data-drop>Room to live, <em>not just sleep.</em></h2></div>
            <Link className="tlink" href="/suites/">Compare the suites <Icon id="i-arrow" /></Link>
          </div>
          <div className="cards" data-stagger>
            {suites.map(s => (
              <Link className="card" key={s.slug} href={`/suites/#${s.slug}`}>
                <div className="img" data-gl="photo" data-lens><img src={s.photos[0].src} alt={s.photos[0].alt} loading="lazy" />{s.todo && <span className="stand">Photo to confirm</span>}</div>
                <div className="card-top"><h3>{s.name}</h3><span className="no">{s.no}</span></div>
                <div className="card-foot">
                  <div className="facts"><span><Icon id="i-guests" />{s.guests}</span><span><Icon id="i-size" />{s.size}</span></div>
                  <span className="go" aria-hidden="true"><Icon id="i-arrow" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" data-bg="teal" id="facilities" aria-labelledby="dl-h">
        <div className="wrap">
          <div className="dl-head"><div className="head" style={{ margin: 0 }}><p className="eyebrow">Resort delights</p><h2 id="dl-h" data-split data-drop>Reasons to <em>stay in.</em></h2></div><span className="dl-count num" aria-hidden="true">{facilities.length}</span></div>
          <Delights />
        </div>
      </section>

      <section className="sec" data-bg="canopy" id="gallery" aria-labelledby="day-h">
        <div className="wrap">
          <div className="head-row" style={{ marginBottom: 'clamp(30px,4vw,60px)' }}>
            <div className="head"><p className="eyebrow">A day here</p><h2 id="day-h" data-split data-drop>A day at <em>Palm Regal.</em></h2></div>
            <Link className="tlink" href="/gallery/">Full gallery <Icon id="i-arrow" /></Link>
          </div>
          <DayStory />
        </div>
      </section>

      <section className="sec" data-bg="mint" id="location" aria-labelledby="loc-h">
        <Shade />
        <div className="wrap">
          <div className="head-row" style={{ marginBottom: 'clamp(44px,6vw,80px)' }}>
            <div className="head"><p className="eyebrow">Location</p><h2 id="loc-h" data-split data-drop>Gopalpur, and <em>all around it.</em></h2><p className="lede">1 Park Avenue, Gopalpur on Sea. Berhampur railway station is about 25 minutes by car.</p></div>
            <Link className="tlink" href="/location/">Things to do <Icon id="i-arrow" /></Link>
          </div>
          <div className="loc">
            <SketchMap />
            <div>
              <div className="near">{nearby.slice(0, 3).map(n => <div key={n.name}><span>{n.name}</span><b>{n.dist}</b></div>)}</div>
              <div className="attr" data-stagger>
                {attractions.slice(0, 4).map(a => <article key={a.name}><span className="km num">{a.km}<small>km</small></span><b>{a.name}</b><span>{a.text}{a.todo && <Todo>Confirm</Todo>}</span></article>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" data-bg="sage" id="reviews" aria-labelledby="rev-h">
        <div className="wrap">
          <div className="rev-top">
            <div className="score num">4.x<small>/ 5</small></div>
            <div className="head" style={{ margin: 0 }}><p className="eyebrow">Google reviews</p><h2 id="rev-h" data-split data-drop style={{ color: 'var(--teal)' }}>What our guests <em>tell Google.</em></h2></div>
            <a className="btn btn--teal" href="https://www.google.com/maps/search/?api=1&query=Palm%20Regal%20Resort%20Homestay%20Gopalpur" target="_blank" rel="noopener">Read them on Google</a>
          </div>
          <div className="rev-grid" data-stagger>
            {[5, 5, 4].map((n, i) => (
              <article className="review" key={i}>
                <div className="stars" aria-label={`${n} out of 5 stars`}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</div>
                <blockquote>A guest&apos;s review appears here, word for word, from Google.</blockquote>
                <footer><i>G</i><span>Guest name · date <Todo>Live from Google at launch</Todo></span></footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" data-bg="mint" id="faq" aria-labelledby="faq-h">
        <div className="wrap faq-grid">
          <div className="faq-side"><p className="eyebrow">Good to know</p><h2 id="faq-h" data-split data-drop>Questions guests <em>often ask.</em></h2><Link className="btn btn--teal" href="/contact/">Ask us anything</Link></div>
          <Faq limit={6} />
        </div>
      </section>

      <Cta />
    </>
  );
}
