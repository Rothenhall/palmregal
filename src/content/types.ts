/*
 * The shape of content/site/home.json, the file the resort edits through the Edit site editor
 * (its schema is in tina/config.ts: keep the two in step).
 */

export type General = {
  name: string; tagline: string; phone: string; email: string; whatsapp: string;
  bookingUrl: string; address: string; instagram: string; checkIn: string; checkOut: string;
};

export type Photo = { src: string; alt: string };

export type HeroSlide = {
  /** photograph slides */
  image?: string | null;
  /** film slides: the clip for laptops and the portrait clip for phones, plus a still frame for each */
  video?: string | null;
  videoMobile?: string | null;
  poster?: string | null;
  posterMobile?: string | null;
  alt: string; title: string; em: string; seconds: number;
};

export type Suite = {
  name: string; long: string; guests: string; size: string; outdoor: string; bestFor: string;
  highlights: string[]; photos: Photo[]; pending?: boolean;
};

export type Facility = { name: string; tag?: string | null; text: string; img?: string | null; standIn?: boolean | null };
export type FacilityGroup = { title: string; em: string; text: string; items: Facility[] };
export type Moment = { time: string; title: string; em: string; text: string; img: string; alt: string };
export type GalleryPhoto = { src: string; alt: string; cap: string; group: string };
export type Faq = { q: string; answer: string[]; pending?: string | null };

export type SiteContent = {
  seo: { title: string; description: string; image: string };
  general: General;
  buttons: { bookDirect: string; checkAvailability: string; seeSuites: string; explore: string };
  nav: { suites: string; facilities: string; gallery: string; location: string; contact: string };
  hero: { eyebrow: string; place: string; slides: HeroSlide[] };
  arrival: { eyebrow: string; title: string; em: string; lede: string; ledeEm: string; place: string };
  suitesSection: {
    eyebrow: string; title: string; em: string; lede: string; exploreButton: string; suites: Suite[];
    outroEyebrow: string; outroTitle: string; outroEm: string; inEverySuite: { label: string; icon?: string | null }[];
  };
  facilitiesSection: { eyebrow: string; title: string; em: string; lede: string; groups: FacilityGroup[] };
  daySection: { eyebrow: string; moreLink: string; moments: Moment[] };
  locationSection: { eyebrow: string; title: string; em: string; lede: string };
  momentsSection: { eyebrow: string; title: string; em: string; lede: string; photos: GalleryPhoto[] };
  faqSection: { eyebrow: string; title: string; em: string; lede: string; moreLink: string; faqs: Faq[] };
  contactSection: {
    eyebrow: string; title: string; em: string; lede: string; callLabel: string; writeLabel: string;
    formEyebrow: string; formTitle: string; formEm: string;
  };
  footer: { aboutTitle: string; aboutText: string; followText: string; note: string };
};

/**
 * Click-to-edit hook. In the editor's preview it returns Tina's `data-tina-field` attribute for a
 * field of a content object; on the public site it is absent, so the public HTML carries none.
 * Spread the result onto the element: `<h2 {...f(c.title)}>` is wrong, use `{...f(obj, 'title')}`.
 */
export type Edit = (obj: object, field?: string) => { 'data-tina-field'?: string };
