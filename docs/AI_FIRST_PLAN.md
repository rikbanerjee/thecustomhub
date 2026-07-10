# AI-First Positioning Plan — The CustomHub

How a 59-product boutique credibly positions as "AI-first" — and runs it for pocket change.
Companion demo: `mockups/ai-stylist-mockup.html`.

## 1. Positioning: what "AI-first" means for a boutique (not a tech company)

Don't sell AI. Sell what AI lets a 1-person studio do that big brands can't:

| Claim | Backed by |
|---|---|
| "Your idea → mockup in 24 hours" | AI-assisted design pipeline (you already do this) |
| "A stylist for every visitor, 24/7" | AI Stylist quiz + chat |
| "Designs that speak your language" | AI-assisted dual-lingo wordplay generation |
| "Small studio, big-brand experience" | The overall story |

Voice rule: AI is the *sidekick*, culture is the *hero*. "Designed with AI, finished by a
human who argues about fonts." Never lead with the model name; lead with the outcome.

Where it shows up:
- Hero sticker: "AI-POWERED ✦ HUMAN-FINISHED"
- Nav: "AI Stylist ✦"
- Custom order page: "AI mockup in 24h — free"
- About/story section: 3-sentence version of how one studio + AI = 59 designs and counting
- SEO: "AI custom t-shirt design", "AI personalized gifts", "AI apparel mockup" — low
  competition, rising search volume, and you actually do it.

## 2. The three customer-facing features (demoed in the mockup)

1. **Vibe Finder (quiz)** — 3 taps: who's it for → vibe (Filmy/Bangali/Nerdy/Sporty) →
   product type → instant recommendations. **Zero LLM tokens**: it's a static filter over
   your own catalog. Feels like AI, costs nothing, converts like a salesperson.
2. **HubBot chat** — order help, gift finding, custom-order intake. Tiered brain (below).
3. **AI design assist** (custom orders) — customer describes idea in words; AI drafts
   slogan options + layout; human finishes. This is your existing workflow, productized
   as a promise ("no design? no tension").

## 3. Token-cost architecture: the tiered brain

The trick: most interactions never reach an LLM.

```
Tier 0 — UI chips & quiz (zero tokens)
   Quick-reply buttons, quiz filters, size charts, shipping FAQ links.
   ~70% of interactions end here.

Tier 1 — Rules + keyword/fuzzy match (zero tokens)
   Client-side intent matching ("track order", "diwali gift", "bulk") → canned answers
   + product cards from a static JSON. The demo mockup runs entirely at this tier.

Tier 2 — Small model (Claude Haiku / GPT-4o-mini class)
   Only for free-text that rules can't catch. System prompt + full catalog (59 products
   ≈ 6–8k tokens) sent WITH PROMPT CACHING → cached input is ~10× cheaper.
   Cap: max_tokens 300, 10 messages/session, then hand off to WhatsApp.

Tier 3 — Human (WhatsApp button)
   Custom quotes, complaints, anything ambiguous. Positioned as a feature, not a fallback.
```

### Cost math (why this is genuinely cheap)

Assume Claude Haiku-class pricing (~$1 / 1M input, ~$5 / 1M output, cache reads ~$0.1 / 1M):
- One Tier-2 chat ≈ 8k cached input + 1k fresh input + 600 output ≈ **$0.005**
- 1,000 chats/month, if 30% reach Tier 2 → 300 × $0.005 ≈ **$1.50/month**
- AI design assist (text-only slogan/layout drafts): ~$0.01/request; 100/mo ≈ $1
- Image generation only on accepted concepts (human-triggered, not per visitor)

Total AI bill at boutique scale: **under $10/month**. The architecture matters more than
the bill: caps + tiering means a viral day can't produce a surprise invoice.

### Implementation notes

- Catalog JSON is already the site's data layer (`products.json`) — same file feeds the
  quiz, the rules tier, and the Tier-2 system prompt. One source of truth.
- Add `vibe` tags to products (`filmy`, `bangali`, `nerdy`, `sporty`, `family`) — quiz
  and chat both filter on them. ~1 hr of tagging.
- Serverless function (Firebase Functions) proxies the LLM call — API key never in the
  browser; per-IP rate limit; kill switch env var.
- Log Tier-2 questions weekly → promote repeated ones to Tier-1 rules. The bot gets
  cheaper every week.

## 4. Rollout order

1. **Phase A (zero tokens, ship first):** Vibe Finder quiz + rules-only HubBot + AI
   positioning copy (stickers, nav, story section). This is 90% of the perceived value.
2. **Phase B:** Tier-2 LLM behind the same chat UI (Firebase Function + prompt caching).
3. **Phase C:** AI design assist on the custom-order page (slogan/layout drafts) and
   per-product "wear it with" suggestions (batch-generated offline, served statically).

## 5. Honesty guardrail

Because the Tier-0/1 bot isn't an LLM, don't label it "AI chat" until Tier 2 ships —
call it "Instant help" or ship Phase B quickly. The quiz can honestly be marketed as
"smart matching" from day one; "AI Stylist" becomes literally true at Phase B.
