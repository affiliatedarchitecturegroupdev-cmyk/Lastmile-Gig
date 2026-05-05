import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'transferred';
export type GiftCardDelivery = 'email' | 'sms';

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  currentBalance: number;
  status: GiftCardStatus;
  purchaserId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  message?: string;
  deliveryMethod: GiftCardDelivery;
  expiresAt: Date;
  createdAt: Date;
  redeemedAt?: Date;
  transactions: GiftCardTransaction[];
}

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: 'redeem' | 'add' | 'expire';
  amount: number;
  balanceAfter: number;
  orderId?: string;
  timestamp: Date;
}

@Injectable()
export class GiftCardService {
  private giftCards: Map<string, GiftCard> = new Map();
  private codes: Map<string, string> = new Map(); // code -> id

  /**
   * Purchase gift card
   */
  async purchaseGiftCard(data: {
    purchaserId: string;
    amount: number;
    recipientEmail?: string;
    recipientPhone?: string;
    recipientName?: string;
    message?: string;
    deliveryMethod: GiftCardDelivery;
  }): Promise<GiftCard> {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const giftCard: GiftCard = {
      id: uuidv4(),
      code,
      amount: data.amount,
      currentBalance: data.amount,
      status: 'active',
      purchaserId: data.purchaserId,
      recipientEmail: data.recipientEmail,
      recipientPhone: data.recipientPhone,
      recipientName: data.recipientName,
      message: data.message,
      deliveryMethod: data.deliveryMethod,
      expiresAt,
      createdAt: new Date(),
      transactions: [],
    };

    this.giftCards.set(giftCard.id, giftCard);
    this.codes.set(code, giftCard.id);

    return giftCard;
  }

  /**
   * Generate unique code
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'LM';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get gift card by code
   */
  async getGiftCard(code: string): Promise<GiftCard | null> {
    const id = this.codes.get(code);
    if (!id) return null;
    return this.giftCards.get(id) || null;
  }

  /**
   * Check balance
   */
  async checkBalance(code: string): Promise<{
    valid: boolean;
    balance: number;
    expiresAt: Date;
  } | null> {
    const giftCard = await this.getGiftCard(code);
    if (!giftCard) return null;

    const now = new Date();
    if (giftCard.expiresAt < now || giftCard.status === 'expired') {
      return { valid: false, balance: 0, expiresAt: giftCard.expiresAt };
    }

    return {
      valid: true,
      balance: giftCard.currentBalance,
      expiresAt: giftCard.expiresAt,
    };
  }

  /**
   * Redeem gift card
   */
  async redeemGiftCard(data: {
    code: string;
    amount: number;
    orderId: string;
  }): Promise<{ success: boolean; amountRedeemed: number; balanceRemaining: number }> {
    const giftCard = await this.getGiftCard(data.code);
    if (!giftCard) return { success: false, amountRedeemed: 0, balanceRemaining: 0 };

    if (giftCard.status !== 'active') {
      return { success: false, amountRedeemed: 0, balanceRemaining: giftCard.currentBalance };
    }

    if (giftCard.expiresAt < new Date()) {
      giftCard.status = 'expired';
      return { success: false, amountRedeemed: 0, balanceRemaining: 0 };
    }

    // Calculate redemption
    const amountRedeemed = Math.min(data.amount, giftCard.currentBalance);
    giftCard.currentBalance -= amountRedeemed;

    // Update status
    if (giftCard.currentBalance <= 0) {
      giftCard.status = 'redeemed';
      giftCard.redeemedAt = new Date();
    }

    // Add transaction
    giftCard.transactions.push({
      id: uuidv4(),
      giftCardId: giftCard.id,
      type: 'redeem',
      amount: amountRedeemed,
      balanceAfter: giftCard.currentBalance,
      orderId: data.orderId,
      timestamp: new Date(),
    });

    this.giftCards.set(giftCard.id, giftCard);

    return {
      success: true,
      amountRedeemed,
      balanceRemaining: giftCard.currentBalance,
    };
  }

  /**
   * Transfer gift card
   */
  async transferGiftCard(data: {
    code: string;
    recipientEmail: string;
    recipientName?: string;
  }): Promise<GiftCard | null> {
    const giftCard = await this.getGiftCard(data.code);
    if (!giftCard || giftCard.status !== 'active') return null;

    // Create new gift card for recipient
    const newGiftCard = await this.purchaseGiftCard({
      purchaserId: giftCard.purchaserId,
      amount: giftCard.currentBalance,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      deliveryMethod: 'email',
    });

    // Mark original as transferred
    giftCard.status = 'transferred';
    giftCard.transactions.push({
      id: uuidv4(),
      giftCardId: giftCard.id,
      type: 'redeem',
      amount: giftCard.currentBalance,
      balanceAfter: 0,
      timestamp: new Date(),
    });

    this.giftCards.set(giftCard.id, giftCard);
    return newGiftCard;
  }

  /**
   * Get user gift cards
   */
  async getUserGiftCards(userId: string): Promise<GiftCard[]> {
    return Array.from(this.giftCards.values()).filter(
      gc => gc.purchaserId === userId || 
           gc.recipientEmail === userId
    );
  }

  /**
   * Get gift card transactions
   */
  async getTransactions(code: string): Promise<GiftCardTransaction[]> {
    const giftCard = await this.getGiftCard(code);
    return giftCard?.transactions || [];
  }

  /**
   * Expire gift cards
   */
  async checkExpiredGiftCards(): Promise<number> {
    let expired = 0;
    const now = new Date();

    for (const giftCard of this.giftCards.values()) {
      if (giftCard.status === 'active' && giftCard.expiresAt < now) {
        giftCard.status = 'expired';
        expired++;
      }
    }

    return expired;
  }

  /**
   * Get available denominations
   */
  async getDenominations(): Promise<number[]> {
    return [50, 100, 150, 200, 250, 500, 1000];
  }

  /**
   * Validate gift card
   */
  async validateGiftCard(code: string, amount: number): Promise<{
    valid: boolean;
    canRedeem: boolean;
    message: string;
  }> {
    const giftCard = await this.getGiftCard(code);
    
    if (!giftCard) return { valid: false, canRedeem: false, message: 'Invalid code' };
    if (giftCard.status === 'expired') return { valid: true, canRedeem: false, message: 'Gift card expired' };
    if (giftCard.status === 'redeemed') return { valid: true, canRedeem: false, message: 'Gift card fully redeemed' };
    if (giftCard.currentBalance < amount) return { valid: true, canRedeem: true, message: 'Partial redemption' };
    
    return { valid: true, canRedeem: true, message: 'Valid' };
  }

  /**
   * Get gift card summary
   */
  async getSummary(): Promise<{
    totalSold: number;
    totalRedeemed: number;
    activeBalance: number;
  }> {
    let totalSold = 0;
    let totalRedeemed = 0;
    let activeBalance = 0;

    for (const gc of this.giftCards.values()) {
      if (gc.purchaserId) {
        totalSold += gc.amount;
      }
      if (gc.status === 'redeemed') {
        totalRedeemed += gc.amount;
      } else if (gc.status === 'active') {
        activeBalance += gc.currentBalance;
      }
    }

    return { totalSold, totalRedeemed, activeBalance };
  }
}