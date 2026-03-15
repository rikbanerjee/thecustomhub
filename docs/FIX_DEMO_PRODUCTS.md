# 🔧 Fix: Removing Demo/Hardcoded Products

## ✅ Issue Identified

Home page is showing demo products like `durga-puja-tshirt-2024` which **DO NOT EXIST** in `products.json`. This is cached JavaScript serving old demo data.

**Verification:**
- ❌ `durga-puja-tshirt-2024` does NOT exist in products.json
- ✅ Actual products have IDs like `unisex-durga-puja-t-shirt-red-black-bengali-goddess-design-copy`
- ✅ products.json contains 62 real Shopify products

---

## 🔍 Root Cause

**Browser/Vite cache** is serving old JavaScript bundle with hardcoded demo products.

---

## 🔧 Complete Fix Steps

### Step 1: Stop Dev Server

Press `Ctrl+C` in terminal to stop the dev server completely.

### Step 2: Clear All Caches

```bash
# Clear Vite cache
rm -rf node_modules/.vite dist .vite

# Clear npm cache (if needed)
npm cache clean --force

# Optional: Clear node_modules and reinstall (if still not working)
# rm -rf node_modules package-lock.json
# npm install
```

### Step 3: Clear Browser Cache

**Method 1: Hard Refresh**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` or `Cmd+Shift+R`

**Method 2: Clear Site Data**
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear site data** or **Clear storage**
4. Check all boxes
5. Click **Clear site data**

**Method 3: Use Incognito/Private Window**
- Open a new incognito/private window
- Navigate to `http://localhost:5173`

### Step 4: Restart Dev Server

```bash
npm run dev
```

Wait for it to fully start (you'll see the localhost URL).

### Step 5: Hard Refresh Browser Again

After dev server starts:
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
- Or close and reopen the browser tab

### Step 6: Verify in Console

Open browser console (F12) and check:

**Expected Output:**
```
📦 getAllProducts() called
✅ Loaded 62 products from products.json (ARRAY FORMAT)
📦 First product check: {
  id: "unisex-durga-puja-t-shirt-red-black-bengali-goddess-design-copy",
  hasType: true,
  hasVariants: true,
  hasShopifyImages: true
}
📁 getAllCategories() called
✅ Extracted 3 categories: Clothing (60), Coffee and Tea Cups (1), Concert (1)
Featured products loaded: 8
```

**Verify product IDs:**
- Should see IDs like `unisex-durga-puja-t-shirt-red-black-bengali-goddess-design-copy`
- Should **NOT** see `durga-puja-tshirt-2024` or any demo IDs

---

## 🐛 Troubleshooting

### If Still Showing Demo Products

#### 1. Check Network Tab

Open DevTools → **Network** tab:
1. Filter by **JS** (JavaScript files)
2. Look for `index-[hash].js` or `main-[hash].js`
3. Check if files have old timestamps
4. If old, hard refresh (`Ctrl+Shift+R`)

#### 2. Disable Service Worker (if any)

1. Open DevTools → **Application** tab
2. Click **Service Workers** in left sidebar
3. Click **Unregister** for any service workers
4. Refresh page

#### 3. Clear Browser Cache Completely

**Chrome:**
1. Go to `chrome://settings/clearBrowserData`
2. Select "Cached images and files"
3. Select "All time"
4. Click **Clear data**

**Firefox:**
1. Go to `about:preferences#privacy`
2. Click **Clear Data**
3. Select "Cached Web Content"
4. Click **Clear Now**

#### 4. Verify products.json is Being Imported

Add this temporarily to `src/pages/Home/index.jsx` to verify:

```javascript
useEffect(() => {
  // Temporary: Log actual products being used
  const { getAllProducts } = require('../../utils/dataHelpers');
  const allProducts = getAllProducts();
  console.log('🔍 VERIFICATION - Products being used:');
  console.log('Count:', allProducts.length);
  console.log('First 5 IDs:', allProducts.slice(0, 5).map(p => p.id));
  
  // ... rest of code
}, []);
```

**Check:**
- Should see 62 products
- Should see real Shopify product IDs
- Should NOT see demo product IDs

#### 5. Check if Multiple products.json Files Exist

```bash
find . -name "products.json" -type f
```

**Should only see:**
- `src/data/products.json` (the correct one)

**If you see others**, check if they contain demo data and remove them.

#### 6. Nuclear Option: Full Reset

If nothing else works:

```bash
# Stop dev server
# Ctrl+C

# Clear everything
rm -rf node_modules/.vite dist .vite
npm cache clean --force

# Restart
npm run dev
```

Then:
- Close browser completely
- Reopen browser
- Clear browser cache (see method 2 above)
- Navigate to localhost:5173 in a new tab
- Hard refresh immediately

---

## ✅ Verification Checklist

After clearing caches and restarting:

- [ ] Console shows "✅ Loaded **62** products"
- [ ] Console shows product IDs like `unisex-durga-puja-t-shirt-...`
- [ ] Console does **NOT** show `durga-puja-tshirt-2024`
- [ ] Home page shows 62+ products in stats
- [ ] Home page shows 3 categories (Clothing, Coffee and Tea Cups, Concert)
- [ ] Featured products have Shopify CDN images
- [ ] Clicking a product goes to real product ID (not demo ID)
- [ ] Product detail page shows real Shopify product data

---

## 🎯 Expected Product IDs

**Real products.json has IDs like:**
- `unisex-durga-puja-t-shirt-red-black-bengali-goddess-design-copy`
- `abstract-durga-maa-shakti-t-shirt`
- `subho-bijoya-t-shirt-bengali-graphic-tee-durga-puja-shirt-unisex-copy-1`

**Demo products (should NOT appear):**
- ❌ `durga-puja-tshirt-2024`
- ❌ `rabindranath-tagore-poetry-hoodie`
- ❌ `shah-rukh-khan-iconic-pose-tshirt`
- ❌ Any ID not in the 62 products.json array

---

## 📝 Files to Check

1. **`src/data/products.json`** - Should have 62 products with Shopify IDs
2. **`src/utils/dataHelpers.js`** - Should import from `../data/products.json`
3. **No other products.json files** - Check if any exist elsewhere

---

## 🚀 Quick Fix Command

Run this to do everything at once:

```bash
# Stop dev server first (Ctrl+C), then:
rm -rf node_modules/.vite dist .vite && npm cache clean --force && npm run dev
```

Then:
1. Hard refresh browser (`Ctrl+Shift+R`)
2. Check console for correct product count and IDs

---

**After following these steps, demo products should be gone and only real Shopify products from products.json should display!** 🎉

