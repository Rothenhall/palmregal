/*
 * The "Edit site" editor (TinaCMS, self-hosted, visual editing).
 *
 * What it edits: content/site/home.json, the one file that holds the homepage's words, numbers, links and
 * photos. Layout, colours and motion are code and are not reachable from here.
 * Where it lives: built into public/admin/editor and served at /admin/editor/ behind the admin sign-in.
 * Its click-to-edit view is /admin/preview/ (src/app/(preview)), which renders the real homepage with live data.
 * Keep the schema below in step with src/content/types.ts.
 */
import { createElement, useEffect } from 'react';
import { defineConfig, AbstractAuthProvider, type TinaField } from 'tinacms';

/* ── sign-in: the editor has no accounts of its own, it reuses the admin sign-in (Auth.js) ── */
class AdminSessionAuth extends AbstractAuthProvider {
  async getUser() {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      const session = res.ok ? await res.json() : null;
      return session?.user ? { email: session.user.email, name: 'Admin' } : false;
    } catch {
      return false;
    }
  }
  async authenticate() {
    window.location.href = '/admin/login/';
    return new Promise(() => {}) as Promise<never>;
  }
  async getToken() {
    return { id_token: '' };
  }
  async logout() {
    window.location.href = '/admin/';
  }
  async authorize() {
    return this.getUser();
  }
}

/* ── field helpers: friendly labels and plain-language descriptions ── */
const text = (name: string, label: string, description?: string): TinaField => ({ type: 'string', name, label, description });
const long = (name: string, label: string, description?: string): TinaField => ({ type: 'string', name, label, description, ui: { component: 'textarea' } });
const photo = (name: string, label: string, description?: string): TinaField => ({ type: 'image', name, label, description });
const group = (name: string, label: string, description: string, fields: TinaField[]): TinaField => ({ type: 'object', name, label, description, fields } as TinaField);
const heading = (prefix = '', hint = 'The first words of the heading') => [
  text(prefix ? `${prefix}Title` : 'title', 'Heading', hint),
  text(prefix ? `${prefix}Em` : 'em', 'Heading, second part (shown in italics)', 'The italic words that finish the heading'),
];
const word = (item: Record<string, unknown>, key: string, fallback: string) => ({ label: String(item?.[key] || fallback) });

