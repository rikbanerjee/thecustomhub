/**
 * HubBot rules engine — Tier 0/1 only (see docs/AI_FIRST_PLAN.md).
 *
 * Zero network calls, zero LLM tokens: keyword/intent matching against the
 * real product catalog (via dataHelpers), returning a canned response plus
 * an optional list of matching products. Anything that falls through to
 * `fallback` gets pointed at WhatsApp — Tier 3, the human.
 *
 * Each rule is tried in order; the first whose `test(query)` returns true
 * wins. Keep more specific rules (e.g. "sister" gift) above general ones
 * (e.g. generic "gift") so they don't get shadowed.
 */
import {
  getAllProducts,
  getProductsByVibe,
  getProductsByCategory,
} from '../utils/dataHelpers';

const includesAny = (haystack, words) => words.some((w) => haystack.includes(w));

/**
 * @typedef {Object} HubBotReply
 * @property {string} text - the bot's message (may include simple inline HTML links)
 * @property {Array} [products] - up to 3 normalized products to show as mini-cards
 */

/** @returns {HubBotReply} */
const rules = [
  {
    name: 'gift-sister',
    test: (q) => includesAny(q, ['gift']) && includesAny(q, ['sister', 'behen', 'didi']),
    reply: () => ({
      text: 'For a sister? Say no more — the chugli specialist:',
      products: getAllProducts()
        .filter((p) => p.title.includes('Behen'))
        .slice(0, 3),
    }),
  },
  {
    name: 'gift-dad',
    test: (q) => includesAny(q, ['gift']) && includesAny(q, ['dad', 'father', 'baba', 'papa']),
    reply: () => ({
      text: 'Dad gifts are our specialty. Crowd favorites:',
      products: getAllProducts()
        .filter((p) => /dad|g\.o\.a\.t/i.test(p.title))
        .slice(0, 3),
    }),
  },
  {
    name: 'gift-mug',
    test: (q) => includesAny(q, ['gift']) && includesAny(q, ['mug', 'cup']),
    reply: () => ({
      text: 'Gift mugs, coming up:',
      products: getProductsByCategory('coffee-and-tea-cups').slice(0, 3),
    }),
  },
  {
    name: 'gift-general',
    test: (q) => includesAny(q, ['gift']),
    reply: () => ({
      text: "Love it. Who's it for — or tap a vibe in the Vibe Finder and I'll match from the full catalog. Meanwhile, safe bets:",
      products: getAllProducts().slice(0, 3),
    }),
  },
  {
    name: 'bulk-crew',
    test: (q) => includesAny(q, ['bulk', 'team', 'group', 'crew', 'office', 'event']),
    reply: () => ({
      text: "Bulk is our thing — mixed sizes, one design, group discounts at 10+. The bulk builder takes 2 minutes: <a href='/custom-orders' style='color:var(--color-rani);font-weight:700'>Start a custom order →</a> Free mockup in 24h before you pay anything.",
    }),
  },
  {
    name: 'festival',
    test: (q) => includesAny(q, ['diwali', 'festival', 'puja', 'holi', 'rakhi']),
    reply: () => ({
      text: 'Festival drop favorites — Durga Maa for the culture, Dil Se for the gifting:',
      products: getProductsByVibe('bangali').slice(0, 3),
    }),
  },
  {
    name: 'sizing',
    test: (q) => includesAny(q, ['size', 'fit', 'measurement']),
    reply: () => ({
      text: 'Apparel runs S–3XL (true to size, unisex). Onesies 0–24M. Mugs: 11oz & 15oz. Between sizes? Size up for the classic streetwear fit.',
    }),
  },
  {
    name: 'shipping',
    test: (q) => includesAny(q, ['ship', 'delivery', 'how long', 'arrive']),
    reply: () => ({
      text: 'Ready designs ship in 3–5 business days across USA & Canada. Custom orders: 2–3 weeks. In MA? Local pickup is free.',
    }),
  },
  {
    name: 'order-status',
    test: (q) => includesAny(q, ['track', 'order status', 'where is my']),
    reply: () => ({
      text: 'Check your confirmation email for the tracking link — or ping us on WhatsApp with your order number and a human will chase it down.',
    }),
  },
  {
    name: 'returns',
    test: (q) => includesAny(q, ['return', 'refund', 'exchange']),
    reply: () => ({
      text: "Wrong size? Unworn items exchange free within 30 days. Custom pieces are made-for-you so they're final sale — that's why we send a free mockup first.",
    }),
  },
  {
    name: 'mug-general',
    test: (q) => includesAny(q, ['mug', 'cup', 'chai']),
    reply: () => ({
      text: 'Mug lineup, fresh from the kiln:',
      products: getProductsByCategory('coffee-and-tea-cups').slice(0, 3),
    }),
  },
  {
    name: 'funny',
    test: (q) => includesAny(q, ['funny', 'pun', 'joke']),
    reply: () => ({
      text: 'Certified pun-heavy picks:',
      products: getAllProducts()
        .filter((p) => Array.isArray(p.tags) && p.tags.some((t) => /funny|humor/i.test(t)))
        .slice(0, 3),
    }),
  },
  {
    name: 'bangali',
    test: (q) => includesAny(q, ['bengali', 'bangla', 'kolkata']),
    reply: () => ({
      text: 'Bangali corner ❤️ :',
      products: getProductsByVibe('bangali').slice(0, 3),
    }),
  },
  {
    name: 'filmy',
    test: (q) => includesAny(q, ['bollywood', 'filmy', 'movie', 'hindi']),
    reply: () => ({
      text: 'Full filmy mode:',
      products: getProductsByVibe('filmy').slice(0, 3),
    }),
  },
  {
    name: 'sporty',
    test: (q) => includesAny(q, ['cricket', 'jersey', 'sport']),
    reply: () => ({
      text: 'Game day gear:',
      products: getProductsByVibe('sporty').slice(0, 3),
    }),
  },
  {
    name: 'human',
    test: (q) => includesAny(q, ['human', 'person', 'call', 'whatsapp']),
    reply: () => ({
      text: 'Tap the WhatsApp button (bottom-right) — a real human replies, usually within the hour. Chai break permitting.',
    }),
  },
];

const fallback = {
  text: "Good question — that one's beyond my quick answers, so I'd hand it to the team on WhatsApp (real humans, fast replies). Or try: <i>'gift for dad'</i>, <i>'Diwali picks'</i>, <i>'bulk order'</i>, <i>'sizes'</i>.",
};

/**
 * @param {string} query - raw user text
 * @returns {HubBotReply}
 */
export const getHubBotReply = (query) => {
  const q = (query || '').toLowerCase();
  const matched = rules.find((rule) => rule.test(q));
  return matched ? matched.reply(q) : fallback;
};

export default rules;
