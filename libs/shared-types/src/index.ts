export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'customer' | 'driver' | 'partner' | 'admin' | 'ops';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  partnerId: string;
  driverId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentRef: string;
  deliveryAddress: Address;
  placedAt: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Driver {
  id: string;
  userId: string;
  vehicleType: 'scooter' | 'bicycle' | 'car' | 'van';
  status: DriverStatus;
  performanceScore: number;
  zone: string;
}

export type DriverStatus = 'active' | 'idle' | 'offline' | 'suspended';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  type: RestaurantType;
  status: PartnerStatus;
}

export type RestaurantType = 'restaurant' | 'cafe' | 'fastfood' | 'finedining' | 'hotel' | 'corporate';
export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}