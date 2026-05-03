'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { StorefrontList } from '@/components/StorefrontList';
import { Cart } from '@/components/Cart';
import { OrderTracking } from '@/components/OrderTracking';

export default function Home() {
  const [view, setView] = useState<'home' | 'stores' | 'cart' | 'tracking'>('home');
  const [cartCount, setCartCount] = useState(0);

  return (
    <main>
      <Header cartCount={cartCount} onCartClick={() => setView('cart')} />
      {view === 'home' && <Hero onExplore={() => setView('stores')} />}
      {view === 'stores' && <StorefrontList onSelectStore={() => {}} />}
      {view === 'cart' && <Cart onCheckout={() => setView('tracking')} />}
      {view === 'tracking' && <OrderTracking orderId="demo" />}
    </main>
  );
}