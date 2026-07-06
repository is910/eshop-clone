import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsCache } from '../context/ProductContext';
import './ProductDetails.css';

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const ProductDetails = ({ onAddToCart }) => {
  const { id } = useParams();
  const { cachedDetails, cacheProductDetail, cachedList } = useProductsCache();

  const hasCache = !!cachedDetails[id];

  const [product, setProduct] = useState(cachedDetails[id] || null);
  const [isLoading, setIsLoading] = useState(!hasCache);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(!!cachedDetails[id]);
  const [justAdded, setJustAdded] = useState(false);

  /* Track which recommended product just had its "Added" animation */
  const [addedRecId, setAddedRecId] = useState(null);

  useEffect(() => {
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
        cacheProductDetail(id, data);
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

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    onAddToCart(product);
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  };

  const handleRecAdd = (recProduct) => {
    if (recProduct.stock <= 0) return;
    onAddToCart(recProduct);
    setAddedRecId(recProduct.id);
    const timer = setTimeout(() => setAddedRecId(null), 1400);
    return () => clearTimeout(timer);
  };

  /* ── Recommended Products ───────────────── */
  const recommended = useMemo(() => {
    if (!cachedList || !product) return [];
    const others = cachedList.filter(p => p.id !== product.id);
    if (others.length === 0) return [];
    // Return up to 4, prioritizing same category
    const sameCategory = others.filter(p => p.category === product.category);
    const diffCategory = others.filter(p => p.category !== product.category);
    return [...sameCategory, ...diffCategory].slice(0, 4);
  }, [cachedList, product]);

  /* ── Loading Skeleton ─────────────────────── */
  if (isLoading) {
    return (
      <div className="pd">
        <div className="pd__back">
          <div className="skeleton" style={{ width: '120px', height: '16px', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div className="pd__layout">
          <div className="pd__image-col">
            <div className="skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--radius-xl)' }} />
          </div>
          <div className="pd__info-col">
            <div className="skeleton skeleton-text" style={{ width: '90px' }} />
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '2em' }} />
            <div className="skeleton skeleton-text" style={{ width: '25%', height: '1.8em', marginTop: 'var(--space-4)' }} />
            <div className="skeleton skeleton-text" style={{ width: '100%' }} />
            <div className="skeleton skeleton-text" style={{ width: '90%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            <div style={{ marginTop: 'auto' }}>
              <div className="skeleton" style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-8)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error State ──────────────────────────── */
  if (error) {
    return (
      <div className="pd__error">
        <div className="pd__error-icon">
          <PackageIcon />
        </div>
        <h2 className="pd__error-title">Product Not Found</h2>
        <p className="pd__error-msg">{error}</p>
        <Link to="/" className="pd__error-link">
          <ArrowLeft />
          Back to Shop
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const stockLabel = isOutOfStock
    ? 'Out of stock'
    : isLowStock
      ? `Only ${product.stock} left`
      : 'In stock';

  const stockClass = isOutOfStock
    ? 'pd__stock--out'
    : isLowStock
      ? 'pd__stock--low'
      : 'pd__stock--in';

  return (
    <div className="pd">
      {/* Back link */}
      <Link to="/" className="pd__back animate-fade-in-down">
        <ArrowLeft />
        <span>Back to Shop</span>
      </Link>

      <div className="pd__layout">
        {/* ── Image Column ──────────────────── */}
        <div className="pd__image-col animate-fade-in-up">
          <div className="pd__image-wrap">
            {!imageLoaded && (
              <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-xl)', aspectRatio: 'unset' }} />
            )}
            <img
              src={product.image}
              alt={product.name}
              className={`pd__image ${imageLoaded ? 'pd__image--loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
            />
            <span className="pd__category">{product.category}</span>
          </div>
        </div>

        {/* ── Info Column ───────────────────── */}
        <div className="pd__info-col animate-fade-in-up delay-2">
          <span className="pd__category-text">{product.category}</span>

          <h1 className="pd__name">{product.name}</h1>

          <div className="pd__price-row">
            <span className="pd__price">${product.price.toFixed(2)}</span>
            <span className={`pd__stock ${stockClass}`}>
              <span className="pd__stock-dot" />
              {stockLabel}
            </span>
          </div>

          <div className="pd__divider" />

          <p className="pd__description">{product.description}</p>

          {/* Add to Cart */}
          <div className="pd__action">
            <button
              className={`pd__cart-btn ${justAdded ? 'pd__cart-btn--added' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            >
              {justAdded ? (
                <>
                  <CheckIcon />
                  Added to Cart
                </>
              ) : (
                <>
                  <BagIcon />
                  {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </>
              )}
            </button>
          </div>

          {/* Extra details */}
          <div className="pd__meta-cards">
            <div className="pd__meta-card">
              <span className="pd__meta-card-label">Category</span>
              <span className="pd__meta-card-value">{product.category}</span>
            </div>
            <div className="pd__meta-card">
              <span className="pd__meta-card-label">Availability</span>
              <span className="pd__meta-card-value">{product.stock} in stock</span>
            </div>
            <div className="pd__meta-card">
              <span className="pd__meta-card-label">Item ID</span>
              <span className="pd__meta-card-value">#{product.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommended Products ────────────── */}
      {recommended.length > 0 && (
        <section className="pd__rec animate-fade-in-up">
          <div className="pd__rec-header">
            <div className="pd__rec-header-left">
              <SparkleIcon />
              <h2 className="pd__rec-title">You Might Also Like</h2>
            </div>
            <Link to="/" className="pd__rec-view-all">
              View All
              <ArrowLeft style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>

          <div className="pd__rec-grid">
            {recommended.map((rec, index) => {
              const recOut = rec.stock <= 0;
              const recAdded = addedRecId === rec.id;
              return (
                <article
                  key={rec.id}
                  className="pd__rec-card"
                  style={{ '--rec-stagger': index }}
                >
                  <Link to={`/product/${rec.id}`} className="pd__rec-card-img">
                    <img src={rec.image} alt={rec.name} loading="lazy" />
                  </Link>
                  <div className="pd__rec-card-info">
                    <Link to={`/product/${rec.id}`} className="pd__rec-card-name">
                      {rec.name}
                    </Link>
                    <div className="pd__rec-card-bottom">
                      <span className="pd__rec-card-price">${rec.price.toFixed(2)}</span>
                      <button
                        className={`pd__rec-card-btn ${recAdded ? 'pd__rec-card-btn--added' : ''}`}
                        onClick={() => handleRecAdd(rec)}
                        disabled={recOut}
                        aria-label={`Add ${rec.name} to cart`}
                      >
                        {recAdded ? <CheckIcon /> : <PlusIcon />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;