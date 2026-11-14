# Palm Regal website (v0.6)

Single-page Next.js site for Palm Regal Resort Homestay, Gopalpur on Sea. The public page is prerendered to static HTML at build time; a small, separate `/admin` area (sign-in, dashboard shell) runs as server routes on Vercel. Navigation stays within the homepage; booking is available through the header and booking form.

## Run it on your computer

You need Node.js 20 or newer (https://nodejs.org).

```bash
npm install
npm run dev          # http://localhost:3000, reloads as you edit; also starts the Edit site editor in local mode
npm run dev:site     # the website only, without the editor
```

To preview the finished build:

```bash
npm run build        # the homepage must show as "Static" in the route table
npm start            # next start, http://localhost:3000
```

### Admin sign-in

Copy `.env.example` to `.env.local` and fill it in:

- `AUTH_SECRET`: `npx auth secret` (or `openssl rand -base64 32`)
- `ADMIN_EMAIL`: the admin login
- `ADMIN_PASSWORD_HASH`: run `node scripts/hash-password.mjs "your password"`. In `.env` files each `$` must be escaped with a backslash (the script prints that form); in Vercel paste the plain hash.

Then open `/admin`. It lives in `src/app/admin` with its own root layout and CSS, guarded by `src/middleware.ts` (matcher `/admin` only) and the panel layout. Auth config is in `src/auth.config.ts` and `src/auth.ts` (Auth.js v5, credentials, JWT sessions, no database; add Google in `src/auth.ts`). The public site is in `src/app/(site)`.

The page needs an internet connection for Google Fonts.

## Where things are

| What | File |
| --- | --- |
| All the words, numbers, suites, facilities, FAQs, photos | `content/site/home.json` (edited through Edit site; typed loader `src/content/site.ts`, types `src/content/types.ts`) |
| The Edit site editor's fields and labels | `tina/config.ts` |
| Coast map places (geography, so kept in code) | `src/content/coast.ts` |
| Colours, type, layout | `src/app/globals.css` (tokens at the top) |
| Homepage sections | `src/components/SiteBody.tsx`, rendered by `src/app/(site)/page.tsx` |
| Homepage navigation anchors | `navOf` in `src/content/site.ts`, section ids in `src/components/SiteBody.tsx` |
| Scroll-controlled aerial hero | `src/components/Hero.tsx`, styles under `.aerial-hero` in `src/app/globals.css` |
| Footer water (WebGL) | `src/components/LiquidLayer.tsx`, shader in `src/lib/shaders.ts` |
| Smooth scroll, heading reveals, parallax and colour shifts | `src/components/Motion.tsx` |
| Photos | `public/img/` |

The homepage ends with ten FAQs and a short enquiry form, on the same deep-teal ground as the footer. Enquiries currently open the visitor's email app; they are not submitted to a delivery service. The WhatsApp number remains empty by request.

Current decisions and deferred map photographs: [experience follow-ups](docs/experience-follow-ups.md). Official API options and the proposed five-review section: [Google reviews plan](docs/google-reviews-plan.md). No live Google review feed is connected yet.

The homepage uses a continuous AI-generated night arrival based on the original property's night aerial around 58.60 seconds. Kling 3.0 generated the camera approach and scene motion from a restored, dimly lit reference frame; the garden/window glow is gently increased in finishing. This is an illustrative generated scene, so fine inferred details are not documentary footage.

`public/media/palm-regal-night-arrival-v4-desktop.mp4` is 1920×1080 and `palm-regal-night-arrival-v4-mobile.mp4` is a 720×1280 portrait crop. Both contain 242 frames at 30 fps over 8.05 seconds, sampled from the native 24fps generation without stretching its speed, and every frame is a keyframe (H.264, `-g 1 -tune fastdecode`) so scroll seeking lands on any frame at once instead of decoding up to the previous keyframe. No photo zoom or CSS camera transform is added by the website. The hero provides 220svh of desktop scroll travel and 160svh on phones. Scrolling advances/reverses the camera move and lighting progression; it does not autoplay or loop.

Matching WebP posters render immediately. Reduced-motion preferences, data saving, disabled JavaScript or video errors show a still hero with both booking links available. Motion preference and viewport changes reconfigure the video and clean up the previous scroll trigger.

## Still waiting on the resort

Items marked `pending` in `content/site/home.json`. Set `NEXT_PUBLIC_DRAFT=true` to show them on the page as orange "to confirm" tags while reviewing; they are hidden by default.

- WhatsApp Business number: set the WhatsApp number under Resort details in Edit site. Until then, Book Direct opens an email.
- Booking engine or WhatsApp enquiry (Book Direct)
- Host photo and a few words from Jahnavi
- Book Direct offer
- Sea and Garden View suite: size, guests, description, photo
- Theatre and restaurant photos; real yoga lawn and jogging track photos
- Google reviews (go live at launch) and rating
- YouTube tour link
- Distances for Sonpur, Dhabaleshwar, Tapta Pani; city travel times; taxi contacts

## Deploy

Push to GitHub and import in Vercel (framework: Next.js; no output directory needed). Set these environment variables for Production: `NEXT_PUBLIC_SITE_URL` (the live domain), `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`. The homepage is still served as static HTML from the CDN; only `/admin` and `/api/auth` run on the server.

## Edit site (visual editor)

Admins open **Edit site** in the dashboard, see the real homepage, click any text or photo, change it and press Save. Only content can be changed (text, photos, links, prices, lists such as suites and FAQs); layout, colours and motion are code.

How it works:

- Content lives in `content/site/home.json`. The public homepage (`/`) is still prerendered static HTML built from that file; **no editor code is in its bundle** and its HTML has no `data-tina-field` attributes.
- The editor is [TinaCMS](https://tina.io) with visual editing, built into `public/admin/editor` (git-ignored) and served at `/admin/editor/`. `src/middleware.ts` guards `/admin/*`, so it sits behind the normal admin sign-in. There is no second login: the editor's backend (`src/app/api/tina/gql/route.ts`) accepts only a valid Auth.js admin session.
- The editor's click-to-edit view is `/admin/preview/` (`src/app/(preview)`): the same `SiteBody` the public page uses, fed live data through Tina's `useTina` and marked with `tinaField`. It is protected the same way and sent with `noindex`.
- **Save/Publish on Vercel** commits `content/site/home.json` to GitHub (and updates the index in Upstash Redis); Vercel then rebuilds and the change is live in about two minutes.
- Locally (`npm run dev`) the editor runs in Tina's **local mode** (`TINA_PUBLIC_IS_LOCAL=true`, set in the dev script): saving writes straight to `content/site/home.json`, with no Redis and no GitHub. Review the change with git and commit it yourself.

Set up on Vercel (Settings > Environment Variables, Production; the Upstash integration adds the first two itself):

| Variable | What |
| --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (the Tina content index) |
| `GITHUB_PAT` | Fine-grained GitHub token, "Contents: Read and write" on this repo |
| `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` | Optional. Default `Rothenhall`, `palmregal`, and the branch Vercel builds |

Plus the admin sign-in variables above. `npm run build` (`scripts/build.mjs`) runs `tinacms build` and then `next build`. With those variables present it builds the self-hosted editor and indexes the content into Redis; without them it builds the editor in local mode and the website is unaffected.

Good to know:

- Photos: click any picture in the editor and upload a new one, or choose an existing one. Uploads use our own photo library (`tina/media-store.ts`, API in `src/app/api/tina/media/`, rules in `src/lib/media/`), not Tina's repo media. The browser first shrinks each photo (longest edge 2400 px, WebP at quality 0.82, JPEG if WebP is unavailable, EXIF and GPS removed, rotation fixed) so it stays under Vercel's ~4.5 MB request limit and keeps the site fast. The server then checks the real file type (JPEG, PNG, WebP, AVIF only; no SVG), re-checks size and EXIF with `sharp`, names it `lower-case-with-hyphens.webp` (never overwriting: `-2`, `-3`...) and saves it to `public/img`: on Vercel as a commit "Edit site: upload photo ..." to `GITHUB_BRANCH` via the GitHub Contents API, locally straight to disk. The content stores the usual `/img/<file>` path. Each upload is a commit, so Vercel redeploys; the photo is on the live site about two minutes later. Until then the editor still previews it: any `/img/*` URL that matches no real file is routed (`next.config.mjs`, `fallback` rewrite) to the admin-only proxy `/api/tina/media/preview/`, which reads it from GitHub with the server-side token; visitors get a normal 404. Deleting a photo is also a commit and is refused while `content/site/home.json` on the branch still uses it (and for `emblem.png`, used by the code). Limits: 4 MB per stored photo, one photo per request, up to 10 per upload action. The list shows up to 1000 files per folder (a GitHub Contents API limit).
- **Editor branding (white-label):** admins see Palm Regal and the Rothenhall logo, not the CMS's. It is done with real package patches, not runtime hacks: `patches/*.patch` (applied by `patch-package` in `postinstall`, so also on Vercel) edit `tinacms` (logo, texts, hidden docs links, no announcement/update calls, "Photos" screen, no Collections list), `@tinacms/app` and `@tinacms/cli` (the editor's `index.html`: title "Edit site · Palm Regal Admin", favicon, noindex, theme colour, `public/brand/editor.css` colour overrides). The page is branded from the first byte, so nothing flashes. `scripts/check-editor-branding.mjs` runs in `npm run build` and fails it if a Tina giveaway (llama logo, "TinaCMS" title and so on) is found in the built editor. **After upgrading `tinacms` or `@tinacms/*`** (versions are pinned): run `npm install`; if a patch no longer applies, redo the edits in `node_modules` (see the patch files for what changed) and run `npx patch-package tinacms @tinacms/cli @tinacms/app` to refresh them. Config also sets `telemetry: 'disabled'` and `ui.optOutOfUpdateCheck`. Tina's licence files are untouched (Apache-2.0).
- Not editable in the editor: layout, colours, motion, the hero and night films themselves (only their still pictures and captions), the coast map's places and distances, the enquiry form's field labels, the booking dialog wording, the 404 page, and the "Website by" credit.
- The FAQ answer about check-in times has the phone number and email written into its text; change them there too if they change.
- On Windows machines whose Application Control policy blocks Rollup's native binary, `tinacms build/dev` fails; `npm install --no-save rollup@npm:@rollup/wasm-node@4.68.3` works around it locally.

## Chatbot

A floating "Ask our assistant" button (above the WhatsApp button) opens a guest AI concierge. The button is the only chat code in the homepage's first load; the panel, its CSS and the device fingerprint are fetched on first click, so `/` stays static. It is not rendered inside the Edit site preview.

- API: `src/app/api/chat/route.ts` (Node). `GET` starts a session (signed cookie), `POST` streams the reply as newline-delimited JSON. Model: Sarvam `sarvam-105b-conversations` (override with `SARVAM_CHAT_MODEL`). Hidden `<think>` and `reasoning_content` are never shown or stored.
- The system prompt (`src/lib/chat/prompt.ts`) is built from the live site content, so it follows Edit site changes. It answers only about Palm Regal and Gopalpur, never quotes prices or availability, and replies in the guest's language and script (including romanized Indian languages), guided by a script hint added to each message.
- Admin, Settings: on/off, name, greeting, tone, extra instructions and the limits. Admin, Conversations: transcripts, block, delete. Stored in Redis under `CHAT_KEY_PREFIX` (`dev:` locally, `prod:` on Vercel production), conversations kept 90 days.
- Abuse and cost protection: [docs/chatbot-security.md](docs/chatbot-security.md).
