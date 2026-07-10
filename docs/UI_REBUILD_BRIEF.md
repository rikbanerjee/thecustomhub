# UI Rebuild Brief — "Desi Pop × Zine" Theme

Instructions for the coding agent. Read fully before writing code.

## Mission

Rebuild the site's UI to match the approved mockups, keeping all data flow, routing, and
marketplace tooling untouched. The mockups are the design source of truth:

- `mockups/homepage-hybrid-mockup.html` — homepage: compact hero, rotating category cards,
  custom-order form section, marquee, stickers, footer
- `mockups/custom-order-page-mockup.html` — custom orders: product picker → color → bulk
  size-row builder → placement-aware uploads → summary bar
- `mockups/ai-stylist-mockup.html` — AI Stylist page: Vibe Finder quiz + rules-based HubBot
- `mockups/hero-desi-pop.svg` / `.png` — hero art reference
- `docs/DESIGN_REVAMP_PLAN.md` — design rationale, palette, voice
- `docs/AI_FIRST_PLAN.md` — AI stylist architecture (build Tier 0/1 only; NO LLM calls)
- `docs/SEO_PLAN.md` — metadata, icons, JSON-LD (icons already exist in `public/`)

## Hard constraints (violating any of these = failed task)

1. Do NOT modify: `products.json` product entries' existing fields, `src/amazon/**`,
   `scripts/**`, `mcp-server/**`, `docs/walmart/**`, `walmart_template.xlsx`, any feed
   generation logic. ADDING a new optional field to products (e.g. `vibe` tags) is allowed.
2. Do NOT remove or rename existing routes. New routes are additive (`/ai-stylist`).
3. `src/utils/dataHelpers.js` stays the single data access layer — extend it, don't bypass it.
4. Never mention the city name "Westborough" anywhere. Brand locale = "New England Design
   Studio"; local pickup = "MA".
5. Keep Firebase image URL handling exactly as-is (`imageHelpers.js`).
6. After EVERY phase: `npm run lint` and `npm run build` must pass before starting the next.
7. Work on a branch: `feat/desi-pop-theme`. Commit per phase with descriptive messages.
8. Do not deploy. Leave `npm run deploy` to the owner.

## Design tokens (replace current Tailwind theme values)

```js
// tailwind.config.js — new palette
colors: {
  ink:      '#1A1423',
  cream:    '#FFF6E9',
  rani:     '#D81E5B',   // primary CTA / accents
  marigold: '#FFB627',   // secondary accent / stickers
  peacock:  '#0F7173',   // links / secondary buttons
  chai:     '#C9A67C',   // kept from old palette, borders/subtle fills
}
// fonts
heading: ['Anton', 'sans-serif'],      // replaces Cormorant Garamond
body:    ['Work Sans', 'sans-serif'],  // unchanged
```

CRITICAL font gotcha: Anton ships ONE weight (400). Every heading using it MUST set
`font-weight: 400` and `font-synthesis: none`, or browsers render ugly faux-bold.
Bake this into a `.display`-equivalent utility/component, not per-usage.

Style signature (see mockups for exact treatment): 3px ink borders, hard offset shadows
(no blur), rotated pill "sticker" badges, cream background with subtle halftone,
marquee ribbon, sunburst accents. Keep base 80% neutral — rani/marigold only for emphasis.

Update `index.html`: swap the Google Fonts link to Anton + Work Sans, apply the SEO_PLAN.md
head block (icons exist in `public/`; use `favicon.svg` + `favicon.ico`), add the JSON-LD
(leave `sameAs` placeholder array with a TODO comment).

## Phases

### Phase 1 — Theme foundation
- Tailwind token swap, font swap, `.display` heading treatment, new button/badge/sticker
  components (`src/components/ui/` — Button, Sticker, SectionHeading).
- Global microcopy voice pass comes later; don't rewrite copy in this phase.

