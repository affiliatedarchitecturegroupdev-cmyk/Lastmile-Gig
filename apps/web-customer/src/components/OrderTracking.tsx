'use client';

interface OrderTrackingProps {
  orderId: string;
}

const steps = [
  { status: 'confirmed', label: 'Order Confirmed' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'picked_up', label: 'Picked Up' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderTracking({ orderId }: OrderTrackingProps) {
  return (
    <section className="tracking">
      <div className="container">
        <h2 className="section-title">Track Order</h2>
        <p className="order-id">Order #{orderId}</p>
        <div className="steps">
          {steps.map((step, index) => (
            <div key={step.status} className={`step ${index === 0 ? 'active' : ''}`}>
              <div className="step-dot" />
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .tracking { padding: 4rem 0; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
        .order-id { color: var(--gray-500); margin-bottom: 2rem; }
        .steps { display: flex; flex-direction: column; gap: 1rem; }
        .step { display: flex; align-items: center; gap: 1rem; }
        .step-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--gray-200); }
        .step.active .step-dot { background: var(--primary); }
        .step-label { color: var(--gray-500); }
        .step.active .step-label { color: var(--foreground); font-weight: 500; }
      `}</style>
    </section>
  );
}