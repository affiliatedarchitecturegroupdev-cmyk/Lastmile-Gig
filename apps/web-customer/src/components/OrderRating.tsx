'use client';

interface RatingProps {
  orderId: string;
  onSubmit: (rating: number, comment: string) => void;
}

export function OrderRating({ orderId, onSubmit }: RatingProps) {
  return (
    <section className="rating">
      <h2 className="section-title">Rate Your Order</h2>
      
      <div className="rating-area">
        {['Food Quality', 'Delivery', 'Overall'].map(category => (
          <div key={category} className="rating-row">
            <span>{category}</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="star-btn">★</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea 
        className="rating-comment"
        placeholder="Tell us more about your experience..."
        rows={4}
      />

      <button className="btn btn-primary" onClick={() => onSubmit(5, '')}>
        Submit Rating
      </button>

      <style>{`
        .rating { padding: 2rem 0; }
        .section-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
        .rating-area { margin-bottom: 1.5rem; }
        .rating-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .stars { display: flex; gap: 0.25rem; }
        .star-btn { background: none; border: none; font-size: 1.5rem; color: var(--gray-300); cursor: pointer; }
        .star-btn:hover { color: var(--warning); }
        .rating-comment { width: 100%; padding: 0.75rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; margin-bottom: 1rem; resize: none; }
      `}</style>
    </section>
  );
}