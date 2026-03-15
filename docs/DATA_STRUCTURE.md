# Product Data Structure Documentation

## Overview

This document describes the JSON data structure used for product management in The Custom Hub catalog. The structure is designed to be easily replaceable with data imported from Shopify or other e-commerce platforms.

---

## JSON Schema

### Root Structure

```json
{
  "categories": [...],
  "products": [...]
}
```

---

## Category Object Schema

Each category in the `categories` array follows this structure:

```json
{
  "id": "string",              // Unique identifier (lowercase with hyphens)
  "name": "string",            // Display name
  "description": "string",     // Category description
  "image": "string",           // Path to category image
  "productCount": number       // Number of products in category
}
```

### Category Example

```json
{
  "id": "apparel",
  "name": "Apparel",
  "description": "Trendy Bengali and Bollywood-inspired clothing for every occasion",
  "image": "/assets/images/categories/apparel.jpg",
  "productCount": 4
}
```

### Category Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (e.g., "apparel", "home-decor") |
| `name` | string | ✅ | Display name shown in UI |
| `description` | string | ✅ | Brief description of category |
| `image` | string | ✅ | Path to category image (relative or absolute URL) |
| `productCount` | number | ✅ | Total products in this category (can be auto-calculated) |

---

## Product Object Schema

Each product in the `products` array follows this structure:

```json
{
  "id": "string",
  "title": "string",
  "description": {
    "short": "string",
    "long": "string"
  },
  "price": number,
  "images": ["string"],
  "category": "string",
  "subcategory": "string",
  "tags": ["string"],
  "externalLinks": {
    "amazon": "string",
    "walmart": "string",
    "etsy": "string"
  },
  "inStock": boolean,
  "specifications": {
    "key": "value"
  }
}
```

### Product Example

```json
{
  "id": "durga-puja-tshirt-2024",
  "title": "Durga Puja 2024 Limited Edition T-Shirt",
  "description": {
    "short": "Celebrate Durga Puja with this exclusive 2024 edition t-shirt",
    "long": "Embrace the spirit of Durga Puja with our limited edition 2024 t-shirt..."
  },
  "price": 24.99,
  "images": [
    "/assets/images/products/durga-puja-tshirt-front.jpg",
    "/assets/images/products/durga-puja-tshirt-back.jpg"
  ],
  "category": "apparel",
  "subcategory": "t-shirts",
  "tags": ["durga puja", "bengali", "festival", "limited edition"],
  "externalLinks": {
    "amazon": "https://amazon.com/product",
    "walmart": "https://walmart.com/product",
    "etsy": "https://etsy.com/product"
  },
  "inStock": true,
  "specifications": {
    "Material": "100% Premium Cotton",
    "Sizes Available": "XS, S, M, L, XL, XXL",
    "Colors": "White, Navy Blue, Red, Black"
  }
}
```

### Product Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (lowercase with hyphens) |
| `title` | string | ✅ | Product title/name |
| `description` | object | ✅ | Contains `short` and `long` description strings |
| `description.short` | string | ✅ | Brief description (1-2 sentences, ~150 chars) |
| `description.long` | string | ✅ | Detailed description (multiple paragraphs) |
| `price` | number | ✅ | Product price in USD |
| `images` | array | ✅ | Array of image URLs (at least 1 required) |
| `category` | string | ✅ | Category ID (must match a category in categories array) |
| `subcategory` | string | ⚪ | Optional subcategory (e.g., "t-shirts", "hoodies") |
| `tags` | array | ✅ | Array of searchable tags (lowercase recommended) |
| `externalLinks` | object | ✅ | Purchase links to external platforms |
| `externalLinks.amazon` | string | ⚪ | Amazon product URL |
| `externalLinks.walmart` | string | ⚪ | Walmart product URL |
| `externalLinks.etsy` | string | ⚪ | Etsy product URL |
| `inStock` | boolean | ✅ | Product availability status |
| `specifications` | object | ✅ | Key-value pairs of product specifications |

---

## Data Helpers / Utility Functions

The `src/utils/dataHelpers.js` file provides convenient functions for accessing and manipulating product data.

### Core Functions

#### `getAllProducts()`
Returns all products from the catalog.

```javascript
import { getAllProducts } from './utils/dataHelpers';

const products = getAllProducts();
console.log(`Total products: ${products.length}`);
```

#### `getAllCategories()`
Returns all categories from the catalog.

```javascript
import { getAllCategories } from './utils/dataHelpers';

const categories = getAllCategories();
```

