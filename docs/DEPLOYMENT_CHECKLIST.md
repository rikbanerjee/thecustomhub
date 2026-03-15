# 🚀 Firebase Hosting Deployment Checklist

Complete step-by-step guide for deploying The Custom Hub to Firebase Hosting.

---

## 📋 Pre-Deployment Requirements

### Prerequisites

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Google account for Firebase
- [ ] Domain name (optional, for custom domain setup)

---

## 🔥 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project:**
   - Click "Add project" or "Create a project"
   - Project name: `thecustomhub` (or your preferred name)
   - Enable Google Analytics (optional, recommended)
   - Accept terms and click "Create project"
   - Wait for project creation to complete

3. **Enable Hosting:**
   - In Firebase Console, go to "Build" > "Hosting"
   - Click "Get started"
   - Follow the setup wizard (you can skip for now, we'll configure manually)

### 1.2 Update Project Configuration

1. **Update `.firebaserc`:**
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```
   - Replace `your-firebase-project-id` with your actual Firebase project ID
   - Find it in Firebase Console > Project Settings > General

2. **Note your Firebase Project ID** - you'll need it later

---

## 🔑 Step 2: Firebase Configuration

### 2.1 Get Firebase Config

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select your project

2. **Get Web App Configuration:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (`</>`)
   - Register app nickname: "The Custom Hub Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
   - Copy the `firebaseConfig` object

### 2.2 Set Environment Variables

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in Firebase credentials:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=thecustomhub.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=thecustomhub
   VITE_FIREBASE_STORAGE_BUCKET=thecustomhub.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Verify `.env` is in `.gitignore`:**
   ```bash
   # Should be ignored (contains secrets)
   cat .gitignore | grep .env
   ```

### 2.3 Update Firebase Config File

**File:** `src/config/firebase.config.js`

The file already uses environment variables, so no changes needed if `.env` is set up correctly.

**Verify:**
```javascript
// Should use import.meta.env variables
apiKey: import.meta.env.VITE_FIREBASE_API_KEY
```

---

## 📦 Step 3: Product Data Preparation

### 3.1 Export from Shopify

1. **Login to Shopify Admin:**
   - Go to your Shopify store admin panel
   - Navigate to "Products" section

2. **Export Products:**
   - Click "Export" button (usually at top right)
   - Choose export format: **CSV**
   - Select products to export: **All products**
   - Click "Export products"
   - Download the CSV file

### 3.2 Convert CSV to JSON

**Option A: Use Online Converter**
1. Use CSV to JSON converter: https://www.csvjson.com/csv2json
2. Upload your Shopify CSV
3. Configure settings:
   - Delimiter: Comma
   - Header row: Yes (first row)
4. Download JSON output

**Option B: Use Node.js Script**

Create `scripts/csv-to-json.js`:
```javascript
import fs from 'fs';
import csv from 'csv-parser';

const results = [];

fs.createReadStream('shopify-export.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Transform Shopify CSV format to our JSON format
    const products = results.map(row => ({
      id: row.Handle || row.handle,
      title: row.Title || row.title,
      description: row['Body (HTML)'] || row.description,
      vendor: row.Vendor || row.vendor,
      type: row.Type || row.type,
      tags: (row.Tags || row.tags || '').split(',').map(t => t.trim()),
      images: parseImages(row),
      variants: parseVariants(row),
      category: row['Product Category'] || row.category || ''
    }));
    
    fs.writeFileSync('src/data/products.json', JSON.stringify(products, null, 2));
    console.log(`✅ Converted ${products.length} products to JSON`);
  });

function parseImages(row) {
  // Handle Shopify image columns (Image Src, Image Alt Text, etc.)
  const images = [];
  let i = 1;
  while (row[`Image Src ${i}`] || row[`image_${i}`]) {
    images.push(row[`Image Src ${i}`] || row[`image_${i}`]);
    i++;
  }
  return images;
}

