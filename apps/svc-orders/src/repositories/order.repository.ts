import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';

@Injectable()
export class OrderRepository {
  private repository: Repository<Order>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Order);
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.repository.create(orderData);
    return this.repository.save(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByPartner(partnerId: string, limit = 20, offset = 0): Promise<Order[]> {
    return this.repository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByCustomer(customerId: string, limit = 20, offset = 0): Promise<Order[]> {
    return this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByDriver(driverId: string, limit = 20, offset = 0): Promise<Order[]> {
    return this.repository.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const updates: Partial<Order> = { status };
    
    if (status === OrderStatus.CONFIRMED) {
      updates.confirmedAt = new Date();
    } else if (status === OrderStatus.PREPARING) {
      updates.preparingAt = new Date();
    } else if (status === OrderStatus.DISPATCHED) {
      updates.dispatchedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updates.deliveredAt = new Date();
    }
    
    return this.update(id, updates);
  }

  async findActiveBy Partner(partnerId: string): Promise<Order[]> {
    return this.repository.find({
      where: [
        { partnerId, status: OrderStatus.PLACED },
        { partnerId, status: OrderStatus.CONFIRMED },
        { partnerId, status: OrderStatus.PREPARING },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async findBreached(): Promise<Order[]> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('order')
      .where('order.slaDeadline < :now', { now })
      .andWhere('order.status NOT IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      })
      .getMany();
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async findByDateRange(start: Date, end: Date): Promise<Order[]> {
    return this.repository
      .createQueryBuilder('order')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .getMany();
  }
}