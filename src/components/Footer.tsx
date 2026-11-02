import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { Arrow, Facebook, Instagram, MapPin, YouTube } from "./icons";
import { Tbc } from "./Tbc";

export function Footer() {
  const socials = [
    { href: site.social.instagram, label: "Instagram @palmregalresort", Icon: Instagram },
    { href: site.social.facebook, label: "Facebook", Icon: Facebook },
    { href: site.social.youtube, label: "YouTube", Icon: YouTube },
    { href: site.social.googleMaps, label: "Google Maps", Icon: MapPin },
  ];
  return (
    <>
      <section className="enq" aria-label="Enquire">
        <div className="wrap">
          <h2>
            Enquire now to <em>know more.</em>
          </h2>
          <Link className="btn btn--line" href="/contact">
            Enquire here <Arrow />
          </Link>
        </div>
      </section>
      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <h4>About Palm Regal</h4>
              <p>A resort homestay of serviced suites in Gopalpur on Sea, among palms and lawns, a short walk from the Bay of Bengal.</p>
            </div>
            <div>
              <h4>Contact</h4>
              <address>
                <span>{site.address}</span>
                <a className="num" href={`tel:${site.phone.tel}`}>{site.phone.display}</a>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <Link className="tlink" href="/location" style={{ justifySelf: "start" }}>Show on map</Link>
              </address>
            </div>
            <div>
              <h4>Get social</h4>
              <p>Follow along for the sea, the gardens and life at the resort.</p>
              <div className="socials">
                {socials.map(({ href, label, Icon }) =>
                  href ? (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon /></a>
                  ) : (
                    <span key={label} role="img" aria-label={`${label}, link to come`} title={`${label}: link to come`} style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px dashed rgba(208,138,60,.7)", opacity: 0.7 }}><Icon /></span>
                  ),
                )}
              </div>
            </div>
          </div>
          <p className="notice">
            Please book only through this website, our official phone numbers or {site.email}. <Tbc>Optional notice, wording from the resort</Tbc>
          </p>
        </div>
        <div className="water" data-gl="chrome">
          <div className="bigword" aria-hidden>
            <Image src="/images/emblem.png" alt="" width={140} height={155} />
            Palm <em>Regal</em>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 {site.fullName}, Gopalpur</span>
          <span>Website by Rothenhall</span>
        </div>
      </footer>
    </>
  );
}
