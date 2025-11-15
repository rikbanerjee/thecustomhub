import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path="product/:productId" element={<ProductDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="search" element={<SearchResults />} />
          {/* Legacy route support */}
          <Route path="products" element={<Home />} />
          <Route path="products/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
