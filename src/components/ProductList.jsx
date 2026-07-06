import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useProductsCache } from '../context/ProductContext';
import './ProductList.css';

const ProductList = ({ onAddToCart }) => {
  const { cachedList, cacheProductList } = useProductsCache();
  const [products, setProducts] = useState(cachedList || []);
  const [isLoading, setIsLoading] = useState(!cachedList); // If cached, no loading state needed
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have data in the cache, don't fetch it again!
    if (cachedList) return;

    const controller = new AbortController();
    const { signal } = controller;

    fetch('http://localhost:5000/api/products', { signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve products.');
        return res.json();
      })
      .then(data => {
        cacheProductList(data); // Save data to global cache context
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [cachedList, cacheProductList]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading catalog items...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;

  return (
    <div className="product-list-container">
      <h2>Featured Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;