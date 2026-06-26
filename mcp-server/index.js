#!/usr/bin/env node
/**
 * Catalog & inventory MCP server for The CustomHub. Wraps src/data/products.json
 * with read-only resources/tools (this file, step 2) and write tools routed
 * through lib/store.js#applyChange (step 3, not yet added).
 *
 * See docs/CATALOG_MCP_V0_IMPLEMENTATION_PLAN.md for the full design.
 */
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadProducts, findById, applyChange, previewChange } from './lib/store.js';
import { findProduct } from './lib/resolve.js';
import { summarizeStock, getRealVariants, findVariant, variantLabel } from './lib/inventory.js';

const server = new McpServer({
  name: 'tch-catalog',
  version: '0.1.0',
});

// ---------------------------------------------------------------------------
// Resources (read-only, cheap — raw products.json records, not the
// React-normalized shape components consume)
// ---------------------------------------------------------------------------

server.registerResource(
  'all-products',
  'catalog://products',
  {
    title: 'All products',
    description: 'The full raw products.json catalog array (59 products as of v0).',
    mimeType: 'application/json',
  },
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(loadProducts(), null, 2) }],
  })
);

server.registerResource(
  'product-by-id',
  new ResourceTemplate('catalog://product/{id}', { list: undefined }),
  {
    title: 'Single product',
    description: 'One raw product record by exact id. Use find_product first if you only have a natural-language description.',
    mimeType: 'application/json',
  },
  async (uri, { id }) => {
    const product = findById(loadProducts(), id);
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: product ? JSON.stringify(product, null, 2) : JSON.stringify({ found: false, id }),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Read-only tools
// ---------------------------------------------------------------------------

server.registerTool(
  'find_product',
  {
    title: 'Find product',
    description:
      'Resolve a natural-language reference to a product (e.g. "the heart mug", "dhurander tee") to its exact catalog id. ' +
      'ALWAYS call this before any tool that takes a product id, unless you already have the exact id from a prior find_product/get_product/list_low_stock call in this conversation — never guess an id from memory of a title. ' +
      'Returns either a single confident match, a list of ambiguous candidates to disambiguate with the user, or found:false.',
    inputSchema: { query: z.string().min(1).describe('Natural-language product description, e.g. "the dhurander tee"') },
  },
  async ({ query }) => {
    const result = findProduct(loadProducts(), query);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  'get_product',
  {
    title: 'Get product',
    description: 'Fetch one product by its exact catalog id, including its computed stock summary (mode + numbers).',
    inputSchema: { id: z.string().min(1).describe('Exact product id, e.g. from find_product') },
  },
  async ({ id }) => {
    const product = findById(loadProducts(), id);
    if (!product) {
      return { content: [{ type: 'text', text: JSON.stringify({ found: false, id }) }] };
    }
    const stock = summarizeStock(product);
    return { content: [{ type: 'text', text: JSON.stringify({ ...product, _stock: stock }, null, 2) }] };
  }
);

server.registerTool(
  'list_low_stock',
  {
    title: 'List low-stock products',
    description:
      'List products that are low on or out of stock. Products tracked with a numeric stock (top-level `stock` or a single real variant) ' +
      'appear in belowThreshold when their count is under the threshold. Products with no numeric stock data can only ever appear in ' +
      'outOfStock (when inStock is false) — this tool cannot threshold what it has no number for, and says so rather than guessing.',
    inputSchema: { threshold: z.number().int().nonnegative().default(5).describe('Numeric stock threshold, default 5') },
  },
  async ({ threshold }) => {
    const products = loadProducts();
    const belowThreshold = [];
    const outOfStock = [];
    const untracked = [];

    for (const product of products) {
      const stock = summarizeStock(product);
      const numeric = stock.mode === 'simple' || stock.mode === 'single-variant' ? stock.value : null;

      if (numeric != null && numeric < threshold) {
        belowThreshold.push({ id: product.id, title: product.title, stock: numeric });
      } else if (product.inStock === false) {
        outOfStock.push({ id: product.id, title: product.title, hadNumericStock: numeric != null });
      } else if (stock.mode === 'boolean-only' || stock.mode === 'multi-variant') {
        untracked.push(product.id);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              threshold,
              belowThreshold,
              outOfStock,
              note: `${untracked.length} in-stock products have no single numeric stock count to threshold (multi-variant or boolean-only) and are omitted from belowThreshold.`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Write tools — every one routes through store.js#applyChange (commit) or
// #previewChange (confirm=false), never write products.json directly.
//
// Two-phase shape: call without confirm -> preview; call again with
// confirm:true -> it applies. Tool descriptions tell Claude to always show
// the preview diff to the user and only pass confirm:true after the user
// has explicitly agreed — MCP has no native human-in-the-loop step, so this
// is enforced by instruction, not by the protocol.
// ---------------------------------------------------------------------------

const PREVIEW_NOTE = 'This is a preview only — nothing was written. Show this diff to the user, and only call again with confirm: true after they explicitly agree.';

function buildInventoryMutation({ inStock, stock, adjustBy, variantSku }) {
  if (variantSku && inStock !== undefined) {
    throw new Error('variantSku targets a specific variant\'s quantity; it cannot be combined with inStock, which is a product-level field.');
  }

  return (product) => {
    if (variantSku) {
      const variant = findVariant(product, variantSku);
      if (!variant) {
        const known = getRealVariants(product).map(variantLabel).join(', ') || '(no variants)';
        throw new Error(`No variant matching "${variantSku}" on this product. Known variants: ${known}`);
      }
      if (stock !== undefined) variant.inventoryQty = stock;
      if (adjustBy !== undefined) variant.inventoryQty = Math.max(0, (variant.inventoryQty ?? 0) + adjustBy);
      return;
    }

    if (inStock !== undefined) product.inStock = inStock;
    if (stock !== undefined) product.stock = stock;
    if (adjustBy !== undefined) product.stock = Math.max(0, (product.stock ?? 0) + adjustBy);
  };
}

server.registerTool(
  'update_inventory',
  {
    title: 'Update inventory',
    description:
      'Update a product\'s stock count or in-stock flag. Always resolve the id with find_product first if you only have a description. ' +
      'Provide exactly one of inStock, stock, or adjustBy (e.g. adjustBy: -5 for "sold 5"). ' +
      'If the product has multiple variants (sizes/colors), pass variantSku to target one specific variant\'s quantity instead of a product-level field — call get_product first to see variant SKUs/labels. ' +
      'Call WITHOUT confirm first to see a diff preview, show it to the user, and only call again with confirm: true after they explicitly approve it.',
    inputSchema: {
      id: z.string().min(1),
      inStock: z.boolean().optional(),
      stock: z.number().int().nonnegative().optional(),
      adjustBy: z.number().int().optional(),
      variantSku: z.string().optional().describe('SKU or variant label (e.g. "Black / M") to target a specific variant instead of the product-level field'),
      confirm: z.boolean().optional().default(false),
    },
  },
  async ({ id, inStock, stock, adjustBy, variantSku, confirm }) => {
    const fieldsGiven = [inStock !== undefined, stock !== undefined, adjustBy !== undefined].filter(Boolean).length;
    if (fieldsGiven !== 1) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: 'Provide exactly one of inStock, stock, or adjustBy — not zero, not multiple.' }) }],
        isError: true,
      };
    }

    try {
      const mutate = buildInventoryMutation({ inStock, stock, adjustBy, variantSku });
      if (!confirm) {
        const result = previewChange({ id, mutate });
        return { content: [{ type: 'text', text: JSON.stringify({ preview: true, diff: result.diff, note: PREVIEW_NOTE }, null, 2) }] };
      }
      const result = applyChange({ id, mutate, tool: 'update_inventory', summary: `inStock=${inStock} stock=${stock} adjustBy=${adjustBy} variantSku=${variantSku ?? ''}` });
      return { content: [{ type: 'text', text: JSON.stringify({ applied: true, diff: result.diff, snapshotPath: result.snapshotPath }, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

server.registerTool(
  'set_channel_status',
  {
    title: 'Set channel status',
    description:
      'Turn a sales channel on or off for a product. channel "amazon"/"walmart" sets marketplace.<channel> to active/inactive; channel "site" sets inStock ' +
      '(the live site has no separate marketplace.site field — inStock IS the site\'s channel toggle). ' +
      'Call WITHOUT confirm first to see a diff preview, show it to the user, and only call again with confirm: true after they explicitly approve it.',
    inputSchema: {
      id: z.string().min(1),
      channel: z.enum(['amazon', 'walmart', 'site']),
      active: z.boolean(),
      confirm: z.boolean().optional().default(false),
    },
  },
  async ({ id, channel, active, confirm }) => {
    const mutate = (product) => {
      if (channel === 'site') {
        product.inStock = active;
        return;
      }
      product.marketplace = product.marketplace || {};
      product.marketplace[channel] = active ? 'active' : 'inactive';
    };

    try {
      if (!confirm) {
        const result = previewChange({ id, mutate });
        return { content: [{ type: 'text', text: JSON.stringify({ preview: true, diff: result.diff, note: PREVIEW_NOTE }, null, 2) }] };
      }
      const result = applyChange({ id, mutate, tool: 'set_channel_status', summary: `${channel} -> ${active ? 'active' : 'inactive'}` });
      return { content: [{ type: 'text', text: JSON.stringify({ applied: true, diff: result.diff, snapshotPath: result.snapshotPath }, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

server.registerTool(
  'discontinue_product',
  {
    title: 'Discontinue product',
    description:
      'Take a product off sale everywhere: sets inStock to false, and marketplace.amazon/marketplace.walmart to "inactive" for any channel keys that already ' +
      'exist on the product (never adds a marketplace block that was not already there). Never deletes the record — fully reversible by hand from the snapshot this write creates, or by re-running set_channel_status/update_inventory. ' +
      'Call WITHOUT confirm first to see a diff preview, show it to the user, and only call again with confirm: true after they explicitly approve it.',
    inputSchema: {
      id: z.string().min(1),
      confirm: z.boolean().optional().default(false),
    },
  },
  async ({ id, confirm }) => {
    const mutate = (product) => {
      product.inStock = false;
      if (product.marketplace) {
        if (product.marketplace.amazon !== undefined) product.marketplace.amazon = 'inactive';
        if (product.marketplace.walmart !== undefined) product.marketplace.walmart = 'inactive';
      }
    };

    try {
      if (!confirm) {
        const result = previewChange({ id, mutate });
        return { content: [{ type: 'text', text: JSON.stringify({ preview: true, diff: result.diff, note: PREVIEW_NOTE }, null, 2) }] };
      }
      const result = applyChange({ id, mutate, tool: 'discontinue_product', summary: 'discontinued' });
      return { content: [{ type: 'text', text: JSON.stringify({ applied: true, diff: result.diff, snapshotPath: result.snapshotPath }, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
