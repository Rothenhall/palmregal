# Palm Regal website: backlog and decisions

Last updated: 2 Nov 2026. Branch: `v0.7`.

## Locked (do not change until Lokesh says so)

These need more iterations and a proper development pass later. Leave them exactly as they are for now.

1. **Moments at Palm Regal** (homepage, dusk section, `src/components/MomentsWall.tsx`)
   - Today: a tilted wall of resort photos that drifts with the cursor and the scroll; click opens a photo.
   - Still to work out: real guest photos (with permission), what the wall should say and do, how it reads on phones, whether it stays on the homepage.
2. **Coast map** (homepage and Location page, `src/components/CoastMap.tsx`, data from `scripts/build-coast.mjs`)
   - Today: real geography from Natural Earth (coastline, Chilika, Odisha and Andhra Pradesh border, NH 16), pins with verified coordinates, a synced list, an arc and a distance tag to the chosen place.
   - Still to work out: the exact Palm Regal pin (needs the resort's Google Maps pin), Sonapur's exact position, a larger map on phones, layout and interaction iterations.

## Planned, waiting for go-ahead

- **One 3D piece: the Palm Regal room key** on the homepage "Three steps. No middleman." section. Brass key with a teal enamel fob and the emblem. As you scroll, it floats in, turns to face you on step 1, slides into a teal keyhole on step 2 and turns to "unlocked" on step 3, then holds. Built in code (no model download), shares the existing canvas, still image on phones and for reduced motion.

## Needed from the resort (Jahnavi)

- A 10–20 second real video for the hero (garden walk, beach at golden hour or a drone shot), or original full-size photos (the beach at dusk and the pool are only 1280×960).
- The resort's exact location (Google Maps pin link).
- WhatsApp Business number (Book Direct sends email until then).
- Booking engine or WhatsApp enquiry: which one.
- Host photo and a few words; Book Direct offer.
- Sea and Garden View suite: size, guests, description, photo.
- Theatre and restaurant photos; real yoga lawn and jogging track photos.
- Google rating and reviews (go live at launch); YouTube tour link.
- Distances for Sonapur, Dhabaleshwar, Tapta Pani; city travel times; taxi contacts.

## Research: parallax and layout ("arrangement") effects

### What the evidence says

- **Parallax rarely impresses users and can hurt reading** (NN/g, "What Parallax Lacks"). Keep it on background or peripheral images, never on text people read. Once something has played, leave it in its final state; don't replay on scroll up. Long pages need visible in-page navigation, not just dots.
- **Scroll-triggered text animations slow people down** (NN/g, "Scroll-Triggered Text Animations Delay Users"). The main complaint is waiting for text to "load" as you scroll. Use them on secondary content, not body copy; trigger once; subtle ones go unnoticed, which is the goal. Leisure-browsing sites like hotels have more room than task-focused sites, but the waiting problem still applies.
- **Scrolljacking disorients** (NN/g, "Scrolljacking 101"). Changing the scroll rate or direction made people think scrolling was broken. The worst cases combined changed scrolling with text to read. Pinned storytelling worked when it helped understanding (BBC before/after), but users sometimes thought the page had ended (illusion of completeness).
- **Horizontal scrolling on desktop** consistently gets negative reactions (NN/g). People miss off-screen items and ignore arrows. Horizontal swiping is fine on phones for a small, bounded set.
- **Pinned and sticky sections** work when they have a clear start and end; held too long, people think the page is broken. Keep few fixed elements at once.
- **GSAP ScrollSmoother**: images inside an overflow-hidden frame should move only as far as the frame allows ("data-speed auto"); elements land in their natural position when centred; clamp elements near the top so they start in place.

### Layout effects worth considering (from Codrops' studies)

- **Layout formations on scroll**: a section pins briefly while a grid assembles into place, then releases. Good for one signature moment (for example the Gallery chapter openers), not for every section.
- **Scroll-based layout switches (GSAP Flip)**: a pinned section changes arrangement (for example list to grid) as you scroll. Style the end state, let Flip animate between.
- **Elastic grid (ScrollSmoother lag)**: grid columns move at slightly different speeds based on distance from the centre. Subtle and photo-only, so it suits the Gallery grids.
- **Staggered 3D grid reveals**: tiles tilt and settle as they enter. Use sparingly; it competes with the photos.

### How the current site measures up (to review in the next development pass)

| Area | Status | Recommendation |
|---|---|---|
| Hero (three real photos, pinned for about three screens) | Pinned storytelling with a clear end | Keep it short; make sure the next section is visible as the hero ends so nobody thinks the page has finished |
| Photo parallax inside frames | Matches the GSAP and NN/g guidance | Keep |
| Decorative layers (palm shade, the big 13, footer wordmark) | Peripheral only | Keep |
| Heading line reveals and body-paragraph fade-ins | Text appears as you scroll | Remove fade-ins from body paragraphs and lists; keep heading reveals quick (under about 0.6s) or drop them |
| Intro paragraph word fill | Now one-way (stays filled) | Keep, or show the text fully and only animate the colour |
| Day story (sticky photo with steps) | Sticky split with clear start and end | Keep |
| Suites and Facilities in-page menus | Visible in-page navigation | Keep |
| Gallery chapters | Static editorial grids | Candidate for the elastic-grid lag or a one-time formation on each chapter opener |
| Horizontal sections | None on desktop | Keep it that way; swipe only on phones for small sets |


### Reference studied: shrey-ivf.vercel.app (read from its own main.js)

- **Hero arch that opens**: the arch grows to the full screen over the first ~68% of the hero, the photo inside counter-zooms 1.35 to 1.02, the brand words part sideways and fade, the headline arrives once the photo fills. Adopted as "Palm [arch] Regal" with real photos.
- **Clip-path colour swap**: a full-colour copy of a statement revealed over a faded copy, edged by a thin line; the text never moves. Adopted for the homepage intro (one-way, stays filled).
- **Stacking cards**: each card sticks; the previous one scales to .93, rises 10px and dims as the next arrives. Adopted on the Suites page.
- **Pinned stepper**: number, text and arch photo change in place with progress dots. Our day story and the Gallery accordion already follow this; a candidate upgrade for the day story.
- **Horizontal pinned track**: not adopted (NN/g: horizontal scrolling on desktop tests poorly).
- Also: a thin page-progress bar, magnetic buttons, masked word headings, counters, a slow three.js gold double helix in the lab section.


### Research: facilities presentation and stacking cards

- Baymard (travel accommodations, 317+ test sessions): visitors to an unfamiliar boutique property look for the gallery and amenities list, then special features and the neighbourhood. Our homepage order follows this.
- h2c benchmark: lead with what sets the hotel apart; move standard features into details. Facility groups now run play, grounds and sea, eat, move (standard last). eHotelier: overstated amenity copy reads as too good to be true; keep copy factual.
- Real photos build more trust than stock (several hotel UX guides).
- Sticky stacking cards: every card must stay fully readable, offer a static layout for reduced motion, and be tested with the pin off on phones. Cards now stack only on screens at least 901px wide and 760px tall; elsewhere they are a plain list so nothing is covered before it is read.

### Sources

- NN/g, What Parallax Lacks: https://www.nngroup.com/articles/parallax-usability/
- NN/g, Scroll-Triggered Text Animations Delay Users: https://www.nngroup.com/articles/scroll-animations/
- NN/g, Scrolljacking 101: https://www.nngroup.com/articles/scrolljacking-101/
- NN/g, Horizontal Scrolling: https://www.nngroup.com/articles/horizontal-scrolling/
- GSAP ScrollSmoother docs: https://gsap.com/docs/v3/Plugins/ScrollSmoother/
- Codrops, Exploration of On-Scroll Layout Formations: https://tympanus.net/codrops/2024/09/18/exploration-of-on-scroll-layout-formations/
- Codrops, Scroll-Based Layout Animations: https://tympanus.net/codrops/2023/07/20/scroll-based-layout-animations
- Codrops, Elastic Grid Scroll: https://tympanus.net/codrops/2025/06/03/elastic-grid-scroll-creating-lag-based-layout-animations-with-gsap-scrollsmoother/
- Codrops, Staggered (3D) Grid Animations: https://tympanus.net/codrops/2024/10/16/staggered-3d-grid-animations-with-scroll-triggered-effects
- UXPin, scrolling patterns: https://www.uxpin.com/studio/blog/4-types-creative-website-scrolling-patterns/
- Baymard, travel accommodations research: https://baymard.com/blog/new-research-travel-accommodations
- Baymard, travel site UX best practices: https://baymard.com/blog/travel-site-ux-best-practices
- Inviqa, hotel website pain points: https://inviqa.com/blog/common-hotel-website-pain-points-and-how-fix-them
- eHotelier, content that converts: https://insights.ehotelier.com/insights/2016/09/14/six-tips-to-help-hoteliers-craft-content-that-converts/
- Red Hat UX, sticky card: https://ux.redhat.com/patterns/sticky-card/
- Shrey IVF (reference site): https://shrey-ivf.vercel.app/
- Salient, sticky content sections: https://themenectar.com/docs/salient/sticky-content-sections/
