import type { Metadata } from 'next';
import { PageHero } from '@/components/Blocks';
import { EnquiryForm } from '@/components/EnquiryForm';
import { Faq } from '@/components/Faq';
import { Icon } from '@/components/Icons';
import { Todo } from '@/components/Todo';
import { site } from '@/content/site';
import { DRAFT, waHref } from '@/lib/book';

export const metadata: Metadata = { title: 'Contact and booking', description: 'Book direct with Palm Regal, Gopalpur: call +91 72059 70222, email palmregalresort@gmail.com or send an enquiry.' };

export default function Contact() {
  return (
    <>
      <PageHero img="/img/main-banner.webp" alt="Palm Regal garden walkway lit at night" crumb="Contact" eyebrow="We usually reply the same day" title="Book direct with" em="the resort." lede="Call, message or send your dates below. You deal with the people who run Palm Regal, not a booking site." />
      <section className="sec" data-bg="mint" style={{ paddingTop: 'clamp(60px,7vw,100px)' }} aria-label="Ways to reach us">
        <div className="wrap contact-grid">
          <div className="reach">
            <p className="eyebrow">Reach us</p>
            <h2 data-split>Talk to <em>reception.</em></h2>
            <dl className="reach-list">
              <div><dt>Call</dt><dd><a className="num" href={site.phoneHref}>{site.phone}</a></dd></div>
              {(site.whatsapp || DRAFT) && <div><dt>WhatsApp</dt><dd><a href={waHref()}>{site.whatsapp ? 'Message the resort' : 'Business number to come'}</a>{!site.whatsapp && <Todo>TBC</Todo>}</dd></div>}
              <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div><dt>Visit</dt><dd><a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapsQuery)}`} target="_blank" rel="noopener">{site.address}</a><small>Get directions <Icon id="i-arrow" /></small></dd></div>
              <div><dt>Stay</dt><dd><span>Check-in {site.checkIn} · Check-out {site.checkOut}</span></dd></div>
            </dl>
            {DRAFT && <div className="offer"><p className="eyebrow">Book direct offer</p><h3>Your Book Direct perk here.</h3><p style={{ color: 'var(--ink-2)' }}>A discount or a welcome extra for guests who book with us. <Todo>Offer from the resort</Todo></p></div>}
          </div>
          <EnquiryForm />
        </div>
      </section>
      <section className="sec" data-bg="sage" aria-labelledby="faq-h">
        <div className="wrap faq-grid">
          <div className="faq-side"><p className="eyebrow">Good to know</p><h2 id="faq-h" data-split>Before you <em>ask.</em></h2></div>
          <Faq />
        </div>
      </section>
    </>
  );
}
