import { cache } from 'react';
import { redisConfigured } from '@/lib/chat/redis';
import { flaggedConvs, needsReply, type Conv } from '@/lib/chat/store';
import { getWebsiteStatus, ghConfigFromEnv, type SiteStatus } from '@/lib/insights/website';

/** Conversations waiting for the team (newest first). One read per request, shared by the sidebar badge and Home. */
export const getNeedsReply = cache(async (): Promise<Conv[]> => {
  if (!redisConfigured()) return [];
  try { return (await flaggedConvs(60)).filter(needsReply); } catch { return []; }
});

let siteCache: { at: number; v: SiteStatus } | null = null;
/** GitHub publishing status, cached for 60 seconds (failures too, so a slow network is not retried on every click). */
export async function getSiteStatus(): Promise<SiteStatus> {
  if (siteCache && Date.now() - siteCache.at < 60_000) return siteCache.v;
  const v = await getWebsiteStatus(ghConfigFromEnv());
  siteCache = { at: Date.now(), v };
  return v;
}
export const clearSiteStatus = () => { siteCache = null; };
