# Palm Regal production investigation — 7 November 2026

## Reproduced issues

1. An external Google Fonts stylesheet appeared before the inline motion bootstrap and deferred application scripts. Holding that request open on the live site kept `document.readyState` at `loading`, left the HTML class empty, and prevented the hero, room journey and day story from initializing. Releasing/aborting the font request allowed all three to initialize. This reproduces a broad effects failure under blocked or hanging external font CSS; it does not establish the reporter's exact network condition.
2. A cold direct `#gallery` load settled approximately 113 pixels inside the section rather than at its start, as fonts and held-section heights changed after the original fixed 60 ms hash jump.
3. The local installed Next version was 16.4.3, while `package.json`, the lockfile and Vercel use 15.5.28. A successful local build alone did not validate the production dependency set.

## Changes

- Self-host the existing Fraunces/Figtree normal and italic variable fonts in WOFF2, using `font-display: swap`. Remove the external Google font stylesheet/preconnects; preload the two normal faces. Preserve the font names and existing variation settings.
- Downloaded the complete fonts from the official `google/fonts` repository and converted their format without subsetting. Preserve both OFL licences in `public/fonts/`.
- Re-align initial hash navigation while body layout settles, stopping as soon as the user interacts or changes the hash. Refresh scroll measurements when fonts finish loading. Clean up scheduled work and ignore late font callbacks after unmount.
- Render decorative WebGL only while one of its elements is visible. Clear it once when leaving view; skip hidden-tab rendering. Isolate renderer/context failure from the shared animation ticker and restore the CSS presentation.
- Keep the pinned production dependencies. Validate a separate `npm ci` build rather than replacing the running local development environment.
- Include the newly requested hero push-in and fade. Preserve the v4 video assets; the actual bedroom photo remains untransformed.

## Release checks

The isolated clean Next.js 15.5.28 export passed the checks below at desktop 1440×1000 and mobile 390×844, with no page errors or failed HTTP responses. It also passed cold direct-link alignment, reduced-motion and JavaScript-disabled cases. Google font domains were held open by the test harness; the updated export made no requests to them. Live deployment verification is recorded in the local diagnostics output after release.

Validate the clean Next 15 export and then the deployed URL: desktop/mobile hero forward and reverse, room photo controls, horizontal room travel, day selection, map scroll/click, FAQ, empty/invalid enquiry submissions, simulated WebGL context loss, cold hash positioning, reduced-motion and JavaScript-disabled fallbacks. Keep Google Fonts requests hanging during a dedicated regression test; the updated site must not request them at all.

No test should send a real enquiry or invoke email/WhatsApp. A headless mobile viewport does not replace testing on a physical phone.

## Font sources

- https://github.com/google/fonts/tree/main/ofl/fraunces
- https://github.com/google/fonts/tree/main/ofl/figtree

Diagnostics, before/after records and reproducible scripts are retained locally under `output/palm-regal-production-diagnostics/` in the parent Rothenhall workspace.
