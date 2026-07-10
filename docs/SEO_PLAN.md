# SEO Plan — Ranking for "thecustomhub"

Goal: own the brand query "thecustomhub" (currently losing to mycustomhub) and improve
non-brand discovery. Assets already created: `public/favicon.svg`, `favicon.ico`,
`favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png`.

## Why mycustomhub outranks you today

1. Google has almost no brand signals for "The CustomHub": no Organization structured data,
   no `og:image`, favicon is still the default Vite logo, no Search Console verification,
   no Google Business Profile, few/no backlinks using the brand name.
2. The site is a client-rendered SPA — Google renders it, but weakly-signaled SPAs lose
   brand queries to established sites.
3. "CustomHub" is a crowded term; exact-brand reinforcement everywhere is the fix.

## 1. Recommended metadata (paste into `index.html` `<head>`)

```html
<title>The CustomHub | Custom Desi T-Shirts, Hoodies & Mugs — USA</title>
<meta name="description" content="The CustomHub (thecustomhub.com) — dual-lingo Hindi/Bengali & Bollywood t-shirts, hoodies, mugs and custom bulk apparel for teams & events. Ships across USA & Canada. Local pickup in MA." />

<!-- Icons -->
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

<!-- Open Graph -->
<meta property="og:site_name" content="The CustomHub" />
<meta property="og:title" content="The CustomHub | Custom Desi T-Shirts, Hoodies & Mugs" />
<meta property="og:description" content="Dual-lingo desi apparel + custom bulk orders for teams, festivals & events. USA based." />
<meta property="og:url" content="https://thecustomhub.com/" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://thecustomhub.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="The CustomHub | Custom Desi T-Shirts, Hoodies & Mugs" />
<meta name="twitter:image" content="https://thecustomhub.com/og-image.png" />

<link rel="canonical" href="https://thecustomhub.com/" />
```

Title logic: brand FIRST (exact match for the "thecustomhub" query), then the money keywords.
Keep ≤ 60 chars so it doesn't truncate.

## 2. Structured data (JSON-LD — the single biggest brand-query fix)

`alternateName` teaches Google that "thecustomhub" and "TheCustomHub" = this site.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://thecustomhub.com/#org",
      "name": "The CustomHub",
      "alternateName": ["TheCustomHub", "thecustomhub", "The Custom Hub"],
      "url": "https://thecustomhub.com/",
      "logo": "https://thecustomhub.com/icon-512.png",
      "email": "info@thecustomhub.com",
      "areaServed": ["US", "CA"],
      "sameAs": [
        "<-- your Instagram URL -->",
        "<-- your Facebook URL -->",
        "<-- your Etsy/Amazon/Walmart storefront URLs -->"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://thecustomhub.com/#website",
      "url": "https://thecustomhub.com/",
      "name": "The CustomHub",
      "alternateName": "thecustomhub",
      "publisher": { "@id": "https://thecustomhub.com/#org" }
    }
  ]
}
</script>
```

Fill in every `sameAs` you have — marketplace storefronts and social profiles are exactly
the corroborating signals that beat lookalike domains. (Per brand guidance: describe the
studio as "New England Design Studio", never the city name.)

## 3. Off-page actions (this is what actually flips the brand query)

1. **Google Search Console** — verify thecustomhub.com, submit a sitemap. Generate
   `sitemap.xml` (home, categories, all product URLs) + `robots.txt` pointing to it.
2. **Google Business Profile** — you offer local pickup in MA, so you qualify. A verified
   GBP named "The CustomHub" almost always wins the brand panel. Use the service-area
   business option to avoid publishing the street address.
3. **Bing Webmaster Tools** — 5 minutes, free coverage.
4. **Consistent brand name everywhere** — "The CustomHub" (exact casing) on Amazon seller
   page, Walmart, Instagram bio, Facebook, email signatures — each linking to
   thecustomhub.com.
5. **A few brand backlinks** — local MA business directories, desi community event pages
   (Durga Puja associations you've printed for), sponsor mentions from robotics teams.
   Even 3–5 real links naming "The CustomHub" moves a brand query fast.
6. **Social profiles you don't have yet** — register the handle anyway; dormant profiles
   still corroborate the brand.

## 4. Technical follow-ups (Phase 2)

- Add `og:image` support to `src/components/SEO/index.jsx` (it currently sets og:title/desc
  only) and per-product OG images for product pages.
- Product JSON-LD (`Product` + `Offer` schema) on ProductDetail pages — enables price/stock
  rich results.
- Pre-render or SSG the home + category pages (e.g. vite-plugin-ssr / prerender at build)
  so meta tags exist in the raw HTML instead of being injected client-side.
- 404.html already exists for SPA routing on Firebase — good.

## Expected timeline

Brand queries respond quickly once Organization schema + GBP + Search Console are live:
typically 2–6 weeks to overtake a lookalike for the exact brand term.
