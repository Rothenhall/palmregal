# Palm Regal website (v0.6)

Next.js 15 site for Palm Regal Resort Homestay, Gopalpur on Sea. It exports to plain static files, ready for Vercel.

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
| Scroll-controlled aerial hero | `src/components/Hero.tsx`, styles under `.aerial-hero` in `src/app/globals.css` |
| Liquid glass layer (WebGL) | `src/components/LiquidLayer.tsx`, shaders in `src/lib/shaders.ts` |
| Scroll motion and colour shifts | `src/components/Motion.tsx` |
| Photos | `public/img/` |

The homepage uses a continuous AI-generated night arrival based on the original property's night aerial around 58.60 seconds. Kling 3.0 generated the camera approach and scene motion from a restored, dimly lit reference frame; the garden/window glow is gently increased in finishing. This is an illustrative generated scene, so fine inferred details are not documentary footage.

`public/media/palm-regal-night-arrival-v4-desktop.mp4` is 1920×1080 and `palm-regal-night-arrival-v4-mobile.mp4` is a 720×1280 portrait crop. Both contain 483 frames at 60 fps over 8.05 seconds, sampled from the native 24fps generation without stretching its speed. No photo zoom or CSS camera transform is added by the website. The hero provides 220svh of desktop scroll travel and 160svh on phones. Scrolling advances/reverses the camera move and lighting progression; it does not autoplay or loop.

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
