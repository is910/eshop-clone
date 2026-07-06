import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /* Read latest auth identity from localStorage on every call */
  const getIds = useCallback(() => ({
    authToken: localStorage.getItem('authToken'),
    guestId: localStorage.getItem('guestId'),
  }), []);

  /* ── Fetch cart from server ─────────────── */
  const fetchCart = useCallback(async () => {
    try {
      const { authToken, guestId } = getIds();
      let url = 'http://localhost:5000/api/cart';
      if (guestId && !authToken) url += `?guestId=${guestId}`;
      const headers = authToken ? { Authorization: authToken } : {};
      const res = await fetch(url, { headers });
      if (res.ok) setCartItems(await res.json());
    } catch (e) {
      console.error('[CartContext] fetch error:', e);
    }
  }, [getIds]);

  /* Initial fetch + re-fetch when token changes (login/logout) */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ── Add item ──────────────────────────── */
  const addToCart = useCallback(async (product) => {
    try {
      const { authToken, guestId } = getIds();
      const res = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          guestId: authToken ? null : guestId,
          authToken,
        }),
      });
      if (res.ok) {
        const payload = await res.json();
        setCartItems(payload.cart);
      }
    } catch (err) {
      console.error('[CartContext] add error:', err);
    }
  }, [getIds]);

  /* ── Remove item (local-only — no backend DELETE endpoint exists) ── */
  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  /* ── Clear entirely ────────────────────── */
  const clearCart = useCallback(() => setCartItems([]), []);

  /* ── Drawer toggles ────────────────────── */
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  /* ── Derived values ────────────────────── */
  const cartCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      fetchCart,
      addToCart,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      cartCount,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}