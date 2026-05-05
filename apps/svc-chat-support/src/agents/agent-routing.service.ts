import { Injectable } from '@nestjs/common';

export interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  specialty: string[];
  activeChats: number;
  maxChats: number;
  avgRating: number;
}

@Injectable()
export class AgentRoutingService {
  private agents: Map<string, Agent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const defaultAgents: Agent[] = [
      { id: 'agent1', name: 'Sarah M.', email: 'sarah@lastmile.com', status: 'available', specialty: ['billing', 'orders'], activeChats: 2, maxChats: 5, avgRating: 4.8 },
      { id: 'agent2', name: 'John D.', email: 'john@lastmile.com', status: 'available', specialty: ['delivery', 'driver'], activeChats: 1, maxChats: 5, avgRating: 4.6 },
      { id: 'agent3', name: 'Lisa K.', email: 'lisa@lastmile.com', status: 'available', specialty: ['general', 'technical'], activeChats: 3, maxChats: 5, avgRating: 4.9 },
    ];

    for (const agent of defaultAgents) {
      this.agents.set(agent.id, agent);
    }
  }

  /**
   * Find best agent
   */
  async findBestAgent(specialty?: string[]): Promise<Agent | null> {
    const available = Array.from(this.agents.values())
      .filter(a => a.status === 'available' && a.activeChats < a.maxChats);

    if (available.length === 0) return null;

    // Filter by specialty if provided
    let candidates = available;
    if (specialty?.length) {
      candidates = available.filter(a =>
        specialty.some(s => a.specialty.includes(s))
      );
    }

    // Sort by fewest active chats
    candidates.sort((a, b) => a.activeChats - b.activeChats);
    return candidates[0] || null;
  }

  /**
   * Get all available agents
   */
  async getAvailableAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values())
      .filter(a => a.status === 'available');
  }

  /**
   * Update agent status
   */
  async updateStatus(agentId: string, status: 'available' | 'busy' | 'offline'): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    agent.status = status;
    this.agents.set(agentId, agent);
    return true;
  }

  /**
   * Increment active chats
   */
  async incrementChats(agentId: string): Promise<number> {
    const agent = this.agents.get(agentId);
    if (!agent) return 0;

    agent.activeChats++;
    this.agents.set(agentId, agent);
    return agent.activeChats;
  }

  /**
   * Decrement active chats
   */
  async decrementChats(agentId: string): Promise<number> {
    const agent = this.agents.get(agentId);
    if (!agent) return 0;

    agent.activeChats = Math.max(0, agent.activeChats - 1);
    
    if (agent.activeChats < agent.maxChats) {
      agent.status = 'available';
    }
    
    this.agents.set(agentId, agent);
    return agent.activeChats;
  }

  /**
   * Get agent performance
   */
  async getAgentPerformance(agentId: string): Promise<{
    chatsToday: number;
    avgResponseTime: number;
    avgRating: number;
  }> {
    return {
      chatsToday: Math.floor(Math.random() * 20) + 5,
      avgResponseTime: 2.5,
      avgRating: 4.7,
    };
  }

  /**
   * Queue for routing
   */
  async getRoutingQueue(): Promise<Agent[]> {
    return Array.from(this.agents.values())
      .filter(a => a.status === 'available')
      .sort((a, b) => a.activeChats - b.activeChats);
  }

  /**
   * Auto-route chat
   */
  async autoRoute(specialty?: string[]): Promise<string | null> {
    const agent = await this.findBestAgent(specialty);
    return agent?.id || null;
  }
}