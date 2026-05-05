import { Injectable, Logger } from '@nestjs/common';

export interface CircuitBreakerState {
  service: string;
  state: 'closed' | 'open' | 'half_open';
  failures: number;
  successes: number;
  lastFailure?: Date;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private states: Map<string, CircuitBreakerState> = new Map();
  private readonlythreshold = 5;
  private readonly timeout = 30000;

  async recordSuccess(service: string): Promise<void> {
    const state = this.states.get(service);
    if (!state) return;
    state.failures = 0;
    if (state.state === 'half_open') state.state = 'closed';
    this.states.set(service, state);
  }

  async recordFailure(service: string): Promise<void> {
    let state = this.states.get(service);
    if (!state) { state = { service, state: 'closed', failures: 0, successes: 0 }; }
    state.failures++;
    state.lastFailure = new Date();
    if (state.failures >= this.threshold) state.state = 'open';
    this.states.set(service, state);
  }

  async isOpen(service: string): Promise<boolean> {
    const state = this.states.get(service);
    if (!state) return false;
    if (state.state === 'open' && Date.now() - (state.lastFailure?.getTime() || 0) > this.timeout) {
      state.state = 'half_open';
      this.states.set(service, state);
    }
    return state.state === 'open';
  }
}