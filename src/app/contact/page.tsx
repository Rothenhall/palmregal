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
      <PageHero crumb="Contact" eyebrow="We usually reply the same day" title="Book direct with" em="the resort." lede="Call, message or send your dates below. You deal with the people who run Palm Regal, not a booking site." />
      <section className="sec" data-bg="mint" style={{ paddingTop: 0 }} aria-label="Ways to reach us">
        <div className="wrap contact-grid">
          <div>
            <div className="ways" data-stagger>
              <a className="way" href={site.phoneHref}><Icon id="i-phone" /><span><b>Call reception</b><span className="num">{site.phone}</span></span></a>
              <a className="way" href={waHref()}><Icon id="i-wa" /><span><b>WhatsApp</b><span>{site.whatsapp ? 'Message the resort' : <>Business number to come <Todo>TBC</Todo></>}</span></span></a>
              <a className="way" href={`mailto:${site.email}`}><Icon id="i-mail" /><span><b>Email</b><span>{site.email}</span></span></a>
              <a className="way" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapsQuery)}`} target="_blank" rel="noopener"><Icon id="i-map" /><span><b>Visit</b><span>{site.address}</span></span></a>
            </div>
            {DRAFT && (            <div className="offer"><p className="eyebrow">Book direct offer</p><h3>Your Book Direct perk here.</h3><p style={{ color: 'var(--ink-2)' }}>A discount or a welcome extra for guests who book with us. <Todo>Offer from the resort</Todo></p></div>)}
          </div>
          <EnquiryForm />
        </div>
      </section>
      <section className="sec" data-bg="sage" aria-labelledby="faq-h">
        <div className="wrap faq-grid">
          <div className="faq-side"><p className="eyebrow">Good to know</p><h2 id="faq-h" data-split data-drop>Before you <em>ask.</em></h2></div>
          <Faq />
        </div>
      </section>
    </>
  );
}
