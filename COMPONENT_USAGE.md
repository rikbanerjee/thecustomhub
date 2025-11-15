# Product Display Components - Usage Guide

Complete guide for using ProductCard, CategoryCard, and ProductGrid components.

---

## 📦 Components Overview

### 1. ProductCard
Displays individual product with image, title, price, and stock status.

### 2. CategoryCard
Displays category with image, name, description, and product count.

### 3. ProductGrid
Container for displaying multiple ProductCard components with loading states.

---

## 🎯 ProductCard Component

### Basic Usage

```jsx
import ProductCard from './components/ProductCard';
import { getProductById } from './utils/dataHelpers';

const product = getProductById('durga-puja-tshirt-2024');

<ProductCard product={product} />
```

### Features

✅ **Lazy Loading Images** - Images load only when visible  
✅ **Stock Badge** - Green "In Stock" or Gray "Out of Stock"  
✅ **Hover Effects** - Image zoom, text color change, arrow animation  
✅ **Loading Skeleton** - Smooth loading animation  
✅ **Error Handling** - Fallback when image fails to load  
✅ **PropTypes Validation** - Type checking for all props  
✅ **Responsive** - Mobile-first design  
✅ **Accessibility** - ARIA labels and semantic HTML  

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `product` | Object | ✅ | Product object from dataHelpers |
| `product.id` | string | ✅ | Unique product identifier |
| `product.title` | string | ✅ | Product title |
| `product.description` | object | ✅ | Short and long descriptions |
| `product.description.short` | string | ✅ | Brief description |
| `product.price` | number | ✅ | Product price |
| `product.images` | array | ✅ | Array of image URLs |
| `product.inStock` | boolean | ✅ | Stock availability |

### Example in Grid Layout

```jsx
const MyProducts = () => {
  const products = getAllProducts();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Hover Effects

- **Image**: Scales 105% on hover
- **Title**: Changes to primary color
- **Arrow**: Slides right
- **Card**: Slight shadow increase

---

## 🏷️ CategoryCard Component

### Basic Usage

```jsx
import CategoryCard from './components/CategoryCard';
import { getAllCategories } from './utils/dataHelpers';

const categories = getAllCategories();

{categories.map(category => (
  <CategoryCard key={category.id} category={category} />
))}
```

### Features

✅ **Lazy Loading Images** - Performance optimized  
✅ **Hover Effects** - Image zoom, lift animation  
✅ **Product Count Badge** - Shows on hover  
✅ **Fallback Icons** - Emoji icons when no image  
✅ **Smooth Transitions** - All animations are smooth  
✅ **PropTypes Validation** - Type checking  
✅ **Responsive** - Works on all screen sizes  

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `category` | Object | ✅ | Category object |
| `category.id` | string | ✅ | Unique category identifier |
| `category.name` | string | ✅ | Category name |
| `category.description` | string | ⚪ | Category description |
| `category.image` | string | ⚪ | Category image URL |
| `category.productCount` | number | ⚪ | Number of products |

### Example with Icons

```jsx
const CategoryGrid = () => {
  const categories = getAllCategories();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};
```

### Custom Category Icons

The component uses predefined icons based on category ID:
- `apparel` → 👕
- `home-decor` → 🏠
- `accessories` → 👜
- `gifts` → 🎁
- Default → 🎨

To customize icons, edit `getCategoryIcon()` function in `CategoryCard/index.jsx`.

---

## 📊 ProductGrid Component

### Basic Usage

```jsx
import ProductGrid from './components/ProductGrid';
import { getAllProducts } from './utils/dataHelpers';

const products = getAllProducts();

<ProductGrid products={products} />
```

### Features

✅ **Loading State** - Skeleton cards while loading  
✅ **Empty State** - Custom message and action  
✅ **Responsive Columns** - Configurable per breakpoint  
✅ **Staggered Animation** - Cards fade in sequentially  
✅ **PropTypes Validation** - Full type checking  
✅ **Flexible Layout** - Customizable grid columns  

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `products` | Array | `[]` | Array of product objects |
| `loading` | boolean | `false` | Show loading skeletons |
| `emptyMessage` | string | `"No products found"` | Message when empty |
| `emptyAction` | node | `null` | Action button/component |
| `columns` | object | See below | Responsive column config |

### Default Columns

```javascript
columns: {
  xs: 1,  // Mobile
  sm: 2,  // Tablet
  md: 3,  // Small desktop
  lg: 4   // Large desktop
}
```

### Example: Loading State

```jsx
const MyPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getProductsByCategory('apparel');
      setProducts(data);
      setLoading(false);
    };
    
    fetchProducts();
  }, []);
  
  return <ProductGrid products={products} loading={loading} />;
};
```

### Example: Empty State with Action

```jsx
<ProductGrid 
  products={[]}
  emptyMessage="No products match your search"
  emptyAction={
    <button onClick={handleClearFilters} className="btn-primary">
      Clear Filters
    </button>
  }
/>
```

### Example: Custom Column Layout

```jsx
// 2-column layout for featured section
<ProductGrid 
  products={featuredProducts}
  columns={{ xs: 1, sm: 2, md: 2, lg: 2 }}
