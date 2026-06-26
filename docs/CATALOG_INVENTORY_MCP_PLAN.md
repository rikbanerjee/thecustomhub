# Catalog & Inventory via Natural Language (MCP) — Product Plan

**Owner:** Rik (solo founder/operator, The CustomHub)
**Author:** Principal Product Strategist
**Date:** 2026-06-24
**Status:** Proposal for decision

---

## 0. TL;DR — The Recommendation

Build a **thin, file-backed MCP server** that wraps `src/data/products.json` and gives you conversational control of your catalog and inventory from both Claude Desktop and Claude Code. **Do not migrate to Firestore yet.** A 59-SKU, one-person, build-time-rendered site does not need a runtime database, and a migration is the single most expensive, highest-risk thing you could do right now — for a problem (live cross-channel overselling) you don't actually have yet, because only ~1 of your 59 products currently carries marketplace channel data.

The real win is not "a database." The real win is: **you stop hand-editing 8,000 lines of JSON, every change is validated, logged, and reversible, and the JSON stops being something you fear.** An MCP server delivers all of that on top of the file you already have. Treat the JSON as a real system of record by putting a disciplined, safe interface in front of it — not by replacing it.

Migrate to Firestore later, and only if a specific trigger fires (see §5, "Migration Triggers"). Until then, the JSON file *is* the database; the MCP server is the admin panel; Claude is the UI.

---

## 1. Vision: What "Natural-Language Catalog Management" Means For a Solo Operator

You are the entire company. Every minute spent reformatting JSON, hunting for a product ID, or copy-pasting between three marketplace templates is a minute not spent on sourcing, design, or marketing. The job-to-be-done is not "edit data." It is:

> "Let me run my store by *talking*, with the confidence that nothing silently breaks and I can always undo."

The experience target: any catalog or inventory change you can describe in one sentence, you can execute in one sentence — and you see exactly what changed before it's saved.

### The utterances you should be able to say (and have correctly executed)

**Inventory & stock**
- "Mark the Dhurander tee out of stock." → flips `inStock`, asks if you also mean all channels.
- "Set the black small Dhurander tee to 8 units." → updates the per-variant `qty`.
- "What's low on stock right now?" → lists everything under your threshold.
- "How many of the heart mug are left across all channels?"
- "Restock all Dhurander sizes to 20."
- "We sold 5 black mediums on Amazon — knock them down." → decrement, surfaces if it now crosses low/zero.

**Channel availability**
- "Put the heart mug live on Amazon and Walmart."
- "Pull the cricket jersey off Walmart but keep it on the site and Amazon."
- "Discontinue the heart mug everywhere." → site `inStock:false` + all channels `inactive`, with a confirm.

**Catalog (add / edit / price)**
- "Add the new mug from `_inbox/desi-vibes-mug`, price $24, sell on Amazon and Walmart." → runs your existing inbox-draft flow, then writes the record.
- "Bump every sweatshirt by $3."
- "Rewrite the Dhurander description to lean harder into the Bollywood angle." → drafts, shows diff, you approve.
- "Add this lifestyle shot as the second image on the cricket jersey."

**Read / status**
- "Show me everything that's live on Amazon."
- "Which products have no Walmart data yet?"
- "What changed in the catalog this week?" → reads the audit log.

The unifying principle: **propose → confirm → apply → log.** Never a silent write.

---

## 2. Data Architecture Decision

### The question
Does conversational catalog/inventory management require migrating off `products.json` to Firestore, or can a well-designed MCP server safely sit in front of the JSON?

### The decision: **Stay on JSON. Wrap it. Do not migrate now.**

### Why (reasoned, not a menu)

**1. Your site is build-time rendered, and that's a feature, not a debt.**
`dataHelpers.js` does `import productsData from '../data/products.json'` — the catalog is baked into the bundle at `npm run build`. This means your live site has **zero runtime data dependency**: no database to go down, no read costs, no latency, instant CDN delivery from Firebase Hosting. Moving to Firestore means either (a) fetching products at runtime — adding a loading state, an outage surface, and read-cost to a site that currently has none — or (b) still building from a Firestore snapshot at build time, in which case Firestore bought you nothing the JSON didn't already give you, at the cost of a migration. For a 59-SKU catalog that changes a few times a week, **build-time JSON is the correct architecture.** Don't trade a robust, free, simple system for an "enterprise-shaped" one.

