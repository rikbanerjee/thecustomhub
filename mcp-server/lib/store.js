/**
 * The only module allowed to read or write products.json. Every tool that
 * mutates the catalog goes through `applyChange`, which is the single place
 * that snapshots, validates, atomically writes, and audit-logs — a tool
 * author cannot forget a safety step because there is no other path to the file.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateProducts } from './schema.js';
import { diff as computeDiff } from './diff.js';
import { appendLog } from './audit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(__dirname, '../../src/data/products.json');
const SNAPSHOT_DIR = path.join(__dirname, '../snapshots');

/** Re-read the file fresh every call — no in-memory cache. You're the only
 * writer, and the cost of re-reading a ~60-product file is negligible next
 * to the risk of ever acting on a stale copy. */
export function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_PATH, 'utf8');
  return JSON.parse(raw);
}

export function findById(products, id) {
  return products.find((p) => p.id === id) || null;
}

/** Copy the current live file into snapshots/ before a write touches it. */
export function snapshot() {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(SNAPSHOT_DIR, `products.${ts}.json`);
  fs.copyFileSync(PRODUCTS_PATH, dest);
  return dest;
}

/** Write via a temp file + rename so a crash mid-write can never leave
 * products.json partially written or corrupt. */
export function atomicWrite(products) {
  const tmpPath = `${PRODUCTS_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(products, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, PRODUCTS_PATH);
}

/**
 * The one function every write tool calls.
 *
 * @param {object} params
 * @param {string} params.id - product id to mutate
 * @param {(product: object) => void} params.mutate - mutates the cloned product in place
 * @param {string} params.tool - tool name, for the audit log
 * @param {string} params.summary - human-readable summary, for the audit log
 * @returns {{before: object, after: object, diff: Array, snapshotPath: string}}
 */
export function applyChange({ id, mutate, tool, summary }) {
  const products = loadProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`No product with id "${id}" found.`);
  }

  const before = structuredClone(products[index]);
  const after = structuredClone(products[index]);
  mutate(after);

  const updated = [...products];
  updated[index] = after;

  // Validate the FULL array, not just the touched product — a bug in one
  // tool's mutate() can't silently corrupt an unrelated product.
  validateProducts(updated);

  const snapshotPath = snapshot();
  atomicWrite(updated);

  const fieldDiff = computeDiff(before, after);
  appendLog({ tool, id, summary, diff: fieldDiff, snapshotPath });

  return { before, after, diff: fieldDiff, snapshotPath };
}

/** Build a preview without writing anything — used for the confirm=false path. */
export function previewChange({ id, mutate }) {
  const products = loadProducts();
  const product = findById(products, id);
  if (!product) {
    throw new Error(`No product with id "${id}" found.`);
  }

  const before = structuredClone(product);
  const after = structuredClone(product);
  mutate(after);

  // Validate against a hypothetical full array so a preview can never promise
  // a change that would actually fail validation on commit.
  const index = products.findIndex((p) => p.id === id);
  const hypothetical = [...products];
  hypothetical[index] = after;
  validateProducts(hypothetical);

  return { before, after, diff: computeDiff(before, after) };
}
