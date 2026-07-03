import React from 'react';
import './Header.css';

const Header = ({ cartItemCount, onCartClick }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <h1>eShop Student Project</h1>
      </div>
      <nav className="header-nav">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/products">Products</a></li>
          {/* Учениците могат да добавят още линкове тук */}
        </ul>
      </nav>
      <div className="header-cart" onClick={onCartClick}>
        <span className="cart-icon">🛒</span>
        <span className="cart-count">{cartItemCount}</span>
      </div>
    </header>
  );
};

export default Header;