**2. The concurrency argument for a database doesn't apply to you.**
Databases earn their keep when multiple writers hit the same data concurrently. You are one person. There is exactly one writer. The "fragility" you feel today is **not** a concurrency problem — it's an *unguarded-edit* problem: hand-editing JSON has no validation, no schema enforcement, no log, no undo, and the backup-file sprawl (`products-archive.json`, `products-wrking-backup.json`, `products.json.backup`) is the scar tissue of editing without a safety net. An MCP server fixes every one of those without a database: it validates on write, enforces the schema, snapshots before each change, and logs everything. **That's the actual cure.**

**3. The multi-channel overselling risk is real but latent, not active.**
Inspection of `products.json` today: only ~1 product carries `marketplace`/`walmartData` blocks; `amazonData` is on zero. You are not currently overselling across channels because you are barely selling across channels yet. **Solving live cross-channel stock sync now is solving a problem you don't have.** The right move is to design the data model so a single source of truth exists from day one (so the problem never *becomes* real), which you can do in JSON just as well as in Firestore (see §4). Firestore's real-time sync only matters once you have live API connections to *both* marketplaces — and you don't (Walmart is bulk-upload-only in your current setup; no live API).

**4. Operational reality: you have no one to babysit a migration.**
A Firestore migration means: model the collections, write the migration script, re-point `dataHelpers.js`, handle the build-vs-runtime fetch decision, set up security rules, test that 59 products render identically, and debug the inevitable schema-drift bugs — all while the live store keeps running. That is a multi-day, all-risk, low-visible-reward project for a solo non-backend operator. The MCP-over-JSON server is a **half-day to two-day** project with immediate, daily payoff. The opportunity cost is not close.

**Conclusion:** JSON is your system of record. The MCP server makes it *safe and conversational*. Firestore is a **later, trigger-gated** decision (§5), not a prerequisite.

### What changes in the data model regardless (do this now, in JSON)

To prevent the latent overselling problem from ever becoming real, introduce **one source of truth for physical stock** and treat channel quantities as derived. See §4. This is a JSON schema change, not a database.

---

## 3. MCP Server Design

A single local MCP server (`tch-catalog`), run by you, exposed to both Claude Desktop and Claude Code via their MCP config. It reads/writes `products.json` and an `inventory-log.jsonl` audit file in the repo. Node-based (matches your stack and your existing `scripts/*.mjs` tooling).

### Tools (actions — these mutate or compute) vs Resources (read-only context)

**Resources** (Claude can read these for grounding without a tool call; cheap, safe, no confirmation):
- `catalog://products` — the full normalized catalog (read-only view).
- `catalog://product/{id}` — one product.
- `catalog://low-stock` — computed list under threshold.
- `catalog://schema` — the product schema + valid `type` values, so Claude drafts conform.
- `catalog://audit-log` — recent changes.

**Tools** (actions, each returns a *preview/diff* by default and requires an explicit confirm to commit — see §6):

| Tool | Purpose | Notes |
|---|---|---|
| `find_product` | Resolve a fuzzy name ("the heart mug") to a single product ID | **Critical safety tool.** Returns candidates if ambiguous; never guesses silently. |
| `get_product` | Full detail incl. all channel blocks | Read; no confirm. |
| `update_inventory` | Set/adjust stock for a product or specific variant | Supports absolute ("set to 8") and relative ("sold 5"). Writes to the single source of truth (§4). |
| `set_channel_status` | Turn a product active/inactive on a named channel | `amazon` \| `walmart` \| `site` (+ future `etsy`). |
| `list_low_stock` | Everything under threshold (default-configurable) | Also exposed as a resource; tool form lets you pass a custom threshold. |
| `add_product` | Append a new validated product record | Pairs with the inbox flow; validates against schema before write. |
| `update_product` | Edit price / description / tags / images | Returns a field-level diff. |
| `discontinue_product` | Soft-discontinue: `inStock:false` + all channels `inactive` | Soft, reversible; never deletes the record. |
| `bulk_price_adjust` | "+$3 to all sweatshirts" | Always previews the full affected list before applying. |
| `undo_last_change` | Revert to the pre-change snapshot | Backed by the per-write snapshot (§6). |

### Feed generation: keep as CLI, *trigger* from MCP

Your Amazon (`amazon:generate`) and Walmart injector scripts are mature, tested, and produce files you upload manually to Seller Central. **Do not absorb their logic into the MCP server.** Instead add one thin tool:

- `generate_feed(channel, productIds?)` → shells out to the existing `npm run amazon:generate` / Walmart injector and reports the output path.

This keeps the battle-tested feed logic in one place (the scripts), lets you say "generate the Amazon feed for the new mug," and respects that the *upload* step stays manual (Seller Central, by hand) because that's a human-in-the-loop checkpoint you want anyway. **Generating a feed is a tool; uploading it is your job.**

### Client integration

