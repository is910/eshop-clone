import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './AuthPage.css';

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

const AuthPage = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="auth">
      {/* ── Left Decorative Panel ─────────── */}
      <div className="auth__panel">
        <div className="auth__panel-bg" aria-hidden="true">
          <div className="auth__panel-circle auth__panel-circle--1" />
          <div className="auth__panel-circle auth__panel-circle--2" />
          <div className="auth__panel-circle auth__panel-circle--3" />
        </div>

        <div className="auth__panel-grid" aria-hidden="true" />

        <div className="auth__panel-content">
          <Link to="/" className="auth__panel-logo">
            <span className="auth__panel-logo-mark">V</span>
            <span className="auth__panel-logo-text">Verdant</span>
          </Link>

          <p className="auth__panel-tagline">
            Thoughtfully curated essentials for everyday living. Join us for a seamless shopping experience.
          </p>

          <div className="auth__panel-features">
            <div className="auth__panel-feature">
              <div className="auth__panel-feature-icon">
                <LockIcon />
              </div>
              <div>
                <span className="auth__panel-feature-title">Secure Checkout</span>
                <span className="auth__panel-feature-desc">Your data is always protected</span>
              </div>
            </div>

            <div className="auth__panel-feature">
              <div className="auth__panel-feature-icon">
                <TruckIcon />
              </div>
              <div>
                <span className="auth__panel-feature-title">Fast Shipping</span>
                <span className="auth__panel-feature-desc">Quick delivery to your door</span>
              </div>
            </div>

            <div className="auth__panel-feature">
              <div className="auth__panel-feature-icon">
                <RefreshIcon />
              </div>
              <div>
                <span className="auth__panel-feature-title">Easy Returns</span>
                <span className="auth__panel-feature-desc">Hassle-free return process</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────── */}
      <div className="auth__form-panel">
        <div className="auth__form-inner">
          {/* Mobile-only brand */}
          <Link to="/" className="auth__mobile-logo">
            <span className="auth__panel-logo-mark">V</span>
            <span className="auth__panel-logo-text">Verdant</span>
          </Link>

          <Link to="/" className="auth__back">
            <ArrowLeft />
            <span>Back to Shop</span>
          </Link>

          {/* Tab Switcher */}
          <div className="auth__tabs" role="tablist">
            <div
              className={`auth__tabs-indicator ${activeTab === 'register' ? 'auth__tabs-indicator--right' : ''}`}
              aria-hidden="true"
            />
            <button
              className={`auth__tab ${activeTab === 'login' ? 'auth__tab--active' : ''}`}
              onClick={() => setActiveTab('login')}
              role="tab"
              aria-selected={activeTab === 'login'}
            >
              Sign In
            </button>
            <button
              className={`auth__tab ${activeTab === 'register' ? 'auth__tab--active' : ''}`}
              onClick={() => setActiveTab('register')}
              role="tab"
              aria-selected={activeTab === 'register'}
            >
              Register
            </button>
          </div>

          {/* Sliding Form Content — both always mounted */}
          <div className="auth__form-content">
            <div className={`auth__slide ${activeTab === 'login' ? 'auth__slide--active' : 'auth__slide--left'}`}>
              <Login onAuthSuccess={onAuthSuccess} />
            </div>
            <div className={`auth__slide ${activeTab === 'register' ? 'auth__slide--active' : 'auth__slide--right'}`}>
              <Register onAuthSuccess={onAuthSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;