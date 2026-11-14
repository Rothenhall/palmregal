/*
 * All of the site's words, numbers and photos live here.
 * Anything marked `todo` is waiting on the resort and shows a small
 * "to confirm" tag when NEXT_PUBLIC_DRAFT is "true" (hidden by default).
 */

export const site = {
  name: 'Palm Regal',
  tagline: 'Resort Homestay · Gopalpur',
  phone: '+91 72059 70222',
  phoneHref: 'tel:+917205970222',
  email: 'palmregalresort@gmail.com',
  /** WhatsApp Business number in international format, digits only. Empty until the resort confirms it. */
  whatsapp: '',
  /** The resort's booking system (RPMS, payments by Razorpay). Every "Book direct" and "Check availability" link goes here. Empty until the resort shares the URL; until then they lead to the enquiry form. */
  bookingUrl: '',
  address: '1 Park Avenue, Adjt. Zone by the Park, Gopalpur on Sea, Odisha 761002',
  instagram: 'https://www.instagram.com/palmregalresort/',
  checkIn: '12 PM',
  checkOut: '10 AM',
};

/**
 * The opening screen: backgrounds that change on their own, each with its own large caption.
 * Real footage and real photos only (the resort asked for real over AI-generated). A clip has a
 * 16:9 file for laptops and a portrait crop for phones, with a poster frame for each; a photo is
 * one file. Order runs from day into night. Captions read as one line: title, then em in italics.
 */
export type HeroSlide = {
  kind: 'video' | 'image';
  src: string;
  /** clips: the portrait version for phones */
  mobile?: string;
  /** clips: the first frame, shown until the clip plays (and instead of it with reduced motion) */
  poster?: string;
  posterMobile?: string;
  alt: string;
  title: string;
  em: string;
  /** seconds on screen */
  seconds: number;
};

export const heroSlides: HeroSlide[] = [
  { kind: 'video', src: '/media/hero-day-aerial-desktop.mp4', mobile: '/media/hero-day-aerial-mobile.mp4', poster: '/media/hero-day-aerial-poster.webp', posterMobile: '/media/hero-day-aerial-poster-mobile.webp',
    alt: 'Flying in over Palm Regal by day: three white blocks around the garden and the children\'s play area', title: 'A home by the sea,', em: 'wrapped in green.', seconds: 9 },
  { kind: 'image', src: '/img/exterior-2.webp', alt: 'The palm-lined garden path at Palm Regal', title: 'Palms and lawns,', em: 'all around your suite.', seconds: 7 },
  { kind: 'image', src: '/img/sea-view-deck.webp', alt: 'The sea view deck looking out over the Bay of Bengal', title: 'The Bay of Bengal,', em: 'from the deck.', seconds: 7 },
  { kind: 'image', src: '/img/main-banner.webp', alt: 'The lamp-lit garden walkway at night', title: 'Evenings in the garden,', em: 'softly lit.', seconds: 7 },
  { kind: 'video', src: '/media/hero-night-aerial-desktop.mp4', mobile: '/media/hero-night-aerial-mobile.mp4', poster: '/media/hero-night-aerial-poster.webp', posterMobile: '/media/hero-night-aerial-poster-mobile.webp',
    alt: 'Palm Regal from the air at night, the gardens and paths lit up', title: 'And when night falls,', em: 'the gardens glow.', seconds: 8 },
];

