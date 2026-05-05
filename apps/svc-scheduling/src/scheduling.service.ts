import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'order' | 'promotion' | 'notification';
  scheduledFor: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  payload: any;
}

@Injectable()
export class SchedulingService {
  private tasks: Map<string, ScheduledTask> = new Map();

  async scheduleTask(data: { name: string; type: ScheduledTask['type']; scheduledFor: Date; payload: any }): Promise<ScheduledTask> {
    const task: ScheduledTask = { id: uuidv4(), ...data, status: 'scheduled' };
    this.tasks.set(task.id, task);
    return task;
  }

  async getScheduledTasks(): Promise<ScheduledTask[]> {
    return Array.from(this.tasks.values()).filter(t => t.status === 'scheduled');
  }

  async cancelTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.status = 'failed';
    return true;
  }

  async getTaskStatus(id: string): Promise<ScheduledTask | null> {
    return this.tasks.get(id) || null;
  }

  async reschedule(id: string, newTime: Date): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.scheduledFor = newTime;
    return true;
  }

  async getUpcoming(limit?: number): Promise<ScheduledTask[]> {
    const upcoming = Array.from(this.tasks.values())
      .filter(t => t.status === 'scheduled' && t.scheduledFor > new Date())
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    return limit ? upcoming.slice(0, limit) : upcoming;
  }
}