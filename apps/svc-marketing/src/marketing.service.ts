import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'social';
  segments: string[];
  content: { subject?: string; body: string; image?: string };
  sent: number;
  delivered: number;
  opened?: number;
  clicked?: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
}

@Injectable()
export class MarketingService {
  private campaigns: Map<string, Campaign> = new Map();

  async createCampaign(data: { name: string; type: Campaign['type']; segments: string[]; content: { subject?: string; body: string; image?: string } }): Promise<Campaign> {
    const campaign: Campaign = { id: uuidv4(), ...data, sent: 0, delivered: 0, status: 'draft' };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async sendCampaign(campaignId: string): Promise<{ sent: number }> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return { sent: 0 };
    campaign.status = 'sending';
    campaign.sent = Math.floor(Math.random() * 10000);
    campaign.delivered = Math.floor(campaign.sent * 0.95);
    campaign.opened = Math.floor(campaign.delivered * 0.35);
    campaign.clicked = Math.floor(campaign.opened! * 0.15);
    campaign.status = 'sent';
    return { sent: campaign.sent };
  }

  async getCampaignStats(campaignId: string): Promise<{ openRate: number; clickRate: number; conversionRate: number }> {
    const c = this.campaigns.get(campaignId);
    if (!c) return { openRate: 0, clickRate: 0, conversionRate: 0 };
    return {
      openRate: c.delivered > 0 ? (c.opened! / c.delivered) * 100 : 0,
      clickRate: c.opened! > 0 ? (c.clicked! / c.opened!) * 100 : 0,
      conversionRate: c.clicked! > 0 ? (c.clicked! / c.delivered!) * 100 : 0,
    };
  }

  async getCampaignHistory(): Promise<{ name: string; sent: number; openRate: number }[]> {
    return Array.from(this.campaigns.values()).map(c => ({ name: c.name, sent: c.sent, openRate: c.delivered > 0 ? (c.opened! / c.delivered) * 100 : 0 }));
  }
}