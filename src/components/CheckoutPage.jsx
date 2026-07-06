import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [shipping, setShipping] = useState({ fullName: '', address: '', phone: '' });
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const token = localStorage.getItem('authToken');
    const guestId = localStorage.getItem('guestId');

    try {
      const res = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({
          fullName: shipping.fullName,
          shippingAddress: shipping.address,
          contactPhone: shipping.phone,
          guestId: token ? null : guestId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderReceipt(data);
        clearCart();
      } else {
        setError(data.error || 'Order execution failed.');
      }
    } catch (err) {
      setError('Cannot sync with checkout transaction node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success State ───────────────────────── */
  if (orderReceipt) {
    return (
      <div className="checkout">
        <div className="checkout__success animate-bounce-in">
          <div className="checkout__success-icon">
            <CheckCircle />
          </div>
          <h1 className="checkout__success-title">Order Placed</h1>
          <p className="checkout__success-sub">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>

          <div className="checkout__success-card">
            <div className="checkout__success-row">
              <span className="checkout__success-label">Order Reference</span>
              <span className="checkout__success-value">#{orderReceipt.orderId}</span>
            </div>
            <div className="checkout__success-row">
              <span className="checkout__success-label">Total Charged</span>
              <span className="checkout__success-value checkout__success-value--price">
                ${orderReceipt.total.toFixed(2)}
              </span>
            </div>
            <div className="checkout__success-row">
              <span className="checkout__success-label">Status</span>
              <span className="checkout__success-status">
                <span className="checkout__success-dot" />
                Processing
              </span>
            </div>
          </div>

          <Link to="/" className="checkout__success-btn">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  /* ── Empty Cart Redirect ─────────────────── */
  if (cartItems.length === 0) {
    return (
      <div className="checkout">
        <Link to="/" className="checkout__back">
          <ArrowLeft />
          <span>Back to Shop</span>
        </Link>
        <div className="empty-state">
          <div className="empty-state__icon">
            <TruckIcon />
          </div>
          <h3 className="empty-state__title">Your cart is empty</h3>
          <p className="empty-state__description">
            Add some products before checking out.
          </p>
          <Link to="/" className="cart-drawer__empty-cta">
            Browse Products
            <ArrowLeft style={{ transform: 'rotate(180deg)' }} />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Checkout Form ───────────────────────── */
  return (
    <div className="checkout">
      <Link to="/" className="checkout__back animate-fade-in-down">
        <ArrowLeft />
        <span>Back to Shop</span>
      </Link>

      <h1 className="checkout__title animate-fade-in-up">Checkout</h1>

      <div className="checkout__grid">
        {/* ── Form Column ─────────────────── */}
        <form
          className="checkout__form animate-fade-in-up delay-1"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="checkout__section-title">
            <TruckIcon />
            Shipping Details
          </h2>

          {error && (
            <div className="checkout__error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <div className="checkout__field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={shipping.fullName}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="checkout__field">
            <label htmlFor="address">Shipping Address</label>
            <input
              id="address"
              type="text"
              name="address"
              value={shipping.address}
              onChange={handleChange}
              placeholder="123 Main St, City, Country"
              required
              autoComplete="street-address"
            />
          </div>

          <div className="checkout__field">
            <label htmlFor="phone">Contact Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={shipping.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              required
              autoComplete="tel"
            />
          </div>

          <button
            type="submit"
            className="checkout__submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="checkout__spinner" />
                Processing…
              </>
            ) : (
              <>
                <LockIcon />
                Confirm & Pay ${cartTotal.toFixed(2)}
              </>
            )}
          </button>
        </form>

        {/* ── Summary Column ─────────────── */}
        <div className="checkout__summary animate-fade-in-up delay-2">
          <h2 className="checkout__section-title">Order Summary</h2>

          <ul className="checkout__summary-list">
            {cartItems.map(item => (
              <li key={item.id} className="checkout__summary-item">
                <Link to={`/product/${item.id}`} className="checkout__summary-img">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="checkout__summary-info">
                  <span className="checkout__summary-name">{item.name}</span>
                  <span className="checkout__summary-qty">
                    Qty {item.quantity || 1} &times; ${item.price.toFixed(2)}
                  </span>
                </div>
                <span className="checkout__summary-line">
                  ${(item.price * (item.quantity || 1)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="checkout__summary-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;