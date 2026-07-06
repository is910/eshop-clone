import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProductCard from './ProductCard';
import { useProductsCache } from '../context/ProductContext';
import './ProductList.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const EmptySearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-and-up', label: '$50 & Up' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'name-asc', label: 'A → Z' },
  { value: 'name-desc', label: 'Z → A' },
];

const ProductList = ({ onAddToCart, selectedCategory, onSelectCategory }) => {
  const { cachedList, cacheProductList } = useProductsCache();
  const [products, setProducts] = useState(cachedList || []);
  const [isLoading, setIsLoading] = useState(!cachedList);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const inputRef = useRef(null);

  useEffect(() => {
    if (cachedList) return;

    const controller = new AbortController();
    const { signal } = controller;

    fetch('http://localhost:5000/api/products', { signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve products.');
        return res.json();
      })
      .then(data => {
        cacheProductList(data);
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

  /* ── Filtered & sorted products ─────────── */
  const displayProducts = useMemo(() => {
    let result = products;

    // Header category filter (first layer)
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Text search (within the category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Stock / price filter
    switch (activeFilter) {
      case 'in-stock':
        result = result.filter(p => p.stock > 5);
        break;
      case 'low-stock':
        result = result.filter(p => p.stock > 0 && p.stock <= 5);
        break;
      case 'out-of-stock':
        result = result.filter(p => p.stock <= 0);
        break;
      case 'under-50':
        result = result.filter(p => p.price < 50);
        break;
      case '50-and-up':
        result = result.filter(p => p.price >= 50);
        break;
    }

    // Sort
    if (sortBy !== 'default') {
      result = [...result];
      switch (sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return result;
  }, [products, selectedCategory, searchQuery, activeFilter, sortBy]);

  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleClearCategory = () => {
    onSelectCategory(null);
  };

  const isSearching = searchQuery.trim().length > 0;
  const isFiltered = activeFilter !== 'all';
  const isModified = isSearching || isFiltered || sortBy !== 'default' || !!selectedCategory;

  /* ── Loading ────────────────────────────── */
  if (isLoading) {
    return (
      <div className="product-list-container">
        <div className="pl-toolbar animate-fade-in-down">
          <div className="pl-search">
            <span className="pl-search__icon"><SearchIcon /></span>
            <div className="skeleton" style={{ height: '100%', borderRadius: 'var(--radius-full)' }} />
          </div>
          <div className="pl-divider" />
          <div className="skeleton" style={{ width: 300, height: 30, borderRadius: 'var(--radius-full)' }} />
          <div className="pl-divider" />
          <div className="skeleton" style={{ width: 200, height: 30, borderRadius: 'var(--radius-full)' }} />
        </div>
        <h2>Featured Products</h2>
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="home__skeleton-card">
              <div className="skeleton skeleton-image" style={{ aspectRatio: '3 / 4' }} />
              <div className="home__skeleton-body">
                <div className="skeleton skeleton-text" style={{ width: '35%' }} />
                <div className="skeleton skeleton-text" style={{ width: '75%' }} />
                <div className="skeleton skeleton-text" style={{ width: '25%', height: '1.4em' }} />
                <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-3)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ──────────────────────────────── */
  if (error) {
    return (
      <div className="product-list-container">
        <div className="empty-state">
          <div className="empty-state__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 className="empty-state__title">Something went wrong</h3>
          <p className="empty-state__description">{error}</p>
        </div>
      </div>
    );
  }

  /* ── Build section title ────────────────── */
  const sectionTitle = isSearching
    ? selectedCategory
      ? <>Results for &ldquo;{searchQuery}&rdquo; in <span className="pl-title-cat">{selectedCategory}</span></>
      : <>Results for &ldquo;{searchQuery}&rdquo;</>
    : selectedCategory
      ? selectedCategory
      : 'Featured Products';

  /* ── Main Render ────────────────────────── */
  return (
    <div className="product-list-container">

      {/* ── Active Category Banner ────────── */}
      {selectedCategory && (
        <div className="pl-active-cat animate-fade-in-down">
          <span className="pl-active-cat__label">
            Browsing: <strong>{selectedCategory}</strong>
          </span>
          <button
            className="pl-active-cat__clear"
            onClick={handleClearCategory}
            aria-label={`Clear ${selectedCategory} filter`}
          >
            <ArrowLeft />
            All Products
          </button>
        </div>
      )}

      {/* ── Toolbar ───────────────────────── */}
      <div className="pl-toolbar animate-fade-in-down">
        <div className="pl-search">
          <span className="pl-search__icon"><SearchIcon /></span>
          <input
            ref={inputRef}
            type="text"
            className="pl-search__input"
            placeholder={selectedCategory ? `Search in ${selectedCategory}...` : 'Search products...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search products"
          />
          {searchQuery && (
            <button
              className="pl-search__clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <XIcon />
            </button>
          )}
        </div>

        <div className="pl-divider" />

        <div className="pl-group">
          <span className="pl-label">Filter</span>
          <div className="pl-pills">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`pl-pill ${activeFilter === opt.value ? 'pl-pill--active' : ''}`}
                onClick={() => setActiveFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pl-divider" />

        <div className="pl-group">
          <span className="pl-label">Sort</span>
          <div className="pl-pills">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`pl-pill pl-pill--sort ${sortBy === opt.value ? 'pl-pill--active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section Header ────────────────── */}
      <div className="product-list-header animate-fade-in-up delay-1">
        <h2>{sectionTitle}</h2>
        <p className="product-list-count">
          {isModified
            ? `${displayProducts.length} of ${products.length} products`
            : `${products.length} products`
          }
        </p>
      </div>

      {/* ── Empty Results ─────────────────── */}
      {displayProducts.length === 0 ? (
        <div className="empty-state animate-fade-in-scale">
          <div className="empty-state__icon"><EmptySearchIcon /></div>
          <h3 className="empty-state__title">No matches found</h3>
          <p className="empty-state__description">
            {isSearching
              ? 'Try a different search term or adjust the filters.'
              : 'No products match the selected filter. Try a different option.'
            }
          </p>
          {(selectedCategory || isFiltered || sortBy !== 'default') && (
            <button
              className="pl-reset-btn"
              onClick={() => {
                if (selectedCategory) handleClearCategory();
                setActiveFilter('all');
                setSortBy('default');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;