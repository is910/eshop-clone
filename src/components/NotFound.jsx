import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductsCache } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import './NotFound.css';

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const NotFound = () => {
  const { cachedList, cacheProductList } = useProductsCache();
  const { addToCart } = useCart();

  const [products, setProducts] = useState(cachedList || []);
  const [isLoading, setIsLoading] = useState(!cachedList);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    if (cachedList) return;

    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        cacheProductList(data);
        setProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [cachedList, cacheProductList]);

  const suggested = useMemo(() => {
    if (!products.length) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [products]);

  const handleAdd = (product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    setAddedId(product.id);
    const timer = setTimeout(() => setAddedId(null), 1400);
    return () => clearTimeout(timer);
  };

  return (
    <div className="notfound">
      {/* ── 404 Content ───────────────────── */}
      <div className="notfound__content animate-bounce-in">
        <span className="notfound__code" aria-hidden="true">404</span>
        <h1 className="notfound__title">Page not found</h1>
        <p className="notfound__msg">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link to="/" className="notfound__cta">
          <ArrowLeft />
          Continue Shopping
        </Link>
      </div>

      {/* ── Decorative divider ────────────── */}
      <div className="notfound__divider" aria-hidden="true" />

      {/* ── Suggested Products ────────────── */}
      {!isLoading && suggested.length > 0 && (
        <section className="notfound__products animate-fade-in-up">
          <h2 className="notfound__products-title">Here are some products you might like</h2>

          <div className="notfound__grid">
            {suggested.map((product, index) => {
              const isOut = product.stock <= 0;
              const isAdded = addedId === product.id;
              return (
                <article
                  key={product.id}
                  className="notfound__card"
                  style={{ '--nf-stagger': index }}
                >
                  <Link to={`/product/${product.id}`} className="notfound__card-img">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </Link>
                  <div className="notfound__card-info">
                    <Link to={`/product/${product.id}`} className="notfound__card-name">
                      {product.name}
                    </Link>
                    <div className="notfound__card-bottom">
                      <span className="notfound__card-price">${product.price.toFixed(2)}</span>
                      <button
                        className={`notfound__card-btn ${isAdded ? 'notfound__card-btn--added' : ''}`}
                        onClick={() => handleAdd(product)}
                        disabled={isOut}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        {isAdded ? <CheckIcon /> : <PlusIcon />}
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

export default NotFound;