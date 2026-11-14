import { auth } from '@/auth';
import { redisConfigured } from '@/lib/chat/redis';
import { isDone, needsReply, recentConvs } from '@/lib/chat/store';
import { convLangLabel } from '@/lib/insights/lang';
import { firstGuestMessage, guestLabel, handoffText, when } from '../../../_lib/format';

export const dynamic = 'force-dynamic';

/* Every recent chat as a spreadsheet (CSV, opens in Excel or Google Sheets): one row per conversation. */
const cell = (v: string | number) => {
  const s = String(v ?? '');
  // quote everything; a leading = + - @ is neutralised so a spreadsheet never runs it as a formula
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await auth())?.user) return new Response('Not signed in', { status: 401 });
  if (!redisConfigured()) return new Response('The chat database is not connected.', { status: 503 });
  const convs = await recentConvs(1000);
  const head = ['Guest', 'Started', 'Last message', 'Status', 'Language', 'Messages', 'First question', 'Unanswered questions', 'Needs the team because', 'Conversation'];
  const rows = convs.map(c => [
    guestLabel(c), when(c.createdAt), when(c.updatedAt),
    needsReply(c) ? 'Needs reply' : isDone(c) ? 'Done' : 'Open',
    convLangLabel(c), c.msgs.length, firstGuestMessage(c), (c.unanswered ?? []).join(' / '), handoffText(c.handoff),
    c.msgs.map(m => `${m.r === 'u' ? 'Guest' : 'Assistant'}: ${m.t}`).join('\n'),
  ]);
  const csv = '﻿' + [head, ...rows].map(r => r.map(cell).join(',')).join('\r\n');
  const day = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="palm-regal-chats-${day}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