export const nav = [
  { href: '/#suites', label: 'Suites' },
  { href: '/#facilities', label: 'Facilities' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#location', label: 'Location' },
  { href: '/#contact', label: 'Contact' },
];

export type Suite = {
  slug: string;
  no: string;
  name: string;
  long: string;
  guests: string;
  size: string;
  outdoor: string;
  bestFor: string;
  highlights: string[];
  photos: { src: string; alt: string }[];
  todo?: boolean;
};

export const suites: Suite[] = [
  {
    slug: 'one-bedroom',
    no: '01',
    name: 'One Bedroom Suite',
    long: 'Your own living room, a bedroom, a kitchenette and a private balcony over the gardens. Room for three, with the convertible sofa bed in the living area.',
    guests: 'Up to 3',
    size: '627 sq ft',
    outdoor: '1 private balcony',
    bestFor: 'Couples and small families',
    highlights: ['Separate living room', 'Convertible sofa bed', 'Kitchenette'],
    photos: [
      { src: '/img/bedroom-1.webp', alt: 'One Bedroom Suite bedroom' },
      { src: '/img/kitchen.webp', alt: 'Suite kitchenette' },
      { src: '/img/view-1.webp', alt: 'Bedroom with balcony door' },
    ],
  },
  {
    slug: 'two-bedroom',
    no: '02',
    name: 'Two Bedroom Suite',
    long: 'Two bedrooms, a shared living room, a kitchenette and two private balconies. Made for families and friends travelling together, with room for five.',
    guests: 'Up to 5',
    size: '1042 sq ft',
    outdoor: '2 private balconies',
    bestFor: 'Families and friends travelling together',
    highlights: ['Two bedrooms', 'Shared living room', 'Kitchenette'],
    photos: [
      { src: '/img/living-room.webp', alt: 'Two Bedroom Suite living room' },
      { src: '/img/bedroom-2.webp', alt: 'Suite bedroom' },
      { src: '/img/kitchen.webp', alt: 'Suite kitchenette' },
    ],
  },
  {
    slug: 'sea-and-garden',
    no: '03',
    name: 'Two Bedroom Sea and Garden View',
    long: 'A two-bedroom stay with views of the sea and the gardens. Speak with reception to find out more about this category for your dates.',
    guests: '',
    size: '',
    outdoor: 'Sea and garden view',
    bestFor: 'Waking up to the sea',
    highlights: ['Two bedrooms', 'Sea and garden views'],
    photos: [{ src: '/img/view-2.webp', alt: 'Balcony looking over the gardens' }],
    todo: true,
  },
];

export const inEverySuite = ['Kitchenette', 'Private balcony', 'Living room', 'Home comforts', 'Air conditioning', 'Wi-Fi', 'Parking', 'Pets welcome'];

export type Facility = { name: string; tag?: string; text: string; img?: string; standIn?: boolean; group: string };

export const facilities: Facility[] = [
  { group: 'play', name: 'BayWATCH', tag: 'The Theatre', text: 'Watch your favourite shows and films on Prime Video, Netflix, JioHotstar and more.' },
  { group: 'move', name: 'MUSCLE', tag: 'The Gymnasium', text: 'A fully equipped gym for your morning routine.', img: '/img/gym.webp' },
  { group: 'play', name: 'Acqua', tag: 'The Pool', text: 'The swimming pool, lit up as the evening comes in.', img: '/img/pool.webp' },
  { group: 'eat', name: 'SHACK', tag: 'The Restaurant', text: 'Homestyle meals from our kitchen. Pre-order, or have a parcel sent to your suite.' },
  { group: 'play', name: 'GO PLAY', tag: 'The Gaming Lounge', text: 'Foosball, table tennis, a pool table, carrom, board games and a PS5.', img: '/img/game-room.webp' },
  { group: 'play', name: "Children's Play Area", text: 'A large outdoor garden with swings, slides and room to run.', img: '/img/children-play.webp' },
  { group: 'eat', name: 'Amphitheatre', text: 'An open-air amphitheatre set into the lawn.', img: '/img/amphitheatre.webp' },
  { group: 'move', name: 'Yoga Lawn', text: 'An open lawn for morning yoga.', img: '/img/exterior-1.webp', standIn: true },
  { group: 'move', name: 'Jogging Track', text: 'A jogging track within the property.', img: '/img/main-banner.webp', standIn: true },
  { group: 'grounds', name: 'Pet Friendly', text: 'Bring your furry companions. The lawns are theirs too.', img: '/img/pet-friendly.webp' },
  { group: 'grounds', name: 'Sea View Deck', text: 'A terrace deck looking out over the Bay of Bengal.', img: '/img/sea-view-deck.webp' },
  { group: 'grounds', name: 'Temple', text: 'A temple within the property, framed by flowering trees.', img: '/img/temple.webp' },
];

/* A day at Palm Regal: five moments, morning to night. The one source for the homepage day
   section. Exactly five, because the image accordion
   runs one spring per picture. Gopalpur faces east over the Bay of Bengal, so the sun sets behind
   the resort: no "sunset over the sea" anywhere. */
export const day = [
  { time: 'Morning', title: 'Wake up to', em: 'green.', text: 'Open the balcony doors to lawns and palms, then a slow start on the yoga lawn.', img: '/img/view-2.webp', alt: 'A suite balcony over the gardens' },
  { time: 'Late morning', title: 'A walk under', em: 'the palms.', text: "Wander the garden paths, or take the five-minute walk to Gopalpur's main beach.", img: '/img/exterior-2.webp', alt: 'The palm-lined garden path' },
  { time: 'Afternoon', title: 'A swim,', em: 'then a slow hour.', text: 'The pool first, then a game in GO PLAY or a film in BayWATCH, the private theatre.', img: '/img/pool.webp', alt: 'The pool at dusk' },
  { time: 'Evening', title: 'Evenings on', em: 'the sea deck.', text: 'The Bay of Bengal from the terrace, as the breeze comes in off the water.', img: '/img/sea-view-deck.webp', alt: 'The sea view deck over the Bay of Bengal' },
  { time: 'Night', title: 'Gardens', em: 'after dark.', text: 'Lamp-lit walkways, the amphitheatre and a quiet night by the sea.', img: '/img/main-banner.webp', alt: 'The lamp-lit walkway at night' },
];

export const gallery = [
  { src: '/img/exterior-2.webp', alt: 'Palm-lined garden path', cap: 'The garden path', group: 'Grounds' },
  { src: '/img/exterior-1.webp', alt: 'Resort building and lawns', cap: 'The lawns', group: 'Grounds' },
  { src: '/img/main-banner.webp', alt: 'Lit walkway at night', cap: 'After dark', group: 'Grounds' },
  { src: '/img/temple.webp', alt: 'Temple in the grounds', cap: 'The temple', group: 'Grounds' },
  { src: '/img/amphitheatre.webp', alt: 'Lawns and amphitheatre', cap: 'Amphitheatre', group: 'Grounds' },
  { src: '/img/living-room.webp', alt: 'Suite living room', cap: 'Living room', group: 'Suites' },
  { src: '/img/bedroom-1.webp', alt: 'Suite bedroom', cap: 'Bedroom', group: 'Suites' },
  { src: '/img/bedroom-2.webp', alt: 'Suite bedroom', cap: 'Bedroom', group: 'Suites' },
  { src: '/img/kitchen.webp', alt: 'Suite kitchenette', cap: 'Kitchenette', group: 'Suites' },
  { src: '/img/view-1.webp', alt: 'Bedroom with balcony door', cap: 'Balcony bedroom', group: 'Suites' },
  { src: '/img/view-2.webp', alt: 'Balcony over the gardens', cap: 'Balcony view', group: 'Suites' },
  { src: '/img/pool.webp', alt: 'The pool at dusk', cap: 'The pool', group: 'Facilities' },
  { src: '/img/game-room.webp', alt: 'Gaming lounge', cap: 'GO PLAY lounge', group: 'Facilities' },
  { src: '/img/gym.webp', alt: 'Gym', cap: 'The gym', group: 'Facilities' },
  { src: '/img/children-play.webp', alt: "Children's play area", cap: 'Play area', group: 'Facilities' },
  { src: '/img/sea-view-deck.webp', alt: 'Sea view deck', cap: 'Sea view deck', group: 'Sea' },
  { src: '/img/beach-evening.webp', alt: 'Gopalpur beach in the evening', cap: 'Gopalpur beach', group: 'Sea' },
  { src: '/img/pet-friendly.webp', alt: 'A dog on the lawn', cap: 'Pets welcome', group: 'Grounds' },
];

export const faqs: { q: string; a: string[]; todo?: string }[] = [
  { q: 'What kinds of suites are there?', a: ['One Bedroom Suites for up to 3 guests (627 sq ft), Two Bedroom Suites for up to 5 guests (1042 sq ft), and Two Bedroom Sea and Garden View suites. The One Bedroom and Two Bedroom suites have a living area with a convertible sofa bed, a kitchenette and private balconies. Contact reception for details of the Sea and Garden View category.'] },
  { q: 'What are the check-in and check-out times?', a: [`Check-in is at 12 PM and check-out at 10 AM. Early check-in and late check-out depend on availability: call ${site.phone} or email ${site.email}.`] },
  { q: 'Can we cook in our suite?', a: ['Every suite has a kitchenette. Meals are also available at The Shack, our in-house restaurant. Please pre-order to avoid delays.'] },
  { q: 'Is there room service?', a: ["There's no traditional room service, but The Shack can send a parcel to your suite. Use the crockery in your kitchenette to serve."] },
  { q: 'Can we bring our pet?', a: ['Yes. Palm Regal is pet friendly, so bring your furry companions and enjoy the stay together.'] },
  { q: 'How far is Gopalpur beach?', a: ['Gopalpur main beach is about a five-minute walk from the resort.'] },
  { q: 'Is parking available?', a: ['Yes, spacious basement parking. Electric vehicle charging is available on request.'] },
  { q: 'What is the cancellation policy?', a: ['Individual bookings: free cancellation up to 24 hours before arrival. Later cancellations and no-shows are charged in full.', 'Groups of 5 or more rooms: free up to 7 days before arrival, 50% within 7 days, and 100% on the day of check-in or for no-shows.', 'Date changes are free up to 48 hours before check-in, subject to availability.'] },
  { q: 'Which is the nearest railway station?', a: ['Berhampur railway station, about 25 minutes by car.'] },
  { q: 'Can you arrange a taxi?', a: ["There's no in-house taxi, but reception can arrange one at extra cost, or share local taxi contacts."], todo: 'Driver list to confirm' },
];

/** Places on the coast map. x/y are positions on a 1000 x 640 sketch, not to scale. */
export const coast = [
  { id: 'pr', name: 'Palm Regal', x: 470, y: 400, detail: 'Your suite, among palms and lawns.', home: true },
  { id: 'beach', name: 'Gopalpur beach', x: 532, y: 462, detail: '5 min walk' },
  { id: 'bam', name: 'Berhampur', x: 330, y: 330, detail: '14 km · about 25 min · nearest railway station' },
  { id: 'tt', name: 'Tara Tarini Temple', x: 520, y: 150, detail: '35 km · hilltop temple with wide views' },
  { id: 'chilika', name: 'Chilika Lake', x: 820, y: 236, detail: "46 km · Asia's largest coastal lagoon" },
  { id: 'sonpur', name: 'Sonpur Blue Flag Beach', x: 236, y: 596, detail: '41 km · a certified clean beach', todo: true },
  { id: 'jirang', name: 'Jirang Monastery', x: 70, y: 210, detail: '113 km · the "Mini Tibet of Odisha"', far: true },
];

/* Order: what sets Palm Regal apart first (Baymard / h2c: lead with differentiators), standard facilities last */
export const facilityGroups = [
  { id: 'play', title: 'Play and', em: 'unwind.', text: 'A pool, a private theatre, a gaming lounge and a garden for the children.' },
  { id: 'grounds', title: 'The grounds', em: 'and the sea.', text: 'Lawns for your pets, a sea view deck over the Bay of Bengal and a temple among the trees.' },
  { id: 'eat', title: 'Eat and', em: 'gather.', text: 'Homestyle meals from The Shack, and an amphitheatre on the lawn.' },
  { id: 'move', title: 'Move and', em: 'breathe.', text: 'A gym, a yoga lawn and a jogging track inside the property.' },
];

