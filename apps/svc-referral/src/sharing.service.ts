import { Injectable } from '@nestjs/common';

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  code: string;
}

export interface ReferralReward {
  referrerReward: number;
  refereeReward: number;
  minOrderValue: number;
  expiryDays: number;
}

@Injectable()
export class SharingService {
  /**
   * Generate share content
   */
  async generateShareContent(userId: string, referralCode: string): Promise<ShareContent> {
    return {
      title: 'Join Lastmile and get R50 off!',
      description: 'Use my referral code for R50 off your first order. Download Lastmile!',
      url: `https://lastmile.app/ref/${referralCode}`,
      code: referralCode,
    };
  }

  /**
   * Get platform share links
   */
  async getShareLinks(referralCode: string): Promise<{
    whatsapp: string;
    sms: string;
    email: string;
    twitter: string;
    facebook: string;
  }> {
    const message = `Get R50 off your first Lastmile order with code ${referralCode}`;
    
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent('R50 off Lastmile')}&body=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://lastmile.app/ref/${referralCode}`,
    };
  }

  /**
   * Get referral rewards config
   */
  async getRewardConfig(): Promise<ReferralReward> {
    return {
      referrerReward: 100, // R100 credit
      refereeReward: 50, // R50 discount
      minOrderValue: 200, // Minimum order to earn reward
      expiryDays: 30, // Rewards expire in 30 days
    };
  }

  /**
   * Generate QR code URL
   */
  async generateQRCode(code: string): Promise<string> {
    // Would integrate with QR API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
  }

  /**
   * Track share clicks
   */
  async trackShare(
    referralCode: string,
    channel: 'whatsapp' | 'sms' | 'email' | 'twitter' | 'facebook'
  ): Promise<void> {
    // Would track in analytics
  }

  /**
   * Get referral program terms
   */
  async getTerms(): Promise<string> {
    return `
Referral Program Terms:
- Referrer earns R100 credit after referee completes their first order
- Referee gets R50 off their first order (min R200)
- Maximum 50 successful referrals per user
- Rewards expire 30 days after being awarded
- Lastmile reserves the right to modify or terminate the program
    `.trim();
  }
}