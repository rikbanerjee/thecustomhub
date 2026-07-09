import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { CartProvider } from './contexts/CartContext';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const CustomOrders = lazy(() => import('./pages/CustomOrders'));
const AiStylist = lazy(() => import('./pages/AiStylist'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderCancelled = lazy(() => import('./pages/OrderCancelled'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));

function App() {
  return (
    <Router>
      <CartProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-primary-50">
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin mx-auto" />
                <p className="text-sm text-light-gray">Loading experience…</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="category/:categoryName" element={<CategoryPage />} />
              <Route path="product/:productId" element={<ProductDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="custom-orders" element={<CustomOrders />} />
              <Route path="ai-stylist" element={<AiStylist />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="cart" element={<Cart />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="order-cancelled" element={<OrderCancelled />} />
              <Route path="return-policy" element={<ReturnPolicy />} />
              {/* Legacy route support */}
              <Route path="products" element={<Home />} />
              <Route path="products/:id" element={<ProductDetail />} />
            </Route>
          </Routes>
        </Suspense>
      </CartProvider>
    </Router>
  );
}

export default App;
