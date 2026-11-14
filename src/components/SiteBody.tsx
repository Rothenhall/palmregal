/*
 * The homepage's sections, given their content as props. The public page (src/app/(site)/page.tsx) renders
 * this at build time from content/site/home.json; the editor's preview (src/app/(preview)/admin/preview)
 * renders the very same thing with live data and an `f` hook that marks each text and photo as editable.
 * No editor code lives here, so the public page ships none of it.
 */
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
import type { Edit, SiteContent } from '@/content/types';
import { telHref } from '@/lib/book';
import { noEdit } from '@/lib/edit';

/* An evening palette throughout, with a continuous finish into the footer. */
export function SiteBody({ content, f }: { content: SiteContent; f?: Edit }) {
  const e = f ?? noEdit;
  const site = content.general, fac = content.facilitiesSection, mom = content.momentsSection, faq = content.faqSection, ct = content.contactSection;
  const facilityCount = fac.groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <Hero content={content} f={f} />
      <NightArrival content={content} f={f} />

      <SuiteJourney content={content} f={f} />

      <section className="sec dsec" data-bg="dusk" id="facilities" aria-labelledby="dl-h">
        <div className="wrap">
          <div className="dsec-head">
            <span className="dsec-count num" aria-hidden="true">{facilityCount}</span>
            <div><p className="eyebrow" {...e(fac, 'eyebrow')}>{fac.eyebrow}</p><h2 id="dl-h" data-split {...e(fac, 'title')}>{fac.title} <em {...e(fac, 'em')}>{fac.em}</em></h2></div>
            <p className="lede" {...e(fac, 'lede')}>{fac.lede}</p>
          </div>
        </div>
        {/* full screen: the cards run edge to edge, outside the page width */}
        <DelightsStack groups={fac.groups} f={f} />
      </section>

      <DaySun copy={content.daySection} f={f} />

      <section className="location-map" data-bg="night" data-dark="1" id="location" aria-labelledby="loc-h">
        <CoastMap immersive headingAs="h2" headingId="loc-h" copy={content.locationSection} f={f} />
      </section>

      <section className="sec lux moments-sec" id="moments" data-bg="dusk" aria-labelledby="mom-h">
        <MomentsWall gallery={mom.photos} />
        <div className="wrap moments-copy">
          <p className="eyebrow" {...e(mom, 'eyebrow')}>{mom.eyebrow}</p>
          <h2 id="mom-h" data-split {...e(mom, 'title')}>{mom.title} <em {...e(mom, 'em')}>{mom.em}</em></h2>
          <p className="lede" {...e(mom, 'lede')}>{mom.lede} <Todo>Guest photos, with permission</Todo></p>
        </div>
      </section>

      <div className="stay-close" data-bg="night">
        <section className="wrap stay-faq" id="faq" aria-labelledby="faq-h">
          <div className="stay-intro">
            <p className="eyebrow" {...e(faq, 'eyebrow')}>{faq.eyebrow}</p>
            <h2 id="faq-h" data-split {...e(faq, 'title')}>{faq.title}<br /><em {...e(faq, 'em')}>{faq.em}</em></h2>
            <p className="lede" {...e(faq, 'lede')}>{faq.lede}</p>
            <a className="tlink" href="#contact" {...e(faq, 'moreLink')}>{faq.moreLink} <Icon id="i-arrow" /></a>
          </div>
          <Faq faqs={faq.faqs} f={f} />
        </section>
        <section className="wrap stay-contact" id="contact" aria-labelledby="contact-h">
          <div className="stay-intro">
            <p className="eyebrow" {...e(ct, 'eyebrow')}>{ct.eyebrow}</p>
            <h2 id="contact-h" data-split {...e(ct, 'title')}>{ct.title}<br /><em {...e(ct, 'em')}>{ct.em}</em></h2>
            <p className="lede" {...e(ct, 'lede')}>{ct.lede}</p>
            <div className="stay-reach">
              <a href={telHref(site.phone)} {...e(site, 'phone')}><Icon id="i-phone" /><span><small {...e(ct, 'callLabel')}>{ct.callLabel}</small>{site.phone}</span></a>
              <a href={`mailto:${site.email}`} {...e(site, 'email')}><Icon id="i-mail" /><span><small {...e(ct, 'writeLabel')}>{ct.writeLabel}</small>{site.email}</span></a>
            </div>
            <p className="stay-times" {...e(site, 'checkIn')}>Check-in {site.checkIn}<span aria-hidden="true"> · </span>Check-out {site.checkOut}</p>
          </div>
          <EnquiryForm content={content} f={f} />
        </section>
      </div>
    </>
  );
}
