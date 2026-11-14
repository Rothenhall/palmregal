import { redirect } from 'next/navigation';

/* Old "Edit site" page: the sidebar now opens the visual editor directly. */
export default function Page() { redirect('/admin/editor/#/~/admin/preview/'); }
