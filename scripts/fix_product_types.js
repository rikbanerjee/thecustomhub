import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.resolve(__dirname, '../src/data/products.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

const fixes = {
  // Clothing → T-Shirts
  'bengali-funny-quote-shirt-kotoi-rongo': 'T-Shirts',
  'bengali-graphic-tee-bheto-bangali': 'T-Shirts',
  'bengali-t-shirt-for-nri-bengalis-pagla-khabi-ki-jhaje-more-jabi': 'T-Shirts',
  'bengali-tshirt-ledh-logne-jonmo': 'T-Shirts',
  'custom-tshirt-for-events': 'T-Shirts',
  'dekhlei-hobe-khorcha-ache-bengali-tshirt': 'T-Shirts',
  'devdas-tshirt': 'T-Shirts',
  'dil-chahta-hain': 'T-Shirts',
  'dil-vib-xxl-gry': 'T-Shirts',
  'girl-friend-valentine-valentines-day-tshirt-valentines-forever-gift': 'T-Shirts',
  'high-on-lassi': 'T-Shirts',
  'holi-bura_na_mano': 'T-Shirts',
  'holi-hain25': 'T-Shirts',
  'ledh-logne-jonmo-men-t-shirt-funny-bengali-graphic-tee-bangla-typography-shirt-for-men-women-lazy-mood-bengali-humor-t-shirt-copy': 'T-Shirts',
  'maa-or-meyer-kotha-bengali-tshirt': 'T-Shirts',
  'mama-mini-matching-t-shirt-set-mother-s-day-gift-2025-mom-baby-outfit': 'T-Shirts',
  'matching-family-t-shirt-set-mama-the-original-mama-s-legacy-mama-s-echo-3-piece': 'T-Shirts',
  'too-glam-to-give-a-damn-red-womens-tshirt': 'T-Shirts',
  'tumi-bajale-ektara-bengali-tshirt': 'T-Shirts',
  'youll-always-be-my-valentine-valentines-day-tshirt-valentines-forever-gift': 'T-Shirts',
  'father-s-day-gift-bundle-for-feluda-fans-t-shirt-mug-se': 'T-Shirts',

  // NULL → T-Shirts
  'biriyani-tshirt': 'T-Shirts',

  // Concert → T-Shirts (Diljit Dosanjh t-shirt)
  'diljit-dosanjh-do-you-know': 'T-Shirts',

  // Clothing → Sweatshirts (sweatshirt or hoodie in title)
  'bollywood-soul-broadway-stroll-sweatshirt-where-mumbai-masala-meets-nyc-lights': 'Sweatshirts',
  'from-ape-to-apps-embrace-your-evolutionary-peak': 'Sweatshirts',
  'in-my-bollywood-era-sweatshirt-desi-swag-meets-urban-chic-copy': 'Sweatshirts',
  'pyar-dosti-hai-the-ultimate-bollywood-sweatshirt-for-movie-lovers': 'Sweatshirts',
  'pyar-dosti-hain-bollywood-hoodie': 'Sweatshirts',
  'i-cd-xs-blc': 'Sweatshirts',

  // Clothing → Coffee and Tea Cups (it's actually a mug)
  'dad-greatest-of-all-time': 'Coffee and Tea Cups',
};

let changed = 0;
for (const product of products) {
  const newType = fixes[product.id];
  if (newType && product.type !== newType) {
    const oldType = product.type || 'NULL';
    console.log(`  ${oldType.padEnd(22)} → ${newType.padEnd(22)} | ${product.id}`);
    product.type = newType;
    changed++;
  }
}

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + '\n');
console.log(`\n${changed} products updated.`);
