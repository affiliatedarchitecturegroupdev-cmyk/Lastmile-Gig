import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type MessageType = 'text' | 'image' | 'voice' | 'order_update' | 'system';
export type ConversationType = 'customer_driver' | 'customer_support' | 'driver_partner';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'driver' | 'partner' | 'support';
  type: MessageType;
  content: string;
  attachments?: Attachment[];
  timestamp: Date;
  read: boolean;
  readAt?: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'voice' | 'document';
  url: string;
  thumbnail?: string;
  duration?: number;
  name: string;
  size: number;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: { userId: string; type: string }[];
  orderId?: string;
  lastMessage?: Message;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MessagingService {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();

  /**
   * Create or get conversation between participants
   */
  async getOrCreateConversation(
    type: ConversationType,
    participants: { userId: string; type: string }[],
    orderId?: string
  ): Promise<Conversation> {
    // Find existing conversation
    for (const conv of this.conversations.values()) {
      if (conv.orderId === orderId && conv.type === type) {
        return conv;
      }
    }

    // Create new conversation
    const conversation: Conversation = {
      id: uuidv4(),
      type,
      participants,
      orderId,
      unreadCount: new Map(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);

    return conversation;
  }

  /**
   * Send a message
   */
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: Message['senderType'];
    type: MessageType;
    content: string;
    attachments?: Attachment[];
  }): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      ...data,
      timestamp: new Date(),
      read: false,
    };

    // Store message
    const conversationMessages = this.messages.get(data.conversationId) || [];
    conversationMessages.push(message);
    this.messages.set(data.conversationId, conversationMessages);

    // Update conversation
    const conversation = this.conversations.get(data.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = new Date();

      // Increment unread for other participants
      for (const participant of conversation.participants) {
        if (participant.userId !== data.senderId) {
          const current = conversation.unreadCount.get(participant.userId) || 0;
          conversation.unreadCount.set(participant.userId, current + 1);
        }
      }
    }

    return message;
  }

  /**
   * Get conversation messages
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    before?: Date
  ): Promise<Message[]> {
    const allMessages = this.messages.get(conversationId) || [];
    
    let filtered = allMessages;
    if (before) {
      filtered = allMessages.filter(m => m.timestamp < before);
    }

    return filtered.slice(-limit);
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const conversationMessages = this.messages.get(conversationId);
    if (!conversationMessages) return;

    for (const message of conversationMessages) {
      if (!message.read && message.senderId !== userId) {
        message.read = true;
        message.readAt = new Date();
      }
    }

    // Reset unread count
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount.set(userId, 0);
    }
  }

  /**
   * Get user conversations
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(c => c.participants.some(p => p.userId === userId))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Get total unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    let total = 0;
    const conversations = await this.getUserConversations(userId);

    for (const conv of conversations) {
      total += conv.unreadCount.get(userId) || 0;
    }

    return total;
  }

  /**
   * Get or create customer-driver conversation
   */
  async getDriverConversation(
    orderId: string,
    customerId: string,
    driverId: string
  ): Promise<Conversation> {
    return this.getOrCreateConversation(
      'customer_driver',
      [
        { userId: customerId, type: 'customer' },
        { userId: driverId, type: 'driver' },
      ],
      orderId
    );
  }

  /**
   * Send order update message
   */
  async sendOrderUpdate(
    conversationId: string,
    update: string,
    orderId: string
  ): Promise<Message> {
    return this.sendMessage({
      conversationId,
      senderId: 'system',
      senderType: 'support',
      type: 'order_update',
      content: update,
    });
  }

  /**
   * Quick replies
   */
  async getQuickReplies(): string[] {
    return [
      "I've arrived at the restaurant",
      "Picking up your order",
      "On my way",
      "Almost there",
      "Arrived at your location",
      "Please meet at the entrance",
      "Call me please",
    ];
  }

  /**
   * Search messages
   */
  async searchMessages(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<Message[]> {
    const conversations = await this.getUserConversations(userId);
    const results: Message[] = [];
    const lowerQuery = query.toLowerCase();

    for (const conv of conversations) {
      const convMessages = this.messages.get(conv.id) || [];
      for (const msg of convMessages) {
        if (msg.content.toLowerCase().includes(lowerQuery)) {
          results.push(msg);
        }
      }
    }

    return results.slice(0, limit);
  }
}