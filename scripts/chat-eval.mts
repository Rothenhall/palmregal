/* Offline check of the chatbot's handoff behaviour: calls Sarvam directly with the real system prompt and the real
   post-processing, no server needed. Dev only; costs about one Sarvam call per row.
   Run:  node --env-file=.env.local --import ./scripts/register-eval.mjs scripts/chat-eval.mts */
import { systemPrompt, scriptNote } from '@/lib/chat/prompt';
import { DEFAULTS } from '@/lib/chat/config';
import { decideHandoff, humanIntent, markerStripper, type HandoffReason } from '@/lib/chat/handoff';
import { scriptOf } from '@/lib/chat/store';

type Row = { say: string; expect: 'none' | 'any' | HandoffReason; prev?: [string, string] };
const ROWS: Row[] = [
  { say: 'who are you?', expect: 'none' },
  { say: 'nuvvu evaru?', expect: 'none' },
  { say: 'hi', expect: 'none' },
  { say: 'namaste', expect: 'none' },
  { say: 'do you allow pets?', expect: 'none' },
  { say: 'kya yahan swimming pool hai?', expect: 'none' },
  { say: "what's the wifi password?", expect: 'unknown' },
  { say: 'can I get a discount for 10 nights?', expect: 'any' },
  { say: 'I want to talk to a person', expect: 'human' },
  { say: 'manager tho matladali', expect: 'human' },
  { say: 'mujhe kisi insaan se baat karni hai', expect: 'human' },
  { say: 'How much is a taxi from Berhampur station?', expect: 'frustrated', prev: ['How much is a taxi from Berhampur station?', 'I am sorry, I could not find that.'] },
];

const only = process.argv[2] === 'before' ? 'before' : 'after';
const system = systemPrompt(DEFAULTS);
let calls = 0;
const out: string[] = [];
for (const r of ROWS) {
  const { script } = scriptOf(r.say);
  const history: { role: string; content: string }[] = [];
  if (r.prev) history.push({ role: 'user', content: r.prev[0] }, { role: 'assistant', content: r.prev[1] });
  history.push({ role: 'user', content: `${r.say}\n\n${scriptNote(script, r.say)}` });
  const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'api-subscription-key': process.env.SARVAM_API_KEY! },
    body: JSON.stringify({ model: 'sarvam-105b-conversations', max_tokens: 350, temperature: 0.3, messages: [{ role: 'system', content: system }, ...history] }),
  });
  calls++;
  const raw: string = (await res.json()).choices?.[0]?.message?.content ?? '';
  const m = markerStripper(); const reply = (m.push(raw) + m.flush()).trim();
  const modelReason = m.reason();
  const oldWay: HandoffReason | null = modelReason ?? humanIntent(r.say); // what the server did before the filter
  const newWay = decideHandoff({ text: r.say, reply, model: modelReason, kbMatched: false, prevUser: r.prev?.[0] });
  const shown = only === 'before' ? oldWay : newWay;
  const ok = r.expect === 'none' ? shown === null : r.expect === 'any' ? shown !== null : shown === r.expect;
  out.push(`${ok ? 'OK  ' : 'FAIL'} | ${r.say.padEnd(40)} | expect ${String(r.expect).padEnd(10)} | model ${String(modelReason).padEnd(10)} | before ${String(oldWay).padEnd(10)} | after ${String(newWay).padEnd(10)} | ${reply.replace(/\s+/g, ' ').slice(0, 90)}`);
}
console.log(out.join('\n'));
console.log(`\nSarvam calls: ${calls}`);
