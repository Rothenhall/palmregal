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
| Growing hero | `src/components/Hero.tsx` |
| Liquid glass layer (WebGL) | `src/components/LiquidLayer.tsx`, shaders in `src/lib/shaders.ts` |
| Scroll motion and colour shifts | `src/components/Motion.tsx` |
| Photos | `public/img/` |

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
