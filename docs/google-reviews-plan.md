# Palm Regal: five Google reviews

Assessed 7 November 2026. Status: research and implementation plan, not a connected feed.

## Current implementation

- No Google review request, API client, OAuth flow, verified Place ID or live review data is configured in the website source.
- The previous homepage section was draft-only: a fabricated `4.x` score and a six-card placeholder belt. It has been removed from the homepage. The old unused `ReviewBelt` export is not a live integration.
- The site uses Next.js `output: 'export'`. A private live API proxy cannot run inside that static export. A hosting function or a separately deployed backend is needed; do not expose credentials in browser code.
- The latest request is for five reviews, superseding the transcript's three.

## What “top five” can mean

| Source | What it can supply | Access and limits |
| --- | --- | --- |
| Places API (New), Place Details | Up to five reviews chosen by Google for relevance. They are not guaranteed to be the five highest-rated reviews, or all positive. | Verified Place ID, Cloud project, API key and billing setup. Requesting `reviews` uses the Enterprise + Atmosphere SKU. Google attribution, author attribution and source links are required. |
| Owner-authorized Business Profile API | Paginated reviews for a verified managed property. `orderBy=rating desc` permits highest-rating ordering. | Business owner authorization through OAuth, Google API project approval and appropriate account/location access. The API itself has no usage fee; hosting may have costs. Confirm the intended public website display fits the approved project/use before choosing this source. |
| Directly licensed guest testimonials | Five genuine testimonials supplied with permission. | No live Google feed, no promise of automatic updates. Label as guest testimonials rather than Google-sourced content. |

Recommendation: investigate the owner-authorized route first if five highest-rated reviews is essential. For a public review display without owner access, Places is the practical official alternative, accepting Google's relevance-based selection and its billing requirements. Do not promise a free, highest-rated public feed before access and intended use are settled. No scraping or paid review widget is needed for this plan.

## Proposed integration

1. Confirm the actual Palm Regal listing with Jahnavi, then obtain its identifiers and the appropriate API access. Owner authorization should use OAuth, not shared account passwords.
2. Use a private function on the chosen hosting platform. Keep secrets in server environment variables; permit only this property's identifiers and use minimal read access. The static homepage calls the function, never Google with a private credential.
3. For an approved Business Profile implementation, request review pages ordered by rating descending. Use the highest-rated text reviews; use newer publication dates to break ties only after reading the tied group. Return fewer than five when fewer genuine qualifying text reviews exist. Clearly label the selection, for example “Selected 4–5 star Google reviews, highest rating first.” Preserve original wording, author, rating and publication date.
4. For Places, request only the fields needed for reviews, rating/count, author/source attribution and the business review URL. Describe the order as Google's most relevant reviews. Do not relabel these as the highest-rated five, and do not derive the property's overall score from this subset.
5. Apply the chosen API's actual storage rules. Places content must not be put in a permanent static JSON file or reusable daily cache unless an applicable exception permits it. Business Profile permits only limited temporary performance caching, securely stored for at most 30 days; it is not permission to build a permanent review archive. Deleted or expired content must not be served indefinitely as a fallback.
6. If the feed fails and no permitted fresh response exists, omit the section without affecting the rest of the page. Never substitute sample ratings or reviews. Avoid aggregate-rating SEO markup for self-serving lodging reviews.

## Placement and animation

- Place the section after Moments at Palm Regal and immediately before the FAQ, on the same deep-teal ground as the page ending.
- Use five distinct reviews: one generous lead quote and four supporting cards on wide screens. On phones, show a swipeable row with scroll snapping, visible pagination and previous/next buttons.
- Use a restrained once-only reveal (opacity and roughly 16 px of vertical travel, 0.6 seconds, 80 ms stagger). Keep review text still while it is read. No infinite marquee or autoplay.
- Provide full-text expansion for long reviews, author/source links, rating labels and a direct “Read reviews on Google” link. That link is for reviews, not navigation directions.
- Reduced motion renders the same content immediately. All five reviews must remain keyboard accessible; source attribution must remain visible.

## Validation before connecting

Check the exact property identity, ordering, author attribution, real aggregate rating, long/translated text, fewer-than-five results, revoked credentials, API failure, expiry and deletion. Verify that browser assets contain no secrets. Check keyboard access, mobile layout and reduced motion once browser review is requested again.

## Official sources checked

- [Business Profile review listing and sort order](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)
- [Business Profile prerequisites](https://developers.google.com/my-business/content/prereqs)
- [Business Profile OAuth setup](https://developers.google.com/my-business/content/basic-setup)
- [Business Profile pricing](https://developers.google.com/my-business/content/pricing)
- [Business Profile use and storage policies](https://developers.google.com/my-business/content/policies)
- [Places review fields, five-review limit and billing tier](https://developers.google.com/maps/documentation/places/web-service/place-details)
- [Places storage and attribution policies](https://developers.google.com/maps/documentation/places/web-service/policies)
