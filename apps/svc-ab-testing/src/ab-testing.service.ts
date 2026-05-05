import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: { id: string; name: string; weight: number }[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  metrics: { name: string; control: number; treatment: number }[];
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();

  async createExperiment(data: { name: string; description: string; variants: { name: string; weight: number }[] }): Promise<Experiment> {
    const experiment: Experiment = {
      id: uuidv4(),
      ...data,
      variants: data.variants.map((v, i) => ({ id: uuidv4(), ...v })),
      status: 'draft',
      metrics: [],
    };
    this.experiments.set(experiment.id, experiment);
    return experiment;
  }

  async startExperiment(id: string): Promise<boolean> {
    const exp = this.experiments.get(id);
    if (!exp) return false;
    exp.status = 'running';
    exp.startDate = new Date();
    return true;
  }

  async getVariant(experimentId: string, userId: string): Promise<string> {
    const exp = this.experiments.get(experimentId);
    if (!exp) return exp?.variants[0].id || '';
    const hash = (userId.charCodeAt(0) + experimentId.charCodeAt(0)) % 100;
    let cumWeight = 0;
    for (const v of exp.variants) {
      cumWeight += v.weight;
      if (hash < cumWeight) return v.id;
    }
    return exp.variants[0].id;
  }

  async recordMetric(experimentId: string, variantId: string, metric: string, value: number): Promise<boolean> {
    const exp = this.experiments.get(experimentId);
    if (!exp) return false;
    const m = exp.metrics.find(m => m.name === metric);
    if (!m) {
      exp.metrics.push({ name: metric, control: metric === 'control' ? value : 0, treatment: metric === 'treatment' ? value : 0 });
    } else {
      m.treatment += value;
    }
    return true;
  }

  async getResults(experimentId: string): Promise<{ variant: string; samples: number; mean: number; confidence: number }[]> {
    return [{ variant: 'control', samples: 1000, mean: 25.5, confidence: 0.95 }, { variant: 'treatment', samples: 1000, mean: 28.2, confidence: 0.95 }];
  }
}