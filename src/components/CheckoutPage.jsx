import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { COUNTRIES, getCountryFlag, getPhoneHint, getPhonePlaceholder } from '../data/countries';
import './CheckoutPage.css';

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 12 18 9"/>
  </svg>
);

const SearchSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ═══════════════════════════════════════════════
   CountryPicker — Searchable Dropdown
   ═══════════════════════════════════════════════ */
const CountryPicker = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = COUNTRIES.find(c => c.code === value);

  const filtered = query.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : COUNTRIES;

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Scroll highlighted item into view */
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIdx];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          handleSelect(filtered[highlightIdx].code);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const displayValue = isOpen ? query : (selected ? selected.name : '');

  return (
    <div className="cp" ref={containerRef}>
      <div className={`cp__input-wrap ${isOpen ? 'cp__input-wrap--open' : ''}`}>
        {selected && !query && (
          <span className="cp__flag">{getCountryFlag(selected.code)}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          className="cp__input"
          placeholder={selected ? '' : (placeholder || 'Select country')}
          value={displayValue}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); setHighlightIdx(-1); }}
          onFocus={() => { setIsOpen(true); setQuery(''); }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-label={placeholder || 'Select country'}
        />
        <span className={`cp__arrow ${isOpen ? 'cp__arrow--open' : ''}`} aria-hidden="true">
          <ChevronDown />
        </span>
      </div>

      {isOpen && (
        <ul className="cp__list" ref={listRef} role="listbox">
          {filtered.length > 0 ? (
            filtered.map((c, i) => (
              <li
                key={c.code}
                className={`cp__item ${i === highlightIdx ? 'cp__item--hl' : ''} ${c.code === value ? 'cp__item--active' : ''}`}
                onClick={() => handleSelect(c.code)}
                onMouseEnter={() => setHighlightIdx(i)}
                role="option"
                aria-selected={c.code === value}
              >
                <span className="cp__item-flag">{getCountryFlag(c.code)}</span>
                <span className="cp__item-name">
                  {highlightName(c.name, query)}
                </span>
                <span className="cp__item-code">{c.code}</span>
              </li>
            ))
          ) : (
            <li className="cp__empty">
              <SearchSmallIcon />
              No countries match "{query}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

/* Highlight matching text in country name */
function highlightName(name, query) {
  if (!query.trim()) return name;
  const lower = name.toLowerCase();
  const q = query.toLowerCase().trim();
  const idx = lower.indexOf(q);
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <mark className="cp__mark">{name.slice(idx, idx + q.length)}</mark>
      {name.slice(idx + q.length)}
    </>
  );
}

/* ═══════════════════════════════════════════════
   CheckoutPage
   ═══════════════════════════════════════════════ */
const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [shipping, setShipping] = useState({
    fullName: '',
    country: 'US',
    address: '',
    phoneCountry: 'US',
    phone: '',
  });
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneHint = getPhoneHint(shipping.phoneCountry);

  const clearError = () => { if (error) setError(null); };

  const handleInputChange = (e) => {
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
    clearError();
  };

  const handleCountryChange = (code) => {
    setShipping(prev => ({ ...prev, country: code, phoneCountry: code }));
    clearError();
  };

  const handlePhoneCountryChange = (e) => {
    setShipping(prev => ({ ...prev, phoneCountry: e.target.value, phone: '' }));
    clearError();
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setShipping(prev => ({ ...prev, phone: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const phoneData = COUNTRIES.find(c => c.code === shipping.phoneCountry);
    if (phoneData) {
      const [min, max] = phoneData.phoneDigits;
      const digits = shipping.phone.replace(/\D/g, '');
      if (digits.length < min || digits.length > max) {
        setError(`Phone number must be between ${min} and ${max} digits for ${phoneData.name} (${phoneData.phoneCode}).`);
        setIsSubmitting(false);
        return;
      }
    }

    const countryData = COUNTRIES.find(c => c.code === shipping.country);
    const fullAddress = countryData
      ? `${countryData.name}, ${shipping.address}`
      : shipping.address;
    const fullPhone = phoneData
      ? `${phoneData.phoneCode} ${shipping.phone}`
      : shipping.phone;

    const token = localStorage.getItem('authToken');

    try {
      const res = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({
          fullName: shipping.fullName,
          shippingAddress: fullAddress,
          contactPhone: fullPhone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderReceipt(data);
        clearCart();
      } else {
        setError(data.error || 'Order execution failed.');
      }
    } catch (err) {
      setError('Cannot sync with checkout transaction node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success State ───────────────────────── */
  if (orderReceipt) {
    return (
      <div className="checkout">
        <div className="checkout__success animate-bounce-in">
          <div className="checkout__success-icon"><CheckCircle /></div>
          <h1 className="checkout__success-title">Order Placed</h1>
          <p className="checkout__success-sub">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>
          <div className="checkout__success-card">
            <div className="checkout__success-row">
              <span className="checkout__success-label">Order Reference</span>
              <span className="checkout__success-value">#{orderReceipt.orderId}</span>
            </div>
            <div className="checkout__success-row">
              <span className="checkout__success-label">Total Charged</span>
              <span className="checkout__success-value checkout__success-value--price">
                ${orderReceipt.total.toFixed(2)}
              </span>
            </div>
            <div className="checkout__success-row">
              <span className="checkout__success-label">Status</span>
              <span className="checkout__success-status">
                <span className="checkout__success-dot" />Processing
              </span>
            </div>
          </div>
          <Link to="/" className="checkout__success-btn">Return to Storefront</Link>
        </div>
      </div>
    );
  }

  /* ── Empty Cart ─────────────────────────── */
  if (cartItems.length === 0) {
    return (
      <div className="checkout">
        <Link to="/" className="checkout__back">
          <ArrowLeft /><span>Back to Shop</span>
        </Link>
        <div className="empty-state">
          <div className="empty-state__icon"><TruckIcon /></div>
          <h3 className="empty-state__title">Your cart is empty</h3>
          <p className="empty-state__description">Add some products before checking out.</p>
          <Link to="/" className="cart-drawer__empty-cta">
            Browse Products
            <ArrowLeft style={{ transform: 'rotate(180deg)' }} />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Checkout Form ───────────────────────── */
  return (
    <div className="checkout">
      <Link to="/" className="checkout__back animate-fade-in-down">
        <ArrowLeft /><span>Back to Shop</span>
      </Link>

      <h1 className="checkout__title animate-fade-in-up">Checkout</h1>

      <div className="checkout__grid">
        <form className="checkout__form animate-fade-in-up delay-1" onSubmit={handleSubmit} noValidate>
          <h2 className="checkout__section-title"><TruckIcon />Shipping Details</h2>

          {error && (
            <div className="checkout__error" role="alert">
              <AlertIcon /><span>{error}</span>
            </div>
          )}

          <div className="checkout__field">
            <label htmlFor="co-name">Full Name</label>
            <input
              id="co-name" type="text" name="fullName"
              value={shipping.fullName} onChange={handleInputChange}
              placeholder="Jane Doe" required autoComplete="name"
            />
          </div>

          {/* Searchable country picker */}
          <div className="checkout__field">
            <label>Country</label>
            <CountryPicker
              value={shipping.country}
              onChange={handleCountryChange}
              placeholder="Search country..."
            />
          </div>

          <div className="checkout__field">
            <label htmlFor="co-address">Street Address</label>
            <input
              id="co-address" type="text" name="address"
              value={shipping.address} onChange={handleInputChange}
              placeholder="123 Main St, Apt 4B, City, Postal Code"
              required autoComplete="street-address"
            />
          </div>

          <div className="checkout__field">
            <label>Contact Phone</label>
            <div className="checkout__phone-row">
              <div className="checkout__select-wrap checkout__select-wrap--code">
                <select
                  value={shipping.phoneCountry}
                  onChange={handlePhoneCountryChange}
                  aria-label="Phone country code"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {getCountryFlag(c.code)} {c.phoneCode}
                    </option>
                  ))}
                </select>
                <span className="checkout__select-arrow" aria-hidden="true"><ChevronDown /></span>
              </div>
              <input
                type="tel"
                value={shipping.phone}
                onChange={handlePhoneChange}
                placeholder={getPhonePlaceholder(shipping.phoneCountry)}
                required
                inputMode="numeric"
                autoComplete="tel-national"
              />
            </div>
            {phoneHint && <span className="checkout__field-hint">{phoneHint}</span>}
          </div>

          <button
            type="submit"
            className="checkout__submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="checkout__spinner" />Processing…</>
            ) : (
              <><LockIcon />Confirm & Pay ${cartTotal.toFixed(2)}</>
            )}
          </button>
        </form>

        <div className="checkout__summary animate-fade-in-up delay-2">
          <h2 className="checkout__section-title">Order Summary</h2>
          <ul className="checkout__summary-list">
            {cartItems.map(item => (
              <li key={item.id} className="checkout__summary-item">
                <Link to={`/product/${item.id}`} className="checkout__summary-img">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="checkout__summary-info">
                  <span className="checkout__summary-name">{item.name}</span>
                  <span className="checkout__summary-qty">
                    Qty {item.quantity || 1} &times; ${item.price.toFixed(2)}
                  </span>
                </div>
                <span className="checkout__summary-line">
                  ${(item.price * (item.quantity || 1)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout__summary-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;