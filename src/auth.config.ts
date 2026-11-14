import type { NextAuthConfig } from 'next-auth';

/* Edge-safe Auth.js config (no Node-only imports): shared by middleware and the full config in auth.ts. */
export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 12 },
  pages: { signIn: '/admin/login/' },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email;
      return session;
    },
  },
} satisfies NextAuthConfig;
