import type { Edit } from '@/content/types';

/** The public site's "edit hook": nothing. Only the editor preview passes a real one. */
export const noEdit: Edit = () => ({});
