import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ProductCard = ({ product, onAddToCart, index = 0 }) => {
  const [justAdded, setJustAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product);
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(timer);
  };

  const stockLabel = isOutOfStock
    ? 'Out of stock'
    : isLowStock
      ? `Only ${product.stock} left`
      : 'In stock';

  const stockClass = isOutOfStock
    ? 'product-card__stock--out'
    : isLowStock
      ? 'product-card__stock--low'
      : 'product-card__stock--in';

  return (
    <article
      className={`product-card ${isOutOfStock ? 'product-card--sold-out' : ''}`}
      style={{ '--stagger': index }}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="product-card__image-link">
        <div className="product-card__image-wrap">
          {!imageLoaded && <div className="skeleton skeleton-image" />}
          {/* 📄 Inside src/components/ProductCard.jsx */}

          <img 
            src={product.image} 
            alt={product.name} 
            className={`product-card__image ${imageLoaded ? 'product-card__image--loaded' : ''}`} // Added conditional visibility class if your CSS uses it
            loading="lazy"
            onLoad={() => setImageLoaded(true)} // ✨ FIX: Turns off the skeleton placeholder when image finishes transferring
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'http://localhost:5000/images/default-placeholder.jpg'; 
              setImageLoaded(true); // Ensure we hide the skeleton if a broken link falls back
            }}
          />

          {/* Hover overlay */}
          <div className="product-card__overlay">
            <span className="product-card__view-text">View Details</span>
          </div>

          {/* Category badge */}
          <span className="product-card__category">{product.category}</span>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <span className="product-card__oos-badge">Sold Out</span>
          )}
        </div>
      </Link>

      {/* Info Section */}
      <div className="product-card__info">
        <div className="product-card__top-row">
          <h3 className="product-card__name">{product.name}</h3>
        </div>

        <div className="product-card__meta">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <span className={`product-card__stock ${stockClass}`}>
            <span className="product-card__stock-dot" />
            {stockLabel}
          </span>
        </div>

        <button
          className={`product-card__cart-btn ${justAdded ? 'product-card__cart-btn--added' : ''}`}
          onClick={handleAdd}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        >
          {justAdded ? (
            <>
              <CheckIcon />
              Added
            </>
          ) : (
            <>
              <PlusIcon />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;