### Phase 2 — Homepage (match `homepage-hybrid-mockup.html`)
- Kill `HeroCarousel` usage on Home (keep the component file; just stop using it).
- New compact split hero: word-swap headline (rotating word: Filmy/Desi/Nerdy/Bangali/
  Jugaadu/Squad — React state, fade transition, respect `prefers-reduced-motion`),
  product photo card, sticker badges, two CTAs.
- Marquee ribbon component (CSS animation, pausable, reduced-motion aware).
- "Shop by category" cards: derive categories from `dataHelpers.getAllCategories()` as
  today; each card rotates through the first image of up to 4 in-stock products of that
  type (staggered intervals, dot indicators, count sticker, hover arrow — replicate
  mockup behavior). Lazy-load images.
- Custom-order form section (EmailJS wiring identical to existing Contact form pattern,
  reuse `emailjs.config.js`).
- Compress homepage to mockup's section order: hero → countdown/categories → bestsellers
  (existing `getFeaturedProducts`) → custom-order story block → quotes → form → footer.
  Delete the emoji-tile sections (trust badges, trending, inspiration gallery, about grid)
  — their content is absorbed per the mockup.
- Festival countdown banner: config-driven (`src/config/festivals.js` with name + date +
  link), shows nearest upcoming festival, hides if none within 60 days.

### Phase 3 — Custom Orders page (match `custom-order-page-mockup.html`)
- Rebuild `/custom-orders` with the stepper flow: product cards (T-Shirt, Sweatshirt,
  Cup/Mug, Onesie) → color swatches + size-row bulk builder (duplicate/remove rows, live
  tally vs total) → placement dropdown (front/back/both → dual labeled uploads with
  preview) → notes/contact → live summary bar.
- Submission: EmailJS (same service), serialize the full order state into the message.
  File uploads: EmailJS can't take files — upload images to Firebase Storage under
  `custom-uploads/{timestamp}/` and include the URLs in the email. If Storage write rules
  block anonymous uploads, fall back to "attach via WhatsApp" messaging and note it in
  the PR description.
- Mug flow skips color + placement (11oz/15oz sizes). Onesie sizes: 0–3M…18–24M.

### Phase 4 — AI Stylist page (match `ai-stylist-mockup.html`)
- New route `/ai-stylist`, added to nav as "AI Stylist ✦".
- Add optional `vibe: []` tags to products in `products.json` (values: filmy, bangali,
  nerdy, sporty, family). Tag all 59 — infer from title/tags/description; when unsure,
  choose the closest single tag. This is data addition, not schema change.
- Vibe Finder quiz + HubBot rules engine ported to React. Rules live in
  `src/data/hubbot-rules.js` (intent keywords → response + optional product filter).
  NO network calls, NO LLM. Product cards link to real `/product/:id` routes.
- "Crew" answers route to `/custom-orders`.

### Phase 5 — Voice & polish
- Microcopy pass per DESIGN_REVAMP_PLAN.md §3 (cart toast, empty states, 404, newsletter,
  search empty, order success). Every Hinglish phrase needs an English echo nearby.
- SEO component: add `og:image` support (default `/og-image.png`), per-page titles per
  SEO_PLAN.md.
- Verify: Lighthouse (performance + a11y ≥ current baseline), keyboard nav on quiz/chat/
  order stepper, alt text everywhere, focus states (marigold outline per mockups).

## Verification checklist (run at the end, report results)

- [ ] `npm run lint` clean
- [ ] `npm run build` clean
- [ ] All original routes render (/, /category/t-shirts, /product/<any-id>, /contact,
      /custom-orders, /search, /cart) + new /ai-stylist
- [ ] Category counts on homepage match `products.json` type counts
- [ ] No "Westborough" anywhere in the diff (`git grep -i westborough`)
- [ ] No occurrence of Cormorant Garamond remains
- [ ] Headings render Anton at weight 400 (inspect one in the browser)
- [ ] `npm run amazon:test` still passes (proves product data untouched)
