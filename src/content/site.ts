/*
 * All of the site's words, numbers and photos live here.
 * Anything marked `todo` is waiting on the resort and shows a small
 * "to confirm" tag while NEXT_PUBLIC_DRAFT is not "false".
 */

export const site = {
  name: 'Palm Regal',
  tagline: 'Resort Homestay · Gopalpur',
  phone: '+91 72059 70222',
  phoneHref: 'tel:+917205970222',
  email: 'palmregalresort@gmail.com',
  /** WhatsApp Business number in international format, digits only. Empty until the resort confirms it. */
  whatsapp: '',
  address: '1 Park Avenue, Adjt. Zone by the Park, Gopalpur on Sea, Odisha 761002',
  addressShort: '1 Park Avenue, Gopalpur on Sea, Odisha 761002',
  mapsQuery: 'Palm Regal Resort Homestay, Gopalpur, Odisha',
  instagram: 'https://www.instagram.com/palmregalresort/',
  checkIn: '12 PM',
  checkOut: '10 AM',
};

export const nav = [
  { href: '/suites/', label: 'Suites' },
  { href: '/facilities/', label: 'Facilities' },
  { href: '/gallery/', label: 'Gallery' },
  { href: '/location/', label: 'Location' },
  { href: '/contact/', label: 'Contact' },
];

export type Suite = {
  slug: string;
  no: string;
  name: string;
  short: string;
  long: string;
  guests: string;
  size: string;
  outdoor: string;
  bestFor: string;
  photos: { src: string; alt: string }[];
  todo?: boolean;
};

export const suites: Suite[] = [
  {
    slug: 'one-bedroom',
    no: '01',
    name: 'One Bedroom Suite',
    short: 'A spacious living area with a convertible sofa bed, a kitchenette and an exclusive balcony.',
    long: 'Your own living room, a bedroom, a kitchenette and a private balcony over the gardens. Room for three, with the convertible sofa bed in the living area.',
    guests: 'Up to 3',
    size: '627 sq ft',
    outdoor: '1 private balcony',
    bestFor: 'Couples and small families',
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
    short: 'A spacious living area with a convertible sofa bed, a kitchenette and two exclusive balconies.',
    long: 'Two bedrooms, a shared living room, a kitchenette and two private balconies. Made for families and friends travelling together, with room for five.',
    guests: 'Up to 5',
    size: '1042 sq ft',
    outdoor: '2 private balconies',
    bestFor: 'Families and friends travelling together',
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
    short: 'Two bedrooms looking out over the sea and the gardens.',
    long: 'Two bedrooms looking out over the sea and the gardens.',
    guests: 'To confirm',
    size: 'To confirm',
    outdoor: 'Sea and garden view',
    bestFor: 'Waking up to the sea',
    photos: [{ src: '/img/view-2.webp', alt: 'Balcony looking over the gardens' }],
    todo: true,
  },
];

export const inEverySuite = ['Kitchenette', 'Private balcony', 'Living room', 'Air conditioning', 'Wi-Fi', 'Parking', 'Pets welcome'];

export type Facility = { name: string; tag?: string; text: string; img?: string; standIn?: boolean };

