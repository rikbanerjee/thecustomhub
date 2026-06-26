/**
 * Append-only audit trail of every committed catalog write.
 * One JSON object per line in inventory-log.jsonl — never rewritten, only appended.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, '../inventory-log.jsonl');

/**
 * @param {{tool: string, id: string, summary: string, diff: Array, snapshotPath: string}} entry
 */
export function appendLog(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  fs.appendFileSync(LOG_PATH, line + '\n', 'utf8');
}

/**
 * @param {number} n - max number of most-recent entries to return
 * @returns {Array<object>}
 */
export function readRecent(n = 20) {
  if (!fs.existsSync(LOG_PATH)) return [];
  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n').filter(Boolean);
  return lines.slice(-n).map((line) => JSON.parse(line));
}
