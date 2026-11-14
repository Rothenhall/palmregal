/* What are guests asking about? A small multilingual keyword dictionary (English, romanized Hindi/Telugu/Odia, and the native scripts).
   Pure functions, no Redis. Latin words match whole words (an optional plural s); native-script words match anywhere. */

export type TopicId = 'suites' | 'prices' | 'booking' | 'pets' | 'pool' | 'food' | 'location' | 'checkin' | 'parking' | 'wifi' | 'events' | 'other';

const T: { id: TopicId; label: string; latin: string; native: string }[] = [
  { id: 'suites', label: 'Suites and rooms', latin: 'suite|room|bedroom|bed|accommodation|kamra|kamre|kamara|gadi|kitchenette|balcony|ac|sofa', native: 'గది|గదులు|कमरा|कमरे|ସୁଇଟ|କୋଠରୀ|ରୁମ' },
  { id: 'prices', label: 'Prices and offers', latin: 'price|prices|rate|rates|cost|tariff|charge|charges|offer|discount|deal|package|kitna|kimat|daam|dam|dara|entha|keta', native: 'ధర|ధరలు|कीमत|दाम|किराया|ମୂଲ୍ୟ|ଦର|ଟଙ୍କା' },
  { id: 'booking', label: 'Availability and booking', latin: 'available|availability|book|booking|reserve|reservation|vacant|vacancy|khali|dates?', native: 'उपलब्ध|బుక్|అందుబాటు|ବୁକ' },
  { id: 'pets', label: 'Pets', latin: 'pet|dog|cat|puppy|animal', native: 'कुत्ता|పెట్|కుక్క|ପୋଷା|କୁକୁର' },
  { id: 'pool', label: 'Pool', latin: 'pool|swim|swimming', native: 'स्विमिंग|ఈత|పూల్|ପୁଲ' },
  { id: 'food', label: 'Food and restaurant', latin: 'food|restaurant|breakfast|lunch|dinner|menu|meal|veg|nonveg|khana|nashta|bhojan|cafe|chef', native: 'खाना|नाश्ता|భోజనం|టిఫిన్|ଖାଦ୍ୟ|ଖାଇବା' },
  { id: 'location', label: 'Beach, location and directions', latin: 'beach|sea|gopalpur|direction|directions|reach|route|airport|station|railway|distance|near|nearby|map|location|address|berhampur|bhubaneswar|taxi|cab', native: 'समुद्र|पहुंच|బీచ్|సముద్రం|ସମୁଦ୍ର|ବେଳାଭୂମି' },
  { id: 'checkin', label: 'Check-in and check-out', latin: 'check-?in|check-?out|check in|check out|arrival|early|late|timing|timings', native: 'चेक|చెక్|ଚେକ' },
  { id: 'parking', label: 'Parking', latin: 'parking|park|car|vehicle|bike', native: 'गाड़ी|పార్కింగ్|ପାର୍କିଂ' },
  { id: 'wifi', label: 'Wi-Fi', latin: 'wifi|wi-fi|internet|network', native: 'वाईफाई|వైఫై|ୱାଇଫାଇ' },
  { id: 'events', label: 'Events and groups', latin: 'event|wedding|party|group|conference|meeting|corporate|function|birthday|family trip', native: 'शादी|పెళ్లి|ବିବାହ' },
];
const RX = T.map(t => ({
  ...t,
  re: new RegExp(`(?:\\b(?:${t.latin})s?\\b)|(?:${t.native})`, 'iu'),
}));

export const TOPIC_LABEL: Record<string, string> = { other: 'Something else', ...Object.fromEntries(T.map(t => [t.id, t.label])) };

/** Every topic a text touches (at least one: "other"). */
export function topicsOf(text: string): TopicId[] {
  const hit = RX.filter(t => t.re.test(text)).map(t => t.id);
  return hit.length ? hit : ['other'];
}

/* ---------- grouping unanswered questions ---------- */

const STOP = new Set('the is are was and for you your with that this have has can could would what when where which how does do not from there their about any our will please tell me us we it its in on of to a an at be by or as if i my there any there hai hain ka ki ke ko se mein me kya aap hum ye yeh woh'.split(' '));

export function normalize(q: string) {
  return q.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
const stem = (w: string) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w.replace(/s$/, ''));
export const keywords = (q: string) => new Set(normalize(q).split(' ').filter(w => w.length > 1 && !STOP.has(w)).map(stem));

/** Same question asked differently: same topic and most of the keywords in common. */
export function similar(a: string, b: string) {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return true;
  const tb = topicsOf(b);
  if (!topicsOf(a).some(t => tb.includes(t))) return false;
  const ka = keywords(a), kb = keywords(b);
  if (!ka.size || !kb.size) return false;
  let n = 0; for (const w of ka) if (kb.has(w)) n++;
  return n / Math.min(ka.size, kb.size) >= 0.6 && n >= 1;
}

/** A short stable id for a group, taken from its earliest phrasing. */
export function gapKey(q: string) {
  let h = 2166136261;
  for (const ch of normalize(q)) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
}
