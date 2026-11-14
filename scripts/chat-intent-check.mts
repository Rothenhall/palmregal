/* Offline (no API calls): phrasing the handoff intent check must and must not catch. */
import { humanIntent } from '@/lib/chat/handoff';
const yes = ['manager tho matladali', 'mujhe kisi insaan se baat karni hai', 'owner ka number do', 'please call me', 'can I speak to a person', 'unga manager kitta pesanum', 'manager er sathe kotha bolte chai', 'manager sangare katha heba', 'call karo', 'manager se baat karwa do', 'मुझे इंसान से बात करनी है', 'you are useless', 'I want to talk to someone'];
const no = ['who are you?', 'nuvvu evaru?', 'hi', 'namaste', 'kya yahan swimming pool hai?', 'do you allow pets?', 'how far is the beach', 'what time is check-in', 'is there a team building area?', 'beach ku kemiti jibi?'];
let bad = 0;
for (const t of yes) if (!humanIntent(t)) { console.log('MISSED ', t); bad++; }
for (const t of no) if (humanIntent(t)) { console.log('FALSE+ ', t); bad++; }
console.log(bad ? `${bad} problems` : 'all intent checks pass');
