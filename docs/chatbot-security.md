# Chatbot abuse and cost protection

Goal: a guest concierge that cannot be turned into a free general-purpose LLM or drain Sarvam credits. Every request costs money, so the design is layered: cheap checks first, the model call last, hard caps behind everything.

## What other products do (research summary)

- Crisp: automatic anti-bot protection on by default, plus manual levels (light challenge up to strict for all visitors) you raise during an attack.
- Intercom community advice: block spam regions, put Cloudflare in front. Chatling, ChatLab, Boei, Botpress: per-user or per-session limits stackable per minute, hour and day (ChatLab keys by session, not IP, because of shared networks); honeypot field; captcha shown only when bot detection flags a visitor.
- AI-chat guides (Upstash, Netlify, Chatbase): layered limits (IP for anonymous, per-user quotas, provider limits), sliding window via Upstash Redis, a bot-wide cap, max message length, max conversation length, output token caps, scoping the prompt to the business.
- Not found publicly: how Intercom or Drift sign visitor tokens. The common approach is a server-issued signed visitor id.
- Vercel BotID (invisible, Kasada-based) and Cloudflare Turnstile (invisible or one-click) are the standard invisible challenges on this stack.

## Implemented now

| Measure | Where | Default and why |
| --- | --- | --- |
| Signed, httpOnly visitor cookie (HMAC-SHA256 with `CHAT_SECRET` or `AUTH_SECRET`), issued by `GET /api/chat` | `lib/chat/guard.ts` | Cannot be forged or edited; clients without it get 401. Cookie minting is capped at 30 per network per hour. |
| Per-visitor sliding window | guard.ts | 5 per minute: faster than a person can read replies |
| Per-visitor daily | guard.ts | 40 per day: a guest asks 5 to 10 questions |
| Per-network (IP) sliding window | guard.ts | 80 per hour: generous because guests share resort Wi-Fi and mobile carrier NAT. IPv6 grouped by /64. |
| Per-device fingerprint daily | guard.ts, `components/chat/fingerprint.ts` | 1.5x the visitor limit. Weak signal (hash of browser traits), catches clearing cookies. Loaded only with the chat panel. |
| Global daily circuit breaker | guard.ts | 1500 replies and 1200 tokens x cap per India-time day. At the cap the bot pauses with a friendly message and WhatsApp/booking pointers. |
| Message length, conversation turns, reply tokens | config.ts | 500 chars, 20 guest messages, 350 reply tokens. History sent to the model is the last 10 messages, read from the server, never from the browser (cannot be inflated). |
| Origin check | `originOk` | Own host, `NEXT_PUBLIC_SITE_URL`, and localhost and `*.vercel.app` only outside production. Rejects `Sec-Fetch-Site: cross-site`. Stops other websites; does not stop curl (that is what the limits are for). |
| Honeypot field and minimum cookie age (1.5 s) | route.ts | Naive bots fill the hidden field: 1 hour automatic block. Scripts that skip the widget fail the age check. |
| Admin blocklist | conversations view, Settings | Block visitor, network or device. Stored as hashes with a masked label. |
| IP privacy | guard.ts | IPs stored only as an HMAC hash; admin sees `203.0.•.•` form. |
| Scope guard in the system prompt | `lib/chat/prompt.ts` | Declines unrelated tasks, no invented prices, no medical or legal advice. Also a cost control, with the reply token cap. |
| Refused requests do not consume a guest's quota | guard.ts | A guest in cooldown is not punished further. |
| Retention | store.ts | Conversations expire 90 days after the last message. |
| Key namespace | redis.ts | `CHAT_KEY_PREFIX`, else `prod:` on Vercel production and `dev:` elsewhere. |

Rate-limited guests get HTTP 429 with `Retry-After`, a friendly message, and the widget disables send and shows a countdown.

All limits except the cookie-minting cap are editable in Admin, Settings, within safe bounds.

## Recommended next steps (not built, and why)

1. **Vercel BotID (Deep Analysis)** on `POST /api/chat`: invisible to guests, strongest protection against scripted traffic. Needs the `botid` package, a `withBotId` wrapper in `next.config.mjs`, a client `initBotId` call and `checkBotId()` in the route; paid (per verification) on Pro. Add if the limits above are ever hit by scripted traffic. Cloudflare Turnstile (invisible mode) is the free alternative, needs a site key and secret.
2. **Vercel Firewall rate-limit rule** on `/api/chat` (for example 30 requests per minute per IP) as a coarse outer fence before functions run.
3. **Alerts**: email or WhatsApp when the global cap reaches 80 percent, or when one network is rate limited repeatedly. Today the Settings page shows the day's usage.
4. **Sarvam spend limit**: set a monthly cap in the Sarvam dashboard if it offers one; the daily cap here is the primary guard.
5. Language-ID API per message: not used (costs per character and adds latency); a Unicode script check is enough, see README.

## Known limits

- IP and cookie limits can be evaded by a determined attacker with many IPs; the global daily cap bounds the damage to a known number of replies. Worst-case daily cost = cap x tokens per reply (roughly 1500 x 2,500 tokens in, 350 out, about Rs 90 at current Sarvam 105B rates, to verify against the actual bill).
- Redis read-modify-write of a conversation is not locked; two simultaneous messages from one guest could drop a stored line. Acceptable at this scale.