#### `getProductById(id)`
Get a single product by its ID.

```javascript
import { getProductById } from './utils/dataHelpers';

const product = getProductById('durga-puja-tshirt-2024');
if (product) {
  console.log(product.title);
}
```

#### `getProductsByCategory(category)`
Get all products in a specific category.

```javascript
import { getProductsByCategory } from './utils/dataHelpers';

const apparelProducts = getProductsByCategory('apparel');
```

#### `searchProducts(query)`
Search products by keyword. Searches across title, description, tags, and category. Returns results sorted by relevance.

```javascript
import { searchProducts } from './utils/dataHelpers';

const results = searchProducts('durga puja');
console.log(`Found ${results.length} products`);
```

### Advanced Functions

#### `filterProducts(filters)`
Filter products by multiple criteria.

```javascript
import { filterProducts } from './utils/dataHelpers';

const products = filterProducts({
  category: 'apparel',
  inStock: true,
  minPrice: 20,
  maxPrice: 50,
  tags: ['bengali', 'festival']
});
```

**Available Filters:**
- `category`: Filter by category ID
- `subcategory`: Filter by subcategory
- `inStock`: Filter by stock status (boolean)
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `tags`: Array of tags (matches if any tag is present)

#### `sortProducts(products, sortBy)`
Sort an array of products.

```javascript
import { getAllProducts, sortProducts } from './utils/dataHelpers';

const products = getAllProducts();
const sorted = sortProducts(products, 'price-asc');
```

**Sort Options:**
- `'price-asc'` - Price low to high
- `'price-desc'` - Price high to low
- `'name-asc'` - Name A-Z
- `'name-desc'` - Name Z-A

#### `getRelatedProducts(productId, count)`
Get related products based on category and shared tags.

```javascript
import { getRelatedProducts } from './utils/dataHelpers';

const related = getRelatedProducts('durga-puja-tshirt-2024', 4);
```

#### `getProductsByTag(tag)`
Get all products with a specific tag.

```javascript
import { getProductsByTag } from './utils/dataHelpers';

const festivalProducts = getProductsByTag('durga puja');
```

### Helper Functions

#### `getFeaturedProducts(count)`
Get featured/recommended products (currently returns first N in-stock products).

```javascript
import { getFeaturedProducts } from './utils/dataHelpers';

const featured = getFeaturedProducts(6);
```

#### `getInStockProducts()`
Get only products that are in stock.

```javascript
import { getInStockProducts } from './utils/dataHelpers';

const available = getInStockProducts();
```

#### `getProductsByPriceRange(minPrice, maxPrice)`
Get products within a price range.

```javascript
import { getProductsByPriceRange } from './utils/dataHelpers';

const affordableProducts = getProductsByPriceRange(0, 30);
```

#### `getCategoryById(categoryId)`
Get category details by ID.

```javascript
import { getCategoryById } from './utils/dataHelpers';

const category = getCategoryById('apparel');
```

#### `getAllTags()`
Get unique tags from all products (useful for filter UI).

```javascript
import { getAllTags } from './utils/dataHelpers';

const tags = getAllTags();
// Returns: ['bengali', 'bollywood', 'durga puja', ...]
```

#### `getProductStats()`
Get catalog statistics.

```javascript
import { getProductStats } from './utils/dataHelpers';

const stats = getProductStats();
/*
Returns:
{
  totalProducts: 10,
  inStockCount: 10,
  outOfStockCount: 0,
  totalCategories: 3,
  totalTags: 25,
  averagePrice: "35.59",
  minPrice: 18.99,
  maxPrice: 89.99
}
*/
```

#### `formatPrice(price)`
Format price to USD currency string.

```javascript
import { formatPrice } from './utils/dataHelpers';

const formatted = formatPrice(24.99);
// Returns: "$24.99"
```

---

## Usage Examples

### Example 1: Display Products in a Category

```jsx
import { getProductsByCategory } from '../utils/dataHelpers';
import ProductCard from '../components/ProductCard';

const CategoryPage = ({ categoryId }) => {
  const products = getProductsByCategory(categoryId);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Example 2: Search with Filters

```jsx
import { searchProducts, filterProducts, sortProducts } from '../utils/dataHelpers';

const ProductSearch = ({ query, maxPrice, sortBy }) => {
  let products = searchProducts(query);
  
  if (maxPrice) {
    products = filterProducts({
      ...products,
      maxPrice: maxPrice
    });
  }
  
  products = sortProducts(products, sortBy);
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
};
```

### Example 3: Product Detail Page

```jsx
import { getProductById, getRelatedProducts } from '../utils/dataHelpers';