export const facilities: Facility[] = [
  { name: 'BayWATCH', tag: 'The Theatre', text: 'Watch your favourite shows and films on Amazon Prime, Netflix, Hotstar and more.' },
  { name: 'MUSCLE', tag: 'The Gymnasium', text: 'A fully equipped gym for your morning routine.', img: '/img/gym.webp' },
  { name: 'Acqua', tag: 'The Pool', text: 'The swimming pool, lit up as the evening comes in.', img: '/img/pool.webp' },
  { name: 'SHACK', tag: 'The Restaurant', text: 'Homestyle meals from our kitchen. Pre-order, or have a parcel sent to your suite.' },
  { name: 'GO PLAY', tag: 'The Gaming Lounge', text: 'Foosball, table tennis, pool, carrom, board games and a PS5.', img: '/img/game-room.webp' },
  { name: 'Children Play Area', text: 'A large outdoor garden with swings, slides and room to run.', img: '/img/children-play.webp' },
  { name: 'Amphitheatre', text: 'Enjoy or host a performance on the lawn, by day or under the stars.', img: '/img/amphitheatre.webp' },
  { name: 'EAT AGE', tag: 'The Banquet', text: 'A banquet hall for celebrations and gatherings.', img: '/img/banquet.webp' },
  { name: 'Yoga Lawn', text: 'An open lawn for morning yoga.', img: '/img/exterior-1.webp', standIn: true },
  { name: 'Jogging Track', text: 'A jogging track within the property.', img: '/img/main-banner.webp', standIn: true },
  { name: 'Pet Friendly', text: 'Bring your furry companions. The lawns are theirs too.', img: '/img/pet-friendly.webp' },
  { name: 'Sea View Deck', text: 'A terrace deck looking out over the Bay of Bengal.', img: '/img/sea-view-deck.webp' },
  { name: 'Temple', text: 'A temple within the property, framed by flowering trees.', img: '/img/temple.webp' },
];

export const pillars = [
  { key: 'green', title: 'Green', text: 'Palms, lawns and gardens all around your suite. Mornings start on the yoga lawn.' },
  { key: 'sea', title: 'Sea', text: "Gopalpur's beach is five minutes away on foot, and the Bay of Bengal is in view from the deck." },
  { key: 'home', title: 'Home', text: 'A living room, a kitchenette and a balcony in every suite, and your pets are welcome too.' },
];

export const day = [
  { time: 'Morning', title: 'Wake up to', em: 'green.', text: 'Open the balcony doors to lawns and palms, then a slow start on the yoga lawn.', img: '/img/view-2.webp' },
  { time: 'Afternoon', title: 'A swim,', em: 'then the beach.', text: "The pool first. Gopalpur's main beach is five minutes away on foot.", img: '/img/pool.webp' },
  { time: 'Evening', title: 'Sunset on', em: 'the sea deck.', text: 'Watch the Bay of Bengal from the terrace as the day cools down.', img: '/img/sea-view-deck.webp' },
  { time: 'Night', title: 'Gardens', em: 'after dark.', text: 'Lamp-lit walkways, the amphitheatre and a quiet night by the sea.', img: '/img/main-banner.webp' },
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
  { src: '/img/banquet.webp', alt: 'Banquet hall', cap: 'Banquet hall', group: 'Facilities' },
  { src: '/img/children-play.webp', alt: "Children's play area", cap: 'Play area', group: 'Facilities' },
  { src: '/img/sea-view-deck.webp', alt: 'Sea view deck', cap: 'Sea view deck', group: 'Sea' },
  { src: '/img/beach-evening.webp', alt: 'Gopalpur beach in the evening', cap: 'Gopalpur beach', group: 'Sea' },
  { src: '/img/pet-friendly.webp', alt: 'A dog on the lawn', cap: 'Pets welcome', group: 'Grounds' },
];

export const nearby = [
  { name: 'Gopalpur main beach', dist: '5 min walk' },
  { name: 'Secluded beach, over a wooden bridge', dist: '5 min walk' },
  { name: 'Biju Adventure Park', dist: '5 min drive' },
  { name: 'Berhampur railway station', dist: '25 min drive' },
];

export const attractions = [
  { km: '46', name: 'Chilika Lake', text: "Asia's largest coastal lagoon. Birdwatching and boating." },
  { km: '35', name: 'Tara Tarini Temple', text: 'Hilltop temple with wide views.' },
  { km: '113', name: 'Jirang Monastery', text: 'The "Mini Tibet of Odisha".' },
  { km: '41', name: 'Sonpur Blue Flag Beach', text: 'A certified clean beach.', todo: true },
  { km: '–', name: 'Dhabaleshwar', text: 'Distance to confirm.', todo: true },
  { km: '–', name: 'Tapta Pani Temple', text: 'Distance to confirm.', todo: true },
];

