export type Suite = {
  slug: string;
  no: string;
  name: string;
  summary: string;
  guests: string | null;
  size: string | null;
  balconies: string;
  view?: string;
  photos: { src: string; alt: string }[];
  /** Photo is a stand-in until the resort confirms the right one. */
  photoToConfirm?: boolean;
  detailsToCome?: boolean;
};

export const suites: Suite[] = [
  {
    slug: "one-bedroom",
    no: "01",
    name: "One Bedroom Suite",
    summary: "A spacious living area with a convertible sofa bed, a kitchenette and an exclusive balcony.",
    guests: "Up to 3",
    size: "627 sq ft",
    balconies: "1 private",
    photos: [
      { src: "/images/bedroom-1.webp", alt: "One Bedroom Suite bedroom" },
      { src: "/images/kitchen.webp", alt: "Suite kitchenette" },
      { src: "/images/view-1.webp", alt: "Bedroom with balcony door" },
    ],
  },
  {
    slug: "two-bedroom",
    no: "02",
    name: "Two Bedroom Suite",
    summary: "A spacious living area with a convertible sofa bed, a kitchenette and two exclusive balconies.",
    guests: "Up to 5",
    size: "1042 sq ft",
    balconies: "2 private",
    photos: [
      { src: "/images/living-room.webp", alt: "Two Bedroom Suite living room" },
      { src: "/images/bedroom-2.webp", alt: "Suite bedroom" },
      { src: "/images/kitchen.webp", alt: "Suite kitchenette" },
    ],
  },
  {
    slug: "sea-and-garden-view",
    no: "03",
    name: "Two Bedroom Sea and Garden View",
    summary: "Two bedrooms looking out over the sea and the gardens.",
    guests: null,
    size: null,
    balconies: "To confirm",
    view: "Sea and garden",
    photos: [{ src: "/images/view-2.webp", alt: "Balcony looking over the gardens" }],
    photoToConfirm: true,
    detailsToCome: true,
  },
];

export function getSuite(slug: string) {
  return suites.find((s) => s.slug === slug);
}
