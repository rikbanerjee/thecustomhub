#!/usr/bin/env node
/**
 * Track B5 — RetailAgentOS Cloud Run MCP server.
 *
 * Lets a shopping agent (Claude Desktop) discover The CustomHub's catalog,
 * reason about eligibility/price/stock/region via the vendored
 * `@retailagentos/engine`, get a price-locked quote, and hand off to the
 * existing Stripe `createCheckoutSession` Cloud Function to complete a
 * purchase. Runs on Cloud Run (not Firebase Functions) because MCP needs a
 * long-lived HTTP connection for the Streamable HTTP transport.
 *
 * Deployed with `gcloud run deploy --source .` from the REPO ROOT (see
 * ../Dockerfile) so this file can reach ../raos/adapter.js, ../vendor/*.tgz,
 * and ../src/data/products.json directly — no sync step needed, unlike the
 * Firebase Functions deploy (B3/B4), which is confined to its own directory.
 *
 * `now = Date.now()` is read exactly once per tool call, right here at the
 * server boundary, and injected into every engine call — the engine itself
 * must never read the clock (TRACK-B.md locked decision).
 */

const express = require('express');
const { randomUUID } = require('crypto');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { z } = require('zod');
const Stripe = require('stripe');

const {
  evaluateOffer,
  issueQuote,
  validateQuote,
  checkServesRegion,
  buildDecisionTrace,
  renderBuyerTrace,
} = require('@retailagentos/engine');

const { createCustomHubAdapter, createBuyerContextResolver, SERVES_REGIONS } = require('../raos/adapter');

const products = require('../src/data/products.json');
const adapter = createCustomHubAdapter(products);
const resolver = createBuyerContextResolver();
const merchant = adapter.merchantProfile();

const HONOR_POLICY = { onExpiry: 'requote', onStockLoss: 'reject', onContextChange: 'requote' };

// In-memory quote store for this pilot: quoteId -> { token, variant }. A quote
// is only usable for checkout within its TTL (600s) from the same process —
// fine for a single Cloud Run instance demo, not a production quote store.
const issuedQuotes = new Map();

function findVariant(variantId) {
  return adapter.listVariants().find((v) => v.id === variantId) || null;
}

/**
 * Runs the full eligibility -> stock -> price reasoning chain for one line
 * item. Returns either a priced, quotable result or a decline with a
 * structured reason — the caller (an MCP tool) surfaces the decline as a
 * normal tool result, never as a thrown error or a failed checkout attempt.
 */
function reason({ variantId, quantity, region }) {
  const variant = findVariant(variantId);
  if (!variant) {
    return { ok: false, reasonCode: 'UNKNOWN_VARIANT', message: `No product/variant found for id "${variantId}".` };
  }

  const context = resolver.resolve({ region });
  const regionCheck = checkServesRegion(SERVES_REGIONS, context.marketRegion);
  if (regionCheck.status === 'BLOCKED') {
    return {
      ok: false,
      reasonCode: 'REGION_RESTRICTED',
      message: `The CustomHub ships to ${SERVES_REGIONS.join('/')} only — cannot sell to ${context.marketRegion}.`,
      variant,
    };
  }

  const now = Date.now();
  const record = evaluateOffer({ merchant, variant, quantity, context, now });
  const trace = buildDecisionTrace(record);
  const buyerView = renderBuyerTrace(trace);

  // Deliberately NOT using buyerView.canPurchase/trace.isTransactable here —
  // see Open Questions: an out-of-stock reason (OUT_OF_STOCK) is BLOCK
  // severity but carries a `requirements[]` resolution path ("notify me
  // when available"), which the trace's own derivation treats as
  // CONDITIONAL/isTransactable=true/canPurchase=true. `issueQuote` disagrees
  // — it refuses to quote ANY line with a BLOCK-severity reason regardless
  // of resolvability. Trusting the trace here would tell an agent an
  // out-of-stock item is purchasable and then have issue_quote silently
  // fail. Checking raw reason severity directly matches issueQuote's actual
  // gating rule.
  const hasBlockingReason = record.reasons.some((r) => r.severity === 'BLOCK');
  if (hasBlockingReason) {
    return {
      ok: false,
      reasonCode: trace.governingReason ? trace.governingReason.reason.code : 'NOT_PURCHASABLE',
      message: buyerView.headline,
      detail: buyerView.detail,
      variant,
      record,
      now,
    };
  }

  return { ok: true, variant, context, record, trace, buyerView, now };
}

