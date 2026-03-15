# 🚀 Quick Reference Guide - Data Helpers

Quick copy-paste examples for common operations.

---

## 📦 Import Statement

```javascript
import {
  getAllProducts,
  getAllCategories,
  getProductById,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  sortProducts,
  getRelatedProducts,
  formatPrice
} from './utils/dataHelpers';
```

---

## 🔥 Most Common Operations

### Get All Products
```javascript
const products = getAllProducts();
```

### Get Product by ID
```javascript
const product = getProductById('durga-puja-tshirt-2024');
```

### Get Products in Category
```javascript
const apparelProducts = getProductsByCategory('apparel');
```

### Search Products
```javascript
const results = searchProducts('durga puja');
```

### Format Price
```javascript
const formatted = formatPrice(24.99); // "$24.99"
```

---

## 🎯 In Components

### Display Products in Category Page
```jsx
import { getProductsByCategory } from '../utils/dataHelpers';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const products = getProductsByCategory('apparel');
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Product Detail with Related
```jsx
import { getProductById, getRelatedProducts } from '../utils/dataHelpers';

const ProductDetail = ({ productId }) => {
  const product = getProductById(productId);
  const related = getRelatedProducts(productId, 4);
  
  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description.long}</p>
      <div>
        {related.map(item => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
};
```

### Search with Filters
```jsx
import { filterProducts, sortProducts } from '../utils/dataHelpers';

const [products, setProducts] = useState([]);

// Filter and sort
const filtered = filterProducts({
  category: 'apparel',
  inStock: true,
  maxPrice: 40
});

const sorted = sortProducts(filtered, 'price-asc');
setProducts(sorted);
```

---

## 🔍 Filter Examples

### By Category
```javascript
const products = filterProducts({ category: 'apparel' });
```

### By Price Range
```javascript
const products = filterProducts({ 
  minPrice: 20, 
  maxPrice: 50 
});
```

### By Stock Status
```javascript
const products = filterProducts({ inStock: true });
```

### Multiple Filters
```javascript
const products = filterProducts({
  category: 'apparel',
  inStock: true,
  maxPrice: 40,
  tags: ['bengali', 'festival']
});
```

---

## 📊 Sort Examples

```javascript
const products = getAllProducts();

// Price: Low to High
const sorted = sortProducts(products, 'price-asc');

// Price: High to Low
const sorted = sortProducts(products, 'price-desc');

// Name: A to Z
const sorted = sortProducts(products, 'name-asc');

// Name: Z to A
const sorted = sortProducts(products, 'name-desc');
```

---

## 🏷️ Tag Operations

### Get Products by Tag
```javascript
const festivalProducts = getProductsByTag('durga puja');
```

### Get All Unique Tags
```javascript
const tags = getAllTags();
// ['alpana', 'ami bangali', 'bengali', 'bengali art', ...]
```

### Display Tags in Filter UI
```jsx
const FilterByTags = () => {
  const allTags = getAllTags();
  
  return (
    <div>
      {allTags.map(tag => (
        <button key={tag} onClick={() => handleTagClick(tag)}>
          #{tag}
        </button>
      ))}
    </div>
  );
};
```

---

## 📈 Analytics

### Get Catalog Stats
```javascript
const stats = getProductStats();
console.log(`Total Products: ${stats.totalProducts}`);
console.log(`Average Price: $${stats.averagePrice}`);
console.log(`Price Range: $${stats.minPrice} - $${stats.maxPrice}`);
```

### Display Stats Dashboard
```jsx
const Dashboard = () => {
  const stats = getProductStats();
  
  return (
    <div>
      <div>Products: {stats.totalProducts}</div>
      <div>Categories: {stats.totalCategories}</div>
      <div>In Stock: {stats.inStockCount}</div>
      <div>Avg Price: ${stats.averagePrice}</div>
    </div>
  );
};
```

---

## 🎨 UI Examples

### Product Card with Formatted Price
```jsx
const ProductCard = ({ product }) => (
  <div className="card">
    <img src={product.images[0]} alt={product.title} />
    <h3>{product.title}</h3>
    <p>{product.description.short}</p>
    <span className="price">{formatPrice(product.price)}</span>
    <Link to={`/product/${product.id}`}>View Details</Link>
  </div>
);
```

### Category Grid
```jsx
const CategoryGrid = () => {
  const categories = getAllCategories();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map(category => (
        <Link key={category.id} to={`/category/${category.id}`}>
          <img src={category.image} alt={category.name} />
          <h3>{category.name}</h3>
          <p>{category.productCount} products</p>
        </Link>
      ))}
    </div>
  );
};
```

### Search Bar with Live Results
```jsx
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      const searchResults = searchProducts(value);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };
  
  return (
    <div>
      <input 
        type="text" 
        value={query}
        onChange={handleSearch}
        placeholder="Search products..."
      />
      {results.length > 0 && (
        <div className="results">
          {results.map(product => (
            <div key={product.id}>{product.title}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 🛒 E-commerce Features

### Featured Products Section
```jsx
const FeaturedProducts = () => {
  const featured = getFeaturedProducts(6);
  
  return (
    <section>
      <h2>Featured Products</h2>
      <div className="grid grid-cols-3 gap-4">
        {featured.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
```

### Related Products Section
```jsx
const RelatedProducts = ({ currentProductId }) => {
  const related = getRelatedProducts(currentProductId, 4);
  
  if (related.length === 0) return null;
  
  return (
    <section>
      <h2>You May Also Like</h2>
      <div className="grid grid-cols-4 gap-4">
        {related.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
```

### Price Filter Slider
```jsx
const PriceFilter = ({ onFilterChange }) => {
  const [maxPrice, setMaxPrice] = useState(100);
  
  const handlePriceChange = (value) => {
    setMaxPrice(value);
    const filtered = filterProducts({
      maxPrice: value
    });
    onFilterChange(filtered);
  };
  
  return (
    <div>
      <label>Max Price: ${maxPrice}</label>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={maxPrice}
        onChange={(e) => handlePriceChange(e.target.value)}
      />
    </div>
  );
};
```

---

## 🔄 Common Patterns

### Load Products on Component Mount
```jsx
useEffect(() => {
  const products = getAllProducts();
  setProducts(products);
}, []);
```

### Search with Debounce
```jsx
const [searchQuery, setSearchQuery] = useState('');
const [results, setResults] = useState([]);

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.length > 2) {
      const searchResults = searchProducts(searchQuery);
      setResults(searchResults);
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Category Page with Search
```jsx
const CategoryPage = ({ categoryId }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const products = getProductsByCategory(categoryId);
    setAllProducts(products);
    setFilteredProducts(products);
  }, [categoryId]);
  
  useEffect(() => {
    if (searchQuery) {
      const results = searchProducts(searchQuery);
      const categoryResults = results.filter(
        p => p.category === categoryId
      );
      setFilteredProducts(categoryResults);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchQuery, allProducts, categoryId]);
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search in this category..."
      />
      <div className="products">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

---

## 💾 Data Access Patterns

### Check if Product Exists
```javascript
const product = getProductById(id);
if (product) {
  // Product exists
} else {
  // Product not found, redirect or show error
  navigate('/404');
}
```

### Check Stock Availability
```javascript
const product = getProductById(id);
if (product.inStock) {
  // Show "Add to Cart" or "Buy Now" buttons
} else {
  // Show "Out of Stock" message
}
```

### Get Purchase Links
```javascript
const product = getProductById(id);
const externalLinks = product.externalLinks || {};
const availableLinks = Object.entries(externalLinks)
  .filter(([_, url]) => url);

availableLinks.forEach(([platform, url]) => {
  console.log(`Buy on ${platform}: ${url}`);
});
```

---

## 🎯 Pro Tips

1. **Always check for null** when using `getProductById()` or `getCategoryById()`
2. **Use formatPrice()** for consistent currency display
3. **Cache search results** to avoid re-computing
4. **Debounce search input** for better performance
5. **Use getRelatedProducts()** to increase engagement
6. **Display tags** as clickable filters
7. **Show product count** in category headers
8. **Filter out-of-stock** products in main catalog if desired

---

## 📱 Quick Copy-Paste Snippets

### Product List Component
```jsx
const ProductList = ({ categoryId, sortBy = 'name-asc' }) => {
  let products = categoryId 
    ? getProductsByCategory(categoryId)
    : getAllProducts();
  
  products = sortProducts(products, sortBy);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Category Navigation
```jsx
const CategoryNav = () => {
  const categories = getAllCategories();
  
  return (
    <nav>
      {categories.map(category => (
        <Link key={category.id} to={`/category/${category.id}`}>
          {category.name} ({category.productCount})
        </Link>
      ))}
    </nav>
  );
};
```

### Product Info Display
```jsx
const ProductInfo = ({ product }) => (
  <div>
    <h1>{product.title}</h1>
    <p className="price">{formatPrice(product.price)}</p>
    <p className="short-desc">{product.description.short}</p>
    <div className="long-desc">{product.description.long}</div>
    
    {product.tags.map(tag => (
      <span key={tag} className="tag">#{tag}</span>
    ))}
    
    <dl>
      {Object.entries(product.specifications).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);
```

---

**That's it! You now have everything you need to work with the product data! 🎉**

