import { Hero } from '@/components/Hero';
import { NightArrival } from '@/components/NightArrival';
import { DelightsStack } from '@/components/DelightsStack';
import { DaySun } from '@/components/DaySun';
import { Todo } from '@/components/Todo';
import { CoastMap } from '@/components/CoastMap';
import { MomentsWall } from '@/components/MomentsWall';
import { Faq } from '@/components/Faq';
import { EnquiryForm } from '@/components/EnquiryForm';
import { Icon } from '@/components/Icons';
import { SuiteJourney } from '@/components/SuiteJourney';
import { facilities, site } from '@/content/site';

/* An evening palette throughout, with a continuous finish into the footer. */
export default function Home() {
  return (
    <>
      <Hero />
      <NightArrival />

      <SuiteJourney />

      <section className="sec dsec" data-bg="dusk" id="facilities" aria-labelledby="dl-h">
        <div className="wrap">
          <div className="dsec-head">
            <span className="dsec-count num" aria-hidden="true">{facilities.length}</span>
            <div><p className="eyebrow">Resort delights</p><h2 id="dl-h" data-split>Reasons to <em>stay in.</em></h2></div>
            <p className="lede">Everything is inside the property, a few steps from your suite: a pool, a private theatre, a gym, lawns to wander and the Bay of Bengal from the deck.</p>
          </div>
        </div>
        {/* full screen: the cards run edge to edge, outside the page width */}
        <DelightsStack />
      </section>

      <DaySun />

      <section className="location-map" data-bg="night" data-dark="1" id="location" aria-labelledby="loc-h">
        <CoastMap immersive headingAs="h2" headingId="loc-h" />
      </section>

      <section className="sec lux moments-sec" id="moments" data-bg="dusk" aria-labelledby="mom-h">
        <MomentsWall />
        <div className="wrap moments-copy">
          <p className="eyebrow">Moments at Palm Regal</p>
          <h2 id="mom-h" data-split>Every one of these is a stay <em>we were part of.</em></h2>
          <p className="lede">Beach mornings, pool evenings, birthdays on the lawn and dogs on the grass. <Todo>Guest photos, with permission</Todo></p>
        </div>
      </section>

      <div className="stay-close" data-bg="night">
        <section className="wrap stay-faq" id="faq" aria-labelledby="faq-h">
          <div className="stay-intro">
            <p className="eyebrow">Before you arrive</p>
            <h2 id="faq-h" data-split>A few things<br /><em>to know.</em></h2>
            <p className="lede">From cooking in your suite to bringing your pet. The little details, answered.</p>
            <a className="tlink" href="#contact">Something else on your mind? <Icon id="i-arrow" /></a>
          </div>
          <Faq />
        </section>
        <section className="wrap stay-contact" id="contact" aria-labelledby="contact-h">
          <div className="stay-intro">
            <p className="eyebrow">Stay a little longer</p>
            <h2 id="contact-h" data-split>Your plans.<br /><em>Our pleasure.</em></h2>
            <p className="lede">A weekend by the sea, a family holiday, or a stay with your pet. Tell us what you have in mind.</p>
            <div className="stay-reach">
              <a href={site.phoneHref}><Icon id="i-phone" /><span><small>Call reception</small>{site.phone}</span></a>
              <a href={`mailto:${site.email}`}><Icon id="i-mail" /><span><small>Write to us</small>{site.email}</span></a>
            </div>
            <p className="stay-times">Check-in {site.checkIn}<span aria-hidden="true"> · </span>Check-out {site.checkOut}</p>
          </div>
          <EnquiryForm />
        </section>
      </div>
    </>
  );
}
