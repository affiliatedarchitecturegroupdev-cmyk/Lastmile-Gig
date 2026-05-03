'use client';

interface StorefrontListProps {
  onSelectStore: (storeId: string) => void;
}

const mockStores = [
  { id: '1', name: 'Burger Palace', rating: 4.5, deliveryTime: '20-30 min', category: 'Burgers' },
  { id: '2', name: 'Pizza Express', rating: 4.8, deliveryTime: '15-25 min', category: 'Pizza' },
  { id: '3', name: 'Sushi Master', rating: 4.7, deliveryTime: '25-35 min', category: 'Sushi' },
  { id: '4', name: 'Taco Fiesta', rating: 4.3, deliveryTime: '20-30 min', category: 'Mexican' },
];

export function StorefrontList({ onSelectStore }: StorefrontListProps) {
  return (
    <section className="stores">
      <div className="container">
        <h2 className="section-title">Restaurants Near You</h2>
        <div className="store-grid">
          {mockStores.map(store => (
            <div key={store.id} className="store-card" onClick={() => onSelectStore(store.id)}>
              <div className="store-image" />
              <div className="store-info">
                <h3 className="store-name">{store.name}</h3>
                <p className="store-meta">
                  <span className="store-rating">★ {store.rating}</span>
                  <span className="store-time">{store.deliveryTime}</span>
                </p>
                <span className="store-category">{store.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .stores { padding: 4rem 0; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
        .store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
        .store-card {
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .store-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .store-image { height: 150px; background: var(--gray-100); }
        .store-info { padding: 1rem; }
        .store-name { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
        .store-meta { display: flex; gap: 1rem; color: var(--gray-600); font-size: 0.875rem; margin-bottom: 0.5rem; }
        .store-rating { color: var(--warning); }
        .store-category { display: inline-block; padding: 0.25rem 0.5rem; background: var(--gray-100); border-radius: 0.25rem; font-size: 0.75rem; }
      `}</style>
    </section>
  );
}