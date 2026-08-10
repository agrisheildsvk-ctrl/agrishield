import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Code-split secondary routes for lightning-fast initial load (Lighthouse Performance 95-100)
const Shop = lazy(() => import('./pages/Shop'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-transparent">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogDetails />} />
                  <Route path="product/:slug" element={<ProductDetails />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order-success" element={<OrderSuccess />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="privacy" element={<PrivacyPolicy />} />
                </Route>
                
                {/* Admin Routes (Without MainLayout wrapper) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
