/**
 * Static config for the /custom-orders stepper flow
 * (mockups/custom-order-page-mockup.html).
 */

export const CATEGORIES = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    sub: 'from $19.99',
    path: 'M8 4 4 7l2 3 1.5-1V20h9V9L18 10l2-3-4-3a3 3 0 0 1-8 0Z',
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    sub: 'from $34.99',
    path: 'M8 4 3 7l1.5 4L7 10v10h10V10l2.5 1L21 7l-5-3a4 4 0 0 1-8 0Z M7 14h2m6 0h2',
  },
  {
    id: 'mug',
    name: 'Cup / Mug',
    sub: 'from $14.99',
    path: 'M5 6h11v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z M16 8h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2',
  },
  {
    id: 'onesie',
    name: 'Onesie',
    sub: 'from $17.99',
    path: 'M9 4 5 6l1 4 2-.5V15l-2 3h4l2-2 2 2h4l-2-3V9.5l2 .5 1-4-4-2a3 3 0 0 1-6 0Z',
  },
];

export const CATEGORY_NAMES = {
  tshirt: 'T-Shirt',
  sweatshirt: 'Sweatshirt',
  mug: 'Cup / Mug',
  onesie: 'Onesie',
};

export const SIZES = {
  tshirt: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  sweatshirt: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  onesie: ['0–3M', '3–6M', '6–12M', '12–18M', '18–24M'],
  mug: ['11 oz', '15 oz'],
};

export const COLORS = [
  { name: 'Black', hex: '#1A1423', text: '#fff' },
  { name: 'White', hex: '#ffffff', text: '#1A1423' },
  { name: 'Navy', hex: '#233a5e', text: '#fff' },
  { name: 'Maroon', hex: '#7b1e3a', text: '#fff' },
  { name: 'Sand', hex: '#d9c7a7', text: '#1A1423' },
  { name: 'Sage', hex: '#9caf88', text: '#1A1423' },
];

export const WHATSAPP_NUMBER = '15087334489';