- **Claude Desktop (chat):** primary surface for quick "mark X out of stock" / "what's low" while you're not at the terminal. Add `tch-catalog` to the Desktop MCP config.
- **Claude Code (this CLI):** primary surface for the heavier flows — add-product-from-inbox, generate feed, deploy. It already has Bash to run `npm run build` / `npm run deploy` after a catalog write.
- Same server, both clients. The server is the single writer; the client is just the conversation.

### The write → live pipeline

A catalog change isn't live until rebuilt and deployed (build-time data). So the server's job ends at "JSON updated + logged." Going live stays an explicit step:
- In Claude Code: "...and deploy" → runs `npm run build && npm run deploy`.
- The server should **remind** you when uncommitted-to-live changes exist ("3 catalog changes since last deploy").

---

## 4. Inventory / Stock-Sync Model

### Principle: One physical truth, channels are views with optional buffers

You have one pool of real, physical inventory per variant. Amazon, Walmart, and the site are **windows** onto that pool, not independent pools. The current schema (independent `inStock` boolean + per-channel `qty`) is exactly the design that *causes* overselling. Fix the model now while it's cheap.

### Proposed model (JSON, per variant)

```
variant: {
  sku, color, size, price,
  stock: 20,                 // SINGLE SOURCE OF TRUTH — physical units on hand
  channels: {
    site:    { active: true  },                 // site sells from `stock` directly
    amazon:  { active: true,  buffer: 2 },       // hold back 2 as safety margin
    walmart: { active: true,  buffer: 2 }
  }
}
```

- **Available to a channel** = `stock − buffer` (floored at 0). Buffers absorb sync lag on bulk-only channels.
- The top-level `inStock` boolean stays for the React site (no front-end change needed) but is now **derived**: `inStock = stock > 0 && channels.site.active`. The MCP server keeps it in sync automatically; you never set it by hand again.

### What happens on a sale

- **"Sold 5 black mediums on Amazon"** → `update_inventory` decrements the single `stock` field by 5. Every channel's "available" recomputes automatically. No per-channel bookkeeping.
- Because there's **one** number, there is no "push Amazon's count to Walmart's count" reconciliation — they were never separate. This is the whole point.

### Pushing quantities back out to marketplaces

Here's the honest constraint: Walmart is **bulk-upload-only** in your setup; Amazon you generate a feed for. So "push updated quantities to the channel" = regenerate the feed and re-upload. The model makes the *quantity correct*; getting it *to the channel* stays a deliberate batch step:

- **v0/v1 reality (manual, batched):** decrements update the truth instantly. When you want the channel to reflect it, you say "regenerate the Walmart feed" and re-upload. Low frequency, fully under your control, no silent failure.
- The server should nudge: "Dhurander stock changed since the last Walmart feed — regenerate before your next upload?"
- **Future (when/if APIs exist):** if you ever add a live Amazon/Walmart inventory API, the same single-truth model means a sync job just pushes `stock − buffer` per channel. The model doesn't change; only the delivery mechanism does. This is also the strongest **Firestore migration trigger** (§5).

### Etsy

Etsy is an outbound link today, not an inventory channel. Model it as `channels.etsy: { active, buffer }` so it's *ready*, but do nothing else until you actually sell stock-managed inventory there.

---

## 5. Phased Roadmap

### v0 — "Stop fearing the JSON" (smallest useful slice; target: 1–2 days)
The 20% that delivers 80% of the relief.
- MCP server reads `products.json`, exposes `catalog://products` + `catalog://product/{id}` resources.
- Tools: `find_product`, `get_product`, `update_inventory` (boolean + simple qty), `set_channel_status`, `list_low_stock`, `discontinue_product`.
- **Every write: snapshot-before, validate, append to audit log, show diff, require confirm.**
- Wire into Claude Desktop **and** Claude Code.
- Delete the stray backup files — the snapshot system replaces them.
- **You can now run inventory and channel status entirely by talking.** No schema migration required for v0 if you keep the existing fields; introduce the single-`stock` model here if you're ready (recommended).

### v1 — "Full catalog control + safe stock truth" (target: +2–3 days)
- Adopt the single-source-of-truth stock model (§4) across all variants; auto-derive `inStock`.
- Add `add_product` (wired to the `_inbox/` draft flow), `update_product`, `bulk_price_adjust`, `undo_last_change`.
- `generate_feed` tool shelling to existing scripts.
- "Uncommitted changes since last deploy" reminder + one-word deploy from Claude Code.
- Low-stock threshold configurable per product type.

