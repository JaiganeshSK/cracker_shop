import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import SafetyModal from './components/SafetyModal';
import PriceListModal from './components/PriceListModal';
import SparkleGlow from './components/SparkleGlow';
import ChatbotWidget from './components/ChatbotWidget';

// Store Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import QuickOrderPage from './pages/QuickOrderPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const { storeSettings, isPriceListModalOpen, setIsPriceListModalOpen } = useCart();

  // Dynamic route-aware browser tab title and favicon synchronization
  React.useEffect(() => {
    const shopName = storeSettings?.shopName || 'Public Store';
    const path = location.pathname;

    let pageTitle = '';
    if (path === '/' || path === '/quick-order') {
      pageTitle = storeSettings?.tagline ? `${shopName} | ${storeSettings.tagline}` : `${shopName} | Sivakasi Direct Wholesale`;
    } else if (path.startsWith('/admin/dashboard')) {
      pageTitle = `Admin Dashboard | ${shopName}`;
    } else if (path.startsWith('/admin/categories')) {
      pageTitle = `Categories - Admin | ${shopName}`;
    } else if (path.startsWith('/admin/products')) {
      pageTitle = `Products - Admin | ${shopName}`;
    } else if (path.startsWith('/admin/orders')) {
      pageTitle = `Orders - Admin | ${shopName}`;
    } else if (path.startsWith('/admin/settings')) {
      pageTitle = `Store Settings - Admin | ${shopName}`;
    } else if (path.startsWith('/admin/login')) {
      pageTitle = `Admin Login | ${shopName}`;
    } else if (path.startsWith('/checkout')) {
      pageTitle = `Checkout | ${shopName}`;
    } else if (path.startsWith('/order-success')) {
      pageTitle = `Order Confirmed | ${shopName}`;
    } else if (path.startsWith('/products') || path.startsWith('/catalog')) {
      pageTitle = `Products Catalog | ${shopName}`;
    } else if (path.startsWith('/showcase')) {
      pageTitle = `Showcase | ${shopName}`;
    } else {
      pageTitle = `${shopName} | ${storeSettings?.tagline || 'Factory Direct Cracker Store'}`;
    }

    document.title = pageTitle;

    if (storeSettings?.logoUrl) {
      const faviconLink = document.querySelector("link[rel*='icon']");
      if (faviconLink) {
        faviconLink.href = storeSettings.logoUrl;
      }
    }
  }, [location.pathname, storeSettings?.shopName, storeSettings?.tagline, storeSettings?.logoUrl]);

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-amber-500 selection:text-slate-950">
      {/* Lightweight Festive Particle Glow Effect */}
      {!isAdminRoute && <SparkleGlow />}

      {/* Customer Header */}
      {!isAdminRoute && (
        <Navbar onOpenSafetyModal={() => setSafetyModalOpen(true)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative z-10">
        <Routes>
          {/* Customer Storefront Routes - Quick Order as Default */}
          <Route path="/" element={<QuickOrderPage />} />
          <Route path="/quick-order" element={<QuickOrderPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/catalog" element={<ProductsPage />} />
          <Route path="/showcase" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/track-order" element={<Navigate to="/" replace />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Customer Footer */}
      {!isAdminRoute && (
        <Footer onOpenSafetyModal={() => setSafetyModalOpen(true)} />
      )}

      {/* Interactive Cart Drawer */}
      {!isAdminRoute && <CartDrawer />}

      {/* Mobile Sticky Bottom Nav */}
      {!isAdminRoute && <MobileBottomNav />}

      {/* Customer Support Chatbot Widget */}
      {!isAdminRoute && <ChatbotWidget />}

      {/* Safety Guidelines Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      {/* Wholesale Rate Card / Price List Modal */}
      <PriceListModal
        isOpen={isPriceListModalOpen}
        onClose={() => setIsPriceListModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
