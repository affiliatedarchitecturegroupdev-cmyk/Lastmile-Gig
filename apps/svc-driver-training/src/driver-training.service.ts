import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type ModuleType = 'onboarding' | 'safety' | 'customer_service' | 'navigation' | 'vehicles' | 'compliance';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  duration: number; // minutes
  order: number;
  required: boolean;
  content: TrainingContent[];
}

export interface TrainingContent {
  id: string;
  moduleId: string;
  type: 'video' | 'text' | 'quiz';
  title: string;
  content: string;
  order: number;
}

export interface DriverProgress {
  driverId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  completedAt?: Date;
  quizScore?: number;
}

@Injectable()
export class DriverTrainingService {
  private modules: Map<string, TrainingModule> = new Map();
  private progress: Map<string, DriverProgress[]> = new Map();

  constructor() {
    this.loadModules();
  }

  private loadModules(): void {
    const modules: TrainingModule[] = [
      // Onboarding
      { id: 'm1', title: 'Welcome to Lastmile', description: 'Introduction to the platform', type: 'onboarding', duration: 15, order: 1, required: true, content: [] },
      { id: 'm2', title: 'App Overview', description: 'How to use the driver app', type: 'onboarding', duration: 20, order: 2, required: true, content: [] },
      
      // Safety
      { id: 'm3', title: 'Road Safety', description: 'Defensive driving techniques', type: 'safety', duration: 30, order: 3, required: true, content: [] },
      { id: 'm4', title: 'Food Safety', description: 'Handling food properly', type: 'safety', duration: 20, order: 4, required: true, content: [] },
      
      // Customer Service
      { id: 'm5', title: 'Customer Interactions', description: 'Best practices', type: 'customer_service', duration: 15, order: 5, required: true, content: [] },
      { id: 'm6', title: 'Handling Complaints', description: 'Resolve issues professionally', type: 'customer_service', duration: 15, order: 6, required: false, content: [] },
      
      // Navigation
      { id: 'm7', title: 'GPS Navigation', description: 'Using navigation tools', type: 'navigation', duration: 10, order: 7, required: true, content: [] },
      { id: 'm8', title: 'Complex Addresses', description: 'Finding locations', type: 'navigation', duration: 15, order: 8, required: false, content: [] },
      
      // Compliance
      { id: 'm9', title: 'Traffic Laws', description: 'Legal requirements', type: 'compliance', duration: 25, order: 9, required: true, content: [] },
      { id: 'm10', title: 'Vehicle Requirements', description: 'Rules and regulations', type: 'compliance', duration: 20, order: 10, required: true, content: [] },
    ];

    for (const m of modules) {
      this.modules.set(m.id, m);
    }
  }

  /**
   * Get all modules
   */
  async getAllModules(): Promise<TrainingModule[]> {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get module by ID
   */
  async getModule(moduleId: string): Promise<TrainingModule | null> {
    return this.modules.get(moduleId) || null;
  }

  /**
   * Get modules by type
   */
  async getModulesByType(type: ModuleType): Promise<TrainingModule[]> {
    return Array.from(this.modules.values())
      .filter(m => m.type === type)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get driver progress
   */
  async getDriverProgress(driverId: string): Promise<DriverProgress[]> {
    return this.progress.get(driverId) || [];
  }

  /**
   * Start module
   */
  async startModule(driverId: string, moduleId: string): Promise<DriverProgress> {
    const progress: DriverProgress = {
      driverId,
      moduleId,
      status: 'in_progress',
      progress: 0,
    };

    const userProgress = this.progress.get(driverId) || [];
    userProgress.push(progress);
    this.progress.set(driverId, userProgress);

    return progress;
  }

  /**
   * Update progress
   */
  async updateProgress(
    driverId: string,
    moduleId: string,
    progress: number
  ): Promise<DriverProgress | null> {
    const userProgress = this.progress.get(driverId) || [];
    const p = userProgress.find(p => p.moduleId === moduleId);
    
    if (p) {
      p.progress = progress;
      if (progress >= 100) {
        p.status = 'completed';
        p.completedAt = new Date();
      }
      this.progress.set(driverId, userProgress);
      return p;
    }

    return null;
  }

  /**
   * Complete module
   */
  async completeModule(
    driverId: string,
    moduleId: string,
    quizScore?: number
  ): Promise<DriverProgress | null> {
    const userProgress = this.progress.get(driverId) || [];
    const p = userProgress.find(p => p.moduleId === moduleId);
    
    if (p) {
      p.status = 'completed';
      p.progress = 100;
      p.completedAt = new Date();
      p.quizScore = quizScore;
      this.progress.set(driverId, userProgress);
      return p;
    }

    return null;
  }

  /**
   * Get completed modules
   */
  async getCompletedModules(driverId: string): Promise<string[]> {
    const userProgress = this.progress.get(driverId) || [];
    return userProgress
      .filter(p => p.status === 'completed')
      .map(p => p.moduleId);
  }

  /**
   * Get required modules
   */
  async getRequiredModules(): Promise<TrainingModule[]> {
    return Array.from(this.modules.values())
      .filter(m => m.required);
  }

  /**
   * Check certification eligibility
   */
  async checkCertification(driverId: string): Promise<{
    eligible: boolean;
    completedRequired: string[];
    missingRequired: string[];
  }> {
    const required = await this.getRequiredModules();
    const completed = await this.getCompletedModules(driverId);
    
    const completedRequired = required.filter(m => completed.includes(m.id)).map(m => m.id);
    const missingRequired = required.filter(m => !completed.includes(m.id)).map(m => m.id);

    return {
      eligible: missingRequired.length === 0,
      completedRequired,
      missingRequired,
    };
  }

  /**
   * Get completion stats
   */
  async getStats(driverId: string): Promise<{
    totalModules: number;
    completedModules: number;
    avgQuizScore: number;
    timeSpent: number;
  }> {
    const userProgress = this.progress.get(driverId) || [];
    const completed = userProgress.filter(p => p.status === 'completed');
    const scores = completed.map(p => p.quizScore || 0);
    
    return {
      totalModules: this.modules.size,
      completedModules: completed.length,
      avgQuizScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      timeSpent: userProgress.reduce((sum, p) => {
        const mod = this.modules.get(p.moduleId);
        return sum + (mod?.duration || 0) * (p.progress / 100);
      }, 0),
    };
  }
}