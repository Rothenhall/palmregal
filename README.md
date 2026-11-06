# Palm Regal website (v0.6)

Next.js site for Palm Regal Resort Homestay, Gopalpur on Sea. It exports to plain static files, ready for Vercel.

## Run it on your computer

You need Node.js 20 or newer (https://nodejs.org).

```bash
npm install
npm run dev          # http://localhost:3000, reloads as you edit
```

To preview the finished build:

```bash
npm run build        # writes the static site to ./out
npm start            # serves ./out at http://localhost:3000
```

The page needs an internet connection for Google Fonts.

## Where things are

| What | File |
| --- | --- |
| All the words, numbers, suites, facilities, FAQs, photos | `src/content/site.ts` |
| Colours, type, layout | `src/app/globals.css` (tokens at the top) |
| Homepage | `src/app/page.tsx` |
| Inner pages | `src/app/{suites,facilities,gallery,location,contact}/page.tsx` |
| Arrival film and suite handoff | `src/components/ContinuousArrival.tsx`, `Hero.tsx`, `SuiteJourney.tsx`, `src/lib/arrival.ts` |
| Liquid glass layer (WebGL) | `src/components/LiquidLayer.tsx`, shaders in `src/lib/shaders.ts` |
| Scroll motion and colour shifts | `src/components/Motion.tsx` |
| Photos | `public/img/` |

The homepage uses the actual property's night aerial, retimed locally from the source video. `public/media/palm-regal-source-arrival-v9-desktop.mp4` is 1920×1080 and its mobile rendition is 720×1280. Both contain 180 frames at 60 fps over three seconds. Source coverage is 57.96–59.72 seconds of the original 25 FPS property video. Motion interpolation smooths the observed movement; it does not invent new camera positions, architecture or curtain motion. No paid generation service was used for this version.

The original bedroom photograph transitions over the aerial toward the end of the scroll sequence, then contracts into the existing first suite card. The photo transition is deliberate: available footage does not document a continuous flight from the selected balcony into that exact bedroom. The default sequence contains no synthetic balcony or replacement curtains. The arrival uses six viewport heights of desktop scroll travel and five on phones before the horizontal suite journey. Forward/reverse seeking, navigation and fallbacks retain their existing behavior.

For comparison, open `/?arrival=baseline`. This selects the unchanged v7 44.05-second composite, including its original generated aerial, approximate building planes and synthetic cloth, with the original 13/10.5 viewport-height pacing and registered ending-photo handoff. Its media remains under `public/media/palm-regal-local-arrival-v7-*`. The standalone `/reconstruction-review/index.html` contains night/day source proofs, original curtain footage, measured camera-validation results and the baseline comparison. Reconstruction scripts and reports live in `output/palm-regal-reconstruction-v1/`; the v7 renderer remains in `output/palm-regal-local-film-v1/` at the workspace root.

Matching WebP posters render immediately. Reduced-motion preferences, data saving, disabled JavaScript or video errors show a still hero with both booking links available. Motion preference and viewport changes reconfigure the video and clean up the previous scroll trigger.

## Still waiting on the resort

Items marked with an orange "to confirm" tag. Set `NEXT_PUBLIC_DRAFT=false` to hide the tags for launch.

- WhatsApp Business number: set `whatsapp` in `src/content/site.ts`. Until then, Book Direct opens an email.
- Booking engine or WhatsApp enquiry (Book Direct)
- Host photo and a few words from Jahnavi
- Book Direct offer
- Sea and Garden View suite: size, guests, description, photo
- Theatre and restaurant photos; real yoga lawn and jogging track photos
- Google reviews (go live at launch) and rating
- YouTube tour link
- Distances for Sonpur, Dhabaleshwar, Tapta Pani; city travel times; taxi contacts

## Deploy

Push to GitHub and import in Vercel (framework: Next.js), or upload `out/`. Set `NEXT_PUBLIC_SITE_URL` to the live domain.
