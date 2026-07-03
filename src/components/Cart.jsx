import React from 'react';
import './Cart.css';

const Cart = ({ cartItems, isOpen, onClose, onRemoveFromCart }) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

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
                  <p>${item.price.toFixed(2)}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveFromCart(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <h3>Total: ${total.toFixed(2)}</h3>
            <button className="checkout-btn">Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
