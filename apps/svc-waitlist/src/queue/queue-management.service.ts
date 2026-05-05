import { Injectable } from '@nestjs/common';

export interface QueuePosition {
  entryId: string;
  position: number;
  estimatedWait: number;
  status: string;
}

export interface QueueMetrics {
  partnerId: string;
  avgWaitTime: number;
  maxWaitTime: number;
  partiesServed: number;
  noShowRate: number;
}

@Injectable()
export class QueueManagementService {
  /**
   * Get queue positions
   */
  async getQueuePositions(partnerId: string): Promise<QueuePosition[]> {
    // Would return current queue
    return [
      { entryId: 'e1', position: 1, estimatedWait: 10, status: 'waiting' },
      { entryId: 'e2', position: 2, estimatedWait: 20, status: 'waiting' },
      { entryId: 'e3', position: 3, estimatedWait: 30, status: 'waiting' },
    ];
  }

  /**
   * Get average wait time
   */
  async getAvgWaitTime(partnerId: string): Promise<number> {
    // Would calculate from historical data
    return 18;
  }

  /**
   * Estimate table turnover
   */
  async estimateTableTurnover(partySize: number): Promise<number> {
    // Minutes by party size
    const turnover: Record<number, number> = {
      1: 30, 2: 45, 3: 60, 4: 75, 5: 90, 6: 105
    };
    return turnover[partySize] || 120;
  }

  /**
   * Calculate queue health
   */
  async getQueueHealth(partnerId: string): Promise<{
    score: number;
    status: 'healthy' | 'busy' | 'critical';
    recommendation: string;
  }> {
    // Simple health calculation
    const score = Math.floor(Math.random() * 40) + 60;
    const status = score >= 80 ? 'healthy' : score >= 60 ? 'busy' : 'critical';
    const recommendation = status === 'healthy' 
      ? 'Queue is flowing well'
      : status === 'busy'
      ? 'Consider adding tables or accepting fewer walk-ins'
      : 'High wait times - consider reservations';
    
    return { score, status, recommendation };
  }

  /**
   * Optimize queue
   */
  async optimizeQueue(partnerId: string): Promise<{
    tablesFreed: number;
    nextPosition: number;
    estimatedImprovement: number;
  }> {
    return {
      tablesFreed: 2,
      nextPosition: 1,
      estimatedImprovement: 15,
    };
  }

  /**
   * Queue metrics
   */
  async getQueueMetrics(partnerId: string): Promise<QueueMetrics> {
    return {
      partnerId,
      avgWaitTime: 18,
      maxWaitTime: 45,
      partiesServed: 150,
      noShowRate: 8,
    };
  }
}