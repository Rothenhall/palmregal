import { site, whatsappHref } from "@/content/site";
import { Mail, Phone, WhatsApp } from "../icons";
import { Tbc } from "../Tbc";
import { EnquiryForm } from "./EnquiryForm";

export function Contact({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className={`sec contact${headingLevel === 1 ? " page-top" : ""}`} id="contact" aria-labelledby="contact-h">
      <div className="wrap contact-grid">
        <div className="dark">
          <p className="eyebrow">Contact and booking</p>
          <H id="contact-h" data-split>Book direct with <em>the resort.</em></H>
          <div className="ways">
            <a className="way" href={whatsappHref()}>
              <WhatsApp />
              <span><b>WhatsApp us</b><span>{site.whatsapp ?? <>Business number to come <Tbc>TBC</Tbc></>}</span></span>
            </a>
            <a className="way" href={`tel:${site.phone.tel}`}>
              <Phone />
              <span><b>Call reception</b><span className="num">{site.phone.display}</span></span>
            </a>
            <a className="way" href={`mailto:${site.email}`}>
              <Mail />
              <span><b>Email</b><span>{site.email}</span></span>
            </a>
          </div>
          <div className="offer">
            <p className="eyebrow">Book direct offer</p>
            {site.bookDirectOffer ? (
              <h3>{site.bookDirectOffer}</h3>
            ) : (
              <>
                <h3>Your Book Direct perk here.</h3>
                <p style={{ opacity: 0.82 }}>A discount or a welcome extra for guests who book with us. <Tbc>Offer from the resort</Tbc></p>
              </>
            )}
          </div>
        </div>
        <EnquiryForm />
      </div>
    </section>
  );
}
