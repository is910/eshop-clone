import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const BagIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems, isCartOpen, closeCart,
    removeFromCart, cartTotal, cartCount,
  } = useCart();

  const [leavingIds, setLeavingIds] = useState(new Set());

  const handleRemove = (productId) => {
    setLeavingIds(prev => new Set(prev).add(productId));
    setTimeout(() => {
      removeFromCart(productId);
      setLeavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 320);
  };

  const handleCheckout = () => {
    closeCart();
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/auth');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isCartOpen ? 'cart-overlay--visible' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`cart-drawer ${isCartOpen ? 'cart-drawer--open' : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!isCartOpen}
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div>
            <h2 className="cart-drawer__title">Your Cart</h2>
            <span className="cart-drawer__count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
          </div>
          <button className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">
                <BagIcon />
              </div>
              <h3 className="cart-drawer__empty-title">Nothing here yet</h3>
              <p className="cart-drawer__empty-msg">
                Browse our collection and add something you love.
              </p>
              <Link to="/" className="cart-drawer__empty-cta" onClick={closeCart}>
                Start Shopping
                <ArrowRight />
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {cartItems.map(item => {
                const isLeaving = leavingIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    className={`cart-drawer__item ${isLeaving ? 'cart-drawer__item--leaving' : ''}`}
                  >
                    <Link
                      to={`/product/${item.id}`}
                      className="cart-drawer__item-img"
                      onClick={closeCart}
                    >
                      <img src={item.image} alt={item.name} />
                    </Link>

                    <div className="cart-drawer__item-info">
                      <Link
                        to={`/product/${item.id}`}
                        className="cart-drawer__item-name"
                        onClick={closeCart}
                      >
                        {item.name}
                      </Link>
                      <div className="cart-drawer__item-meta">
                        <span className="cart-drawer__item-qty">
                          Qty {item.quantity || 1}
                        </span>
                        <span className="cart-drawer__item-price">
                          ${(item.price * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      className="cart-drawer__item-remove"
                      onClick={() => handleRemove(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      title="Remove"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total-row">
              <span className="cart-drawer__total-label">Subtotal</span>
              <span className="cart-drawer__total-value">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="cart-drawer__total-note">
              {!localStorage.getItem('authToken') && (
                <span className="cart-drawer__auth-hint">
                  <UserIcon />
                  Sign in required to checkout
                </span>
              )}
              {localStorage.getItem('authToken') && 'Shipping calculated at checkout.'}
            </p>
            <button className="cart-drawer__checkout-btn" onClick={handleCheckout}>
              {!localStorage.getItem('authToken') ? (
                <>
                  <UserIcon />
                  Sign In to Checkout
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight />
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Cart;