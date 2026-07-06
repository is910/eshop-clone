import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsCache } from '../context/ProductContext';
import './ProductCard.css';

const ProductDetails = ({ onAddToCart }) => {
  const { id } = useParams();
  const { cachedDetails, cacheProductDetail } = useProductsCache();
  
  // Check if this specific product detail item is already cached
  const hasCache = !!cachedDetails[id];

  const [product, setProduct] = useState(cachedDetails[id] || null);
  const [isLoading, setIsLoading] = useState(!hasCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If this specific product details are cached, stop here!
    if (hasCache) return;

    const controller = new AbortController();
    const { signal } = controller;

    setIsLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`, { signal })
      .then(res => {
        if (!res.ok) throw new Error('Product not found or server error.');
        return res.json();
      })
      .then(data => {
        cacheProductDetail(id, data); // Save this product to global detail cache
        setProduct(data);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, hasCache, cacheProductDetail]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Fetching extended specifications...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '3rem' }}>{error} <br/><Link to="/">Back to Home</Link></div>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>&larr; Back to Products</Link>
      <div>
        <img src={product.image} alt={product.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
        <h2>{product.name}</h2>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${product.price.toFixed(2)}</p>
        <p style={{ lineHeight: '1.6', color: '#555', margin: '1.5rem 0' }}>{product.description}</p>
        <button 
          className="add-to-cart-btn" 
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;