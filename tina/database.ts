import { createDatabase, createLocalDatabase } from '@tinacms/datalayer';
import { GitHubProvider } from 'tinacms-gitprovider-github';
import { RedisLevel } from 'upstash-redis-level';

/* Local mode (TINA_PUBLIC_IS_LOCAL=true): edits write straight to content/*.json, no database, no GitHub.
   Otherwise: content is indexed in Upstash Redis and "Publish" commits the file to GitHub (Vercel then rebuilds). */
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';
const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch,
        owner: process.env.GITHUB_OWNER || 'Rothenhall',
        repo: process.env.GITHUB_REPO || 'palmregal',
        token: process.env.GITHUB_PAT as string,
      }),

      databaseAdapter: new RedisLevel<string, Record<string, any>>({
        redis: { url: (process.env.KV_REST_API_URL || 'http://localhost:8079') as string, token: (process.env.KV_REST_API_TOKEN || 'missing') as string },
        debug: process.env.DEBUG === 'true' || false,
      }) as never,
      namespace: branch,
    });
