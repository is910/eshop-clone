import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCart } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import Cart from './components/Cart';
import CheckoutPage from './components/CheckoutPage';

function App() {
  const { cartItems, isCartOpen, openCart, closeCart, addToCart, fetchCart, clearCart, cartCount } = useCart();
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
  const [guestId, setGuestId] = useState(localStorage.getItem('guestId') || null);

  const ensureGuestId = useCallback(() => {
    if (!authToken && !guestId) {
      const newGuestId = `guest_uuid_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, [authToken, guestId]);

  React.useEffect(() => { ensureGuestId(); }, [ensureGuestId]);

  const handleAuthCompletion = async (token, role) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);

    if (guestId) {
      await fetch('http://localhost:5000/api/cart/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, authToken: token })
      });
      localStorage.removeItem('guestId');
      setGuestId(null);
    }

    setAuthToken(token);
    setUserRole(role);
    fetchCart();
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);
    setUserRole('guest');
    setGuestId(null);
    clearCart();
    window.location.href = '/';
  };

  return (
    <div className="app-container">
      <Header
        cartItemCount={cartCount}
        onCartClick={openCart}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList onAddToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetails onAddToCart={addToCart} />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthCompletion} />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute userRole={userRole} allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
      <Cart />
    </div>
  );
}

export default App;