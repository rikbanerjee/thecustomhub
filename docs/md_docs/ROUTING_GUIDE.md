# 🗺️ The Custom Hub - Routing Guide

## Complete Routing Architecture

### Route Structure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.jsx (Router)                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   Layout (Header + Footer)                 │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │                     Routes                            │ │ │
│  │  │                                                        │ │ │
│  │  │  "/" ──────────────────────► Home/                   │ │ │
│  │  │                                                        │ │ │
│  │  │  "/category/:categoryName" ► CategoryPage/           │ │ │
│  │  │                                                        │ │ │
│  │  │  "/product/:productId" ────► ProductDetail/          │ │ │
│  │  │                                                        │ │ │
│  │  │  "/contact" ───────────────► Contact/                │ │ │
│  │  │                                                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Route Breakdown

### 1. Home Page: `/`

**Component:** `src/pages/Home/index.jsx`

**Purpose:** Landing page with hero, categories, and featured products

**Features:**
- Hero section with "Shop Now" CTA
- 4 category cards (using CategoryCard component)
- 6 featured products (using ProductCard component)
- About section

**Navigation From Here:**
- Click category → `/category/{categoryId}`
- Click product → `/product/{productId}`
- Click "Shop Now" → `/products` (redirects to home)
- Click "Contact" → `/contact`

**Key Components Used:**
- `CategoryCard` (displays categories)
- `ProductCard` (displays products)

---

### 2. Category Page: `/category/:categoryName`

**Component:** `src/pages/CategoryPage/index.jsx`

**Dynamic Parameter:** `:categoryName` (e.g., "apparel", "home-decor")

**Purpose:** Display all products in a specific category

**Features:**
- Breadcrumb navigation (Home > Category)
- Category header with icon
- Search bar for filtering products
- Product count display
- Responsive product grid
- "No products found" message

**Example URLs:**
- `/category/apparel` - Shows all apparel products
- `/category/home-decor` - Shows all home decor products
- `/category/accessories` - Shows all accessories
- `/category/gifts` - Shows all gifts

**Navigation From Here:**
- Click breadcrumb "Home" → `/`
- Click product → `/product/{productId}`
- Click category badge in product detail → Back to same category

**Key Components Used:**
- `SearchBar` (filter products)
- `ProductCard` (display products)

---

### 3. Product Detail: `/product/:productId`

**Component:** `src/pages/ProductDetail/index.jsx`

**Dynamic Parameter:** `:productId` (e.g., "india-usa-flag-tee")

**Purpose:** Display full details of a single product

**Features:**
- Breadcrumb navigation (Home > Category > Product)
- Image gallery with thumbnails
- Product name, price, description
- Specifications table
- Purchase buttons (Amazon, Walmart, Etsy)
- Clickable category badge
- Contact CTA

**Example URLs:**
- `/product/india-usa-flag-tee`
- `/product/namaste-america-hoodie`
- `/product/mandala-throw-pillow`

**Navigation From Here:**
- Click breadcrumb "Home" → `/`
- Click breadcrumb category → `/category/{categoryId}`
- Click category badge → `/category/{categoryId}`
- Click "Contact Us" → `/contact`

**External Links:**
- "Buy on Amazon" → Opens Amazon in new tab
- "Buy on Walmart" → Opens Walmart in new tab
- "Buy on Etsy" → Opens Etsy in new tab

---

### 4. Contact Page: `/contact`

**Component:** `src/pages/Contact/index.jsx`

**Purpose:** Contact form for inquiries and custom orders

**Features:**
- Contact form with validation
- Order type selector (General Inquiry, Custom Order, Bulk Order, Support)
- Success message on submission
- Contact information (email, phone)
- Business hours
- "Why Choose Us" section

**Navigation From Here:**
- Click "Home" in footer → `/`
- Click "Products" in footer → `/`
- Click logo → `/`

**Form Fields:**
- Name (required)
- Email (required)
- Phone (optional)
- Type of Inquiry (required)
- Message (required)

---

## Component Hierarchy

```
App.jsx
  └── Router
       └── Routes
            └── Layout/
                 ├── Header/
                 │    ├── Logo (Link to /)
                 │    ├── Nav: Home (/)
                 │    ├── Nav: Products (/)
                 │    └── Nav: Contact (/contact)
                 │
                 ├── Outlet (renders current page)
                 │    │
                 │    ├── Home/
                 │    │    ├── CategoryCard/ (4x) → /category/:name
                 │    │    └── ProductCard/ (6x) → /product/:id
                 │    │
                 │    ├── CategoryPage/
                 │    │    ├── SearchBar/
                 │    │    └── ProductCard/ (Nx) → /product/:id
                 │    │
                 │    ├── ProductDetail/
                 │    │    └── Purchase Links (external)
                 │    │
                 │    └── Contact/
                 │         └── Contact Form
                 │
                 └── Footer/
                      ├── Link to /
                      ├── Link to /products
                      └── Link to /contact
```

