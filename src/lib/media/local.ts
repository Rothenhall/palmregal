import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MEDIA_ROOT } from './shared';
import { MediaError } from './rules';
import type { MediaEntry, MediaStorage } from './storage';

/* Photos on the local disk (public/img). Used by `npm run dev`; the live site (read-only disk) uses GitHub. */
export class LocalStorage implements MediaStorage {
  readonly kind = 'local' as const;
  constructor(private root: string = process.cwd()) {}

  /** Resolves inside the repo only; paths were already checked by cleanFilePath/cleanDir, this is the second belt. */
  private abs(...parts: string[]) {
    const full = path.resolve(this.root, ...parts);
    const base = path.resolve(this.root);
    if (full !== base && !full.startsWith(base + path.sep)) throw new MediaError(400, 'Bad path.');
    return full;
  }

  async list(dir: string): Promise<MediaEntry[]> {
    try {
      const entries = await fs.readdir(this.abs(MEDIA_ROOT, dir), { withFileTypes: true });
      const out: MediaEntry[] = [];
      for (const e of entries) {
        if (e.isDirectory()) out.push({ type: 'dir', name: e.name });
        else if (e.isFile()) out.push({ type: 'file', name: e.name, size: (await fs.stat(this.abs(MEDIA_ROOT, dir, e.name))).size });
      }
      return out;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
  }

  async read(rel: string): Promise<Uint8Array | null> {
    try {
      return new Uint8Array(await fs.readFile(this.abs(MEDIA_ROOT, rel)));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw e;
    }
  }

  async create(rel: string, data: Uint8Array): Promise<void> {
    const file = this.abs(MEDIA_ROOT, rel);
    await fs.mkdir(path.dirname(file), { recursive: true });
    try {
      await fs.writeFile(file, data, { flag: 'wx' }); // wx: fail if it exists, never overwrite
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'EEXIST') throw new MediaError(409, 'A photo with that name already exists.');
      throw e;
    }
  }

  async remove(rel: string): Promise<void> {
    try {
      await fs.unlink(this.abs(MEDIA_ROOT, rel));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') throw new MediaError(404, 'That photo no longer exists.');
      throw e;
    }
  }

  async readRepoText(repoPath: string): Promise<string | null> {
    try {
      return await fs.readFile(this.abs(repoPath), 'utf8');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw e;
    }
  }
}
