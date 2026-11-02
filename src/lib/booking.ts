export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function nextDay(iso: string) {
  const d = new Date(iso);
  d.setDate(d.getDate() + 1);
  return isoDate(d);
}

export function bookingMessage(checkIn: string, checkOut: string, guests: string, suite?: string) {
  return `Hello Palm Regal, I would like to stay from ${checkIn} to ${checkOut}, ${guests}${suite ? `, ${suite}` : ""}. Is it available?`;
}

export const guestOptions = ["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6+ guests"];
export const suiteOptions = ["Any suite", "One Bedroom Suite", "Two Bedroom Suite", "Two Bedroom Sea and Garden View"];
