'use client';

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  return (
    <section className="cart">
      <div className="container">
        <h2 className="section-title">Your Cart</h2>
        <div className="cart-empty">
          <p>Your cart is empty</p>
          <button className="btn btn-primary" onClick={onCheckout}>
            Start Shopping
          </button>
        </div>
      </div>
      <style>{`
        .cart { padding: 4rem 0; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
        .cart-empty { text-align: center; padding: 3rem; color: var(--gray-500); }
        .cart-empty p { margin-bottom: 1rem; }
      `}</style>
    </section>
  );
}