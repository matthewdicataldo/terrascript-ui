// src/lib/server/db/schema.ts
import { pgTable, serial, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: varchar('conversation_id', { length: 255 }).notNull(),
  role: varchar('role', { length: 10 }).notNull(), // 'user' or 'model'
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    conversationIdx: index('idx_conversation_id').on(table.conversationId, table.createdAt),
  };
});

// You can define types for insertion and selection if needed
export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;