import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ cartItemCount, onCartClick, userRole, onLogout }) => {
  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#333', color: '#fff' }}>
      <div className="header-logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>eShop Student Project</h1>
        </Link>
      </div>

      <nav className="header-nav">
        <ul style={{ display: 'flex', alignItems: 'center', listStyle: 'none', gap: '20px', margin: 0, padding: 0 }}>
          <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link></li>
          
          {userRole === 'admin' && (
            <li>
              <Link to="/admin" style={{ color: '#fff', backgroundColor: '#dc3545', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                Admin Dashboard
              </Link>
            </li>
          )}

          {/* Conditional Sign In / Logout Configuration Layout */}
          {userRole === 'guest' ? (
            <li>
              <Link to="/auth" style={{ color: '#28a745', fontWeight: 'bold', textDecoration: 'none' }}>
                Login / Register
              </Link>
            </li>
          ) : (
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: '#ccc', background: '#444', padding: '4px 8px', borderRadius: '3px' }}>
                👤 {userRole.toUpperCase()}
              </span>
              <button 
                onClick={onLogout} 
                style={{ 
                  background: '#c0392b', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="header-cart" onClick={onCartClick} style={{ cursor: 'pointer', position: 'relative' }}>
        <span className="cart-icon" style={{ fontSize: '1.5rem' }}>🛒</span>
        <span className="cart-count" style={{ background: '#007bff', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.8rem', position: 'absolute', top: '-5px', right: '-10px' }}>
          {cartItemCount}
        </span>
      </div>
    </header>
  );
};

export default Header;