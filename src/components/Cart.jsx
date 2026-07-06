import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import router bridge hook
import './Cart.css';

const Cart = ({ cartItems, isOpen, onClose, onRemoveFromCart }) => {
  const navigate = useNavigate(); // Initialize navigation
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="cart-overlay">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart-msg">Your cart is empty.</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p>{item.quantity || 1} &times; ${item.price.toFixed(2)}</p>
                </div>
                <button className="remove-btn" onClick={() => onRemoveFromCart(index)}>Remove</button>
              </div>
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <h3>Total: ${total.toFixed(2)}</h3>
            {/* Redirect user directly to dedicated checkout page and collapse sliding layout panels */}
            <button 
              className="checkout-btn" 
              onClick={() => { navigate('/checkout'); onClose(); }}
              style={{ width: '100%', padding: '0.75rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;