function parseVariants(row) {
  // Parse variant data from Shopify CSV
  // Adjust based on your CSV structure
  return [{
    price: parseFloat(row['Variant Price'] || row.price || 0),
    compareAtPrice: parseFloat(row['Variant Compare At Price'] || null) || null,
    sku: row['Variant SKU'] || row.sku || null,
    inventoryQty: parseInt(row['Variant Inventory Qty'] || row.inventory || 0),
    option1: row['Option1 Value'] || row.size || null,
    option2: row['Option2 Value'] || row.color || null,
    option3: row['Option3 Value'] || null
  }];
}
```

**Run:**
```bash
npm install csv-parser
node scripts/csv-to-json.js
```

### 3.3 Validate JSON

1. **Check JSON syntax:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('src/data/products.json'))"
   ```

2. **Fix common issues:**
   - Replace `NaN` with `null`
   - Ensure all strings are quoted
   - Remove trailing commas
   - Validate all URLs are valid

3. **Verify product count:**
   ```bash
   node -e "console.log('Products:', JSON.parse(require('fs').readFileSync('src/data/products.json')).length)"
   ```

### 3.4 Update products.json

1. **Replace file:**
   ```bash
   cp converted-products.json src/data/products.json
   ```

2. **Verify in app:**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   # Check that products display correctly
   ```

---

## 🖼️ Step 4: Image Migration

### 4.1 Image Hosting Options

**Option A: Use Shopify CDN (Recommended)**
- Images already hosted on Shopify CDN
- No migration needed
- URLs in products.json already point to Shopify
- Fast and reliable
- **Use this if Shopify URLs work!**

**Option B: Firebase Storage**
1. **Enable Firebase Storage:**
   - Firebase Console > Storage
   - Click "Get started"
   - Start in production mode
   - Choose location (closest to users)

2. **Upload Images:**
   ```bash
   # Install Firebase Tools (if not already)
   npm install -g firebase-tools
   
   # Login
   firebase login
   
   # Upload images
   firebase storage:upload public/assets/images/ gs://your-project-id.appspot.com/images/
   ```

3. **Update Image URLs:**
   - Replace Shopify URLs with Firebase Storage URLs
   - Format: `https://firebasestorage.googleapis.com/...`

**Option C: CDN/Cloud Storage**
- Use Cloudflare Images, Cloudinary, or AWS S3
- Upload images to your CDN
- Update URLs in products.json

### 4.2 Verify Images

1. **Check image accessibility:**
   ```bash
   # Test if images load
   curl -I https://cdn.shopify.com/.../image.jpg
   ```

2. **Test in development:**
   - Run `npm run dev`
   - Visit product pages
   - Verify all images load correctly
   - Check browser console for 404 errors

---

## 🏗️ Step 5: Build Optimization

### 5.1 Review Build Configuration

**File:** `vite.config.js`

Already configured with:
- ✅ Code splitting
- ✅ Chunk optimization
- ✅ Asset optimization
- ✅ Cache-friendly file names

### 5.2 Test Production Build

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Check bundle sizes:**
   ```
   dist/
   ├── index.html
   ├── assets/
   │   ├── css/           (should be <50KB gzipped)
   │   ├── js/
   │   │   ├── vendor-react-[hash].js    (should be <150KB)
   │   │   ├── vendor-router-[hash].js   (should be <50KB)
   │   │   ├── vendor-other-[hash].js    (should be <100KB)
   │   │   ├── data-products-[hash].js   (should be <500KB)
   │   │   └── index-[hash].js           (should be <100KB)
   │   └── images/
   ```

3. **Verify bundle size:**
   ```bash
   # Check total size
   du -sh dist/
   
   # Check individual chunks
   du -h dist/assets/js/*.js
   ```

4. **Target:** Initial bundle <500KB (gzipped)
   - If over 500KB, review code splitting
   - Consider lazy loading heavy components
   - Check if products.json can be split

### 5.3 Preview Production Build

