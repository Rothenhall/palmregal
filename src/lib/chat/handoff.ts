/* Human handoff: the model ends a reply with [[HANDOFF:reason]]; the server strips it and sends a flag instead.
   A server-side intent check backs this up for explicit requests for a person, in English and common romanized forms. */

export type HandoffReason = 'human' | 'unknown' | 'frustrated';

/* Explicit asks for a person, team, manager or a call. Romanized Hindi, Telugu, Odia, Tamil, Kannada, Bengali, Malayalam included. */
const HUMAN = new RegExp([
  String.raw`\b(talk|speak|chat|connect)\s+(to|with)\s+(a\s+|the\s+|your\s+)?(human|person|someone|team|staff|manager|owner|agent|representative|host)`,
  String.raw`\b(real|live)\s+(person|human|agent)\b`, String.raw`\b(human|manager|owner)\s+(please|pls)\b`, String.raw`\bcall\s+me\b`, String.raw`\b(contact|reach)\s+(the\s+)?(team|owner|manager|staff)`,
  String.raw`\b(insaan|aadmi|admi|manager|malik|owner)\s+se\s+baat`, String.raw`\bbaat\s+kar(ni|na|wa|va|ao|a do)\b`, String.raw`\bkisi\s+se\s+baat`, String.raw`\bphone\s+kar`,
  String.raw`\b(manishi|manshi|vyakti|manager|owner)\s*(tho|to|toa)\s*(matladali|matlaadali|maatladali)`, String.raw`\bmatla?adali\b`, String.raw`\bfone\s+cheyy`, String.raw`\bcall\s+cheyy`,
  String.raw`\b(manisha|manisa|manusha)\s+(sange|sanga|saathe|sathe)\b`, String.raw`\bkatha\s+(heba|hebi|hauchhi)\b`, String.raw`\bphone\s+kar(antu|ibe|iba)\b`,
  String.raw`\b(aal|alu|aalu)\s+(kooda|kuda|koodave)?\s*pesa(num|nam|lam)\b`, String.raw`\bpesanum\b`, String.raw`\bmaathad(abeku|bekku)\b`, String.raw`\b(kotha|kothha)\s+bol`, String.raw`\bsamsarikkanam\b`,
  String.raw`\b(call|phone|ring)\s+(karo|kar\s+do|kijiye|kariye|karna|cheyyi|cheyandi)\b`, String.raw`\b(number|no)\s+(do|dijiye|bhejo|pampandi|ivvandi)\b`, String.raw`\b(owner|manager|malik|staff)\s+ka\s+(number|phone)`,
  String.raw`\bbaat\s+(karwa|krwa|kara)\b`, String.raw`\b(kisi|koi)\s+(insaan|aadmi|admi|vyakti|person)\b`, String.raw`\b(real|asli)\s+(insaan|aadmi)\b`,
  String.raw`\bmaatlaadali\b`, String.raw`\b(manishi|manshi|manisi)\s+(tho|to|toa|tho\s+matla)`, String.raw`\bevarinaa?\s+(tho|to)\s+matla`, String.raw`\bcall\s+(cheyyandi|cheyyi|cheyu)\b`, String.raw`\b(team|staff|owner)\s+(tho|to)\s+matla`,
  String.raw`\b(kitta|kooda|udan)\s+pes`, String.raw`\bpesa\s+(vendum|venum|mudiyuma)\b`, String.raw`\bmanager\s+(kitta|oda)\b`, String.raw`\bphone\s+pann?(u|unga|ungal)\b`, String.raw`\bkaral\s+maadi\b`,
  String.raw`\b(sathe|shathe|er\s+sathe|sange|sangare)\s+(kotha|katha|kathā)\b`, String.raw`\bkotha\s+bolte\s+chai\b`, String.raw`\bmanusa\s+sangare\b`, String.raw`\bfone\s+kar(antu|ana)\b`,
  String.raw`मैनेजर|इंसान|किसी से बात|बात करनी|संपर्क कर`, String.raw`మనిషి|మాట్లాడాలి|మేనేజర్`, String.raw`ମ୍ୟାନେଜର|କଥା ହେବା`, String.raw`பேச வேண்டும்|மேலாளர்`,
].join('|'), 'iu');

