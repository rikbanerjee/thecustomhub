/**
 * `find_product` — resolves a fuzzy, spoken-style reference ("the heart mug")
 * to a product id. This is the riskiest-assumption tool in the v0 plan: every
 * other tool that takes an `id` should be called only after this resolves it,
 * so Claude never guesses an id from memory of the conversation.
 *
 * Scoring is a hand-rolled token/substring match (same spirit as the
 * relevance scoring in src/utils/dataHelpers.js#searchProducts), reimplemented
 * standalone so the MCP server has no import-time dependency on browser-facing
 * code (dataHelpers.js pulls in imageHelpers/firebase config).
 */

// A 59-product catalog of mugs/tees/sweatshirts shares a lot of generic
// vocabulary ("mug", "dad", "tee", "the"). Plain substring/token-count
// scoring lets those generic words drown out the one distinctive word that
// actually identifies the product ("dhurander", "biriyani", "superman").
// Fix: weight each matched token by how RARE it is across the catalog's
// titles — rare tokens (appear in 1-2 products) score high, common tokens
// (appear in 10+) score near zero. This is a simple IDF, recomputed per
// call since 59 products is cheap and the catalog can change between calls.
const STOPWORDS = new Set(['the', 'a', 'an', 'for', 'with', 'and', 'of', 'in', 'on', 'my']);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    // Collapse single-letter-dot-separated acronyms ("G.O.A.T.") into one
    // word before the generic split, so they tokenize as "goat" rather than
    // four single letters that get filtered out by the length>2 rule.
    .replace(/\b(?:[a-z]\.){2,}/g, (m) => m.replace(/\./g, ''))
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function buildDocFrequency(products) {
  const freq = new Map();
  for (const product of products) {
    const tokens = new Set(tokenize(product.title));
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  }
  return freq;
}

function tokenWeight(token, docFreq, totalDocs) {
  const freq = docFreq.get(token) || 1;
  return Math.log((totalDocs + 1) / freq) + 1; // rare token -> high weight; common -> approaches 1
}

function score(product, queryTokens, docFreq, totalDocs) {
  const id = (product.id || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  const titleTokens = new Set(tokenize(product.title));
  // The id (slug) is sometimes the more reliable identifier than the title —
  // at least one product in the catalog has a title/id spelling mismatch
  // ("Dhurandhar" in the title vs "dhurander" in the id), so a query matching
  // the slug's words should count even when the title alone wouldn't.
  const idTokens = new Set(tokenize(id.replace(/-/g, ' ')));
  const tags = (product.tags || []).map((t) => t.toLowerCase());

  let s = 0;

  // Exact/whole-string matches are unambiguous signals regardless of word rarity.
  if (id === queryTokens.joined) s += 100;
  if (title === queryTokens.joined) s += 90;

  for (const qt of queryTokens.tokens) {
    if (titleTokens.has(qt) || idTokens.has(qt)) {
      s += tokenWeight(qt, docFreq, totalDocs) * 10;
    } else if (title.includes(qt) || id.includes(qt)) {
      s += tokenWeight(qt, docFreq, totalDocs) * 4; // partial/substring match, weaker signal
    }
    if (tags.some((t) => t === qt)) s += 6;
  }

  return s;
}

/**
 * @param {Array<object>} products
 * @param {string} query
 * @returns {{match: object} | {ambiguous: true, candidates: object[]} | {found: false}}
 */
export function findProduct(products, query) {
  const joined = query.toLowerCase().trim();
  if (!joined) return { found: false };

  const tokens = tokenize(joined);
  const docFreq = buildDocFrequency(products);
  const queryTokens = { tokens, joined };

  const scored = products
    .map((product) => ({ product, score: score(product, queryTokens, docFreq, products.length) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { found: false };

  // An exact id match is unambiguous by definition, even if a near-duplicate
  // product (e.g. a "-copy" of an existing listing) scores close behind it.
  const exactIdHit = scored.find((s) => s.product.id.toLowerCase() === joined);
  if (exactIdHit) return { match: exactIdHit.product };

  const top = scored[0];
  const runnerUp = scored[1];

  // Confident single match: no runner-up, or the top leads by a wide enough
  // relative margin. A flat 2x ratio was too strict once rare distinctive
  // words got most of the weight — a 25% relative gap is plenty to trust
  // when the top score is also clearly above a noise floor.
  const isConfident = !runnerUp || (top.score - runnerUp.score) / top.score >= 0.25;

  if (isConfident) {
    return { match: top.product };
  }

  return {
    ambiguous: true,
    candidates: scored.slice(0, 5).map((s) => ({ id: s.product.id, title: s.product.title, score: s.score })),
  };
}
