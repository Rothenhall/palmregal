export type Delight = {
  name: string;
  text: string;
  photo: string | null;
  /** The photo stands in until the resort sends the right one. */
  standIn?: string;
};

// Names exactly as the client gave them in the Word brief.
export const delights: Delight[] = [
  { name: "BayWATCH, The Theatre", text: "Watch your favourite shows and films on Amazon Prime, Netflix, Hotstar and more.", photo: null },
  { name: "MUSCLE, The Gymnasium", text: "A fully equipped gym for your morning routine.", photo: "/images/gym.webp" },
  { name: "Swimming Pool", text: "Acqua, the pool, lit up as the evening comes in.", photo: "/images/pool.webp" },
  { name: "SHACK, The Restaurant", text: "Homestyle meals from our kitchen. Pre-order, or have a parcel sent to your suite.", photo: null },
  { name: "GO PLAY, The Gaming Lounge", text: "Foosball, table tennis, pool, carrom, board games and a PS5.", photo: "/images/game-room.webp" },
  { name: "Children Play Area", text: "A large outdoor garden with swings, slides and room to run.", photo: "/images/children-play.webp" },
  { name: "Amphitheatre", text: "Enjoy or host a performance on the lawn, by day or under the stars.", photo: "/images/amphitheatre.webp" },
  { name: "EAT AGE, The Banquet", text: "A banquet hall for celebrations and gatherings.", photo: "/images/banquet.webp" },
  { name: "Yoga Lawn", text: "An open lawn for morning yoga.", photo: "/images/exterior-1.webp", standIn: "Stand-in: yoga lawn photo to come" },
  { name: "Jogging Track", text: "A jogging track within the property.", photo: "/images/main-banner.webp", standIn: "Stand-in: jogging track photo to come" },
  { name: "Pet Friendly Property", text: "Bring your furry companions. The lawns are theirs too.", photo: "/images/pet-friendly.webp" },
  { name: "Sea View Deck", text: "A terrace deck looking out over the Bay of Bengal.", photo: "/images/sea-view-deck.webp" },
  { name: "Temple", text: "A temple within the property, framed by flowering trees.", photo: "/images/temple.webp" },
];

export const comforts = ["Kitchenette", "Balcony", "Living room", "Home comfort", "Air conditioning", "Wi-Fi", "Parking"] as const;
