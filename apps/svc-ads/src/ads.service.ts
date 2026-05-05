import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface AdCampaign {
  id: string;
  name: string;
  type: 'banner' | 'video' | 'sponsored' | 'promo';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  targetAudience: AudienceTarget;
}

export interface AudienceTarget {
  cities: string[];
  demographics: { minAge: number; maxAge: number };
  interests: string[];
}

export interface AdPlacement {
  id: string;
  position: string;
  dimensions: { width: number; height: number };
  basePrice: number;
}

@Injectable()
export class AdsService {
  private campaigns: Map<string, AdCampaign> = new Map();
  private placements: Map<string, AdPlacement> = new Map();

  constructor() {
    this.initPlacements();
  }

  private initPlacements(): void {
    const placements: AdPlacement[] = [
      { id: 'p1', position: 'home_banner', dimensions: { width: 728, height: 90 }, basePrice: 50 },
      { id: 'p2', position: 'sidebar', dimensions: { width: 300, height: 250 }, basePrice: 35 },
      { id: 'p3', position: 'interstitial', dimensions: { width: 320, height: 480 }, basePrice: 75 },
      { id: 'p4', position: 'rewarded_video', dimensions: { width: 1920, height: 1080 }, basePrice: 100 },
    ];
    placements.forEach(p => this.placements.set(p.id, p));
  }

  async createCampaign(data: {
    name: string;
    type: AdCampaign['type'];
    budget: number;
    startDate: Date;
    endDate: Date;
    targetAudience: AudienceTarget;
  }): Promise<AdCampaign> {
    const campaign: AdCampaign = {
      id: uuidv4(),
      ...data,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      status: 'draft',
    };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async activateCampaign(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;
    campaign.status = 'active';
    return true;
  }

  async pauseCampaign(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;
    campaign.status = 'paused';
    return true;
  }

  async getCampaign(campaignId: string): Promise<AdCampaign | null> {
    return this.campaigns.get(campaignId) || null;
  }

  async getActiveCampaigns(): Promise<AdCampaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.status === 'active');
  }

  async recordImpression(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;
    campaign.impressions++;
    return true;
  }

  async recordClick(campaignId: string): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;
    campaign.clicks++;
    return true;
  }

  async recordConversion(campaignId: string, value: number): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;
    campaign.conversions++;
    campaign.spent += value;
    return true;
  }

  async getCampaignMetrics(campaignId: string): Promise<{
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
  }> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return { ctr: 0, cpc: 0, cpm: 0, roas: 0 };

    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
    const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;
    const cpm = campaign.impressions > 0 ? (campaign.spent / campaign.impressions) * 1000 : 0;
    const roas = campaign.spent > 0 ? (campaign.conversions * 100) / campaign.spent : 0;

    return { ctr: Math.round(ctr * 100) / 100, cpc: Math.round(cpc * 100) / 100, cpm: Math.round(cpm * 100) / 100, roas: Math.round(roas * 100) / 100 };
  }

  async getPlacements(): Promise<AdPlacement[]> {
    return Array.from(this.placements.values());
  }

  async reservePlacement(placementId: string, campaignId: string, date: Date): Promise<{ reserved: boolean; price: number }> {
    const placement = this.placements.get(placementId);
    return { reserved: true, price: placement?.basePrice || 50 };
  }

  async getDailySpend(campaignId: string): Promise<{ date: Date; spend: number }[]> {
    const days: { date: Date; spend: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d, spend: Math.random() * 200 });
    }
    return days;
  }

  async getAudienceInsights(campaignId: string): Promise<{
    topCities: { city: string; percentage: number }[];
    topInterests: { interest: string; percentage: number }[];
  }> {
    return {
      topCities: [
        { city: 'Johannesburg', percentage: 35 },
        { city: 'Cape Town', percentage: 28 },
        { city: 'Durban', percentage: 15 },
      ],
      topInterests: [
        { interest: 'Food & Dining', percentage: 45 },
        { interest: 'Cooking', percentage: 30 },
        { interest: 'Fast Food', percentage: 25 },
      ],
    };
  }
}