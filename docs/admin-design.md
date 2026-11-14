# Admin panel design (v2)

A calm, light back office for non-technical resort staff. Everything lives under `src/app/admin/` and is styled only by `admin.css` (scoped to `.adm`). The public site and the editor preview are untouched.

## Information architecture and naming

Grouped by the admin's job, not by the system:

| Group | Item | Route | Notes |
| --- | --- | --- | --- |
| (none) | Home | `/admin/` | Today at a glance, what needs a reply, quick actions |
| Guests | Inbox | `/admin/inbox/` | Chats. "Needs reply" and "Unanswered" are filters; the nav shows a count badge |
| Concierge | Knowledge | `/admin/concierge/knowledge/` | Library first, "Add knowledge" dialog |
| Concierge | Assistant settings | `/admin/concierge/` | Identity, personality, greeting bubble, limits and usage (Advanced), blocked guests, live preview |
| Website | Edit website | `/admin/editor/#/~/admin/preview/` | Opens the visual editor directly (external-arrow icon). No launcher page |

Bottom of the sidebar: account menu (initials, email; View live site, Sign out), then the quiet Rothenhall credit.

Old routes redirect: `/admin/conversations` (+ `/view?id=`, `?filter=attention`), `/admin/knowledge` (+ `/view`), `/admin/settings`, `/admin/edit`. Tina's "back to dashboard" goes to `/admin/` (Home), still valid.

## Visual system

- Light shell: off-white background, white surfaces, 1px hairlines, shadows only on overlays (menus, dialogs, toasts, save bar).
- Teal (`#193f47`) is primary, active nav and focus; amber is used only for "needs attention"; red only for destructive.
- Figtree for all UI at 14px (13px secondary, tabular numbers). Fraunces only for the resort wordmark (sidebar, login). One rule, no serif headings.
- 8px radius, spacing scale 4/8/12/16/24/32/48 as `--s1..--s7`, visible 2px focus ring, text contrast AA.
- Icons: `lucide-react` (1.73.0, exact), imported only inside admin files so it never reaches the public bundle.
- `prefers-reduced-motion` removes transitions and animations.

## Components (`src/app/admin/_ui/`)

Server-safe (`ui.tsx`): `PageHeader`, `Card`, `Section`, `StatTile`, `Badge`, `Progress`, `EmptyState`, `Avatar`, `ButtonLink`, `btn()` class helper, `Field` (label, help, counter, inline error), `Input`, `Textarea`, `Select`, `Switch`.
Client: `Dialog` and `ConfirmDialog` (native `<dialog>`: focus trap, Esc), `Menu` (arrow keys, Esc, outside click), `Segmented` (radio inputs, native arrow keys), `ToastProvider`/`useToast` (+ `?toast=key` from server redirects).
Helpers: `_lib/format.ts` (relative time, language names, guest label, handoff wording), `_lib/data.ts` (cached needs-reply list for sidebar badge and Home).

## Screens

- **Home**: greeting, tiles (chats today / last 7 days, needs your reply, unanswered questions), "Needs your reply" list (latest 5), assistant on/off status with a one-tap switch, quick actions. No AI usage, credits or token figures here by design; they live in Assistant settings, Limits and usage (Advanced).
- **Inbox**: two panes on desktop (list 380px, transcript right); one pane with a back arrow on phones. Filters (segmented) and message search live in the address bar. Rows: guest label, preview, relative time, language name, status. Transcript: bubbles, thumbs shown quietly, system notes for "asked for the team / assistant could not answer", technical details in a collapsed "Details". Actions: Mark as done / Reopen, Block guest (confirm; optional network block), Delete (confirm). Status is `status: 'open' | 'done'` plus `doneAt` on the conversation; a new guest message after `doneAt` makes it "Needs reply" again without changing the chat API.
- **Knowledge**: library table (stacked rows on phones) with on/off switch and menu (View text, Rename, Delete); capacity line; "Add knowledge" dialog with Upload a file (dropzone, upload progress, "Reading the document") and Write a note. The upload route keeps its mechanics and now returns JSON when called by the dropzone.
- **Assistant settings**: sectioned cards, tone cards with an example each, live preview (greeting bubble, chat launcher, first message), save bar that appears on unsaved changes (Save / Discard, inline validation against the same bounds, unsaved-changes warning on leaving), toast on success.
- **Login**: centered card, wordmark, error state, credit.
- **Phones (760px and below)**: a top app bar with the resort name and a menu button opens the sidebar as a drawer. A drawer was chosen over a bottom tab bar because there are grouped destinations, an account menu and a badge that five tabs could not carry cleanly.

## Security and behaviour