export default defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main',
  // No Tina Cloud: content API is our own route (src/app/api/tina), sign-in is ours.
  // No telemetry and no update/announcement checks: the editor never calls home.
  telemetry: 'disabled',
  ui: { optOutOfUpdateCheck: true },
  clientId: null,
  token: null,
  contentApiUrlOverride: '/api/tina/gql',
  authProvider: new AdminSessionAuth(),
  // A way back to the dashboard: an entry in the editor's menu that simply leaves the editor.
  cmsCallback: cms => {
    const BackToDashboard = () => {
      useEffect(() => { window.location.href = '/admin/'; }, []);
      return createElement('p', { style: { padding: 24 } }, 'Going back to the dashboard...');
    };
    // Say plainly why a photo could not be saved or deleted (e.g. "still used on the website").
    cms.alerts.setMap({
      'media:upload:failure': (e: any) => ({ level: 'error', message: `The photo was not uploaded. ${e?.error?.message ?? ''}` }),
      'media:delete:failure': (e: any) => ({ level: 'error', message: e?.error?.message || 'The photo could not be deleted.' }),
    });
    cms.plugins.add({
      __type: 'screen', name: 'Back to dashboard', layout: 'popup', navCategory: 'Site',
      Icon: () => createElement('span', { 'aria-hidden': true }, '←'),
      Component: BackToDashboard,
    } as never);
    return cms;
  },
  build: { outputFolder: 'admin/editor', publicFolder: 'public' },
  // Photos: our own media store (tina/media-store.ts). Uploads are shrunk in the browser, then saved to public/img by
  // /api/tina/media (a GitHub commit on the live site, the local disk under `npm run dev`). Same /img/<file> form either way.
  media: {
    loadCustomStore: async () => (await import('./media-store')).default as never,
    accept: 'image/jpeg,image/png,image/webp,image/avif',
  },
  schema: {
    collections: [
      {
        name: 'home',
        label: 'Homepage',
        path: 'content/site',
        format: 'json',
        match: { include: 'home' },
        ui: {
          allowedActions: { create: false, delete: false },
          // the click-to-edit view: the real homepage, fed live data (src/app/(preview)/admin/preview)
          router: () => '/admin/preview/',
        },
        fields: [
          group('seo', 'Page title and search', 'How the site appears in Google results and when shared on WhatsApp or social media.', [
            text('title', 'Page title', 'Shown in the browser tab and as the headline in Google results.'),
            long('description', 'Short description', 'One or two sentences shown under the title in Google results.'),
            photo('image', 'Sharing picture', 'The picture shown when the site is shared on social media.'),
          ]),
          group('general', 'Resort details', 'Name, phone, email, address and booking link. Used across the page.', [
            text('name', 'Resort name'),
            text('tagline', 'Tagline under the logo'),
            text('phone', 'Phone number', 'As guests should read it, e.g. +91 72059 70222. The call button uses it too.'),
            text('email', 'Email address'),
            text('whatsapp', 'WhatsApp number', 'Digits only with the country code, e.g. 917205970222. Leave empty until the resort has a WhatsApp Business number.'),
            text('bookingUrl', 'Booking page link', 'Where "Book direct" and "Check availability" send guests. Leave empty to send them to the enquiry form instead.'),
            long('address', 'Address'),
            text('instagram', 'Instagram link'),
            text('checkIn', 'Check-in time', 'e.g. 12 PM'),
            text('checkOut', 'Check-out time', 'e.g. 10 AM'),
          ]),
          group('buttons', 'Button wording', 'The words on the main buttons that appear in several places.', [
            text('bookDirect', 'Header booking button'),
            text('checkAvailability', 'Availability button'),
            text('seeSuites', '"See the suites" button'),
            text('explore', '"Explore your stay" link'),
          ]),
          group('nav', 'Menu', 'The words in the top menu and footer. The menu always links to the same sections of the page.', [
            text('suites', 'Suites'), text('facilities', 'Facilities'), text('gallery', 'Gallery'),
            text('location', 'Location'), text('contact', 'Contact'),
          ]),
          group('hero', 'Opening screen', 'The pictures and films that change by themselves at the very top of the page.', [
            text('eyebrow', 'Small line above the headline'),
            text('place', 'Place line at the bottom'),
            {
              type: 'object', name: 'slides', label: 'Slides', list: true,
              description: 'Each slide has a picture or a film and one line of large text. Slides play in this order, morning into night.',
              ui: { itemProps: (item: Record<string, unknown>) => word(item, 'title', 'Slide') },
              templates: [
                {
                  name: 'photoSlide', label: 'Photo slide',
                  fields: [
                    photo('image', 'Photo'),
                    text('title', 'Large text', 'The first words of the caption'),
                    text('em', 'Large text, second part (italics)'),
                    text('alt', 'Describe the picture', 'Read aloud to guests who cannot see it, and used by Google.'),
                    { type: 'number', name: 'seconds', label: 'Seconds on screen' },
                  ],
                },
                {
                  name: 'videoSlide', label: 'Film slide',
                  fields: [
                    photo('poster', 'Still picture (laptop)', 'Shown while the film loads. The film itself can only be changed by the website developer.'),
                    photo('posterMobile', 'Still picture (phone)'),
                    text('title', 'Large text', 'The first words of the caption'),
                    text('em', 'Large text, second part (italics)'),
                    text('alt', 'Describe the film', 'Read aloud to guests who cannot see it, and used by Google.'),
                    { type: 'number', name: 'seconds', label: 'Seconds on screen' },
                    { type: 'string', name: 'video', label: 'Film file (laptop)', ui: { component: 'hidden' } },
                    { type: 'string', name: 'videoMobile', label: 'Film file (phone)', ui: { component: 'hidden' } },
                  ],
                },
              ],
            } as TinaField,
          ]),
          group('arrival', 'Night film introduction', 'The opening words over the night-time film that plays as you scroll.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading('', 'The first word of the big heading'),
            text('lede', 'Sentence under the heading'),
            text('ledeEm', 'Sentence, italic ending'),
            text('place', 'Place line at the bottom'),
          ]),
          group('suitesSection', 'Suites', 'The suites section: its heading, each suite and what comes in every suite.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading(),
            long('lede', 'Introduction'),
            text('exploreButton', '"Explore" button'),
            {
              type: 'object', name: 'suites', label: 'Suites', list: true,
              description: 'One entry per suite category. Numbers (01, 02, ...) follow the order here.',
              ui: { itemProps: (item: Record<string, unknown>) => word(item, 'name', 'New suite') },
              fields: [
                text('name', 'Suite name', 'The last words are shown in italics.'),
                long('long', 'Description'),
                text('guests', 'Guests', 'e.g. Up to 3. Leave empty if not decided.'),
                text('size', 'Size', 'e.g. 627 sq ft. Leave empty if not decided.'),
                text('outdoor', 'Balcony or view', 'e.g. 1 private balcony'),
                text('bestFor', 'Best for', 'e.g. Couples and small families'),
                { type: 'string', name: 'highlights', label: 'Highlights', list: true, description: 'Short points, e.g. Kitchenette.' },
                {
                  type: 'object', name: 'photos', label: 'Photos', list: true,
                  description: 'The first photo is the main one. The next two appear as smaller pictures.',
                  ui: { itemProps: (item: Record<string, unknown>) => word(item, 'alt', 'Photo') },
                  fields: [photo('src', 'Photo'), text('alt', 'Describe the photo', 'Also shown as the caption.')],
                } as TinaField,
                { type: 'boolean', name: 'pending', label: 'Still being decided', description: 'Marks this suite as unfinished in draft mode only. Guests do not see it.', ui: { component: 'hidden' } },
              ],
            } as TinaField,
            text('outroEyebrow', 'Closing: small line'),
            ...heading('outro', 'Closing heading'),
            {
              type: 'object', name: 'inEverySuite', label: 'Comforts in every suite', list: true,
              ui: { itemProps: (item: Record<string, unknown>) => word(item, 'label', 'Comfort') },
              fields: [
                text('label', 'Comfort'),
                {
                  type: 'string', name: 'icon', label: 'Little picture',
                  options: [
                    { value: 'i-kitchen', label: 'Kitchen' }, { value: 'i-balcony', label: 'Balcony' }, { value: 'i-sofa', label: 'Sofa' },
                    { value: 'p-home', label: 'Home' }, { value: 'i-ac', label: 'Air conditioning' }, { value: 'i-wifi', label: 'Wi-Fi' },
                    { value: 'i-parking', label: 'Parking' }, { value: 'i-pet', label: 'Pet' }, { value: 'i-guests', label: 'Guests' },
                  ],
                },
              ],
            } as TinaField,
          ]),
          group('facilitiesSection', 'Facilities', 'The "Resort delights" section: four chapters, each with its facilities.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading(),
            long('lede', 'Introduction'),
            {
              type: 'object', name: 'groups', label: 'Chapters', list: true,
              description: 'Each chapter groups some facilities. The page is designed for four.',
              ui: { itemProps: (item: Record<string, unknown>) => ({ label: [item?.title, item?.em].filter(Boolean).join(' ') || 'Chapter' }) },
              fields: [
                ...heading(),
                long('text', 'Introduction to the chapter'),
                {
                  type: 'object', name: 'items', label: 'Facilities', list: true,
                  ui: { itemProps: (item: Record<string, unknown>) => word(item, 'name', 'Facility') },
                  fields: [
                    text('name', 'Name'),
                    text('tag', 'Small label next to the name', 'e.g. The Pool. Optional.'),
                    long('text', 'Description'),
                    photo('img', 'Photo', 'Optional. The first two photos in a chapter are shown beside it.'),
                    { type: 'boolean', name: 'standIn', label: 'Stand-in photo', description: 'Tick if the photo is only a placeholder; it is then not shown.' },
                  ],
                },
              ],
            } as TinaField,
          ]),
          group('daySection', 'A day at Palm Regal', 'Five moments from morning to night, each with a photo. The page is designed for five.', [
            text('eyebrow', 'Small line above the moments'),
            text('moreLink', 'Link to the moments wall'),
            {
              type: 'object', name: 'moments', label: 'Moments', list: true,
              ui: { itemProps: (item: Record<string, unknown>) => word(item, 'time', 'Moment') },
              fields: [
                text('time', 'Time of day', 'e.g. Morning'),
                ...heading(),
                long('text', 'Description'),
                photo('img', 'Photo'),
                text('alt', 'Describe the photo'),
              ],
            } as TinaField,
          ]),
          group('locationSection', 'Location heading', 'The words above the map. The map itself is part of the design.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading(),
            text('lede', 'Sentence under the heading'),
          ]),
          group('momentsSection', 'Moments wall', 'The wall of photos that opens large when clicked.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading(),
            long('lede', 'Introduction'),
            {
              type: 'object', name: 'photos', label: 'Photos', list: true,
              description: 'Every photo here appears on the wall.',
              ui: { itemProps: (item: Record<string, unknown>) => word(item, 'cap', 'Photo') },
              fields: [
                photo('src', 'Photo'),
                text('cap', 'Caption'),
                text('alt', 'Describe the photo'),
                { type: 'string', name: 'group', label: 'Kind of photo', options: ['Grounds', 'Suites', 'Facilities', 'Sea'] },
              ],
            } as TinaField,
          ]),
          group('faqSection', 'Questions guests ask', 'The FAQ section.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading(),
            long('lede', 'Introduction'),
            text('moreLink', 'Link to the contact form'),
            {
              type: 'object', name: 'faqs', label: 'Questions', list: true,
              ui: { itemProps: (item: Record<string, unknown>) => word(item, 'q', 'New question') },
              fields: [
                text('q', 'Question'),
                { type: 'string', name: 'answer', label: 'Answer', list: true, description: 'One entry per paragraph.', ui: { component: 'textarea' } } as TinaField,
                { type: 'string', name: 'pending', label: 'Note to confirm', description: 'Shown only in draft mode.', ui: { component: 'hidden' } },
              ],
            } as TinaField,
          ]),
          group('contactSection', 'Contact and enquiry', 'The closing section with call, email and the enquiry form.', [
            text('eyebrow', 'Small line above the heading'),
            ...heading(),
            long('lede', 'Introduction'),
            text('callLabel', 'Label above the phone number'),
            text('writeLabel', 'Label above the email address'),
            text('formEyebrow', 'Enquiry form: small line'),
            text('formTitle', 'Enquiry form: heading'),
            text('formEm', 'Enquiry form: heading, second part (italics)'),
          ]),
          group('footer', 'Footer', 'The text at the bottom of every page.', [
            text('aboutTitle', 'About: heading'),
            long('aboutText', 'About: text'),
            long('followText', 'Follow us: text'),
            text('note', 'Line above the big name'),
          ]),
        ],
      },
    ],
  },
});
