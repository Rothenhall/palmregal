import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import databaseClient from '../../../../../tina/__generated__/databaseClient';

/* The editor's content API (what Tina Cloud would normally be). Only a signed-in admin may call it:
   the same Auth.js session as the dashboard, so the editor has no separate login. */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.query) return NextResponse.json({ error: 'no query' }, { status: 400 });
  const result = await databaseClient.request({ query: body.query, variables: body.variables ?? {}, user: session.user });
  return NextResponse.json(result);
}