export const cities = [
  { name: 'Berhampur', time: '25 min' },
  { name: 'Bhubaneswar', time: '3 hrs' },
  { name: 'Cuttack', time: '3.5 hrs' },
  { name: 'Visakhapatnam', time: '5 hrs' },
  { name: 'Kolkata', time: '11 hrs' },
];

export const faqs: { q: string; a: string[]; todo?: string }[] = [
  { q: 'What kinds of suites are there?', a: ['One Bedroom Suites for up to 3 guests (627 sq ft) and Two Bedroom Suites for up to 5 guests (1042 sq ft). Both have a spacious living area with a convertible sofa bed, a kitchenette and an exclusive balcony, two in the larger suite.'] },
  { q: 'What are the check-in and check-out times?', a: ['Check-in is at 12:00 PM and check-out at 10:00 AM. Early check-in and late check-out depend on availability: call 7205970222 or email palmregalresort@gmail.com.'] },
  { q: 'Can we cook in our suite?', a: ['Every suite has a kitchenette. Meals are also available at The Shack, our in-house restaurant. Please pre-order to avoid delays.'] },
  { q: 'Is there room service?', a: ["There's no traditional room service, but The Shack can send a parcel to your suite. Use the crockery in your kitchenette to serve."] },
  { q: 'Can we bring our pet?', a: ['Yes. Palm Regal is pet friendly, so bring your furry companions and enjoy the stay together.'] },
  { q: 'Is parking available?', a: ['Yes, spacious basement parking. Electric vehicle charging is available on request.'] },
  { q: 'What is the cancellation policy?', a: ['Individual bookings: free cancellation up to 24 hours before arrival. Later cancellations and no-shows are charged in full.', 'Groups of 5 or more rooms: free up to 7 days before arrival, 50% within 7 days, and 100% on the day of check-in or for no-shows.', 'Date changes are free up to 48 hours before check-in, subject to availability.'] },
  { q: 'Which is the nearest railway station?', a: ['Berhampur railway station, about 25 minutes by car.'] },
  { q: 'Can you arrange a taxi?', a: ["There's no in-house taxi, but reception can arrange one at extra cost, or share local taxi contacts."], todo: 'Driver list to confirm' },
];

export const heroSlides = [
  { src: '/img/exterior-2.webp', alt: 'Palm-lined garden path at Palm Regal', cap: 'Palms, lawns and gardens all around your suite.' },
  { src: '/img/beach-evening.webp', alt: 'Waves on Gopalpur beach under an evening sky', cap: "Sea breeze, five minutes' walk from Gopalpur beach." },
  { src: '/img/main-banner.webp', alt: 'Lit garden walkway at Palm Regal at night', cap: 'Evenings in the garden, lit softly after dark.' },
];

/** The "at a glance" glass card in the hero. Only facts the resort has given us. */
export const glance = [
  { label: 'Gopalpur beach', value: '5 min walk' },
  { label: 'Resort facilities', value: '13' },
  { label: 'Suite sizes', value: '627–1042 sq ft' },
  { label: 'Pets', value: 'Welcome' },
];

/** Our story timeline. Years and words to come from Jahnavi. */
export const story = [
  { when: 'Year to confirm', title: 'The land', text: 'A green plot a short walk from Gopalpur beach.', todo: true },
  { when: 'Year to confirm', title: 'Palm Regal opens', text: 'Serviced suites among palms and lawns welcome their first guests.', todo: true },
  { when: 'Year to confirm', title: 'Resort delights', text: 'The pool, the theatre, the gaming lounge and the sea view deck join the suites.', todo: true },
  { when: 'Today', title: 'A home by the sea', text: 'Three suite types, thirteen facilities and pets welcome.' },
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

/** Quick starts for the Book Direct pill: each fills the message for you. */
export const quickStarts = [
  { label: 'Plan a weekend', note: 'We are planning a weekend away.' },
  { label: 'Bring my pet', note: 'We will be bringing our pet.' },
  { label: 'Family stay', note: 'We are a family, with children.' },
];
