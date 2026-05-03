'use client';

interface HeroProps {
  onExplore: () => void;
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Fresh Food Delivered<br />
          <span className="hero-highlight">In Minutes</span>
        </h1>
        <p className="hero-subtitle">
          Order from your favorite restaurants and get it delivered to your door in minutes.
        </p>
        <button className="btn btn-primary hero-btn" onClick={onExplore}>
          Explore Restaurants
        </button>
      </div>
      <style>{`
        .hero {
          padding: 4rem 1rem;
          text-align: center;
          background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
        }
        .hero-content {
          max-width: 600px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .hero-highlight {
          color: var(--primary);
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--gray-600);
          margin-bottom: 2rem;
        }
        .hero-btn {
          font-size: 1.125rem;
          padding: 1rem 2rem;
        }
      `}</style>
    </section>
  );
}