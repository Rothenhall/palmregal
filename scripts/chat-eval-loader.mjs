/* Dev-only Node loader for scripts/chat-eval.mts: resolves the "@/" alias and extensionless .ts imports, and lets
   the site's JSON content load without import attributes. Not part of the app build. */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as pres } from 'node:path';

const root = pres(dirname(fileURLToPath(import.meta.url)), '..');

export async function resolve(spec, ctx, next) {
  let target = null;
  if (spec.startsWith('@/')) target = pres(root, 'src', spec.slice(2));
  else if ((spec.startsWith('./') || spec.startsWith('../')) && ctx.parentURL) target = pres(dirname(fileURLToPath(ctx.parentURL)), spec);
  if (target) {
    for (const ext of ['', '.ts', '.json', '/index.ts']) {
      if (existsSync(target + ext) && !(ext === '' && !/\.\w+$/.test(target))) return { url: pathToFileURL(target + ext).href, shortCircuit: true };
    }
  }
  return next(spec, ctx);
}

export async function load(url, ctx, next) {
  if (url.endsWith('.json')) {
    const { readFileSync } = await import('node:fs');
    return { format: 'module', source: 'export default ' + readFileSync(fileURLToPath(url), 'utf8'), shortCircuit: true };
  }
  if (url.endsWith('.ts')) return next(url, { ...ctx, format: 'module-typescript' });
  return next(url, ctx);
}
