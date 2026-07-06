import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const LeafIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 19c4-4 8-5 12-5 0-3.5-1-6-2-6z"/>
    <path d="M11 14c-1.5-1.5-3-2-5-2 0 2 .5 3.5 2 5"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Decorative top wave */}
      <div className="footer__wave" aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 40 C360 0, 720 60, 1080 30 S1440 50, 1440 40 L1440 60 L0 60 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="footer__inner">
        {/* ── Brand Column ──────────────────── */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-mark">V</span>
            <span className="footer__logo-text">Verdant</span>
          </Link>
          <p className="footer__tagline">
            Thoughtfully curated essentials for everyday living. Quality over quantity, always.
          </p>
          <div className="footer__leaf-row">
            <LeafIcon />
            <LeafIcon />
            <LeafIcon />
          </div>
        </div>

        {/* ── Quick Links ──────────────────── */}
        <div className="footer__column">
          <h4 className="footer__heading">Explore</h4>
          <ul className="footer__link-list">
            <li><Link to="/" className="footer__link">All Products</Link></li>
            <li><Link to="/" className="footer__link">New Arrivals</Link></li>
            <li><Link to="/" className="footer__link">Best Sellers</Link></li>
            <li><Link to="/" className="footer__link">Collections</Link></li>
          </ul>
        </div>

        {/* ── Help Column ──────────────────── */}
        <div className="footer__column">
          <h4 className="footer__heading">Support</h4>
          <ul className="footer__link-list">
            <li><Link to="/" className="footer__link">Shipping Info</Link></li>
            <li><Link to="/" className="footer__link">Returns & Exchanges</Link></li>
            <li><Link to="/" className="footer__link">Size Guide</Link></li>
            <li><Link to="/" className="footer__link">Contact Us</Link></li>
          </ul>
        </div>

        {/* ── Company Column ───────────────── */}
        <div className="footer__column">
          <h4 className="footer__heading">Company</h4>
          <ul className="footer__link-list">
            <li><Link to="/" className="footer__link">Our Story</Link></li>
            <li><Link to="/" className="footer__link">Sustainability</Link></li>
            <li><Link to="/" className="footer__link">Careers</Link></li>
            <li><Link to="/" className="footer__link">Press</Link></li>
          </ul>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────── */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          &copy; {currentYear} Verdant. All rights reserved. Student project — not a real store.
        </p>
        <div className="footer__bottom-links">
          <Link to="/" className="footer__bottom-link">Privacy</Link>
          <span className="footer__bottom-sep" aria-hidden="true">&middot;</span>
          <Link to="/" className="footer__bottom-link">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;