1. **Test locally:**
   ```bash
   npm run preview
   ```

2. **Visit:** http://localhost:4173

3. **Test all routes:**
   - [ ] Homepage loads
   - [ ] Category pages work
   - [ ] Product detail pages work
   - [ ] Search works
   - [ ] Contact form works
   - [ ] All images load
   - [ ] No console errors

### 5.4 Analyze Bundle (Optional)

```bash
npm run build:analyze
# Opens bundle analyzer in browser
```

---

## 🔐 Step 6: Firebase Authentication

### 6.1 Login to Firebase CLI

```bash
firebase login
```

- Opens browser for Google authentication
- Authorize Firebase CLI
- Verify login: `firebase projects:list`

### 6.2 Initialize Firebase (if not done)

```bash
firebase init hosting
```

**Configuration:**
- Use existing project: Yes
- Select project: `thecustomhub` (your project)
- Public directory: `dist`
- Single-page app: Yes
- Automatic builds: No (we'll deploy manually)
- Overwrite index.html: No (we have our own)

---

## 🚀 Step 7: Deploy to Firebase

### 7.1 Pre-Deployment Checks

- [ ] All environment variables set in `.env`
- [ ] `products.json` updated with real data
- [ ] Images are accessible (or uploaded)
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] No console errors
- [ ] All routes work correctly
- [ ] Mobile responsive
- [ ] SEO meta tags correct

### 7.2 Deploy

**Quick Deploy:**
```bash
npm run deploy
```

**Manual Deploy:**
```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

**Deploy Everything:**
```bash
npm run deploy:all
```

### 7.3 Deployment Output

You should see:
```
✔  Deploy complete!

Hosting URL: https://thecustomhub.web.app
               https://thecustomhub.firebaseapp.com
```

### 7.4 Verify Deployment

1. **Visit your site:**
   - https://your-project-id.web.app
   - https://your-project-id.firebaseapp.com

2. **Test all features:**
   - [ ] Homepage loads correctly
   - [ ] Categories display
   - [ ] Products show images
   - [ ] Product detail pages work
   - [ ] Search functionality works
   - [ ] Contact form works
   - [ ] Mobile responsive
   - [ ] 404 page works (try invalid URL)

3. **Check performance:**
   - Use Lighthouse (Chrome DevTools)
   - Target: 90+ Performance score
   - Target: 90+ Accessibility score
   - Target: 90+ SEO score

---

## 🌐 Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain

1. **Firebase Console:**
   - Go to Hosting > Custom domains
   - Click "Add custom domain"
   - Enter domain: `thecustomhub.com`

2. **Verify Domain Ownership:**
   - Add TXT record to DNS:
     ```
     Type: TXT
     Name: @
     Value: firebase=your-verification-code
     ```

3. **Configure DNS:**
   - Add A records:
     ```
     Type: A
     Name: @
     Value: 151.101.1.195
     Value: 151.101.65.195
     ```
   - Add CNAME:
     ```
     Type: CNAME
     Name: www
     Value: your-project-id.web.app
     ```

4. **SSL Certificate:**
   - Firebase automatically provisions SSL
   - Wait 24-48 hours for SSL setup
   - Status will show "Connected" when ready

### 8.2 Redirect Configuration

**File:** `firebase.json`

Already configured for clean URLs and SPA routing.

---

## 📊 Step 9: Post-Deployment

### 9.1 Monitoring

1. **Firebase Analytics:**
   - Enable in Firebase Console
   - View user engagement
   - Track page views
   - Monitor errors

2. **Performance Monitoring:**
   - Enable Firebase Performance
   - Track page load times
   - Monitor API calls
   - Identify bottlenecks

3. **Error Tracking:**
   - Check Firebase Console > Hosting
   - Review error logs
   - Monitor 404 errors

### 9.2 SEO Verification

1. **Google Search Console:**
   - Add property: https://search.google.com/search-console
   - Verify ownership
   - Submit sitemap (if created)
   - Monitor indexing

2. **Test SEO:**
   - [ ] Meta tags present
   - [ ] Open Graph tags present
   - [ ] Structured data (optional)
   - [ ] Sitemap.xml (optional)
   - [ ] robots.txt (optional)

### 9.3 Performance Optimization

1. **Lighthouse Audit:**
   ```bash
   # Install Lighthouse CLI
   npm install -g lighthouse
   
   # Run audit
   lighthouse https://thecustomhub.web.app --view
   ```

2. **Optimize based on results:**
   - Image optimization
   - Code splitting improvements
   - Lazy loading
   - Service worker (PWA)

---

## 🔄 Step 10: Continuous Deployment

### 10.1 Automated Deployments (Optional)

**GitHub Actions:**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: thecustomhub
```