Every server action and route keeps its `auth()` check; admin stays `noindex`. Settings still pass through `sanitize()` server side. `store.ts` gained `recentConvs`, `flaggedConvs`, `setConvStatus`, `isDone`, `needsReply` (additive only).

## Phase 2: Insights, Website status, label fixes

### Navigation
Guests: Inbox, **Insights**. Website: Edit website (opens the editor), **Website status**. Home gets one compact "At a glance" card (website state, site health count, top 3 searched dates, open knowledge gaps). No AI usage, credits or token figures appear on Home or Insights; they stay in Assistant settings, Limits and usage.

### Labels
- Guest label: "Guest 4821", a stable 4-digit number from an FNV hash of the visitor id (`_lib/format.ts`).
- Language: `src/lib/insights/lang.ts`. Non-Latin text by script; Latin text by a small list of distinctive function words per language (Hindi, Telugu, Tamil, Odia, Bengali), words that are also English are excluded. Labels: "Telugu (English letters)", "Hindi", "English". Computed when read from the guest's messages, nothing stored; the same helper feeds the Insights language chart. It is a heuristic: very short or mixed messages can be mislabelled.

### Dates guests search for (demand)
- The booking picker (`BookingDialog.tsx`) fires `navigator.sendBeacon('/api/insights/search/')` (fallback `fetch keepalive`) when the guest presses "Check availability": check-in, check-out, adults, children. About +290 bytes raw (+125 gzip) in one existing homepage chunk; no new files or libraries in the public bundle.
- `POST /api/insights/search/` (`src/app/api/insights/search/route.ts`): same-origin check as the chat API, strict validation (real dates from today to +18 months, 1 to 30 nights, adults 1 to 10, children 0 to 10), 30 searches per IP per hour through the chat limiter (IP hashed, used only as the in-memory/Redis limiter key), always answers 204 (400/403/429 for bad, cross-site or excessive calls).
- Stored: aggregate counters only, in Redis hashes under the chat prefix: `ins:in:<YYYY-MM>` (searches per check-in day), `ins:sd:<YYYY-MM>` (searches per day), `ins:nights`, `ins:party` ("adults-children"), `ins:lead` (lead-time bucket), `ins:total`. TTL about 18 months, refreshed on each search. **No cookie, no visitor id, no IP, no per-search record** is stored.
- Admin: month heatmap (this month and the next 5), most searched upcoming dates, average stay, typical group, lead time, last 30 days trend. Empty state explains it starts counting after deployment.

### What guests ask
`src/lib/insights/chats.ts` reads up to 2,000 conversations (batched MGET, 200 per request), cached 5 minutes in memory. Topics come from a multilingual keyword dictionary (`topics.ts`: English, romanized Hindi/Telugu/Odia, Devanagari/Telugu/Odia words); each topic counts once per chat. Also languages, busiest hours (India time), share handed to the team, share with an unanswered question, thumbs up and down. Plain CSS bars (`_ui/charts.tsx`), no chart library.

### Knowledge gaps
Unanswered questions are grouped (same topic plus most keywords in common). "Add answer" opens the existing Add knowledge dialog on the note tab with the title prefilled; once saved the gap is marked resolved (`ins:gaps`, a hash of group key to status). A resolved gap returns only if a guest asks again at least an hour after the answer was added. "Dismiss" hides it for good.

### Website status, Undo, Site health
- `src/lib/insights/website.ts`: read-only GitHub calls with `GITHUB_PAT` for `GITHUB_OWNER`/`GITHUB_REPO`/`GITHUB_BRANCH` (same defaults as `tina/database.ts`; optional `GITHUB_API_URL` for a different API host). Latest text and photo commits, and the deploy state of the newest commit from Vercel's GitHub deployments (falls back to commit statuses): Live, Publishing (about 2 minutes), Failed, or "Status unavailable" when there is no token or GitHub cannot be reached. Cached 60 seconds, failures too.
- **Undo last text change**: for the newest commit touching `content/site/home.json`, writes the parent version back through the Contents API with the message "Admin: undo website change <shortsha>". It refuses if the file has changed since the page was loaded, for merge commits, or when there is no earlier version. Photos are not undone (the dialog says so). Covered by mocked tests only: `node scripts/insights.test.mjs` (no network, nothing written).
- **Site health** (`health.ts`): WhatsApp number missing, photos without a description, items still marked "to confirm", Google title and description length, fewer than 5 FAQs, used photos over 500 KB (sizes from the GitHub folder listing, or the local disk in local mode). Each with a plain explanation and a "Fix in editor" link; an "All good" state when clean.

### Privacy summary
Guest searches: aggregate counts only. Chat insights: derived from existing chat records (already retained 90 days); nothing new is stored except the resolved/dismissed gap flags.
