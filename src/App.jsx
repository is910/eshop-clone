import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage'; // Import new page view
import Cart from './components/Cart';
import CheckoutPage from './components/CheckoutPage'; // Import the new Checkout component

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
  const [guestId, setGuestId] = useState(localStorage.getItem('guestId') || null);

  useEffect(() => {
    if (!authToken && !guestId) {
      const newGuestId = `guest_uuid_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, [authToken, guestId]);

  const refreshCartFromServer = useCallback(async () => {
    try {
      let url = 'http://localhost:5000/api/cart';
      if (guestId && !authToken) url += `?guestId=${guestId}`;
      const headers = authToken ? { 'Authorization': authToken } : {};
      const res = await fetch(url, { headers });
      if (res.ok) setCartItems(await res.json());
    } catch (e) { console.error(e); }
  }, [authToken, guestId]);

  useEffect(() => { if (authToken || guestId) refreshCartFromServer(); }, [authToken, guestId, refreshCartFromServer]);

  const handleAddToCart = async (product) => {
    try {
      const res = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, guestId: authToken ? null : guestId, authToken })
      });
      if (res.ok) {
        const payload = await res.json();
        setCartItems(payload.cart);
      }
    } catch (err) { console.error(err); }
  };

  // Callback triggered when the subform successfully logs in/registers
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
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);
    setUserRole('guest');
    setCartItems([]);
    window.location.href = '/';
  };

  return (
    <div className="app-container">
      <Header 
        cartItemCount={cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        userRole={userRole} 
        onLogout={handleLogout} 
      />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList onAddToCart={handleAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetails onAddToCart={handleAddToCart} />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthCompletion} />} />
          
          {/* Add Checkout Workspace Route mapping context props down cleanly */}
          <Route 
            path="/checkout" 
            element={<CheckoutPage cartItems={cartItems} onCheckoutSuccess={() => setCartItems([])} />} 
          />
          
          <Route 
            path="/admin" 
            element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </main>

      <Cart cartItems={cartItems} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onRemoveFromCart={() => {}} />
    </div>
  );
}

export default App;