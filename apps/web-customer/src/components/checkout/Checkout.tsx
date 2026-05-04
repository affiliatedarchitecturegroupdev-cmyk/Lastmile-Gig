'use client';

interface CheckoutProps {
  onPlaceOrder: () => void;
}

export function Checkout({ onPlaceOrder }: CheckoutProps) {
  return (
    <section className="checkout">
      <h2 className="section-title">Checkout</h2>
      
      <div className="checkout-section">
        <h3>Delivery Address</h3>
        <div className="address-card">
          <p>123 Main St, Johannesburg</p>
          <button className="btn-link">Change</button>
        </div>
      </div>

      <div className="checkout-section">
        <h3>Payment Method</h3>
        <div className="payment-options">
          <label className="payment-option">
            <input type="radio" name="payment" defaultChecked />
            <span>Credit Card</span>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" />
            <span>Apple Pay</span>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" />
            <span>Cash on Delivery</span>
          </label>
        </div>
      </div>

      <div className="checkout-section">
        <h3>Tip</h3>
        <div className="tip-options">
          <button className="tip-btn">10%</button>
          <button className="tip-btn">15%</button>
          <button className="tip-btn">20%</button>
          <button className="tip-btn">Custom</button>
        </div>
      </div>

      <div className="checkout-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>R150.00</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>R35.00</span>
        </div>
        <div className="summary-row">
          <span>Service Fee</span>
          <span>R10.00</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>R195.00</span>
        </div>
      </div>

      <button className="btn btn-primary place-order-btn" onClick={onPlaceOrder}>
        Place Order - R195.00
      </button>

      <style>{`
        .checkout { padding: 2rem 0; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
        .checkout-section { margin-bottom: 1.5rem; }
        .checkout-section h3 { font-size: 1rem; font-weight: 500; margin-bottom: 0.75rem; }
        .address-card { display: flex; justify-content: space-between; padding: 1rem; background: var(--gray-50); border-radius: 0.5rem; }
        .btn-link { background: none; border: none; color: var(--primary); font-weight: 500; }
        .payment-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: var(--gray-50); border-radius: 0.5rem; margin-bottom: 0.5rem; cursor: pointer; }
        .tip-options { display: flex; gap: 0.5rem; }
        .tip-btn { flex: 1; padding: 0.75rem; background: var(--gray-100); border: none; border-radius: 0.5rem; font-weight: 500; }
        .tip-btn:hover { background: var(--gray-200); }
        .checkout-summary { padding: 1rem; background: var(--gray-50); border-radius: 0.5rem; margin-bottom: 1rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .summary-row.total { font-weight: 700; font-size: 1.125rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--gray-200); }
        .place-order-btn { width: 100%; padding: 1rem; font-size: 1.125rem; }
      `}</style>
    </section>
  );
}