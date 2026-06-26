# The CustomHub: Product Templates

This document defines the structure for adding new products to `src/data/products.json`.

## Product JSON Schema

Each product in the `products.json` array must be an object with the following structure.

```json
{
  "id": "kebab-case-id",
  "sku": "PARENT-SKU-001",
  "title": "Product Name - Clear and descriptive",
  "vendor": "The CustomHub",
  "category": "Google Product Category string",
  "type": "Internal Collection Tag",
  "price": 0.00,
  "description": "HTML Description for Website",
  "images": [
    "https://firebasestorage.../image-01.jpg?alt=media"
  ],
  "options": [
    { "name": "Size", "position": 1, "values": ["S", "M", "L", "XL"] },
    { "name": "Color", "position": 2, "values": ["Black", "White"] }
  ],
  "variants": [
    {
      "sku": "CHILD-SKU-BLACK-S",
      "option1": "S",
      "option2": "Black",
      "option3": null,
      "price": 19.99,
      "compareAtPrice": 24.99,
      "inventoryQty": 10,
      "variantImg": "https://firebasestorage.../black-s.jpg?alt=media"
    }
  ],
  "tags": ["tag1", "tag2"],
  "isCustomizable": false,
  
  "publishTo": {
    "website": true,
    "amazon": false,
    "walmart": false
  },

  "marketplace": {
    "amazon": {
      "price": 0.00, 
      "title": "SEO Optimized Title",
      "bulletPoints": ["BP1", "BP2", "BP3", "BP4", "BP5"]
    },
    "walmart": {
      "price": 0.00
    }
  }
}
```

### Field Definitions:

- **`id` (String, Required):** A unique identifier (kebab-case).
- **`sku` (String, Required):** The Parent SKU for the product group.
- **`title` (String, Required):** The customer-facing name for the website.
- **`options` (Array, Required for Clothing):** Defines what the variant options represent.
    - `name`: e.g., "Size", "Color".
    - `position`: 1, 2, or 3 (maps to `option1`, `option2`, `option3`).
- **`variants` (Array, Required):** Individual product variations.
    - `sku`: The unique Child SKU for this specific size/color combination.
    - `option1`, `option2`, `option3`: The values matching the `options` definitions.
    - `price`: Price for this specific variant.
    - `inventoryQty`: Current stock level.
- **`publishTo` (Object, Required):** Multi-channel visibility flags.
- **`marketplace` (Object, Optional):** Channel-specific overrides and metadata.

### Valid Values Reference

**`type` (Site Collections):**
*   `"Coffee and Tea Cups"` (Mugs)
*   `"Clothing"` (General Apparel)
*   `"T-Shirts"` (Specific Tees)
*   `"Sports Jerseys"` (Cricket/Soccer Kits)
*   `"Sweatshirts"` (Hoodies/Crewnecks)
*   `"Home Decor"` (Pillows, Posters)

**`category` (Google Taxonomy - Examples):**
*   `"Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs"`
*   `"Apparel & Accessories > Clothing > Clothing Tops > T-Shirts"`
*   `"Apparel & Accessories > Clothing > Uniforms & Workwear > Sports Uniforms"`
