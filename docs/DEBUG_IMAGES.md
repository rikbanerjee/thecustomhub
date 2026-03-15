# 🐛 Debug: Images and Products Not Showing

## Issue
`npm run dev` not showing all images and items from `products.json`

## ✅ Fixes Applied

### 1. ProductCard Component - Image Safety Check
**File:** `src/components/ProductCard/index.jsx`

**Problem:** Component was accessing `product.images[0]` without checking if the array exists.

**Fix:** Added safety check before accessing images array:
```jsx
// Before:
<img src={product.images[0]} ... />

// After:
{product.images && product.images.length > 0 && !imageError ? (
  <img src={product.images[0]} ... />
) : (
  <div>Placeholder image icon</div>
)}
```

### 2. Debug Logging in Home Page
**File:** `src/pages/Home/index.jsx`

**Added:** Console logging to verify data loading:
- Number of featured products loaded
- Number of categories loaded
- Stats object
- First featured product details (id, title, images)

This helps identify if:
- Products are loading correctly
- Images array is present
- Image URLs are accessible

## 🔍 Verification Steps

### 1. Check Console Logs

Run `npm run dev` and open browser console (F12):

**Expected output:**
```
Featured products loaded: 8
Categories loaded: 3
Stats: {totalProducts: 62, totalCategories: 3, ...}
First featured product: {
  id: "...",
  title: "...",
  hasImages: true,
  imageCount: 1,
  imageUrl: "https://cdn.shopify.com/..."
}
```

**If you see:**
- `Featured products loaded: 0` → Products not loading from JSON
- `hasImages: false` → Images array missing from products
- `imageUrl: undefined` → Image URLs not in products

### 2. Check Network Tab

Open DevTools → Network tab:

**Check:**
- Are product images loading from Shopify CDN?
- Any 404 errors for images?
- CORS errors when loading images?

**Common issues:**
- **403 Forbidden:** Shopify CDN blocking requests
- **CORS Error:** Cross-origin resource sharing issue
- **404 Not Found:** Image URL doesn't exist

### 3. Verify products.json Structure

**Expected structure:**
```json
[
  {
    "id": "product-id",
    "title": "Product Title",
    "images": [
      "https://cdn.shopify.com/.../image.jpg"
    ],
    "variants": [...],
    "type": "Clothing"
  }
]
```

**Verify:**
```bash
node -e "const data = require('./src/data/products.json'); console.log('Total:', data.length); console.log('Has images:', data[0].images?.length);"
```

### 4. Check Product Normalization

Products are normalized in `dataHelpers.js`:

```javascript
const normalizeProduct = (product) => {
  return {
    ...product,
    images: product.images || [],  // ← Always includes images array
    // ... other fields
  };
};
```

**Verify normalization:**
- Check if `getFeaturedProducts()` returns normalized products
- Confirm images array is preserved

## 🛠️ Troubleshooting

### Issue 1: Products Not Loading

**Symptoms:**
- Console shows `Featured products loaded: 0`
- Home page shows "No products found"

**Solutions:**
1. **Check products.json is valid JSON:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('./src/data/products.json'))"
   ```

2. **Check import in dataHelpers.js:**
   ```javascript
   import productsData from '../data/products.json';
   ```

3. **Verify getAllProducts() returns array:**
   ```javascript
   console.log('Products:', getAllProducts().length);
   ```

### Issue 2: Images Not Displaying

**Symptoms:**
- Products show placeholder icon
- Console shows `hasImages: false`
- Network tab shows image errors

**Solutions:**

1. **Check if images array exists:**
   ```javascript
   console.log('Product images:', product.images);
   console.log('Image count:', product.images?.length);
   ```

2. **Verify image URLs:**
   - Check if URLs are valid
   - Test URLs in browser
   - Check for CORS issues

3. **Check ProductCard component:**
   - Verify safety check: `product.images && product.images.length > 0`
   - Check `onError` handler is working

4. **Test image URL manually:**
   ```bash
   curl -I "https://cdn.shopify.com/.../image.jpg"
   # Should return 200 OK
   ```

### Issue 3: CORS Errors with Shopify Images

**Symptoms:**
- Console shows CORS error
- Network tab shows failed requests
- Images don't load

**Solutions:**

1. **Use proxy for development:**
   ```javascript
   // vite.config.js
   export default defineConfig({
     server: {
       proxy: {
         '/api/images': {
           target: 'https://cdn.shopify.com',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api\/images/, '')
         }
       }
     }
   });
   ```

2. **Download images locally:**
   - Use image migration script
   - Host images on Firebase Storage
   - Update image URLs in products.json

3. **Contact Shopify support:**
   - Request CORS headers for your domain
   - Or use Shopify API with authentication

### Issue 4: Only Some Images Showing

**Symptoms:**
- Some products show images, others don't
- Inconsistent display

**Solutions:**

1. **Check each product has images:**
   ```javascript
   const products = getAllProducts();
   products.forEach((p, i) => {
     if (!p.images || p.images.length === 0) {
       console.log(`Product ${i} missing images:`, p.id);
     }
   });
   ```

2. **Verify all image URLs are valid:**
   ```javascript
   products.forEach((p) => {
     p.images?.forEach((url) => {
       // Test each URL
     });
   });
   ```

3. **Check for broken URLs:**
   - Look for null/undefined URLs
   - Check for malformed URLs
   - Verify Shopify CDN URLs are correct

## 📋 Checklist

When running `npm run dev`, verify:

- [ ] Console shows products loading (check logs)
- [ ] Featured products count > 0
- [ ] Categories count > 0
- [ ] First product has `hasImages: true`
- [ ] Image URLs are valid Shopify CDN URLs
- [ ] Network tab shows images loading (200 OK)
- [ ] No CORS errors in console
- [ ] No 404 errors for images
- [ ] ProductCard shows images (not placeholders)
- [ ] Home page displays products correctly

## 🔧 Quick Test

Run this in browser console after page loads:

```javascript
// Check if products loaded
console.log('Featured products:', window.__FEATURED_PRODUCTS__ || 'Not set');

// Check first product
const firstProduct = document.querySelector('[data-product-id]');
if (firstProduct) {
  const img = firstProduct.querySelector('img');
  console.log('First product image:', img?.src);
  console.log('Image loaded:', img?.complete);
}
```

Or add temporary global variable in Home component:

```javascript
// In Home/index.jsx (temporary for debugging)
window.__FEATURED_PRODUCTS__ = featured;
window.__CATEGORIES__ = cats;
```

## 🎯 Expected Behavior

**After fixes:**
1. All 62 products should load from `products.json`
2. Featured products section should show 8 products
3. Each product card should display:
   - Product image from Shopify CDN
   - Product title
   - Price from variants
   - Stock status badge
4. Categories section should show 3 categories
5. All images should load (no placeholders unless image error)

## 📝 Next Steps

1. **Run dev server:**
   ```bash
   npm run dev
   ```

2. **Check browser console:**
   - Look for debug logs
   - Verify data is loading
   - Check for errors

3. **Inspect network requests:**
   - Open DevTools → Network
   - Filter by "Img"
   - Check if images are loading

4. **If issues persist:**
   - Share console logs
   - Share network errors
   - Check products.json structure

## 🔗 Related Files

- `src/data/products.json` - Product data source
- `src/utils/dataHelpers.js` - Data normalization
- `src/pages/Home/index.jsx` - Home page component
- `src/components/ProductCard/index.jsx` - Product display component
- `src/components/ProductGrid/index.jsx` - Product grid container

---

**Last Updated:** After fixing ProductCard image safety check and adding debug logging.