/>
```

### Example: Search Results

```jsx
const SearchResults = ({ query }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);
      const products = searchProducts(query);
      setResults(products);
      setLoading(false);
    }
  }, [query]);
  
  return (
    <ProductGrid 
      products={results}
      loading={loading}
      emptyMessage={`No products found for "${query}"`}
      emptyAction={
        <Link to="/products" className="btn-outline">
          Browse All Products
        </Link>
      }
    />
  );
};
```

---

## 🎨 Styling & Animations

### CSS Classes Used

**From Tailwind:**
- `card` - Base card styling
- `btn-primary`, `btn-secondary`, `btn-outline` - Button styles
- `container-custom` - Container with padding
- `animate-pulse` - Loading animation
- `line-clamp-2` - Truncate to 2 lines

**Custom Animations:**
- `animate-fade-in` - Fade and slide up animation
- Hover transforms and transitions

### Customizing Animations

Edit `src/styles/index.css`:

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

---

## 📱 Responsive Design

### Breakpoints

- **xs (default)**: < 640px - Mobile
- **sm**: ≥ 640px - Large mobile / small tablet
- **md**: ≥ 768px - Tablet
- **lg**: ≥ 1024px - Desktop
- **xl**: ≥ 1280px - Large desktop

### Mobile-First Approach

All components start with mobile layout and enhance for larger screens.

```jsx
// Mobile: 1 column, Desktop: 4 columns
<ProductGrid 
  columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
/>
```

---

## 🔍 Complete Examples

### Example 1: Category Page

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { getProductsByCategory, getCategoryById } from '../utils/dataHelpers';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const cat = getCategoryById(categoryId);
      const prods = getProductsByCategory(categoryId);
      setCategory(cat);
      setProducts(prods);
      setLoading(false);
    };
    
    fetchData();
  }, [categoryId]);
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">{category?.name}</h1>
      
      <ProductGrid 
        products={products}
        loading={loading}
        emptyMessage={`No products in ${category?.name}`}
      />
    </div>
  );
};
```

### Example 2: Homepage Featured Section

```jsx
import ProductGrid from '../components/ProductGrid';
import { getFeaturedProducts } from '../utils/dataHelpers';

const FeaturedSection = () => {
  const featured = getFeaturedProducts(6);
  
  return (
    <section className="py-16">
      <div className="container-custom">
        <h2 className="text-4xl font-bold text-center mb-12">
          Featured Products
        </h2>
        
        <ProductGrid 
          products={featured}
          columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}
        />
      </div>
    </section>
  );
};
```

### Example 3: Search with Filters

```jsx
const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  
  useEffect(() => {
    let results = searchProducts(searchQuery);
    
    // Apply price filter
    results = results.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );
    
    setProducts(results);
  }, [searchQuery, priceRange]);
  
  return (
    <div className="container-custom">
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
      />
      
      <ProductGrid 
        products={products}
        emptyMessage="No products match your criteria"
        emptyAction={
          <button onClick={() => setSearchQuery('')}>
            Clear Search
          </button>
        }
      />
    </div>
  );
};
```

---

## ⚡ Performance Tips

1. **Lazy Loading**: Images load only when visible (built-in)
2. **Memoization**: Consider using `React.memo()` for ProductCard
3. **Virtual Scrolling**: For 100+ products, use react-window
4. **Image Optimization**: Use optimized image formats (WebP)
5. **Skeleton Loading**: Improves perceived performance

### Example with React.memo

```jsx
import { memo } from 'react';

const ProductCard = memo(({ product }) => {
  // Component code...
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
```

---

## 🐛 Common Issues & Solutions

### Issue: Images not loading

**Solution**: Check image URLs in products.json

```javascript
// Verify in browser console
console.log(product.images[0]);
```

### Issue: PropTypes warnings

**Solution**: Ensure all required props are passed

```jsx
// ❌ Bad
<ProductCard />

// ✅ Good
<ProductCard product={productObject} />
```

### Issue: Grid not responsive

**Solution**: Check parent container width

```jsx
// Ensure parent has proper width
<div className="w-full">
  <ProductGrid products={products} />
</div>
```

---

## 🎯 Best Practices

1. **Always provide loading state** for better UX
2. **Use meaningful empty messages** based on context
3. **Keep product objects complete** - don't omit required fields
4. **Test on multiple screen sizes** - especially mobile
5. **Use semantic HTML** - maintain accessibility
6. **Optimize images** - compress before using
7. **Handle errors gracefully** - show fallbacks

---

## ✅ Checklist for Implementation

- [ ] Import required components
- [ ] Fetch product/category data using dataHelpers
- [ ] Pass correct props to components
- [ ] Handle loading states
- [ ] Provide empty state messages
- [ ] Test responsive layout
- [ ] Verify hover effects work
- [ ] Check image lazy loading
- [ ] Test navigation links
- [ ] Verify accessibility (keyboard nav, screen readers)

---

## 📚 Additional Resources

- See `src/utils/dataHelpers.js` for data fetching functions
- See `DATA_STRUCTURE.md` for product schema
- See `QUICK_REFERENCE.md` for data helper examples
- Check Tailwind docs for styling customization

---

**Components are production-ready and fully documented! 🎉**

