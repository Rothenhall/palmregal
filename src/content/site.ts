// Facts come from the resort's brief, FAQ doc and brochure (see docs/README.md).
// `null` marks content the resort still has to send; the UI shows a TBC tag for it.

export const site = {
  name: "Palm Regal",
  fullName: "Palm Regal Resort Homestay",
  place: "Gopalpur on Sea, Odisha",
  tagline: "Beachfront bliss, just for you.",
  description:
    "Serviced suites with their own living room, kitchenette and balcony, set among palms and lawns, five minutes' walk from Gopalpur beach in Odisha.",
  address: "1 Park Avenue, Adjt. Zone by the Park, Gopalpur on Sea, Odisha 761002",
  phone: { display: "+91 72059 70222", tel: "+917205970222" },
  email: "palmregalresort@gmail.com",
  whatsapp: null as string | null, // WhatsApp Business number: question for Jahnavi
  checkIn: "12 PM",
  checkOut: "10 AM",
  social: {
    instagram: "https://www.instagram.com/palmregalresort/",
    facebook: null as string | null,
    youtube: null as string | null,
    googleMaps: null as string | null,
  },
  youtubeTour: null as string | null,
  bookDirectOffer: null as string | null,
};

export const nav = [
  { href: "/suites", label: "Suites" },
  { href: "/facilities", label: "Facilities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/location", label: "Location" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;

/** Link that opens a WhatsApp chat, or the contact page until the number arrives. */
export function whatsappHref(message?: string) {
  if (!site.whatsapp) return "/contact";
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${q}`;
}
