# tch-catalog MCP server

Lets you manage The CustomHub's product catalog and inventory by talking to Claude, instead of hand-editing `src/data/products.json`. Every write is previewed, confirmed, validated, snapshotted, and logged before it touches the live file. See `docs/CATALOG_INVENTORY_MCP_PLAN.md` and `docs/CATALOG_MCP_V0_IMPLEMENTATION_PLAN.md` for the full design and rationale.

## What it can do (v0)

- **Find a product** by natural-language description ("the heart mug", "dhurander tee")
- **Look up** a product's full record and stock summary
- **List low-stock / out-of-stock** products
- **Update inventory** — set a stock count, adjust it by a delta ("sold 5"), toggle `inStock`, or target a specific size/color variant
- **Turn a sales channel on/off** — Amazon, Walmart, or the live site itself
- **Discontinue a product** — pulls it from every channel without deleting the record

It does **not** add new products, change prices, regenerate marketplace feeds, or remodel the stock schema — that's v1.

## Setup

```bash
cd mcp-server
npm install
```

### Claude Code (this repo)

Already wired via the project's `.mcp.json` at the repo root — nothing else to do. Claude Code spawns `node mcp-server/index.js` automatically when you open this repo.

### Claude Desktop

Add to `claude_desktop_config.json` (use an **absolute** path — Desktop doesn't run with this repo as its working directory):

```json
{
  "mcpServers": {
    "tch-catalog": {
      "command": "node",
      "args": ["/Users/rikbanerjee/code/thecustomhub/mcp-server/index.js"]
    }
  }
}
```

Restart Claude Desktop after editing the config.

## How a write actually happens

Every mutating tool (`update_inventory`, `set_channel_status`, `discontinue_product`) follows the same two-call shape, because MCP has no native human-in-the-loop step:

1. Call it **without** `confirm` → returns a diff preview, nothing is written.
2. Show that diff to the user. Only after they explicitly agree, call the **same tool again with `confirm: true`** → it snapshots the current file, validates the full catalog, atomically writes, and appends an audit log line.

In practice this means a Claude conversation like:

> **You:** Mark the Dhurander tee out of stock.
> **Claude:** *(calls `find_product`, then `update_inventory` without confirm)* This will set `inStock: true → false` for "The Ghatak Tee – Dhurandhar 2 Inspired Graphic Streetwear". Apply it?
> **You:** Yes.
> **Claude:** *(calls `update_inventory` again with `confirm: true`)* Done — snapshotted and logged.

## Safety net

- **`lib/store.js`** is the only module allowed to touch `products.json`. Every write goes through `applyChange`, which snapshots the current file, validates the *entire* product array (not just the touched record), writes atomically (temp file + rename, so a crash mid-write can't corrupt the file), and appends to the audit log — in that order, every time.
- **`mcp-server/snapshots/`** — a timestamped copy of `products.json` taken immediately before every committed write. Gitignored. If a change goes wrong, the previous state is sitting right there to restore by hand (there's no `undo_last_change` tool yet — that's v1).
- **`mcp-server/inventory-log.jsonl`** — append-only, one JSON line per committed write (`tool`, `id`, `summary`, `diff`, `snapshotPath`, timestamp). Gitignored.

## Known limitation: legacy variant data

57 of 59 products in `products.json` are in a legacy Shopify-export shape: there's no top-level `price`, and price/quantity live on `variants[]` (often padded with placeholder objects where every field is `null`). `lib/inventory.js` normalizes this — see `summarizeStock()` for the four shapes a product's stock data can take (`simple`, `single-variant`, `multi-variant`, `boolean-only`). `list_low_stock` can only threshold products with a single countable number; multi-variant products (most T-shirts, with a size/color matrix) need `update_inventory`'s `variantSku` parameter to target one variant at a time.

## Debugging

```bash
# Talk to the server directly over stdio without a full Claude client
node -e "
import('@modelcontextprotocol/sdk/client/index.js').then(async ({ Client }) => {
  const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');
  const transport = new StdioClientTransport({ command: 'node', args: ['index.js'] });
  const client = new Client({ name: 'debug', version: '0.0.1' });
  await client.connect(transport);
  console.log(await client.listTools());
  await client.close();
});
"
```
