# The CustomHub — Website Design Brief

Planning document only — no code changed. Based on a review of `Header`, `Home`, `HeroCarousel`, `CategoryCard`, `ProductCard`, `Footer`, `tailwind.config.js`, and `products.json`.

## 1. Goal

The site currently reads as a generic, template-driven storefront: emoji standing in for photography, ten similar homepage sections in a row, and two very different customers (diaspora shopper vs. bulk custom-order customer) blended into one undifferentiated scroll. The brand deserves to look like what it is — a boutique, dual-lingo heritage label with real, well-made products. This brief resets the homepage and shared components around that: **real photography, a clearer story, and two distinct paths for your two kinds of customer.**

## 2. Keep as-is

- **Palette** — deep brown / golden tan / sage ("Refined Heritage") is tasteful and on-brand. Don't touch.
- **Type pairing** — Cormorant Garamond (headings) + Work Sans (body) reads editorial and premium. Keep.
- **ProductCard interaction pattern** — hover quick-view, quick-add-to-cart, stock badges. This is a solid, modern e-commerce pattern already. Leave the mechanics; only the surrounding content changes.
- **Testimonials component and trust-signal bar** — right idea, just needs real content (see §6).

## 3. Fix first (small, high-impact, not design work — bugs)

- **Hero shows blank on load.** `heroConfig.primaryImage` depends on an unset env var (`VITE_HERO_IMAGE_URL`), and `HeroCarousel` hard-suppresses all text/CTA on slide 1 whenever there's no image. Visitors likely land on a plain gradient with no headline for ~5 seconds before slide 2 (which has copy) rotates in. This should never ship without a headline.
- **Category icon maps are inconsistent.** `Header.jsx` and `CategoryCard.jsx` each hardcode a different icon lookup (`apparel`, `home-decor`, `t-shirts`, `mugs`...) that doesn't line up with the actual live `type` values (T-Shirts, Coffee and Tea Cups, Sweatshirts, Sports Jerseys). Categories are likely silently falling back to a generic 🎨.

## 4. Replace emoji with real photography

This is the single highest-leverage visual change. Every one of these currently uses an emoji tile instead of a photo, and you already have real lifestyle photography for at least one product (Dhurander tee) proving the concept works:

| Section / Component | Current | Replace with |
|---|---|---|
| Category cards (fallback state) | Emoji (👕🏠👜🎁) | A real flat-lay or on-model photo per category — `CategoryCard` already supports `category.image`, it's just unset |
| "Custom Designs for Every Occasion" (6 tiles) | Emoji (🏆🤖🎤🦃🎉🏢) | Real photos of past custom orders per occasion (team jerseys, family reunion tees, concert group shirts) |
| "Trending Now" (6 tiles) | Emoji (🏈🎤🤖🦃🏀🎭) | Cut this section — it's redundant with "Recent Custom Projects" below it (see §5) |
| "Recent Custom Projects" (6 tiles) | Emoji + gradient | Actual customer photos where you have permission; otherwise styled mockups, never emoji |
| About section icon grid | Emoji (🎨✨🚚💝) | Small line-icon set in brand colors (not emoji) — cheap to produce, immediately reads more premium |

**If real customer photos aren't available yet for every occasion tile**, prioritize shooting/collecting them in this order: your two or three best-selling products in lifestyle settings, then a handful of completed custom/bulk orders (team jerseys, family matching sets) — these double as social proof and hero/category imagery.

## 5. Homepage restructure

Current order runs ten sections deep with real overlap. Proposed structure:

1. **Hero** — fixed headline/CTA (see §3), real image once available
2. **Two clear entry points** (new) — a simple split: "Shop the Collection" (curated Indian/Bollywood pieces) vs. "Start a Custom Order" (teams, events, families). This is the single most important structural change: right now these two funnels are interleaved for ten sections with no differentiation.
3. **Shop by Category** — with real photos (§4)
4. **Featured Products**
5. **Trust bar** — keep, but make claims verifiable where possible (e.g. review count instead of generic checkmarks)
6. **Custom Orders showcase** — merge "Custom Designs for Every Occasion" + "Trending Now" + "Recent Custom Projects" into one section with real photography, not three
7. **Testimonials**
8. **About** — trim to 2–3 sentences + the icon grid; the current version repeats itself and can live mostly on a dedicated About/Contact page instead of the homepage
9. **Newsletter**

This cuts the homepage from ten sections to roughly seven, removes the duplicate occasion/trending/recent-projects content, and gives each of your customer segments (NRI USA, NRI Canada, MA local pickup, general US festival shoppers, English-only techies) a clear path within the first two screens instead of a long undifferentiated scroll.

## 6. Trust & social proof

Verify `Testimonials` is populated with real reviews (name, location, product) rather than placeholder copy. Where you can, swap the generic "✓ Made in USA / ✓ Fast Turnaround" checkmarks for one or two concrete numbers (review count/rating, orders shipped, states/countries served) — specific claims read as more credible than a row of identical checkmarks.

## 7. Smaller polish items

- Product price display: clarify "Starting at $X" vs. a flat price for variant products, so it's unambiguous which is which.
- Canadian NRI customers get no currency/shipping cue anywhere on the site — worth a small shipping-note callout given it's a named customer segment, even if pricing stays USD-only.
- Homepage animation delays (many `animate-fade-in` staggers) are fine in moderation; once real photography replaces emoji tiles, re-check that the page doesn't feel sluggish with large images added on top of the existing stagger animations.

## 8. Suggested phasing

**Phase 1 (this week):** fix the hero blank-slide bug, fix category icon mapping, source/shoot real photography for top categories and 2–3 best custom-order examples.

**Phase 2:** rebuild homepage section order per §5, wire real images into `CategoryCard` and the custom-orders showcase, consolidate the three redundant emoji sections into one.

**Phase 3:** trust-bar copy pass with real numbers, About page trim, price-display clarity, Canada shipping note.

## Next steps

Once photography is sourced (or you tell me to proceed with placeholder/stock imagery in the meantime), I can turn §5 into an actual homepage mockup, and then implement in code section by section.
