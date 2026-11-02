import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { BookBar } from '@/components/BookForm';
import { DelightsStack } from '@/components/DelightsStack';
import { DayJourney } from '@/components/DayJourney';
import { Icon } from '@/components/Icons';
import { Todo } from '@/components/Todo';
import { CoastMap } from '@/components/CoastMap';
import { MomentsWall } from '@/components/MomentsWall';
import { ReviewBelt, SuiteTall, ThreeWays } from '@/components/Sections';
import { facilities } from '@/content/site';
import { DRAFT } from '@/lib/book';

/* Bold and immersive: an evening mood throughout, seven sections, one dark language */
export default function Home() {
  return (
    <>
      <Hero />

      <section className="book" id="book" data-bg="dusk" aria-label="Check availability">
        <div className="wrap">
          <BookBar />
          <p className="book-msg">Book direct with the resort: your dates go straight to reception. <Todo>Booking engine or WhatsApp: question for Jahnavi</Todo></p>
        </div>
      </section>

      <section className="sec" data-bg="night" id="suites" aria-labelledby="suites-h">
        <div className="wrap">
          <div className="head-row" style={{ marginBottom: 'var(--head-gap)' }}>
            <div className="head"><p className="eyebrow">Our suites</p><h2 id="suites-h" data-split data-drop>Room to live, <em>not just sleep.</em></h2></div>
            <Link className="tlink" href="/suites/">Compare the suites <Icon id="i-arrow" /></Link>
          </div>
          <SuiteTall />
        </div>
      </section>


      <section className="sec dsec" data-bg="dusk" id="facilities" aria-labelledby="dl-h">
        <div className="wrap">
          <div className="dsec-head">
            <span className="dsec-count num" aria-hidden="true">{facilities.length}</span>
            <div><p className="eyebrow">Resort delights</p><h2 id="dl-h" data-split>Reasons to <em>stay in.</em></h2></div>
            <p className="lede">Everything is inside the property, a few steps from your suite: a pool, a private theatre, a gym, lawns to wander and the Bay of Bengal from the deck.</p>
          </div>
          <DelightsStack />
        </div>
      </section>

      <DayJourney />

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

      {DRAFT && (
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
      )}

      <section className="sec lux" data-bg="night" aria-labelledby="ready-h">
        <div className="wrap">
          <div className="head center"><p className="eyebrow">Your stay</p><h2 id="ready-h" data-split data-drop>Ready when you are. <em>Three ways to start.</em></h2></div>
          <ThreeWays />
        </div>
      </section>
    </>
  );
}
