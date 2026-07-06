import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Home = () => {
  const scrollToProducts = (e) => {
    e.preventDefault();
    document.getElementById('product-grid-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="home-hero">
      {/* Floating blurred circles */}
      <div className="home-hero__bg" aria-hidden="true">
        <div className="home-hero__circle home-hero__circle--1" />
        <div className="home-hero__circle home-hero__circle--2" />
        <div className="home-hero__circle home-hero__circle--3" />
      </div>

      {/* Subtle grid texture */}
      <div className="home-hero__grid" aria-hidden="true" />

      <div className="home-hero__content">
        <span className="home-hero__tag animate-fade-in-down">New Season</span>
        <h1 className="home-hero__title animate-fade-in-up">
          Curated<br />Essentials
        </h1>
        <p className="home-hero__subtitle animate-fade-in-up delay-2">
          Thoughtfully selected pieces that balance quality, comfort, and timeless style for everyday living.
        </p>
        <a
          href="#product-grid-anchor"
          className="home-hero__cta animate-fade-in-up delay-3"
          onClick={scrollToProducts}
        >
          Browse Collection
          <ArrowRight />
        </a>
      </div>

      {/* Floating decorative badge */}
      <div className="home-hero__badge animate-fade-in-scale delay-5" aria-hidden="true">
        <span className="home-hero__badge-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </span>
        <span className="home-hero__badge-label">Ethically Made</span>
      </div>
    </section>
  );
};

export default Home;