function registerTools(server) {
  server.registerTool(
    'find_product',
    {
      title: 'Find a product',
      description:
        'Search The CustomHub catalog by keyword (title match). Returns variant ids, prices, and stock state — use evaluate_offer for a specific variant + region before recommending a purchase.',
      inputSchema: { query: z.string().describe('Free-text search, e.g. "bengali t-shirt"') },
    },
    async ({ query }) => {
      const q = query.toLowerCase();
      const matches = adapter
        .listVariants()
        .filter((v) => v.title.toLowerCase().includes(q))
        .slice(0, 15)
        .map((v) => ({
          variantId: v.id,
          title: v.title,
          basePrice: v.basePrice,
          currency: v.currency,
          inventoryState: v.inventory?.state ?? 'in_stock',
          callForPrice: v.callForPrice,
        }));
      return { content: [{ type: 'text', text: JSON.stringify(matches, null, 2) }] };
    }
  );

  server.registerTool(
    'evaluate_offer',
    {
      title: 'Evaluate an offer',
      description:
        'Runs eligibility (region), inventory, and pricing reasoning for one variant + quantity + shipping region. Always call this before recommending a purchase — it declines out-of-region or out-of-stock items with a structured reason instead of letting checkout fail later.',
      inputSchema: {
        variantId: z.string(),
        quantity: z.number().int().positive().default(1),
        region: z.string().length(2).describe('ISO 3166-1 alpha-2 shipping country, e.g. "US" or "CA"'),
      },
    },
    async ({ variantId, quantity, region }) => {
      const result = reason({ variantId, quantity, region });
      if (!result.ok) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { purchasable: false, reasonCode: result.reasonCode, message: result.message, detail: result.detail },
                null,
                2
              ),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                purchasable: true,
                unitPrice: result.trace.unitPrice,
                currency: result.variant.currency,
                headline: result.buyerView.headline,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'issue_quote',
    {
      title: 'Issue a price-locked quote',
      description:
        'Evaluates the offer and, if eligible/in-stock/priced, issues a QuoteToken price-locked for 10 minutes. Returns a decline reason (not an error) when the item is out of region or out of stock.',
      inputSchema: {
        variantId: z.string(),
        quantity: z.number().int().positive().default(1),
        region: z.string().length(2),
      },
    },
    async ({ variantId, quantity, region }) => {
      const result = reason({ variantId, quantity, region });
      if (!result.ok) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ quoted: false, reasonCode: result.reasonCode, message: result.message }, null, 2),
            },
          ],
        };
      }

      const token = issueQuote(result.record, HONOR_POLICY, merchant.merchantId, result.variant.id, quantity, result.now);
      if (!token) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { quoted: false, reasonCode: 'UNQUOTABLE', message: 'Offer evaluated eligible but could not be priced into a quote.' },
                null,
                2
              ),
            },
          ],
        };
      }

      issuedQuotes.set(token.quoteId, { token, variant: result.variant, context: result.context });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                quoted: true,
                quoteId: token.quoteId,
                unitPrice: token.unitPrice,
                currency: token.currency,
                quantity: token.quantity,
                expiresInSeconds: token.ttlSeconds,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    'checkout',
    {
      title: 'Complete checkout for a quote',
      description:
        'Validates a previously issued quote (signature, TTL, stock, price agreement) and, if it still holds, creates a Stripe Checkout session via the existing createCheckoutSession Cloud Function. Returns a decline reason instead of attempting checkout when the quote no longer holds.',
      inputSchema: {
        quoteId: z.string(),
        customerEmail: z.string().email().optional(),
      },
    },
    async ({ quoteId, customerEmail }) => {
      const issued = issuedQuotes.get(quoteId);
      if (!issued) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ checkedOut: false, reasonCode: 'UNKNOWN_QUOTE', message: `No quote found for id "${quoteId}" (it may have expired from this server instance).` }, null, 2),
            },
          ],
        };
      }

      const now = Date.now();
      const validation = validateQuote(
        { token: issued.token, context: issued.context, variant: issued.variant, merchant },
        now
      );

      if (validation.outcome !== 'HONORED') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  checkedOut: false,
                  reasonCode: validation.outcome,
                  message: validation.reasons.map((r) => r.message).join(' '),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const session = await createStripeCheckoutSession({
        items: [
          {
            title: issued.variant.title,
            price: issued.token.unitPrice,
            quantity: validation.honoredQuantity ?? issued.token.quantity,
          },
        ],
        customerEmail,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ checkedOut: true, checkoutUrl: session.url }, null, 2),
          },
        ],
      };
    }
  );
}

/**
 * Calls the existing `createCheckoutSession` Firebase callable Cloud
 * Function over its HTTPS callable protocol (POST { data: {...} }) — the
 * same function the React cart already uses, per TRACK-B.md's instruction
 * to hand off to it rather than reimplementing Stripe integration here.
 */
async function createStripeCheckoutSession({ items, customerEmail }) {
  const url =
    process.env.CHECKOUT_FUNCTION_URL ||
    'https://us-central1-thecustomhub-efb8a.cloudfunctions.net/createCheckoutSession';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { items, ...(customerEmail ? { customerEmail } : {}) } }),
  });

  if (!res.ok) {
    throw new Error(`createCheckoutSession failed: ${res.status} ${await res.text()}`);
  }
  const body = await res.json();
  return body.result;
}

function buildServer() {
  const server = new McpServer({ name: 'thecustomhub-raos', version: '0.1.0' });

  server.registerResource(
    'catalog',
    'raos://catalog/variants',
    {
      title: 'Catalog (normalized RAOS variants)',
      description: 'All buyable variants, normalized to the RAOS canonical shape via CustomHubAdapter.listVariants().',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(adapter.listVariants(), null, 2) }],
    })
  );

  registerTools(server);
  return server;
}

const app = express();
app.use(express.json());

// One transport (and MCP server instance) per client session, keyed by the
// Streamable HTTP session id header the SDK assigns on `initialize`. Without
// this, every POST (initialize, then each subsequent tool call) would spin
// up an unrelated transport and the client's follow-up calls would fail with
// "Server not initialized".
const sessions = new Map();

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  let transport = sessionId && sessions.get(sessionId);

  if (!transport) {
    const server = buildServer();
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => sessions.set(id, transport),
    });
    // Clean up on the SESSION's close (client disconnects / calls DELETE),
    // not on this individual HTTP response's close — the streamable
    // transport serves many request/response cycles per session, and each
    // one's res emits 'close' when it finishes, well before the session ends.
    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
    await server.connect(transport);
  }

  await transport.handleRequest(req, res, req.body);
});

app.get('/healthz', (req, res) => res.status(200).send('ok'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`RetailAgentOS MCP server listening on :${port}`);
});
