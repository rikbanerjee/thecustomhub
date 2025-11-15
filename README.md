# The Custom Hub - Product Catalog Website

A modern, static product catalog website for thecustomhub.com featuring NRI Indian and American cultural merchandise. Built with React, Vite, and Tailwind CSS, optimized for Firebase Hosting.

## 🎯 Project Overview

**Phase 1**: Display-only catalog with external purchase links (Current)
- No shopping cart or checkout functionality
- Links to Amazon, Walmart, and Etsy for purchases
- Contact form for manual order inquiries

## 🛠️ Tech Stack

- **React 19** - Latest React with functional components and hooks
- **Vite** - Lightning-fast build tool and dev server
- **React Router DOM v7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework with @theme directive
- **Firebase Hosting** - Production deployment platform
- **ES6+** - Modern JavaScript syntax

## 📁 Project Structure

```
thecustomhub/
├── public/
│   └── assets/
│       └── images/          # Product images go here
├── src/
│   ├── components/          # Reusable UI components (subdirectory pattern)
│   │   ├── CategoryCard/
│   │   │   └── index.jsx   # Category display card
│   │   ├── Header/
│   │   │   └── index.jsx   # Navigation header with mobile menu
│   │   ├── Footer/
│   │   │   └── index.jsx   # Site footer
│   │   ├── Layout/
│   │   │   └── index.jsx   # Main layout wrapper
│   │   ├── ProductCard/
│   │   │   └── index.jsx   # Product display card
│   │   └── SearchBar/
│   │       └── index.jsx   # Search input component
│   ├── pages/               # Page-level components (subdirectory pattern)
│   │   ├── Home/
│   │   │   └── index.jsx   # Homepage with hero, categories, featured products
│   │   ├── CategoryPage/
│   │   │   └── index.jsx   # Category-specific product listing
│   │   ├── ProductDetail/
│   │   │   └── index.jsx   # Individual product details page
│   │   └── Contact/
│   │       └── index.jsx   # Contact form page
│   ├── config/
│   │   └── firebase.config.js  # Firebase configuration
│   ├── data/
│   │   └── products.json    # Product data from Shopify (array format, categories extracted dynamically)
│   ├── styles/
│   │   └── index.css        # Global styles with Tailwind v4 @theme
│   ├── utils/
│   │   └── helpers.js       # Utility functions
│   ├── App.jsx              # Main app with route definitions
│   └── main.jsx             # Entry point
├── .firebaserc              # Firebase project configuration
├── .gitignore               # Git ignore rules
├── firebase.json            # Firebase hosting configuration
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS with Tailwind plugin
├── tailwind.config.js       # Tailwind custom theme configuration
└── vite.config.js           # Vite build configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase CLI (for deployment)

### Installation

1. **Clone and navigate to the project:**
```bash
cd /Users/rikbanerjee/work/projects/thecustomhub
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

```bash
npm run dev              # Start Vite dev server with hot reload
npm run build            # Build for production (outputs to /dist)
npm run preview          # Preview production build locally
npm run lint             # Run ESLint
npm run deploy           # Build and deploy to Firebase
```

## 🗺️ Routing Configuration

The app uses React Router with the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Homepage with hero, categories, and featured products |
| `/category/:categoryName` | CategoryPage | Products filtered by category |
| `/product/:productId` | ProductDetail | Individual product details |
| `/contact` | Contact | Contact form for inquiries |

**Legacy Routes** (for backward compatibility):
- `/products` → redirects to Home
- `/products/:id` → redirects to ProductDetail

## 🎨 Component Architecture

### Reusable Components

**CategoryCard** - Displays category with icon and name
```jsx
import CategoryCard from './components/CategoryCard';
<CategoryCard category={categoryObject} />
```

**ProductCard** - Displays product preview with image, name, price
```jsx
import ProductCard from './components/ProductCard';
<ProductCard product={productObject} />
```

**SearchBar** - Reusable search input with clear functionality
```jsx
import SearchBar from './components/SearchBar';
<SearchBar onSearch={handleSearch} placeholder="Search..." />
```

### Best Practices Implemented

✅ Functional components with hooks (no class components)  
✅ Component subdirectory pattern for better organization  
✅ Small, focused, reusable components  
✅ Modern ES6+ syntax (arrow functions, destructuring, etc.)  
✅ Proper prop types and validation  
✅ Mobile-first responsive design  

## 📦 Product Data Management

### Dynamic Category Extraction

**Important**: The application now uses **dynamic category extraction** from Shopify product data. Categories are no longer defined in a static array but are automatically generated from product data.

### JSON Structure (Shopify Format)

Products are defined in `src/data/products.json` as an array of product objects:

```json
[
  {
    "id": "product-slug",
    "title": "Product Name",
    "description": "<p>HTML description from Shopify</p>",
    "vendor": "The CustomHub",
    "category": "Apparel & Accessories > Clothing > Clothing Tops > T-Shirts",
    "type": "Clothing",
    "tags": ["tag1", "tag2", "tag3"],
    "images": ["https://cdn.shopify.com/..."],
    "variants": [
      {
        "sku": "",
        "option1": "S",
        "option2": "Black",
        "option3": null,
        "price": 18.99,
        "compareAtPrice": null,
        "inventoryQty": 10,
        "variantImg": "https://cdn.shopify.com/..."
      }
    ],
    "externalLinks": {
      "amazon": "https://amazon.com/...",
      "walmart": "",
      "etsy": ""
    },
    "inStock": true,
    "specifications": {
      "Product Category": "Apparel & Accessories > Clothing",
      "Type": "Clothing",
      "Vendor": "The CustomHub"
    }
  }
]
```