### Later — only if a trigger fires
- **Firestore migration.** Trigger conditions (any one): (a) you add a *live* inventory API to a marketplace and need real-time multi-channel sync; (b) catalog grows past ~a few hundred SKUs and JSON edits/builds get slow; (c) you bring on a second person who edits catalog concurrently; (d) you want a customer-facing live-stock display ("only 2 left"). None of these are true today.
- Live "low stock" email/push alerts.
- Sales-velocity / reorder suggestions.

### Explicitly OUT of scope (anti-overengineering)
- A custom web admin panel — the conversation **is** the admin panel; building a UI duplicates it.
- Real-time marketplace API sync — no API exists in your setup; don't build for it speculatively.
- Multi-warehouse, multi-location, lot/batch tracking, COGS/accounting — enterprise inventory boilerplate that has no place in a one-person diaspora streetwear brand.
- Auto-purchasing/reordering, demand forecasting — premature for 59 SKUs.

---

## 6. Risks & Failure Modes (the part a form-based admin wouldn't need)

A conversational interface trades a form's precision for speech's ambiguity. The guardrails below are **non-negotiable**, because the cost of a misunderstanding is overselling or a wrong product pulled live.

| Risk | Failure mode | Guardrail |
|---|---|---|
| **Wrong product matched** | "the heart mug" matches two products; Claude picks one | `find_product` returns *candidates* on ambiguity and **refuses to act** until you disambiguate. Single confident match still echoed back in the confirm step. |
| **Overselling** | "set to 8" mis-parsed as "+8" | All inventory writes show **before → after** numbers in the confirm. Relative vs absolute is stated explicitly ("setting to 8" vs "adding 8, new total 28"). |
| **Silent destructive change** | description/price overwritten with no record | Every write previews a **field-level diff** and requires confirmation. Nothing commits on the first utterance. |
| **Wrong thing pulled live** | "discontinue everywhere" hits the wrong SKU | Discontinue is **soft** (flags only, never deletes) and fully reversible via `undo_last_change`. |
| **No way back** | a change looks right, turns out wrong an hour later | **Per-write snapshot** of `products.json` + append-only `inventory-log.jsonl` (timestamp, tool, before, after, the utterance). `undo_last_change` and "what changed this week?" both read this. |
| **Stale live site** | JSON updated, never rebuilt; site shows old data | Server tracks "changes since last deploy" and reminds you; deploy stays an explicit confirmed step. |
| **Corrupt JSON** | a bad write breaks the build for the whole store | Validate against `catalog://schema` **and** `JSON.parse` the full file **before** replacing it. Refuse the write on failure; the prior snapshot is untouched. |

**The governing rule:** the server **proposes**, you **confirm**, it **applies and logs**. Speed comes from one-sentence commands, not from skipping confirmation. For batch operations (`bulk_price_adjust`), the confirm shows the **full affected list**, not just a count.

---

## 7. Success Metrics

How you'll know this beats hand-editing JSON. (Engagement = do you actually use it; Value = does it make the store safer/faster.)

**Value metrics**
- **Time per catalog change:** from minutes of JSON wrangling → under ~30 seconds conversationally. (Target: 80%+ reduction.)
- **Zero invalid-JSON build breaks** caused by manual edits. (Validation makes this structurally impossible — track that it stays at zero.)
- **Zero oversell incidents** once channels go live — measured as: no channel ever advertised more units than `stock − buffer`.
- **Backup-file sprawl eliminated:** the repo holds the live file + the snapshot/log system, nothing else. (Currently 3+ stray backups → 0.)

**Engagement metrics**
- **Share of catalog/inventory changes made conversationally vs by hand-editing JSON.** North-star for adoption — target ~100% within a few weeks; any hand-edit is a signal the server is missing a capability.
- **Changes that used `undo` or were caught at the confirm step** — proof the guardrails are doing real work (and a backlog of better-disambiguation ideas).

**Leading indicator of the real goal**
- Hours/week *not* spent on catalog mechanics → redirected to sourcing, design, marketing. The entire point is buying back your time. If you don't feel that within two weeks, the plan failed regardless of the other numbers.

---

## Riskiest Assumption & Cheapest Test

**Riskiest assumption:** that natural-language product resolution (`find_product`) is reliable enough that you'll *trust* it for inventory — if "the heart mug" too often resolves wrong or ambiguously, the confirm-step friction will push you right back to editing JSON, and the whole thing dies.

**Cheapest test:** before building any write path, build **only** `find_product` + the read resources (half a day), then spend an afternoon asking it to resolve every product the way you'd naturally refer to them out loud. If it nails the match (or cleanly asks when ambiguous) ~95%+ of the time, the conversational model is sound and the rest of the build is justified. If it doesn't, the fix is cheap (better aliases/tags per product) and you've learned it for $0 of wasted server-building.
