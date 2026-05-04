import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DriverStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum DriverAvailability {
  OFFLINE = 'offline',
  ONLINE = 'online',
  BUSY = 'busy',
}

export enum VehicleType {
  BICYCLE = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'phone', length: 20 })
  phone: string;

  @Column({ name: 'profile_photo_url', nullable: true })
  profilePhotoUrl: string | null;

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.PENDING })
  status: DriverStatus;

  @Column({ type: 'enum', enum: DriverAvailability, default: DriverAvailability.OFFLINE })
  availability: DriverAvailability;

  @Column({ type: 'enum', enum: VehicleType, default: VehicleType.BICYCLE })
  vehicleType: VehicleType;

  @Column({ name: 'vehicle_plate', nullable: true })
  vehiclePlate: string | null;

  @Column({ name: 'vehicle_model', nullable: true })
  vehicleModel: string | null;

  @Column({ name: 'vehicle_year', nullable: true })
  vehicleYear: number | null;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string | null;

  @Column({ name: 'license_expiry', type: 'date', nullable: true })
  licenseExpiry: Date | null;

  @Column({ name: 'insurance_number', nullable: true })
  insuranceNumber: string | null;

  @Column({ name: 'insurance_expiry', type: 'date', nullable: true })
  insuranceExpiry: Date | null;

  @Column({ name: 'current_location', type: 'jsonb', nullable: true })
  currentLocation: { lat: number; lng: number } | null;

  @Column({ name: 'zone', nullable: true })
  zone: string | null;

  @Column({ name: 'rating', type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @Column({ name: 'total_deliveries', type: 'int', default: 0 })
  totalDeliveries: number;

  @Column({ name: 'accept_rate', type: 'decimal', precision: 5, scale: 2, default: 100 })
  acceptRate: number;

  @Column({ name: 'cancellation_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  cancellationRate: number;

  @Column({ name: 'on_time_rate', type: 'decimal', precision: 5, scale: 2, default: 100 })
  onTimeRate: number;

  @Column({ name: 'wallet_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  walletBalance: number;

  @Column({ name: 'pending_payout', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingPayout: number;

  @Column({ name: 'total_earnings', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt: Date | null;

  @Column({ name: 'deactivated_at', type: 'timestamp', nullable: true })
  deactivatedAt: Date | null;

  @Column({ name: 'last_active_at', type: 'timestamp', nullable: true })
  lastActiveAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}