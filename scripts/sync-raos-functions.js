/**
 * Copies the repo's single source of truth for RetailAgentOS (raos/adapter.js,
 * the vendored engine tarball, products.json, and the built index.html) into
 * functions/, which Firebase deploys as an isolated directory (firebase.json:
 * functions.source = "functions") — it can't `require('../raos/adapter')` or
 * read anything outside itself once deployed.
 *
 * Run automatically before `firebase deploy --only functions` via
 * firebase.json's functions.predeploy hook. Never hand-edit the copies this
 * script writes under functions/raos, functions/vendor, functions/data, or
 * functions/public — edit the repo-root originals and re-run this script.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`synced ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dest)}`);
}

copyFile(
  path.join(ROOT, 'raos', 'adapter.js'),
  path.join(ROOT, 'functions', 'raos', 'adapter.js')
);
copyFile(
  path.join(ROOT, 'raos', 'package.json'),
  path.join(ROOT, 'functions', 'raos', 'package.json')
);
copyFile(
  path.join(ROOT, 'vendor', 'retailagentos-engine-0.1.0.tgz'),
  path.join(ROOT, 'functions', 'vendor', 'retailagentos-engine-0.1.0.tgz')
);
copyFile(
  path.join(ROOT, 'src', 'data', 'products.json'),
  path.join(ROOT, 'functions', 'data', 'products.json')
);

const builtIndexHtml = path.join(ROOT, 'dist', 'index.html');
if (fs.existsSync(builtIndexHtml)) {
  copyFile(builtIndexHtml, path.join(ROOT, 'functions', 'public', 'index.html'));
} else {
  console.warn(
    'dist/index.html not found — run `npm run build` first so productSchema (B4) serves fresh markup.'
  );
}
