import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

/* Valid hash of a random string, compared against when the email is unknown so response time doesn't reveal it. */
const DUMMY_HASH = '$2b$12$d.mcOkEzgwOnhujlbwoPne0p6Tj9omqN1gd9lUn0gLyzcWLnHb38y';

/* Admin accounts come from env vars (no database). Comma-separate ADMIN_EMAIL / ADMIN_PASSWORD_HASH to add more later. */
function admins() {
  const emails = (process.env.ADMIN_EMAIL ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const hashes = (process.env.ADMIN_PASSWORD_HASH ?? '').split(',').map(s => s.trim());
  return emails.map((email, i) => ({ email, hash: hashes[i] ?? '' }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? '').trim().toLowerCase();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;
        const admin = admins().find(a => a.email === email);
        const ok = await bcrypt.compare(password, admin?.hash || DUMMY_HASH);
        return admin && ok ? { id: admin.email, email: admin.email, name: 'Admin' } : null;
      },
    }),
    // Later: import Google from 'next-auth/providers/google' and add Google({ ... }) here,
    // then restrict sign-in to the admin emails in a signIn callback.
  ],
});
