'use client';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-text">LASTMILE</span>
          <span className="logo-gig">GIG</span>
        </div>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#stores">Stores</a>
          <a href="#orders">Orders</a>
          <a href="#account">Account</a>
        </nav>
        <button className="cart-btn" onClick={onCartClick}>
          Cart ({cartCount})
        </button>
      </div>
      <style>{`
        .header {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid var(--gray-200);
          z-index: 100;
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-weight: 700;
          font-size: 1.25rem;
        }
        .logo-text {
          color: var(--primary);
        }
        .logo-gig {
          color: var(--gray-600);
        }
        .nav {
          display: flex;
          gap: 1.5rem;
        }
        .nav a {
          color: var(--gray-600);
          font-weight: 500;
        }
        .nav a:hover {
          color: var(--primary);
        }
        .cart-btn {
          padding: 0.5rem 1rem;
          background: var(--gray-100);
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
        }
        .cart-btn:hover {
          background: var(--gray-200);
        }
      `}</style>
    </header>
  );
}