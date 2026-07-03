import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { products as initialProducts } from './data/products';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const handleRemoveFromCart = (indexToRemove) => {
    setCartItems(cartItems.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="app-container">
      <Header 
        cartItemCount={cartItems.length} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main className="main-content">
        <div className="hero-section">
          <h1>Welcome to our eShop Base</h1>
          <p>This is a starting point. Students, it's your turn to make it awesome!</p>
        </div>
        
        <ProductList 
          products={initialProducts} 
          onAddToCart={handleAddToCart} 
        />
      </main>

      <Cart 
        cartItems={cartItems} 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onRemoveFromCart={handleRemoveFromCart}
      />
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} eShop Student Project Base</p>
      </footer>
    </div>
  );
}

export default App;
