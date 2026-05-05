import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ETLJob {
  id: string;
  name: string;
  type: 'order' | 'revenue' | 'driver' | 'partner' | 'customer';
  schedule: 'hourly' | 'daily' | 'weekly';
  status: ETLStatus;
  lastRun?: Date;
  nextRun?: Date;
  recordsProcessed: number;
  errors: number;
}

export type ETLStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface DeliveryMetricsETL {
  orderId: string;
  customerId: string;
  driverId: string;
  restaurantId: string;
  orderPlaced: Date;
  orderConfirmed: Date;
  orderPreparing: Date;
  orderReady: Date;
  orderPickedUp: Date;
  orderDelivered: Date;
  totalTime: number;
  preparationTime: number;
  deliveryTime: number;
  distance: number;
  deliveryFee: number;
  tip: number;
  total: number;
}

@Injectable()
export class DeliveryETLService {
  private readonly logger = new Logger(DeliveryETLService.name);
  private jobs: Map<string, ETLJob> = new Map();
  private metrics: Map<string, DeliveryMetricsETL> = new Map();

  constructor() {
    this.initJobs();
  }

  private initJobs(): void {
    const jobs: ETLJob[] = [
      { id: 'j1', name: 'Daily Orders ETL', type: 'order', schedule: 'daily', status: 'idle', recordsProcessed: 0, errors: 0 },
      { id: 'j2', name: 'Hourly Revenue ETL', type: 'revenue', schedule: 'hourly', status: 'idle', recordsProcessed: 0, errors: 0 },
      { id: 'j3', name: 'Weekly Driver ETL', type: 'driver', schedule: 'weekly', status: 'idle', recordsProcessed: 0, errors: 0 },
    ];
    jobs.forEach(j => this.jobs.set(j.id, j));
  }

  async startJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'running';
    this.jobs.set(jobId, job);
    this.logger.log(`ETL job ${jobId} started`);
    return true;
  }

  async completeJob(jobId: string, recordsProcessed: number, errors: number): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'completed';
    job.lastRun = new Date();
    job.recordsProcessed = recordsProcessed;
    job.errors = errors;
    this.jobs.set(jobId, job);
    this.logger.log(`ETL job ${jobId} completed: ${recordsProcessed} records`);
    return true;
  }

  async processDeliveryMetrics(orders: any[]): Promise<{ processed: number }> {
    let processed = 0;
    for (const order of orders) {
      const metric: DeliveryMetricsETL = {
        orderId: order.id, customerId: order.userId, driverId: order.driverId, restaurantId: order.restaurantId,
        orderPlaced: order.createdAt, orderConfirmed: order.confirmedAt!, orderPreparing: order.preparingAt!,
        orderReady: order.readyAt!, orderPickedUp: order.pickedUpAt!, orderDelivered: order.deliveredAt!,
        totalTime: 0, preparationTime: 0, deliveryTime: 0, distance: order.distance || 5,
        deliveryFee: order.deliveryFee, tip: order.tip, total: order.total,
      };
      // Calculate times
      if (metric.orderPlaced && metric.orderDelivered) {
        metric.totalTime = (metric.orderDelivered.getTime() - metric.orderPlaced.getTime()) / 60000;
      }
      if (metric.orderConfirmed && metric.orderReady) {
        metric.preparationTime = (metric.orderReady.getTime() - metric.orderConfirmed.getTime()) / 60000;
      }
      if (metric.orderPickedUp && metric.orderDelivered) {
        metric.deliveryTime = (metric.orderDelivered.getTime() - metric.orderPickedUp.getTime()) / 60000;
      }
      this.metrics.set(metric.orderId, metric);
      processed++;
    }
    return { processed };
  }

  async getJob(jobId: string): Promise<ETLJob | null> { return this.jobs.get(jobId) || null; }
  async getJobs(): Promise<ETLJob[]> { return Array.from(this.jobs.values()); }
  async getMetrics(orderId: string): Promise<DeliveryMetricsETL | null> { return this.metrics.get(orderId) || null; }
}