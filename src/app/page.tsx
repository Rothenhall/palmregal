import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { BookBar } from '@/components/BookForm';
import { Delights } from '@/components/Delights';
import { DayStory } from '@/components/DayStory';
import { Faq } from '@/components/Faq';
import { Icon, Shade } from '@/components/Icons';
import { Todo } from '@/components/Todo';
import { CoastMap } from '@/components/CoastMap';
import { MomentsWall } from '@/components/MomentsWall';
import { BookingSteps, ReviewBelt, SuiteTall, ThreeWays } from '@/components/Sections';
import { facilities, pillars } from '@/content/site';

/* "A day by the Bay": the page runs from morning at the top to night at the footer */
export default function Home() {
  return (
    <>
      <Hero />

      <section className="book" id="book" data-bg="mint" aria-label="Check availability">
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

      <section className="sec lux" data-bg="sage" aria-labelledby="host-h">
        <div className="wrap">
          <div className="host">
            <div className="host-media">
              <div className="img main" data-gl="photo" data-lens><img src="/img/view-2.webp" alt="Balcony looking over the gardens" loading="lazy" /><span className="stand">Host photo to come</span></div>
              <div className="sig"><b>Welcome home</b><small>Your hosts at Palm Regal</small></div>
            </div>
            <div>
              <p className="eyebrow">Our story</p>
              <h2 id="host-h" data-split data-drop>Started by a family. <em>Run like a home.</em></h2>
              <div className="host-copy" data-reveal>
                <p>Palm Regal is a resort homestay: suites with room to live, cook and slow down, and people who look after every stay themselves, from the first message to the last morning.</p>
                <p>Tell us what you need before you arrive, whether it&apos;s an early check-in, a meal from The Shack or a taxi to Chilika, and we&apos;ll have it ready. <Todo>Host photo and words from Jahnavi</Todo></p>
              </div>
              <Link className="btn btn--teal" href="/contact/">Say hello <Icon id="i-arrow" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" data-bg="sage" id="suites" aria-labelledby="suites-h">
        <div className="wrap">
          <div className="head-row" style={{ marginBottom: 'var(--head-gap)' }}>
            <div className="head"><p className="eyebrow">Our suites</p><h2 id="suites-h" data-split data-drop>Room to live, <em>not just sleep.</em></h2></div>
            <Link className="tlink" href="/suites/">Compare the suites <Icon id="i-arrow" /></Link>
          </div>
          <SuiteTall />
        </div>
      </section>

      <section className="sec" data-bg="mint" aria-labelledby="how-h">
        <div className="wrap">
          <div className="head center"><p className="eyebrow">Book direct</p><h2 id="how-h" data-split data-drop>Three steps. <em>No middleman.</em></h2></div>
          <BookingSteps />
        </div>
      </section>

      <section className="sec" data-bg="mint" id="faq" aria-labelledby="faq-h">
        <div className="wrap faq-grid">
          <div className="faq-side"><p className="eyebrow">Good to know</p><h2 id="faq-h" data-split data-drop>Questions guests <em>often ask.</em></h2><Link className="btn btn--teal" href="/contact/">Ask us anything</Link></div>
          <Faq limit={6} />
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

      <section className="sec lux" data-bg="dusk" id="location" aria-labelledby="loc-h">
        <div className="wrap">
          <div className="head-row" style={{ marginBottom: 'var(--head-gap)' }}>
            <div className="head"><p className="eyebrow">The coast around us</p><h2 id="loc-h" data-split data-drop>Gopalpur, and <em>all around it.</em></h2><p className="lede">The beach is five minutes away on foot. Chilika, Tara Tarini and the Blue Flag beach make an easy day out.</p></div>
            <Link className="tlink" href="/location/">Things to do <Icon id="i-arrow" /></Link>
          </div>
          <CoastMap />
        </div>
      </section>

      <section className="sec lux moments-sec" data-bg="dusk" aria-labelledby="mom-h">
        <MomentsWall />
        <div className="wrap moments-copy">
          <p className="eyebrow">Moments at Palm Regal</p>
          <h2 id="mom-h" data-split data-drop>Every one of these is a stay <em>we were part of.</em></h2>
          <p className="lede">Beach mornings, pool evenings, birthdays on the lawn and dogs on the grass. <Todo>Guest photos, with permission</Todo></p>
        </div>
      </section>

      <section className="sec" data-bg="dusk" id="reviews" aria-labelledby="rev-h">
        <div className="wrap">
          <div className="rev-top">
            <div className="score num">4.x<small>/ 5</small></div>
            <div className="head" style={{ margin: 0 }}><p className="eyebrow">Google reviews</p><h2 id="rev-h" data-split data-drop>What our guests <em>tell Google.</em></h2></div>
            <a className="btn btn--light" href="https://www.google.com/maps/search/?api=1&query=Palm%20Regal%20Resort%20Homestay%20Gopalpur" target="_blank" rel="noopener">Read them on Google</a>
          </div>
          <p className="lede" style={{ marginBottom: 30 }}>Placeholders for now. <Todo>Live from Google at launch</Todo></p>
        </div>
        <ReviewBelt />
      </section>

      <section className="sec lux" data-bg="night" aria-labelledby="ready-h">
        <div className="wrap">
          <div className="head center"><p className="eyebrow">Your stay</p><h2 id="ready-h" data-split data-drop>Ready when you are. <em>Three ways to start.</em></h2></div>
          <ThreeWays />
        </div>
      </section>
    </>
  );
}
