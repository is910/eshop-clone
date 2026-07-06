import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const GridIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const Header = ({
  cartItemCount, onCartClick, userRole, onLogout,
  categories = [], selectedCategory, onSelectCategory
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const location = useLocation();
  const prevCountRef = useRef(cartItemCount);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartItemCount > prevCountRef.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(t);
    }
    prevCountRef.current = cartItemCount;
  }, [cartItemCount]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleCartClick = () => {
    onCartClick();
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (cat) => {
    onSelectCategory(cat === 'All' ? null : cat);
    setIsMobileMenuOpen(false);
  };

  const handleShopClick = () => {
    onSelectCategory(null);
    setIsMobileMenuOpen(false);
  };

  const displayCount = cartItemCount > 99 ? '99+' : cartItemCount;

  const showCategoriesDropdown = categories.length > 0;

  return (
    <>
      <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
        <div className="header__inner">

          <Link to="/" className="header__logo" aria-label="Home">
            <span className="header__logo-mark">V</span>
            <span className="header__logo-text">Verdant</span>
          </Link>

          <nav className="header__nav" aria-label="Main navigation">
            <ul className="header__nav-list">
              <li>
                <Link
                  to="/"
                  className={`header__nav-link ${location.pathname === '/' && !selectedCategory ? 'header__nav-link--active' : ''}`}
                  onClick={handleShopClick}
                >
                  Shop
                </Link>
              </li>

              {showCategoriesDropdown && (
                <li className="header__cat-wrap">
                  <span
                    className={`header__nav-link header__nav-link--cat ${selectedCategory ? 'header__nav-link--active' : ''}`}
                  >
                    Categories
                    <ChevronDown />
                  </span>

                  <div className="header__cat-dropdown" aria-label="Product categories">
                    <div className="header__cat-dropdown-arrow" aria-hidden="true" />
                    <div className="header__cat-dropdown-inner">
                      <button
                        className={`header__cat-item ${!selectedCategory ? 'header__cat-item--active' : ''}`}
                        onClick={() => handleCategoryClick('All')}
                      >
                        <GridIcon />
                        <span>All Products</span>
                      </button>

                      <div className="header__cat-divider" />

                      {categories.map(cat => (
                        <button
                          key={cat}
                          className={`header__cat-item ${selectedCategory === cat ? 'header__cat-item--active' : ''}`}
                          onClick={() => handleCategoryClick(cat)}
                        >
                          <span className="header__cat-dot" />
                          <span>{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              )}

              {userRole === 'admin' && (
                <li>
                  <Link
                    to="/admin"
                    className={`header__nav-link header__nav-link--admin ${location.pathname === '/admin' ? 'header__nav-link--active' : ''}`}
                  >
                    <ShieldIcon />
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="header__actions">
            {userRole === 'guest' ? (
              <Link to="/auth" className="header__auth-btn">
                <UserIcon />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="header__user-group">
                <span className="header__role-badge">
                  <UserIcon />
                  {userRole}
                </span>
                <button
                  className="header__logout-btn"
                  onClick={onLogout}
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogoutIcon />
                </button>
              </div>
            )}

            <button
              className={`header__cart-btn ${cartBounce ? 'header__cart-btn--bounce' : ''}`}
              onClick={handleCartClick}
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <CartIcon />
              {cartItemCount > 0 && (
                <span className="header__cart-badge" key={cartItemCount}>
                  {displayCount}
                </span>
              )}
            </button>

            <button
              className="header__menu-toggle"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`header__overlay ${isMobileMenuOpen ? 'header__overlay--visible' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`header__drawer ${isMobileMenuOpen ? 'header__drawer--open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="header__drawer-header">
          <span className="header__logo-mark header__logo-mark--large">V</span>
          <span className="header__logo-text">Verdant</span>
        </div>

        <nav className="header__drawer-nav">
          <Link
            to="/"
            className={`header__drawer-link ${location.pathname === '/' && !selectedCategory ? 'header__drawer-link--active' : ''}`}
            onClick={handleShopClick}
          >
            Shop
          </Link>

          {showCategoriesDropdown && (
            <>
              <div className="header__drawer-divider" />
              <span className="header__drawer-section-title">Categories</span>
              <Link
                to="/"
                className={`header__drawer-link header__drawer-link--cat ${!selectedCategory ? 'header__drawer-link--active' : ''}`}
                onClick={() => handleCategoryClick('All')}
              >
                <GridIcon />
                All Products
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat}
                  to="/"
                  className={`header__drawer-link header__drawer-link--cat ${selectedCategory === cat ? 'header__drawer-link--active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span className="header__cat-dot" />
                  {cat}
                </Link>
              ))}
            </>
          )}

          {userRole === 'admin' && (
            <Link
              to="/admin"
              className={`header__drawer-link header__drawer-link--admin ${location.pathname === '/admin' ? 'header__drawer-link--active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShieldIcon />
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div className="header__drawer-footer">
          {userRole === 'guest' ? (
            <Link
              to="/auth"
              className="header__drawer-auth-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <UserIcon />
              Sign In / Register
            </Link>
          ) : (
            <div className="header__drawer-user">
              <span className="header__role-badge header__role-badge--large">
                <UserIcon />
                Signed in as {userRole}
              </span>
              <button
                className="header__drawer-logout"
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
              >
                <LogoutIcon />
                Log Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Header;