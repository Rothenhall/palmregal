// Distances from the FAQ and brochure. `km: null` or `tbc` marks figures the resort still has to confirm.
export const nearby = [
  { name: "Gopalpur main beach", distance: "5 min walk" },
  { name: "Secluded beach, over a wooden bridge", distance: "5 min walk" },
  { name: "Biju Adventure Park", distance: "5 min drive" },
];

export const attractions: { name: string; km: number | null; text: string; tbc?: string }[] = [
  { name: "Chilika Lake", km: 46, text: "Asia's largest coastal lagoon. Birdwatching and boating." },
  { name: "Tara Tarini Temple", km: 35, text: "Hilltop temple with wide views." },
  { name: "Jirang Monastery", km: 113, text: 'The "Mini Tibet of Odisha".' },
  { name: "Sonpur Blue Flag Beach", km: 41, text: "A certified clean beach.", tbc: "Confirm km" },
  { name: "Dhabaleshwar", km: null, text: "", tbc: "Distance TBC" },
  { name: "Tapta Pani Temple", km: null, text: "", tbc: "Distance TBC" },
];

export const heroSlides = [
  { src: "/images/exterior-2.webp", alt: "Palm-lined garden path at Palm Regal", caption: "Palms, lawns and gardens all around your suite." },
  { src: "/images/beach-evening.webp", alt: "Waves on Gopalpur beach under an evening sky", caption: "Sea breeze, five minutes' walk from Gopalpur beach." },
  { src: "/images/main-banner.webp", alt: "Lit garden walkway at Palm Regal at night", caption: "Evenings in the garden, lit softly after dark." },
];

export const day = [
  { time: "Morning", title: "Wake up to", em: "green.", text: "Open the balcony doors to lawns and palms, then a slow start on the yoga lawn.", src: "/images/view-2.webp", alt: "Balcony overlooking the gardens" },
  { time: "Afternoon", title: "A swim,", em: "then the beach.", text: "The pool first. Gopalpur's main beach is five minutes away on foot.", src: "/images/pool.webp", alt: "The pool at dusk" },
  { time: "Evening", title: "Sunset on", em: "the sea deck.", text: "Watch the Bay of Bengal from the terrace as the day cools down.", src: "/images/sea-view-deck.webp", alt: "Terrace sea view deck" },
  { time: "Night", title: "Gardens", em: "after dark.", text: "Lamp-lit walkways, the amphitheatre and a quiet night by the sea.", src: "/images/main-banner.webp", alt: "Lit walkway at night" },
];

export const gallery = [
  { src: "/images/exterior-1.webp", caption: "The gardens" },
  { src: "/images/living-room.webp", caption: "Suite living room" },
  { src: "/images/kitchen.webp", caption: "Your kitchenette" },
  { src: "/images/temple.webp", caption: "The temple" },
  { src: "/images/bedroom-2.webp", caption: "A bedroom" },
  { src: "/images/children-play.webp", caption: "Children's play area" },
  { src: "/images/view-1.webp", caption: "Balcony bedroom" },
  { src: "/images/game-room.webp", caption: "GO PLAY lounge" },
  { src: "/images/amphitheatre.webp", caption: "The amphitheatre" },
  { src: "/images/sea-view-deck.webp", caption: "Sea view deck" },
  { src: "/images/pool.webp", caption: "Acqua, the pool" },
  { src: "/images/pet-friendly.webp", caption: "Pet friendly lawns" },
];
