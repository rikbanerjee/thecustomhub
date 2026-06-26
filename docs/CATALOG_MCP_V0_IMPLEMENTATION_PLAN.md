# Catalog & Inventory MCP Server — v0 Implementation Scope

**Companion to:** `docs/CATALOG_INVENTORY_MCP_PLAN.md` (product plan — read that first for the *why*)
**This document:** the engineering scope for v0 — what gets built, in what order, with what exact tool contracts.
**Target:** 1–2 days, solo build, no schema migration, no breaking change to the live site.

---

## 0. What v0 does and doesn't do

**Does:** lets you manage inventory and channel status for existing products by talking to Claude (Desktop or Code), with every write validated, snapshotted, logged, and confirmed before it commits.

**Does not:** touch `add_product`, `update_product`, `bulk_price_adjust`, `undo_last_change`, `generate_feed`, or the single-source-of-truth `stock`/`buffer` variant remodel from §4 of the product plan. Those are v1. v0 is deliberately narrow — it's the smallest slice that replaces "hand-edit JSON for inventory/status changes" with "talk to Claude," per the product plan's own framing.

**Schema:** v0 makes **zero breaking changes** to `products.json`. It reads and writes the fields that already exist (`inStock`, `marketplace.amazon`, `marketplace.walmart`, and variant `qty` inside `walmartData.variants[]` where present). The only *additive* change is an optional top-level `stock` integer (see §3.3) — products that don't have it simply don't get numeric low-stock tracking yet; they still get boolean in/out-of-stock control.

---

## 1. Repo layout

A new top-level directory, sibling to `scripts/`, not under `src/` (so Vite never sees it):

```
mcp-server/
├── package.json          # own deps: @modelcontextprotocol/sdk, zod
├── index.js               # entrypoint — registers resources/tools, starts stdio transport
├── lib/
│   ├── store.js           # load/validate/snapshot/atomic-write products.json
│   ├── schema.js          # zod Product schema (lenient — see §3.3)
│   ├── audit.js           # append/read inventory-log.jsonl
│   ├── resolve.js         # find_product fuzzy matching
│   └── diff.js            # field-level diff for previews
├── snapshots/             # gitignored — timestamped pre-write copies of products.json
├── inventory-log.jsonl    # gitignored — append-only audit trail
└── README.md              # setup + Claude Desktop/Code wiring instructions
```

Why a separate package rather than folding into the root `package.json`: the MCP SDK and zod are server-only dependencies with no business being in the Vite bundle's dependency graph, and a separate `node_modules` keeps `npm run build` untouched by this work entirely.

---

## 2. Dependencies

```bash
cd mcp-server && npm init -y && npm install @modelcontextprotocol/sdk zod
```

