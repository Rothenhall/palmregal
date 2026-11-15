/* Shared by the testimonials page, its form and its save action. */
import type { Testimonial } from '@/content/types';

export const SOURCES = ['Google', 'Booking.com', 'Airbnb', 'MakeMyTrip', 'TripAdvisor', 'Direct / guest book', 'Other'] as const;

export type TestimonialsDraft = { show: boolean; eyebrow: string; heading: string; intro?: string | null; items: Testimonial[] };

/* the tone each card gets on the website, by its place in a block of seven (matches components/Testimonials.tsx) */
export const TONE_OF = (i: number) => (['Light', 'Sea', 'Night', 'Night', 'Night', 'Sea', 'Light'] as const)[i % 7];
