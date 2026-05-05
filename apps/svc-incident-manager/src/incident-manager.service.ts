import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: IncidentStatus;
  assignee?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export type IncidentStatus = 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved';

@Injectable()
export class IncidentManagerService {
  private readonly logger = new Logger(IncidentManagerService.name);
  private incidents: Map<string, Incident> = new Map();

  async createIncident(data: { title: string; severity: string }): Promise<Incident> {
    const incident: Incident = { id: uuidv4(), title: data.title, severity: data.severity as any, status: 'open', createdAt: new Date() };
    this.incidents.set(incident.id, incident);
    this.logger.log(`Incident ${incident.id} created: ${data.title}`);
    return incident;
  }

  async assignIncident(incidentId: string, assignee: string): Promise<boolean> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;
    incident.assignee = assignee;
    incident.status = 'investigating';
    this.incidents.set(incidentId, incident);
    return true;
  }

  async resolveIncident(incidentId: string): Promise<boolean> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;
    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    this.incidents.set(incidentId, incident);
    return true;
  }
}