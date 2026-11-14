// Usage: node scripts/hash-password.mjs "your password"
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your password"');
  process.exit(1);
}
const hash = bcrypt.hashSync(password, 12);
const backslash = String.fromCharCode(92);
console.log('\nFor Vercel (Project Settings > Environment Variables), paste as is:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('\nFor .env.local, every dollar sign must be escaped with a backslash:');
console.log(`ADMIN_PASSWORD_HASH=${hash.split('$').join(backslash + '$')}\n`);
