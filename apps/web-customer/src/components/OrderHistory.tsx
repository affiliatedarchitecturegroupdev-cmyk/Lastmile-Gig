'use client';

interface OrderHistoryProps {
  onReorder: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
}

interface PastOrder {
  id: string;
  restaurant: string;
  date: string;
  total: number;
  status: string;
  items: { name: string; quantity: number }[];
}

const mockOrders: PastOrder[] = [
  { id: 'LM2024001', restaurant: 'Burger Palace', date: '2024-03-15', total: 245.00, status: 'delivered', items: [{ name: 'Classic Burger', quantity: 2 }] },
  { id: 'LM2024002', restaurant: 'Pizza Express', date: '2024-03-10', total: 180.00, status: 'delivered', items: [{ name: 'Margherita Pizza', quantity: 1 }] },
  { id: 'LM2024003', restaurant: 'Sushi Master', date: '2024-03-05', total: 420.00, status: 'delivered', items: [{ name: 'Salmon Roll', quantity: 3 }] },
];

export function OrderHistory({ onReorder, onViewDetails }: OrderHistoryProps) {
  return (
    <section className="orders">
      <h2 className="section-title">Order History</h2>
      <div className="orders-list">
        {mockOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3 className="restaurant-name">{order.restaurant}</h3>
                <p className="order-date">{order.date}</p>
              </div>
              <span className="order-total">R{order.total.toFixed(2)}</span>
            </div>
            <div className="order-items">
              {order.items.map((item, idx) => (
                <span key={idx}>{item.quantity}x {item.name}</span>
              ))}
            </div>
            <div className="order-actions">
              <button className="btn btn-secondary" onClick={() => onViewDetails(order.id)}>
                View Details
              </button>
              <button className="btn btn-primary" onClick={() => onReorder(order.id)}>
                Reorder
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .orders { padding: 2rem 0; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
        .orders-list { display: flex; flex-direction: column; gap: 1rem; }
        .order-card { padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 0.75rem; }
        .order-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .restaurant-name { font-weight: 600; }
        .order-date { font-size: 0.875rem; color: var(--gray-500); }
        .order-total { font-weight: 600; }
        .order-items { font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.75rem; }
        .order-items span { display: block; }
        .order-actions { display: flex; gap: 0.5rem; }
        .order-actions button { flex: 1; }
      `}</style>
    </section>
  );
}