import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PLACED = 'placed',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DISPATCHED = 'dispatched',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id' })
  partnerId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'driver_id', nullable: true })
  driverId: string | null;

  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PLACED })
  status: OrderStatus;

  @Column({ name: 'items', type: 'jsonb' })
  items: OrderItem[];

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2 })
  deliveryFee: number;

  @Column({ name: 'service_fee', type: 'decimal', precision: 10, scale: 2 })
  serviceFee: number;

  @Column({ name: 'tax', type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'delivery_location', type: 'jsonb' })
  deliveryLocation: { lat: number; lng: number };

  @Column({ name: 'pickup_location', type: 'jsonb', nullable: true })
  pickupLocation: { lat: number; lng: number } | null;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20 })
  customerPhone: string;

  @Column({ name: 'customer_note', type: 'text', nullable: true })
  customerNote: string | null;

  @Column({ name: 'partner_note', type: 'text', nullable: true })
  partnerNote: string | null;

  @Column({ name: 'sla_deadline', type: 'timestamp' })
  slaDeadline: Date;

  @Column({ name: 'estimated_prep_minutes', type: 'int', nullable: true })
  estimatedPrepMinutes: number | null;

  @Column({ name: 'estimated_delivery_minutes', type: 'int', nullable: true })
  estimatedDeliveryMinutes: number | null;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string | null;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount: number | null;

  @Column({ name: 'rating', type: 'int', nullable: true })
  rating: number | null;

  @Column({ name: 'rating_comment', type: 'text', nullable: true })
  ratingComment: string | null;

  @Column({ name: 'delivery_photo_hash', type: 'varchar', length: 64, nullable: true })
  deliveryPhotoHash: string | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'preparing_at', type: 'timestamp', nullable: true })
  preparingAt: Date | null;

  @Column({ name: 'dispatched_at', type: 'timestamp', nullable: true })
  dispatchedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}