### How Dynamic Categories Work

1. **Category Extraction**: Categories are automatically extracted from the `type` field in each product
2. **Slugification**: Category names are converted to URL-friendly IDs (e.g., "Clothing" → "clothing", "Home & Garden" → "home-garden")
3. **Product Counting**: Each category tracks how many products belong to it
4. **Category Images**: The first product image from each category is used as the category image
5. **Descriptions**: Category descriptions are auto-generated or use predefined templates

**Category Extraction Logic** (`src/utils/dataHelpers.js`):
```javascript
// Categories are dynamically extracted from product types
export const getAllCategories = () => {
  const products = getAllProducts();
  const categoryMap = new Map();

  products.forEach(product => {
    const categoryName = product.type || 'Other';
    const categoryId = slugify(categoryName);
    // ... category creation logic
  });
  
  return Array.from(categoryMap.values());
};
```

### Adding New Products

1. Add product data to `src/data/products.json` following the Shopify format
2. Ensure each product has a `type` field (used for categorization)
3. Include `variants` array with pricing information
4. Categories will be automatically generated from the `type` field
5. Rebuild: `npm run build`

### Importing from Shopify CSV

To import products from Shopify:
1. Export products as CSV from Shopify admin
2. Convert CSV to JSON array format (not an object with categories)
3. Ensure the following fields are present:
   - `id` (product handle/slug)
   - `title`
   - `description` (HTML string)
   - `type` (for category extraction)
   - `category` (full Shopify category path)
   - `tags` (array)
   - `images` (array)
   - `variants` (array with price, options, inventory)
   - `inStock` (boolean)
4. Replace `src/data/products.json` with the new data
5. Categories will be automatically extracted on next build

**Note**: No need to manually create or update categories - they are generated automatically!

## 🎨 Styling & Design

### Color Palette

The design uses **red and blue** tones (avoiding orange per user preference):

- **Primary (Red)**:
  - `primary-50` to `primary-900` - Brand color for CTAs and accents
  - Main: `primary-600` (#dc2626)

- **Secondary (Blue)**:
  - `secondary-50` to `secondary-900` - Supporting color
  - Main: `secondary-600` (#0284c7)

- **Gray Scale**: Text, backgrounds, borders

### Tailwind v4 Custom Theme

Custom colors are defined using CSS variables in `src/styles/index.css`:

```css
@theme {
  --color-primary-600: #dc2626;
  --color-secondary-600: #0284c7;
  /* ... more colors */
}
```

### Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

All components use mobile-first responsive design.

## 🔥 Firebase Configuration

### Initial Setup

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase:**
```bash
firebase login
```

3. **Create Project:**
- Go to https://console.firebase.google.com
- Create a new project named "thecustomhub"
- Enable Hosting in the project

4. **Configure Firebase:**
Edit `src/config/firebase.config.js` with your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "thecustomhub.firebaseapp.com",
  projectId: "thecustomhub",
  // ... other config
};
```

### Deployment

**Build and deploy:**
```bash
npm run deploy
```

**Or deploy manually:**
```bash
npm run build
firebase deploy --only hosting
```

Your site will be live at: `https://thecustomhub.web.app`

## 🔧 Configuration Files

### Vite Config (`vite.config.js`)
- React plugin configuration
- Build output settings

### Tailwind Config (`tailwind.config.js`)
- Custom theme extensions
- Color palette definitions (note: some colors moved to CSS @theme)

### PostCSS Config (`postcss.config.js`)
- Tailwind CSS v4 PostCSS plugin
- Autoprefixer

### Firebase Config (`firebase.json`)
- Hosting rules
- Redirects for SPA routing
- Cache headers for static assets

## 📱 Features

### Current (Phase 1)

✅ Responsive homepage with hero section  
✅ Category browsing with dedicated category pages  
✅ Product catalog with search functionality  
✅ Detailed product pages with specifications  
✅ External purchase links (Amazon, Walmart, Etsy)  
✅ Contact form for inquiries  
✅ Mobile-first responsive design  
✅ SEO-friendly routing  

### Future Enhancements (Phase 2+)

- Shopping cart functionality
- Checkout integration (Stripe/PayPal)
- User authentication and accounts
- Order history tracking
- Product reviews and ratings
- Wishlist feature
- Advanced filtering (price range, tags)
- Admin panel for product management

## 🧪 Development Guidelines

### Component Creation

When creating a new component:

1. Create a subdirectory: `src/components/ComponentName/`
2. Add `index.jsx` inside the directory
3. Use functional components with hooks
4. Export as default: `export default ComponentName`

Example:
```jsx
// src/components/MyComponent/index.jsx
import { useState } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState('');
  
  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

### Page Creation

Same pattern as components but in `src/pages/`:

```jsx
// src/pages/MyPage/index.jsx
import MyComponent from '../../components/MyComponent';

const MyPage = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Page content */}
      </div>
    </div>
  );
};

export default MyPage;
```

### Adding Routes

Update `src/App.jsx`:

```jsx
<Route path="my-route" element={<MyPage />} />
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

© 2025 The Custom Hub. All rights reserved.

## 📞 Support

For questions or issues:
- Email: info@thecustomhub.com
- Phone: +1 (234) 567-890

## 🙏 Acknowledgments

- Built with modern React best practices (2025)
- Styled with Tailwind CSS v4
- Deployed on Firebase Hosting
