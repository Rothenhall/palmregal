/* Which language is a guest writing in? Used by the admin Inbox and Insights. Server only, computed when read (nothing is stored).
   Non-Latin text is told apart by its script. Latin text (English, or Hindi/Telugu/... typed in English letters) is guessed from
   a few very common, distinctive function words. The lists avoid words that are also ordinary English. */
import type { Conv } from '@/lib/chat/store';

export type Lang = { name: string; romanized: boolean };

const SCRIPTS: [RegExp, string][] = [
  [/[ऀ-ॿ]/, 'Hindi'], [/[ఀ-౿]/, 'Telugu'], [/[஀-௿]/, 'Tamil'], [/[ಀ-೿]/, 'Kannada'],
  [/[ഀ-ൿ]/, 'Malayalam'], [/[ঀ-৿]/, 'Bengali'], [/[଀-୿]/, 'Odia'], [/[઀-૿]/, 'Gujarati'],
  [/[਀-੿]/, 'Punjabi'], [/[؀-ۿ]/, 'Urdu'],
];

const words = (s: string) => new Set(s.split(/\s+/));
const ROMAN: Record<string, Set<string>> = {
  Hindi: words('hai hain kya nahi nahin mujhe mujhko aap aapka aapke apka apke kaise kitna kitne kitni chahiye hoga hogi karna karo kab kahan hum hamare rahega milega batao bataiye bataye dijiye dijie bhi lekin abhi wala sakte sakta sakti kijiye karenge hota hoti mera meri tha thi'),
  Telugu: words('nuvvu meeru miru enti emi ela ekkada undi unnaya unnayi unda undha kavali kavalsi cheyandi cheyyandi cheppandi cheppu entha ledu ledhu ikkada akkada cheyyali randi ravali dayachesi chala bagundi'),
  Tamil: words('enna epdi eppadi irukku irukkum irukka iruku venum vendum evlo evvalavo enga inga anga sollunga sollu panna pannunga romba nalla illa illai kudutha vanga'),
  Odia: words('kemiti achhi achi jibi jaa kete kouthi kouthare rahibi thaibi hela heba mora tumara apananka kana'),
  Bengali: words('kemon achhe koto kothay ami amar apni apnar tumi korbo hobe jabo thakbo bolun dorkar pabo'),
};

const tokens = (t: string) => t.toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/).filter(Boolean);

/** Guess the language of one message. */
export function guessLang(text: string): Lang {
  for (const [re, name] of SCRIPTS) if (re.test(text)) return { name, romanized: false };
  const toks = tokens(text);
  if (!toks.length) return { name: 'English', romanized: false };
  let best = '', bestN = 0, second = 0;
  for (const [name, set] of Object.entries(ROMAN)) {
    const n = toks.reduce((c, w) => c + (set.has(w) ? 1 : 0), 0);
    if (n > bestN) { second = bestN; bestN = n; best = name; } else if (n > second) second = n;
  }
  // two distinctive words, or one in a very short message, or a fifth of the words
  const enough = bestN >= 2 || (bestN === 1 && toks.length <= 4) || bestN / toks.length >= 0.2;
  return best && enough && bestN > second ? { name: best, romanized: true } : { name: 'English', romanized: false };
}

export const langLabel = (l: Lang) => (l.romanized ? `${l.name} (English letters)` : l.name);

/** The language of a whole conversation: the most common non-English language among the guest's messages, else English. */
export function convLang(c: Pick<Conv, 'msgs'>): Lang {
  const tally = new Map<string, { l: Lang; n: number }>();
  for (const m of c.msgs) {
    if (m.r !== 'u') continue;
    const l = guessLang(m.t);
    if (l.name === 'English') continue;
    const key = langLabel(l);
    tally.set(key, { l, n: (tally.get(key)?.n ?? 0) + 1 });
  }
  const top = [...tally.values()].sort((a, b) => b.n - a.n)[0];
  return top ? top.l : { name: 'English', romanized: false };
}
export const convLangLabel = (c: Pick<Conv, 'msgs'>) => langLabel(convLang(c));