Confirmed available: `@modelcontextprotocol/sdk@1.29.0` on npm, Node v26 locally (well above the SDK's minimum). `"type": "module"` to match the rest of the repo's ESM convention.

No other new dependencies. Fuzzy matching in `resolve.js` is hand-rolled (scored substring/token match, same spirit as the existing `searchProducts` scoring in `src/utils/dataHelpers.js`) — not worth pulling in a fuzzy-search library for 59 SKUs, and keeping it dependency-free means no version drift to babysit.

---

## 3. Core library design

### 3.1 `lib/store.js` — the safety layer everything else builds on

This is the only module allowed to read or write `products.json`. Every tool goes through it.

```js
export function loadProducts()              // JSON.parse the file fresh each call — no in-memory cache,
                                              // since you're the only writer and staleness would be worse
                                              // than the cost of re-reading a small file.

export function snapshot()                  // copy current products.json → snapshots/products.<ISO8601>.json
                                              // returns the snapshot path. Called before every committed write.

export function atomicWrite(products)       // JSON.stringify(products, null, 2) → products.json.tmp →
                                              // fs.renameSync → products.json. Never writes the live file directly,
                                              // so a crash mid-write can't corrupt it.

export function applyChange({ id, mutate, tool, summary })
                                              // the one function every write tool calls:
                                              // 1. load fresh
                                              // 2. find product by id, clone it
                                              // 3. run mutate(productClone) — tool-specific field changes
                                              // 4. validate full array against schema.js
                                              // 5. snapshot() the pre-change file
                                              // 6. atomicWrite(updated array)
                                              // 7. audit.append({ tool, id, before, after, summary })
                                              // 8. return { before, after, diff: diff.compute(before, after) }
```

Centralizing the write path in `applyChange` means every tool gets snapshot+validate+log+atomic-write for free — a tool author (future-you, or me adding v1 tools) cannot forget the safety steps because there's no other way to write the file.

### 3.2 `lib/diff.js`

Flat field-level diff between two product objects (shallow keys + one level into `marketplace`):

```js
diff(before, after) → [{ field: 'inStock', before: true, after: false }, ...]
```

Used to build the human-readable preview every confirm step shows.

### 3.3 `lib/schema.js` — validation, deliberately lenient

A zod schema mirroring the fields documented in root `CLAUDE.md`:

```js
const Product = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  vendor: z.string().min(1),
  type: z.string().min(1),          // NOT a fixed enum — new types are valid (CLAUDE.md: "reuse unless intending a new category")
  category: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string(),
  images: z.array(z.string().url()).min(1),
  tags: z.array(z.string()),
  inStock: z.boolean(),
  stock: z.number().int().nonnegative().optional(),   // NEW, additive, optional
  isCustomizable: z.boolean().optional(),
  marketplace: z.object({
    amazon: z.enum(['active', 'inactive']).optional(),
    walmart: z.enum(['active', 'inactive']).optional(),
  }).optional(),
  amazonData: z.object({}).passthrough().optional(),   // don't re-validate the full Amazon contract here —
  walmartData: z.object({}).passthrough().optional(),  // that's the generators' job; just don't let writes corrupt the shape
}).passthrough();                                      // unknown future fields don't fail validation
```

`applyChange` validates the *entire array* (not just the touched product) before writing, so a bug in one tool can't silently corrupt an unrelated product. `.passthrough()` everywhere it's not this tool's job to police — v0's job is "don't corrupt the file and don't make an invalid inventory/status change," not "fully re-validate the Amazon/Walmart contracts" (those already have their own validation in the generators).

### 3.4 `lib/resolve.js` — `find_product`, the riskiest-assumption tool

Per the product plan's own "cheapest test": this is the tool to get right before trusting anything else. Scoring (adapted from the existing relevance scoring in `dataHelpers.searchProducts`, reimplemented standalone so the MCP server has no import-time dependency on browser-facing code):

```js
function findProduct(query) {
  // score each product: exact id match=100, title substring=10*wordsMatched,
  // tag exact match=8, type/category substring=2
  // returns one of:
  //   { match: <product> }                          — single confident match (score gap to runner-up is large)
  //   { ambiguous: true, candidates: [...] }         — top scores are close; list top 5 with id+title
  //   { found: false }                                — nothing scored > 0
}
```

The "confident vs ambiguous" threshold (e.g. top score ≥ 2× runner-up) is the one piece of tuning logic in v0 worth iterating on during the validation pass in §6.

### 3.5 `lib/audit.js`

```js
appendLog({ ts, tool, id, before, after, summary })   // one JSON line appended to inventory-log.jsonl
readRecent(n = 20)                                     // for a future "what changed recently" — not a v0 tool,
                                                        // but trivial to add once the log exists; stub it now.
```

---

## 4. MCP server: resources and tools

`index.js` wires `lib/*` into the MCP SDK's high-level `McpServer` API over stdio.

### Resources (read-only, no confirm, cheap)

| URI | Returns |
|---|---|
| `catalog://products` | The full raw `products.json` array (not the React-normalized shape — this is for catalog management, so raw source-of-truth fields). |
| `catalog://product/{id}` | One raw product record. |

(`catalog://low-stock` and `catalog://schema` from the full design are deferred to v1 — `list_low_stock` as a tool covers the same need for v0, and Claude already has the schema via this document / `CLAUDE.md` context.)

### Tools

Every mutating tool follows the same two-phase shape: **call without `confirm` → get a preview; call again with `confirm: true` → it applies.** This is the only practical way to get "propose → confirm → apply" out of the MCP protocol, which has no native human-in-the-loop step — so the tool descriptions themselves instruct Claude to always preview first and only pass `confirm: true` after the user has explicitly agreed to the exact diff shown.

#### `find_product`
```ts
input:  { query: string }
output: { match: Product } | { ambiguous: true, candidates: Product[] } | { found: false }
```
Read-only. No confirm needed. Every other tool that takes an `id` should be called *after* this resolves it — tool descriptions say so explicitly, so Claude doesn't guess an id from memory of the conversation.

#### `get_product`
```ts
input:  { id: string }
output: Product | { found: false }
```
Read-only.

#### `update_inventory`
```ts
input: {
  id: string,
  inStock?: boolean,        // simple boolean path
  stock?: number,           // absolute set of the new optional top-level `stock` field
  adjustBy?: number,        // relative delta on `stock` ("sold 5" → adjustBy: -5)
  variantSku?: string,      // if present, target walmartData.variants[].qty for that SKU instead of top-level stock
  confirm?: boolean          // default false
}
output (confirm=false): { preview: true, diff: [...], note: "Call again with confirm: true to apply." }
output (confirm=true):  { applied: true, diff: [...], snapshotPath, loggedAt }
```
Validation: exactly one of `inStock` / `stock` / `adjustBy` per call — reject ambiguous combined calls rather than guess precedence. If `variantSku` is given but the product has no matching variant, return an error, not a silent no-op.

#### `set_channel_status`
```ts
input:  { id: string, channel: "amazon" | "walmart" | "site", active: boolean, confirm?: boolean }
```
`amazon`/`walmart` → `marketplace.<channel> = active ? "active" : "inactive"`. `site` → `inStock = active` (the site has no `marketplace.site` field today; `inStock` *is* the site channel toggle).

#### `list_low_stock`
```ts
input:  { threshold?: number }   // default 5
output: { belowThreshold: [...products with numeric stock < threshold...], outOfStock: [...products with inStock:false, regardless of whether they have a numeric stock...] }
```
Read-only. Products with no numeric `stock` field can only ever appear in `outOfStock` (when `inStock:false`), never in `belowThreshold` — v0 can't threshold what it can't count, and the tool should say so rather than pretend.

#### `discontinue_product`
```ts
input:  { id: string, confirm?: boolean }
```
Sets `inStock: false`, and `marketplace.amazon`/`marketplace.walmart` to `"inactive"` for any channel keys that already exist on the product (never adds a `marketplace` block that wasn't there). Never deletes the record. Reversible by hand today (no `undo_last_change` until v1 — but the snapshot from this write is already sitting in `snapshots/`, so reversal is a one-line manual restore even before v1 ships the tool).

---

## 5. Client wiring

### Claude Code (this CLI)
Add a project-scoped `.mcp.json` at the repo root:
```json
{
  "mcpServers": {
    "tch-catalog": {
      "command": "node",
      "args": ["mcp-server/index.js"]
    }
  }
}
```
Safe to commit — no secrets, just a relative node command. (Verify the exact `.mcp.json` schema against the Claude Code docs at wiring time; the registration mechanism may instead be `claude mcp add tch-catalog -- node mcp-server/index.js` run once locally, which writes the equivalent config for you.)

### Claude Desktop
Add the same server to `claude_desktop_config.json`'s `mcpServers` block, with an **absolute** path (Desktop doesn't run with the repo as cwd):
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

Both clients spawn the server as a subprocess over stdio per session — there's no persistent process to manage or deploy.

---

## 6. Build order

| Step | Deliverable | Est. |
|---|---|---|
| 1 | `mcp-server/` scaffold + deps; `lib/schema.js`, `lib/diff.js`, `lib/audit.js`, `lib/store.js` (load/snapshot/atomicWrite/applyChange) | 2–3 hrs |
| 2 | `lib/resolve.js` (`find_product` logic) + `index.js` registering resources and the three read-only tools (`find_product`, `get_product`, `list_low_stock`). Smoke-test with `npx @modelcontextprotocol/inspector node mcp-server/index.js` before touching write tools. | 2 hrs |
| 3 | Write tools: `update_inventory`, `set_channel_status`, `discontinue_product`, all routed through `applyChange`. Inspector-test each: preview call, confirm call, verify a snapshot file appeared, verify `inventory-log.jsonl` got a line, verify `products.json` still `JSON.parse`s and `npm run build` still passes after a test write. | 3–4 hrs |
| 4 | Wire into Claude Code (`.mcp.json`) and Claude Desktop config; write `mcp-server/README.md`; add `mcp-server/snapshots/` and `mcp-server/inventory-log.jsonl` to `.gitignore`; add a short pointer section to root `CLAUDE.md` so other coding agents know this exists. | 1–2 hrs |
| 5 | **Validation pass (the plan's "cheapest test"):** in a live Claude session, call `find_product` for every one of the 59 products the way you'd naturally refer to them out loud. Tune the scoring/ambiguity threshold in `resolve.js` until it's ~95%+ right or cleanly asks. Don't move to trusting it for writes until this passes. | 1–2 hrs |

Total: **~1.5–2 days**, matching the product plan's v0 estimate.

**After v0 lands and the validation pass holds:** delete `products-archive.json`, `products-wrking-backup.json`, `products.json.backup` — the snapshot system in `mcp-server/snapshots/` is the thing that now does that job properly. Don't delete them until after step 5 passes; they're free insurance during the build.

---

## 7. What "done" looks like

You can open a Claude Desktop chat with no terminal open and say "mark the Dhurander tee out of stock," see a one-line diff preview, say "yes," and have it actually committed, snapshotted, and logged — and the same sentence works in Claude Code. That's the whole v0 bar. Everything else (adding products, pricing, feed generation, undo) is v1.