---

## Navigation Flow Examples

### User Journey 1: Browse by Category

```
Home (/)
  → Click "Apparel" category
  → Category Page (/category/apparel)
    → Click "India-USA Flag T-Shirt"
    → Product Detail (/product/india-usa-flag-tee)
      → Click "Buy on Amazon"
      → External: Amazon.com (new tab)
```

### User Journey 2: Search Within Category

```
Home (/)
  → Click "Home Decor" category
  → Category Page (/category/home-decor)
    → Type "pillow" in search bar
    → Filters to show only pillow products
    → Click product
    → Product Detail (/product/mandala-throw-pillow)
```

### User Journey 3: Contact for Custom Order

```
Home (/)
  → Click "Get in Touch" button
  → Contact (/contact)
    → Fill out form
    → Select "Custom Order"
    → Submit
    → Success message displayed
```

### User Journey 4: Category Badge Navigation

```
Product Detail (/product/yoga-meditation-mat)
  → Click category badge "Accessories"
  → Category Page (/category/accessories)
    → See all accessories
    → Click another product
    → Product Detail (/product/heritage-tote-bag)
```

---

## URL Parameters Explained

### `:categoryName`

**Type:** String (lowercase with hyphens)

**Possible Values:**
- `apparel`
- `home-decor`
- `accessories`
- `gifts`

**Usage in Component:**
```javascript
const { categoryName } = useParams();
// Access: /category/apparel
// categoryName = "apparel"
```

### `:productId`

**Type:** String (lowercase with hyphens)

**Examples:**
- `india-usa-flag-tee`
- `namaste-america-hoodie`
- `mandala-throw-pillow`
- `diwali-decor-set`

**Usage in Component:**
```javascript
const { productId } = useParams();
// Access: /product/india-usa-flag-tee
// productId = "india-usa-flag-tee"
```

---

## Route Guards & Error Handling

### Invalid Category

**URL:** `/category/invalid-category`

**Behavior:**
- Component checks if category exists in `products.json`
- If not found: Shows "Category Not Found" message
- Provides "Back to Home" button

### Invalid Product

**URL:** `/product/invalid-product`

**Behavior:**
- Component checks if product exists in `products.json`
- If not found: Automatically redirects to `/products` (home)

### 404 Not Found

**Any unmatched route:** e.g., `/random-page`

**Behavior:**
- Falls back to Layout
- Could add a custom 404 page in the future

---

## Legacy Route Support

For backward compatibility with old URLs:

```javascript
// Old URL                  → New Route
/products                   → / (Home)
/products/:id              → /product/:id (ProductDetail)
/products?category=apparel → / (Home, could be updated to category page)
```

**Implementation in App.jsx:**
```javascript
<Route path="products" element={<Home />} />
<Route path="products/:id" element={<ProductDetail />} />
```

---

## Link Examples in Code

### Link to Home
```jsx
<Link to="/">Home</Link>
```

### Link to Category
```jsx
<Link to={`/category/${category.id}`}>
  {category.name}
</Link>
```

### Link to Product
```jsx
<Link to={`/product/${product.id}`}>
  View Product
</Link>
```

### Link to Contact
```jsx
<Link to="/contact">Contact Us</Link>
```

---

## Search Params (Query Strings)

Currently not heavily used, but supported by React Router.

**Example Usage (Future Enhancement):**

```
/category/apparel?sort=price&order=asc
                  ↑      ↑        ↑
             search params
```

**Access in Component:**
```javascript
const [searchParams] = useSearchParams();
const sort = searchParams.get('sort'); // "price"
const order = searchParams.get('order'); // "asc"
```

---

## Firebase Hosting SPA Configuration

**Problem:** Direct navigation to `/product/some-id` would return 404 from server.

**Solution:** `firebase.json` rewrites all routes to `/index.html`

```json
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

This ensures React Router handles all routing client-side.

---

## Testing Routes Locally

### Start Dev Server
```bash
npm run dev
```

### Test All Routes
1. http://localhost:5173/ (Home)
2. http://localhost:5173/category/apparel (Category)
3. http://localhost:5173/product/india-usa-flag-tee (Product)
4. http://localhost:5173/contact (Contact)

### Test Invalid Routes
- http://localhost:5173/invalid → Falls back gracefully
- http://localhost:5173/category/invalid → Shows "Not Found" message
- http://localhost:5173/product/invalid → Redirects to home

---

## Summary

✅ **4 Main Routes** implemented  
✅ **2 Dynamic Parameters** (categoryName, productId)  
✅ **Breadcrumb Navigation** on detail pages  
✅ **SPA Routing** with React Router v7  
✅ **Firebase SPA Rewrite** configured  
✅ **Error Handling** for invalid routes  
✅ **Legacy Support** for old URLs  

**All routing requirements met and tested successfully!**

