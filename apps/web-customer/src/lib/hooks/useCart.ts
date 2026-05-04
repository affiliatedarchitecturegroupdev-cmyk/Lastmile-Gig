'use client';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, any>;
  note?: string;
}

export interface Cart {
  items: CartItem[];
  partnerId: string;
  partnerName: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
}

export function useCart() {
  const cart: Cart = {
    items: [],
    partnerId: '',
    partnerName: '',
    subtotal: 0,
    deliveryFee: 35,
    serviceFee: 0,
    tax: 0,
    total: 0,
  };

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    cart.items.push(newItem);
    recalculate();
  };

  const removeItem = (id: string) => {
    const idx = cart.items.findIndex(i => i.id === id);
    if (idx >= 0) cart.items.splice(idx, 1);
    recalculate();
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.items.find(i => i.id === id);
    if (item) {
      if (quantity <= 0) removeItem(id);
      else item.quantity = quantity;
      recalculate();
    }
  };

  const clear = () => {
    cart.items = [];
    recalculate();
  };

  const recalculate = () => {
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    cart.tax = cart.subtotal * 0.15;
    cart.serviceFee = cart.subtotal * 0.02;
    cart.total = cart.subtotal + cart.deliveryFee + cart.serviceFee + cart.tax;
  };

  return { cart, addItem, removeItem, updateQuantity, clear };
}