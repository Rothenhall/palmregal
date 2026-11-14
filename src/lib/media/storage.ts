/* What the photo service needs from a place that holds photos. Two implementations:
   GitHub (live site: photos are commits to the branch) and the local disk (npm run dev). */

export interface MediaEntry {
  type: 'file' | 'dir';
  name: string;
  size?: number;
}

export interface MediaStorage {
  readonly kind: 'github' | 'local';
  /** Entries directly inside public/img/<dir> ('' = the root). A folder that does not exist is empty. */
  list(dir: string): Promise<MediaEntry[]>;
  /** The bytes of public/img/<rel>, or null if missing. */
  read(rel: string): Promise<Uint8Array | null>;
  /** Creates public/img/<rel>. Throws MediaError(409) if it already exists; never overwrites. */
  create(rel: string, data: Uint8Array, message: string): Promise<void>;
  /** Removes public/img/<rel>. Throws MediaError(404) if missing. */
  remove(rel: string, message: string): Promise<void>;
  /** A text file elsewhere in the repo (e.g. content/site/home.json), or null. */
  readRepoText(repoPath: string): Promise<string | null>;
}
