import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export interface CartItem {
  id: string;
  partnerId: string;
  partnerName: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface VendorGroup {
  partnerId: string;
  partnerName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
}

interface MultiVendorCartContextType {
  items: CartItem[];
  vendorGroups: VendorGroup[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  totals: {
    itemsCount: number;
    vendorsCount: number;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    total: number;
  };
}

const MultiVendorCartContext = createContext<MultiVendorCartContextType | undefined>(undefined);

export function MultiVendorCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Group items by vendor
  const vendorGroups = items.reduce((groups: VendorGroup[], item) => {
    const existing = groups.find(g => g.partnerId === item.partnerId);
    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.price * item.quantity;
    } else {
      groups.push({
        partnerId: item.partnerId,
        partnerName: item.partnerName,
        items: [item],
        subtotal: item.price * item.quantity,
        deliveryFee: 35,
      });
    }
    return groups;
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate totals
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const vendorsCount = vendorGroups.length;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = vendorGroups.length * 35;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + serviceFee;

  const totals = {
    itemsCount,
    vendorsCount,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
  };

  return (
    <MultiVendorCartContext.Provider
      value={{
        items,
        vendorGroups,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totals,
      }}
    >
      {children}
    </MultiVendorCartContext.Provider>
  );
}

export function useMultiVendorCart() {
  const context = useContext(MultiVendorCartContext);
  if (!context) {
    throw new Error('useMultiVendorCart must be used within MultiVendorCartProvider');
  }
  return context;
}

// Multi-vendor checkout hook
export function useMultiVendorCheckout() {
  const { items, vendorGroups, totals, clearCart } = useMultiVendorCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderGroupId, setOrderGroupId] = useState<string | null>(null);

  const processCheckout = async (deliveryAddress: string, paymentMethod: string) => {
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/checkout/multi-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: vendorGroups.flatMap(g => g.items),
          vendors: vendorGroups.map(g => ({
            partnerId: g.partnerId,
            items: g.items,
          })),
          deliveryAddress,
          paymentMethod,
          totals,
        }),
      });
      
      const data = await res.json();
      
      if (data.groupId) {
        setOrderGroupId(data.groupId);
        clearCart();
      }
      
      return data;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    orderGroupId,
    processCheckout,
  };
}