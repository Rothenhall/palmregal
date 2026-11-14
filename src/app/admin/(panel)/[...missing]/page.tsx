import { notFound } from 'next/navigation';

/* Any unknown address inside the admin shows the admin's own 404 (with the sidebar), not the website's. */
export default function Missing() {
  notFound();
}
