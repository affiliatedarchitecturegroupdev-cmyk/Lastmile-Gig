import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type ChatStatus = 'queued' | 'active' | 'waiting' | 'ended';
export type ChatPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatSession {
  id: string;
  ticketId?: string;
  userId: string;
  agentId?: string;
  status: ChatStatus;
  priority: ChatPriority;
  subject: string;
  startedAt: Date;
  endedAt?: Date;
  messages: ChatMessage[];
  rating?: number;
}

@Injectable()
export class LiveChatService {
  private chats: Map<string, ChatSession> = new Map();
  private queue: string[] = [];

  /**
   * Start new chat
   */
  async startChat(data: {
    userId: string;
    subject: string;
    priority?: ChatPriority;
  }): Promise<ChatSession> {
    const chat: ChatSession = {
      id: uuidv4(),
      userId: data.userId,
      status: 'queued',
      priority: data.priority || 'normal',
      subject: data.subject,
      startedAt: new Date(),
      messages: [],
    };

    // Add system welcome message
    chat.messages.push({
      id: uuidv4(),
      chatId: chat.id,
      senderId: 'system',
      senderType: 'system',
      message: 'Welcome to Lastmile Support. An agent will be with you shortly.',
      timestamp: new Date(),
      read: false,
    });

    this.chats.set(chat.id, chat);
    this.queue.push(chat.id);

    return chat;
  }

  /**
   * Get queue position
   */
  async getQueuePosition(chatId: string): Promise<number> {
    return this.queue.indexOf(chatId) + 1;
  }

  /**
   * Send message
   */
  async sendMessage(chatId: string, senderId: string, senderType: 'customer' | 'agent', message: string): Promise<ChatMessage> {
    const chat = this.chats.get(chatId);
    if (!chat) throw new Error('Chat not found');

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      chatId,
      senderId,
      senderType,
      message,
      timestamp: new Date(),
      read: false,
    };

    chat.messages.push(chatMessage);
    this.chats.set(chatId, chat);

    return chatMessage;
  }

  /**
   * Get chat messages
   */
  async getMessages(chatId: string): Promise<ChatMessage[]> {
    const chat = this.chats.get(chatId);
    return chat?.messages || [];
  }

  /**
   * Assign agent to chat
   */
  async assignAgent(chatId: string, agentId: string): Promise<ChatSession | null> {
    const chat = this.chats.get(chatId);
    if (!chat) return null;

    chat.agentId = agentId;
    chat.status = 'active';
    
    chat.messages.push({
      id: uuidv4(),
      chatId: chat.id,
      senderId: 'system',
      senderType: 'system',
      message: 'You are now connected with an agent.',
      timestamp: new Date(),
      read: false,
    });

    // Remove from queue
    const queueIndex = this.queue.indexOf(chatId);
    if (queueIndex >= 0) {
      this.queue.splice(queueIndex, 1);
    }

    this.chats.set(chatId, chat);
    return chat;
  }

  /**
   * End chat
   */
  async endChat(chatId: string, rating?: number): Promise<ChatSession | null> {
    const chat = this.chats.get(chatId);
    if (!chat) return null;

    chat.status = 'ended';
    chat.endedAt = new Date();
    chat.rating = rating;

    chat.messages.push({
      id: uuidv4(),
      chatId: chat.id,
      senderId: 'system',
      senderType: 'system',
      message: 'Chat ended. Thank you for contacting us.',
      timestamp: new Date(),
      read: false,
    });

    this.chats.set(chatId, chat);
    return chat;
  }

  /**
   * Get active chats by agent
   */
  async getAgentChats(agentId: string): Promise<ChatSession[]> {
    return Array.from(this.chats.values()).filter(
      c => c.agentId === agentId && c.status === 'active'
    );
  }

  /**
   * Get user's chat history
   */
  async getUserChats(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chats.values()).filter(c => c.userId === userId);
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: string, userId: string): Promise<void> {
    const chat = this.chats.get(chatId);
    if (!chat) return;

    for (const msg of chat.messages) {
      if (msg.senderType !== userId) {
        msg.read = true;
      }
    }
  }

  /**
   * Get unread count
 */
  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const chat = this.chats.get(chatId);
    if (!chat) return 0;
    
    return chat.messages.filter(m => 
      m.senderType !== userId && !m.read
    ).length;
  }

  /**
   * Get queue stats
   */
  async getQueueStats(): Promise<{
    queuedChats: number;
    activeChats: number;
    avgWaitTime: number;
  }> {
    let active = 0;
    for (const chat of this.chats.values()) {
      if (chat.status === 'active') active++;
    }

    return {
      queuedChats: this.queue.length,
      activeChats: active,
      avgWaitTime: this.queue.length > 0 ? 3 + this.queue.length * 2 : 0,
    };
  }
}