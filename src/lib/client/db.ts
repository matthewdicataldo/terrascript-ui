// src/lib/client/db.ts
import Dexie, { type Table } from 'dexie';

export interface ClientMessage {
  id?: number; // Auto-incremented primary key by Dexie
  internalId: string; // To correlate with potential server IDs or for optimistic UI
  conversationId: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  status?: 'pending' | 'sent' | 'error'; // For optimistic UI
}

export class MySubClassedDexie extends Dexie {
  messages!: Table<ClientMessage>; 

  constructor() {
    super('aiChatAppDB');
    this.version(1).stores({
      // Primary key 'id' is auto-incremented.
      // Index 'conversationId' for filtering.
      // Index '[conversationId+timestamp]' for sorted queries per conversation.
      messages: '++id, internalId, conversationId, &[conversationId+timestamp]'
    });
  }
}

export const dxDb = new MySubClassedDexie();