### 10.2 Update Process

**To update products:**
```bash
# 1. Export from Shopify
# 2. Convert to JSON
# 3. Replace src/data/products.json
# 4. Test locally
npm run dev

# 5. Build and deploy
npm run deploy
```

**To update code:**
```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Preview
npm run preview

# 5. Deploy
npm run deploy
```

---

## ✅ Deployment Checklist Summary

### Pre-Deployment
- [ ] Firebase project created
- [ ] Firebase CLI installed and logged in
- [ ] `.firebaserc` updated with project ID
- [ ] `.env` file created with Firebase config
- [ ] Products exported from Shopify
- [ ] CSV converted to JSON
- [ ] `products.json` validated and updated
- [ ] Images verified (or migrated)

### Build
- [ ] `npm run build` succeeds
- [ ] Bundle size <500KB (gzipped)
- [ ] `npm run preview` works
- [ ] All routes tested
- [ ] No console errors
- [ ] Images load correctly
- [ ] Mobile responsive

### Deployment
- [ ] `firebase login` successful
- [ ] `firebase init hosting` completed
- [ ] `npm run deploy` successful
- [ ] Site accessible at Firebase URL
- [ ] All features tested on live site
- [ ] 404 page works
- [ ] Performance acceptable

### Post-Deployment
- [ ] Custom domain configured (optional)
- [ ] Google Analytics set up (optional)
- [ ] Google Search Console verified (optional)
- [ ] Lighthouse audit passed
- [ ] Monitoring enabled

---

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules
npm install
```

**Error: Bundle too large**
- Review code splitting in `vite.config.js`
- Check if products.json can be split
- Use lazy loading for heavy components

### Deployment Fails

**Error: Permission denied**
```bash
# Re-login
firebase logout
firebase login
```

**Error: Project not found**
```bash
# Verify project ID
firebase projects:list

# Update .firebaserc
firebase use your-project-id
```

### Images Not Loading

**Issue: Shopify images blocked**
- Check CORS settings
- Verify image URLs are accessible
- Consider migrating to Firebase Storage

**Issue: 404 on images**
- Verify image paths in products.json
- Check public/assets/images/ exists
- Update image URLs if migrated

### Routes Not Working

**Issue: 404 on all routes**
- Verify `firebase.json` has SPA rewrites
- Check that `rewrites` point to `/index.html`
- Rebuild and redeploy

---

## 📚 Additional Resources

- **Firebase Hosting Docs:** https://firebase.google.com/docs/hosting
- **Vite Build Guide:** https://vitejs.dev/guide/build.html
- **React Router Deployment:** https://reactrouter.com/en/main/start/deployment
- **Shopify API:** https://shopify.dev/docs/api/admin-rest

---

## 🎉 Deployment Complete!

Your site should now be live at:
- **Firebase URL:** https://your-project-id.web.app
- **Custom Domain:** https://thecustomhub.com (if configured)

**Next Steps:**
1. Monitor performance and errors
2. Gather user feedback
3. Plan Phase 2 features (cart, checkout, etc.)
4. Set up analytics tracking
5. Create sitemap and submit to search engines

**Congratulations! Your site is live! 🚀**

