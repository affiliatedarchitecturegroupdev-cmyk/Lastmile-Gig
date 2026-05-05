import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Driver {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  status: DriverStatus;
  verificationStatus: VerificationStatus;
  vehicle: DriverVehicle;
  zone: string;
  rating: number;
  totalDeliveries: number;
  acceptanceRate: number;
  averageDeliveryTime: number;
  onlineAt?: Date;
  currentLocation?: Coordinates;
  currentOrderId?: string;
  earnings: DriverEarnings;
  createdAt: Date;
  documents: DriverDocuments;
}

export type DriverStatus = 'offline' | 'online' | 'busy' | 'delivery' | 'suspended';
export type VerificationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface DriverVehicle {
  type: 'car' | 'motorcycle' | 'bicycle';
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: Date;
}

export interface DriverEarnings {
  today: number;
  week: number;
  month: number;
  pending: number;
}

export interface DriverDocuments {
  idCard?: string;
  driversLicense?: string;
  vehicleLicense?: string;
  insurance?: string;
}

export interface DriverApplication {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  vehicle: DriverVehicle;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  appliedAt: Date;
}

@Injectable()
export class DriverOnboardingService {
  private readonly logger = new Logger(DriverOnboardingService.name);
  private drivers: Map<string, Driver> = new Map();
  private applications: Map<string, DriverApplication> = new Map();

  constructor() {
    this.seedDriverData();
  }

  private seedDriverData(): void {
    const drivers: Driver[] = [
      {
        id: 'd1', email: 'driver1@example.com', phone: '+27811234567', firstName: 'Mike', lastName: 'Johnson',
        status: 'online', verificationStatus: 'approved',
        vehicle: { type: 'car', make: 'Toyota', model: 'Corolla', year: 2020, licensePlate: 'ABC 123 GP' },
        zone: 'jhb-central', rating: 4.8, totalDeliveries: 450, acceptanceRate: 0.92, averageDeliveryTime: 25,
        onlineAt: new Date(), currentLocation: { lat: -26.2041, lng: 28.0473, timestamp: new Date() },
        earnings: { today: 450, week: 2800, month: 12500, pending: 850 },
        createdAt: new Date('2023-03-15'),
        documents: { idCard: 'doc1', driversLicense: 'doc2', vehicleLicense: 'doc3', insurance: 'doc4' },
      },
    ];
    drivers.forEach(d => this.drivers.set(d.id, d));
  }

