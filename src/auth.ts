import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { checkPassword, clientKey } from './lib/adminPassword';

/* One shared password for the resort team (no email). The password and its attempt limit live in lib/adminPassword.ts;
   it is stored as a hash in content/admin.json and can be changed in Admin → Password. */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { password: {} },
      async authorize(creds, req) {
        const password = String(creds?.password ?? '');
        // attempts are counted per network; only a one-way hash of the address is stored
        return (await checkPassword(password, clientKey(req?.headers?.get('x-forwarded-for')))) ? { id: 'admin', name: 'Palm Regal team' } : null;
      },
    }),
  ],
});