const FRUSTRATED = /\b(not\s+(helpful|helping)|useless|you\s+(did\s?n.?t|don.?t)\s+(answer|understand)|stupid\s+bot|worst\s+bot|bekar|bakwas)\b/i;

export function humanIntent(text: string): HandoffReason | null {
  if (HUMAN.test(text)) return 'human';
  if (FRUSTRATED.test(text)) return 'frustrated';
  return null;
}

/* Words that make a model-raised "human" handoff believable. A greeting or "who are you" never contains them. */
const PERSON_CUES = /person|human|manager|owner|team|staff|someone|agent|call|phone|number|talk|speak|contact|reach|discount|negotiat|bargain|offer|custom|group|bulk|baat|matla|manishi|insaan|aadmi|admi|manusha|manisa|pesa|maath|katha|kotha|malik|sangare|sathe|sange|kitta/i;
/* A genuine handoff reply points the guest to the team (the prompt asks for it), in any script. An answer does not. */
const TEAM_WORD = /team|staff|टीम|స్టాఫ్|టీమ్|టీం|ଟିମ|টিম|குழு|அணி|ടീം|ತಂಡ|ટીમ/i;
const SUBSTANTIVE = 280; // a reply longer than this that says "unknown" almost certainly answered the question

/** The same wording for a guest who asks the identical thing twice in a row: they did not get an answer. */
export function repeated(prev: string | undefined, text: string) {
  if (!prev) return false;
  const t = (s: string) => new Set((s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(w => w.length > 2));
  const a = t(prev), b = t(text);
  if (!a.size || !b.size) return false;
  let n = 0; for (const w of a) if (b.has(w)) n++;
  return n / Math.max(a.size, b.size) >= 0.7;
}

/**
 * Decides whether this turn shows the handoff card. The model's marker is a suggestion, filtered here so a greeting,
 * "who are you" or a fully answered question never produces a card; explicit requests, repeats and frustration still do.
 */
export function decideHandoff(o: { text: string; reply: string; model: HandoffReason | null; kbMatched: boolean; prevUser?: string }): HandoffReason | null {
  const intent = humanIntent(o.text);
  if (intent) return intent;
  if (repeated(o.prevUser, o.text)) return 'frustrated';
  const nonLatin = /[^\u0000-ɏ]/.test(o.text);
  if (o.model === 'human') return nonLatin || PERSON_CUES.test(o.text) ? 'human' : null;
  if (o.model === 'frustrated') return null; // real frustration is caught by the phrases and the repeat check above
  if (o.model === 'unknown') {
    if (o.kbMatched) return null; // answered from an uploaded document
    if (o.reply.length > SUBSTANTIVE) return null;
    return TEAM_WORD.test(o.reply) ? 'unknown' : null; // no mention of the team: it answered
  }
  return null;
}

/** Streaming filter: passes text through, removes [[HANDOFF:x]] (even split across chunks) and records x. */
export function markerStripper() {
  let hold = ''; let reason: HandoffReason | null = null;
  const re = /\[\[\s*HANDOFF\s*:?\s*([a-z_]*)\s*\]\]/gi;
  const push = (chunk: string, final = false) => {
    let s = hold + chunk; hold = '';
    s = s.replace(re, (_m, r: string) => { reason = (['human', 'unknown', 'frustrated'].includes(r.toLowerCase()) ? r.toLowerCase() : 'unknown') as HandoffReason; return ''; });
    if (!final) {
      const m = s.match(/\[\[?[A-Za-z:_ ]{0,20}\]?$/); // an unfinished marker at the end: wait for the next chunk
      if (m && m.index !== undefined) { hold = s.slice(m.index); s = s.slice(0, m.index); }
    } else s = s.replace(/\[\[[^\]]*\]?$/, '');
    return s;
  };
  return { push, flush: () => push('', true), reason: () => reason as HandoffReason | null };
}
