// Curated from the resort's FAQ doc (docs/source/faq-palm-regal.md). `tbc` marks answers still to confirm.
export type Faq = { q: string; a: string[]; tbc?: string };

export const faqs: Faq[] = [
  {
    q: "What kinds of suites are there?",
    a: [
      "One Bedroom Suites for up to 3 guests (627 sq ft) and Two Bedroom Suites for up to 5 guests (1042 sq ft). Both have a spacious living area with a convertible sofa bed, a kitchenette and an exclusive balcony, two in the larger suite.",
    ],
  },
  {
    q: "What are the check-in and check-out times?",
    a: [
      "Check-in is at 12:00 PM and check-out at 10:00 AM. Early check-in and late check-out depend on availability: call 7205970222 or email palmregalresort@gmail.com.",
    ],
  },
  { q: "Can we cook in our suite?", a: ["Every suite has a kitchenette. Meals are also available at The Shack, our in-house restaurant. Please pre-order to avoid delays."] },
  { q: "Is there room service?", a: ["There's no traditional room service, but The Shack can send a parcel to your suite. Use the crockery in your kitchenette to serve."] },
  { q: "Can we bring our pet?", a: ["Yes. Palm Regal is pet friendly, so bring your furry companions and enjoy the stay together."] },
  { q: "Is parking available?", a: ["Yes, spacious basement parking. Electric vehicle charging is available on request."] },
  {
    q: "What is the cancellation policy?",
    a: [
      "Individual bookings: free cancellation up to 24 hours before arrival. Later cancellations and no-shows are charged in full.",
      "Groups of 5 or more rooms: free up to 7 days before arrival, 50% within 7 days, and 100% on the day of check-in or for no-shows.",
      "Date changes are free up to 48 hours before check-in, subject to availability.",
    ],
  },
  {
    q: "How far is the resort from nearby cities?",
    a: ["Berhampur about 25 minutes, Bhubaneswar about 3 hours, Cuttack about 3.5 hours, Visakhapatnam about 5 hours and Kolkata about 11 hours by car."],
    tbc: "Distances to confirm",
  },
  { q: "Which is the nearest railway station?", a: ["Berhampur railway station, about 25 minutes by car."] },
  {
    q: "Can you arrange a taxi?",
    a: ["There's no in-house taxi, but reception can arrange one at extra cost, or share local taxi contacts."],
    tbc: "Driver list to confirm",
  },
];