  /**
   * Submit driver application
   */
  async submitApplication(data: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    vehicle: DriverVehicle;
  }): Promise<DriverApplication> {
    const application: DriverApplication = {
      id: uuidv4(),
      ...data,
      status: 'pending',
      appliedAt: new Date(),
    };

    this.applications.set(application.id, application);
    this.logger.log(`Driver application ${application.id} submitted`);

    return application;
  }

  /**
   * Get application status
   */
  async getApplicationStatus(applicationId: string): Promise<DriverApplication | null> {
    return this.applications.get(applicationId) || null;
  }

  /**
   * Approve application
   */
  async approveApplication(applicationId: string): Promise<Driver> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    application.status = 'approved';

    const driver: Driver = {
      id: uuidv4(),
      email: application.email,
      phone: application.phone,
      firstName: application.firstName,
      lastName: application.lastName,
      status: 'offline',
      verificationStatus: 'pending',
      vehicle: application.vehicle,
      zone: 'jhb-central',
      rating: 0,
      totalDeliveries: 0,
      acceptanceRate: 0,
      averageDeliveryTime: 0,
      earnings: { today: 0, week: 0, month: 0, pending: 0 },
      createdAt: new Date(),
      documents: {},
    };

    this.drivers.set(driver.id, driver);
    this.logger.log(`Driver ${driver.id} approved from application ${applicationId}`);

    return driver;
  }

  /**
   * Register driver
   */
  async registerDriver(data: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    vehicle: DriverVehicle;
  }): Promise<Driver> {
    const driver: Driver = {
      id: uuidv4(),
      ...data,
      status: 'offline',
      verificationStatus: 'pending',
      vehicle: data.vehicle,
      zone: 'jhb-central',
      rating: 0,
      totalDeliveries: 0,
      acceptanceRate: 0,
      averageDeliveryTime: 0,
      earnings: { today: 0, week: 0, month: 0, pending: 0 },
      createdAt: new Date(),
      documents: {},
    };

    this.drivers.set(driver.id, driver);
    this.logger.log(`Driver ${driver.id} registered`);

    return driver;
  }

  /**
   * Get driver by ID
   */
  async getDriver(driverId: string): Promise<Driver | null> {
    return this.drivers.get(driverId) || null;
  }

  /**
   * Go online
   */
  async goOnline(driverId: string, location: Coordinates): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.status = 'online';
    driver.onlineAt = new Date();
    driver.currentLocation = location;

    this.drivers.set(driverId, driver);
    this.logger.log(`Driver ${driverId} is now online`);

    return true;
  }

  /**
   * Go offline
   */
  async goOffline(driverId: string): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.status = 'offline';
    driver.currentLocation = undefined;
    driver.currentOrderId = undefined;

    this.drivers.set(driverId, driver);
    this.logger.log(`Driver ${driverId} is now offline`);

    return true;
  }

  /**
   * Update location
   */
  async updateLocation(driverId: string, location: Coordinates): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.currentLocation = location;
    this.drivers.set(driverId, driver);

    return true;
  }

  /**
   * Accept order
   */
  async acceptOrder(driverId: string, orderId: string): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver || driver.status !== 'online') {
      return false;
    }

    driver.status = 'busy';
    driver.currentOrderId = orderId;

    this.drivers.set(driverId, driver);
    this.logger.log(`Driver ${driverId} accepted order ${orderId}`);

    return true;
  }

  /**
   * Complete delivery
   */
  async completeDelivery(driverId: string, orderId: string, earnings: number): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.status = 'online';
    driver.totalDeliveries++;
    driver.earnings.today += earnings;
    driver.earnings.week += earnings;
    driver.earnings.month += earnings;
    driver.currentOrderId = undefined;

    this.drivers.set(driverId, driver);
    this.logger.log(`Driver ${driverId} completed delivery, earned R${earnings}`);

    return true;
  }

  /**
   * Cancel order
   */
  async cancelOrder(driverId: string): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.status = 'online';
    driver.currentOrderId = undefined;

    this.drivers.set(driverId, driver);
    return true;
  }

  /**
   * Upload document
   */
  async uploadDocument(driverId: string, type: keyof DriverDocuments, documentUrl: string): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.documents[type] = documentUrl;
    this.drivers.set(driverId, driver);

    this.logger.log(`Driver ${driverId} uploaded ${type} document`);
    return true;
  }

  /**
   * Submit for verification
   */
  async submitForVerification(driverId: string): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    // Check if all documents are uploaded
    if (!driver.documents.idCard || !driver.documents.driversLicense || !driver.documents.vehicleLicense || !driver.documents.insurance) {
      throw new Error('Missing required documents');
    }

    driver.verificationStatus = 'in_review';
    this.drivers.set(driverId, driver);

    this.logger.log(`Driver ${driverId} submitted for verification`);
    return true;
  }

  /**
   * Approve verification
   */
  async approveVerification(driverId: string): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    driver.verificationStatus = 'approved';
    this.drivers.set(driverId, driver);

    this.logger.log(`Driver ${driverId} verification approved`);
    return true;
  }

  /**
   * Get nearby drivers
   */
  async getNearbyDrivers(location: Coordinates, radiusKm: number, limit?: number): Promise<Driver[]> {
    const drivers = Array.from(this.drivers.values())
      .filter(d => d.status === 'online' && d.verificationStatus === 'approved' && d.currentLocation)
      .sort((a, b) => {
        const distA = this.calculateDistance(location.lat, location.lng, a.currentLocation!.lat, a.currentLocation!.lng);
        const distB = this.calculateDistance(location.lat, location.lng, b.currentLocation!.lat, b.currentLocation!.lng);
        return distA - distB;
      });

    return limit ? drivers.slice(0, limit) : drivers;
  }

  /**
   * Calculate distance
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * Math.PI / 180;
  }

  /**
   * Get driver statistics
   */
  async getDriverStatistics(driverId: string): Promise<{
    totalDeliveries: number;
    rating: number;
    acceptanceRate: number;
    averageDeliveryTime: number;
    earnings: DriverEarnings;
  }> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    return {
      totalDeliveries: driver.totalDeliveries,
      rating: driver.rating,
      acceptanceRate: driver.acceptanceRate,
      averageDeliveryTime: driver.averageDeliveryTime,
      earnings: driver.earnings,
    };
  }

  /**
   * Update rating
   */
  async updateRating(driverId: string, newRating: number): Promise<boolean> {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      return false;
    }

    // Weighted average (assuming 450 previous ratings)
    driver.rating = (driver.rating * 450 + newRating) / 451;
    this.drivers.set(driverId, driver);

    return true;
  }
}