const ProductDetail = ({ productId }) => {
  const product = getProductById(productId);
  const related = getRelatedProducts(productId, 4);
  
  if (!product) return <div>Product not found</div>;
  
  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description.long}</p>
      
      <h2>Related Products</h2>
      {related.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
};
```

---

## Importing from Shopify

### CSV to JSON Conversion

When importing products from Shopify CSV:

1. **Export from Shopify:**
   - Go to Products > Export
   - Select CSV format
   - Download the file

2. **Map Shopify Fields to Our Schema:**

| Shopify Field | Our Field | Notes |
|--------------|-----------|-------|
| Handle | id | Convert to lowercase with hyphens |
| Title | title | Direct mapping |
| Body (HTML) | description.long | Convert HTML to plain text |
| Vendor | specifications.Brand | Optional |
| Type | subcategory | Map to our subcategory |
| Tags | tags | Split comma-separated values |
| Variant Price | price | Use first variant price |
| Image Src | images | Collect all image URLs |
| Variant Inventory Qty | inStock | Convert to boolean (qty > 0) |

3. **Conversion Script Example:**

```javascript
// shopifyToCustomHub.js
const fs = require('fs');
const csv = require('csv-parser');

const products = [];
const categories = new Set();

fs.createReadStream('shopify_products.csv')
  .pipe(csv())
  .on('data', (row) => {
    const product = {
      id: row.Handle,
      title: row.Title,
      description: {
        short: row.Title, // Derive from title or meta description
        long: stripHtml(row['Body (HTML)'])
      },
      price: parseFloat(row['Variant Price']),
      images: [row['Image Src']].filter(Boolean),
      category: mapToCategory(row.Type),
      subcategory: row.Type.toLowerCase(),
      tags: row.Tags.split(',').map(t => t.trim().toLowerCase()),
      externalLinks: {
        amazon: "", // Add manually
        walmart: "",
        etsy: ""
      },
      inStock: parseInt(row['Variant Inventory Qty']) > 0,
      specifications: {
        // Map from Shopify metafields or variant options
      }
    };
    
    products.push(product);
    categories.add(product.category);
  })
  .on('end', () => {
    const output = {
      categories: Array.from(categories).map(createCategory),
      products: products
    };
    
    fs.writeFileSync('products.json', JSON.stringify(output, null, 2));
  });
```

---

## Sample Products Included

The current `products.json` includes **10 Bengali & Bollywood cultural products** across **3 categories**:

### Categories
1. **Apparel** (4 products)
   - Durga Puja T-Shirt
   - Rabindranath Tagore Poetry Hoodie
   - Shah Rukh Khan Iconic Pose T-Shirt
   - Bengali Calligraphy Sweatshirt

2. **Home Decor** (3 products)
   - Kolkata Skyline Wall Art
   - Alpana Mandala Throw Pillow Set
   - Vintage Bollywood Movie Poster Canvas

3. **Accessories** (3 products)
   - Rosogolla Enamel Mug
   - Pohela Boishakh Tote Bag
   - Bengali Typography Phone Case

---

## Validation Rules

When adding new products, ensure:

✅ **Required Fields:** All required fields are present  
✅ **Unique IDs:** Product and category IDs are unique  
✅ **Valid Categories:** Product category matches existing category ID  
✅ **Price Format:** Price is a positive number  
✅ **Image Arrays:** At least one image URL provided  
✅ **External Links:** At least one external purchase link  
✅ **Tags:** Array of lowercase strings for consistent search  
✅ **Specifications:** At least 3-5 key specifications  

---

## Future Enhancements

Possible extensions to the data structure:

- `featured`: boolean flag for homepage featured products
- `discount`: object with discount percentage and expiry date
- `variants`: array for size/color variations
- `reviews`: array of customer reviews
- `rating`: average product rating
- `sku`: product SKU number
- `weight`: shipping weight
- `dimensions`: product dimensions
- `materials`: detailed material composition

---

## Summary

✅ **10 sample Bengali/Bollywood products** created  
✅ **3 categories** defined  
✅ **20+ utility functions** for data access  
✅ **Comprehensive documentation** provided  
✅ **Shopify import guide** included  
✅ **Ready for production use** with real data  

The data structure is designed to be flexible and easily replaceable with real product data from Shopify or other e-commerce platforms.

