import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Driver, DriverStatus, DriverAvailability, VehicleType } from '../entities/driver.entity';

@Injectable()
export class DriverRepository {
  private repository: Repository<Driver>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Driver);
  }

  async create(driverData: Partial<Driver>): Promise<Driver> {
    const driver = this.repository.create(driverData);
    return this.repository.save(driver);
  }

  async findById(id: string): Promise<Driver | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Driver | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async findByStatus(status: DriverStatus, limit = 20, offset = 0): Promise<Driver[]> {
    return this.repository.find({
      where: { status },
      take: limit,
      skip: offset,
      order: { rating: 'DESC' },
    });
  }

  async findAvailable(zone?: string, vehicleType?: VehicleType): Promise<Driver[]> {
    const query = this.repository.createQueryBuilder('driver')
      .where('driver.status = :status', { status: DriverStatus.ACTIVE })
      .andWhere('driver.availability = :availability', { availability: DriverAvailability.ONLINE });

    if (zone) {
      query.andWhere('driver.zone = :zone', { zone });
    }
    if (vehicleType) {
      query.andWhere('driver.vehicleType = :vehicleType', { vehicleType });
    }

    return query.orderBy('driver.rating', 'DESC').getMany();
  }

  async findNearby(lat: number, lng: number, radiusKm: number, limit = 20): Promise<Driver[]> {
    // Simplified - in production use PostGIS for spatial queries
    const drivers = await this.findAvailable();
    return drivers.slice(0, limit);
  }

  async update(id: string, data: Partial<Driver>): Promise<Driver> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateLocation(id: string, location: { lat: number; lng: number }): Promise<Driver> {
    return this.update(id, { currentLocation: location });
  }

  async updateAvailability(id: string, availability: DriverAvailability): Promise<Driver> {
    return this.update(id, { 
      availability,
      lastActiveAt: new Date(),
    });
  }

  async updateRating(id: string, rating: number, totalRatings: number): Promise<Driver> {
    return this.update(id, { rating, totalRatings });
  }

  async updateEarnings(id: string, amount: number): Promise<Driver> {
    const driver = await this.findById(id);
    if (!driver) throw new Error('Driver not found');
    
    const walletBalance = driver.walletBalance + amount;
    const totalEarnings = driver.totalEarnings + amount;
    
    return this.update(id, { walletBalance, totalEarnings });
  }

  async countByStatus(status: DriverStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async incrementDeliveries(id: string): Promise<Driver> {
    const driver = await this.findById(id);
    if (!driver) throw new Error('Driver not found');
    
    return this.update(id, { 
      totalDeliveries: driver.totalDeliveries + 1 
    });
  }
}