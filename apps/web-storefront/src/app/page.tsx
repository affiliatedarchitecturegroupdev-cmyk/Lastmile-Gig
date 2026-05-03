'use client';

const mockOrders = [
  { id: 'ORD-001', customer: 'John D.', items: 3, total: 45.99, status: 'new', time: '2 min ago' },
  { id: 'ORD-002', customer: 'Sarah M.', items: 2, total: 28.50, status: 'preparing', time: '5 min ago' },
  { id: 'ORD-003', customer: 'Mike R.', items: 5, total: 72.25, status: 'ready', time: '10 min ago' },
];

export default function DashboardPage() {
  return (
    <>
      <header className="header">
        <h1 className="title">Dashboard</h1>
        <span>Today, {new Date().toLocaleDateString()}</span>
      </header>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Today's Orders</div>
          <div className="stat-value">24</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">$847</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value">$35.29</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Drivers</div>
          <div className="stat-value">8</div>
        </div>
      </div>

      <div className="orders-table">
        <div className="table-header">Recent Orders</div>
        {mockOrders.map(order => (
          <div key={order.id} className="table-row">
            <div>
              <div style={{ fontWeight: 500 }}>{order.id}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                {order.customer} • {order.items} items
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`status-badge status-${order.status}`}>
                {order.status}
              </span>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {order.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}