# Design Revamp Plan — "Desi Pop × Zine" (Hybrid A+B)

Planning document only. No code changes yet. Companion visual: `mockups/homepage-hybrid-mockup.html`.

## 1. Diagnosis (current site)

- Emoji tiles instead of product imagery across categories, trust badges, project gallery, trending.
- "Refined Heritage" brown/tan/sage palette reads artisan-boutique, not Bollywood-pop.
- Brand voice (dual-lingo puns) absent from all UI copy — the wit lives only on the shirts.
- Homepage = 10 equal-weight stacked sections; nothing has hierarchy.
- Auto-rotating hero carousel (low engagement past slide 1; slide 1 currently hides its own text).
- One funnel for two distinct audiences (NRI/desi vs US events/techies).
- Navigation by garment type (T-Shirts, Mugs…) instead of intent (occasion, festival, vibe).

## 2. Theme: Desi Pop base + Zine typography

Bollywood-poster color and playfulness, delivered through giant kinetic typography for hero
and campaign moments. Product photos/mockups do the visual heavy lifting; the chrome around
them is loud but structured.

### Color tokens (proposed Tailwind names)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1A1423` | Text, zine-style type blocks, footer |
| `cream` | `#FFF6E9` | Page background (replaces white/gray-50) |
| `rani` | `#D81E5B` | Primary CTA, accents, sale badges |
| `marigold` | `#FFB627` | Secondary accent, highlights, sticker badges |
| `peacock` | `#0F7173` | Links, secondary buttons, techie-collection accent |
| `chai` | `#C9A67C` | Kept from current palette for continuity (borders, subtle fills) |

Rule: cream background + ink text as the calm base; rani/marigold/peacock only for emphasis.
The base stays 80% neutral so the color moments actually pop.

### Typography

- **Display**: a bold condensed grotesque or poster face (e.g., Anton, Archivo Black, or
  Bricolage Grotesque) — used HUGE for hero headlines, section titles, campaign banners.
- **Body**: keep Work Sans.
- Cormorant Garamond retires (or survives only in "heritage" product descriptions).
- Hinglish/Benglish headline words get the display face + a color word-swap
  ("Wear your **filmy** side").

### Texture & ornament

- Sticker/badge system: rotated pill badges — "100% Filmy", "Paisa Vasool", "Nerd Approved",
  "Local Pickup MA". Reusable component, replaces trust-badge checkmarks.
- Halftone dots / risograph grain as section-divider texture (SVG, not images).
- Marquee strips (scrolling text ribbons) between major sections: mixed-language phrases.
- Block-print/paisley motifs allowed only as faint background texture, never foreground.

## 3. Voice: UI copy in brand voice

| Moment | Current | Proposed |
|---|---|---|
| Add to cart toast | — | "Arre wah! In the bag." |
| Empty cart | generic | "Bilkul khaali. Let's fix that." |
| 404 | generic | "Yeh rasta band hai. Back to shopping →" |
| Newsletter | "Stay Updated" | "Thoda gossip, thoda discount." |
| Search empty | generic | "Kuch nahi mila… try 'Diwali' or 'chai'?" |
| Order success | generic | "Ho gaya! Your order is in." |

Keep every Hinglish phrase glossed by context or a subtle English echo so English-only
customers are never lost.

## 4. Information architecture

### Homepage — compress 10 sections to 5

1. **Split hero** (no carousel): giant rotating headline (JS word-swap, not slide-swap) +
   featured product photo. Two paths: "Shop Desi Collection" / "Custom for Your Crew".
2. **Shop by occasion** (photo tiles, festival-aware): Diwali, Durga Puja, Rakhi, Concerts,
   Team/Events, Tech & Office, Gifts. A countdown banner auto-surfaces the nearest festival.
3. **Bestsellers** — real product photos, quick-view kept.
4. **Custom orders story** — ONE strong block with 2–3 real project photos + bulk/no-minimum
   badges (absorbs current trust badges, trending tiles, and project gallery).
5. **Social proof + newsletter** — testimonials condensed to a quote strip.

### Navigation

- Primary: Shop by Occasion ▾ | Desi Collection | Custom Orders | Gifts
- Garment type (T-Shirts/Mugs/Sweatshirts/Jerseys) becomes a filter, not the nav.
  (Note: current nav is auto-derived from `type` in products.json — occasion nav will need a
  tag-driven mapping, e.g. derive from `tags` like `diwali`, `techie`, `concert`.)
- Audience split honored throughout: "Desi at heart" vs "Here for custom gear" entry points.

### New engagement features (later phases)

- **Gift finder quiz** — 3 questions → filtered results. High value for NRI gift buyers.
- **Festival calendar page** — SEO play: "Diwali 2026 gift ideas", order-by deadlines.
- **Design-language toggle Easter egg** — headline flips Hindi↔Bengali↔English on click.

## 5. Photography requirements (blocker for everything)

The theme cannot land on emoji tiles. Minimum asset list:

- Flat-lay or on-model photo for every product in `products.json` (already have Firebase images — audit for quality/consistency; reshoot heroes on cream background).
- 3–5 lifestyle shots (group in custom tees, festival setting, mug + chai).
- 4–6 real custom-project photos with customer permission (replaces emoji gallery).
- Consistent mockup template (same tee color/angle) for design-only listings.

## 6. Phased roadmap

**Phase 1 — Skin (1–2 weeks of effort)**
Tailwind token swap (colors + display font), button/badge components, kill carousel → static
split hero with word-swap headline, replace emoji tiles with photos, homepage compression.

**Phase 2 — Voice & merchandising**
Brand-voice microcopy pass (toasts, empty states, 404), occasion-based nav via tags,
festival countdown banner, sticker-badge system rollout, marquee ribbons.

**Phase 3 — Engagement**
Gift finder quiz, festival calendar/SEO pages, audience-split personalization,
language-toggle Easter egg, Instagram feed integration.

**Guardrails**
- No change to products.json schema, marketplace pipelines, or MCP server.
- Ship Phase 1 behind a branch; A/B eyeball against current site before deploy.
- Every Hinglish phrase must degrade gracefully for English-only visitors.
- Keep Lighthouse ≥ current scores; display font subset + `font-display: swap`.
