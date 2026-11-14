import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

/* Guards /admin only (see matcher), so the public site pays nothing for it. */
export default auth(req => {
  const path = req.nextUrl.pathname.replace(/\/+$/, '') || '/';
  const isLogin = path === '/admin/login';
  if (isLogin && req.auth) return NextResponse.redirect(new URL('/admin/', req.nextUrl));
  if (!isLogin && !req.auth) return NextResponse.redirect(new URL('/admin/login/', req.nextUrl));
});

export const config = { matcher: ['/admin', '/admin/:path*'] };
