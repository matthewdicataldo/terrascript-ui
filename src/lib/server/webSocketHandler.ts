// src/lib/server/webSocketHandler.ts
import { WebSocketServer, type WebSocket } from 'ws';
import { experimental_RPCHandler as ORPCHandler } from '@orpc/server/ws';
import { os } from '@orpc/server';
import type { ChatMessage } from '../rpcDefinition';
import { GoogleGenAI as genai } from '@google/genai';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { db } from './db';
import { messagesTable, type InsertMessage } from './db/schema';
import { eq, asc } from 'drizzle-orm';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set – aborting WebSocket server bootstrap.');
  throw new Error('GEMINI_API_KEY env-var is required');
 }
 
const ai = new genai({ apiKey: GEMINI_API_KEY });

async function getChatHistoryFromDB(conversationId: string): Promise<ChatMessage[]> {
  try {
    const dbMessages = await db.select({
      role: messagesTable.role,
      content: messagesTable.content
    })
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(asc(messagesTable.createdAt));

    return dbMessages.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }]
    }));
  } catch (error) {
    console.error('Error fetching history from DB with Drizzle:', error);
    return [];
  }
}

async function saveMessageToDB(conversationId: string, role: 'user' | 'model', text: string) {
  try {
    const newMessage: InsertMessage = {
      conversationId,
      role,
      content: text,
    };
    await db.insert(messagesTable).values(newMessage);
    console.log(`[ConvID: ${conversationId}] Saved ${role} message to DB.`);
  } catch (error) {
    console.error(`[ConvID: ${conversationId}] Error saving message to DB with Drizzle:`, error);
  }
}

// Define procedures. Provide explicit type arguments for TInput and TOutput in os.handler.
// Assuming the handler function receives { input: TInput, context: TContext }
const routerProcedures = {
  getHistory: os.handler<ChatMessage[]>(
    async (options) => { // options.input will be string
      const conversationId = options.input;
      console.log(`[ConvID: ${conversationId}] getHistory called.`);
      return getChatHistoryFromDB(conversationId as string);
    }
  ),

  chatStream: os.handler<AsyncGenerator<{ type: 'chunk' | 'error' | 'end'; data: string }, void, unknown>>(
    async function* (options) { // options.input will be { conversationId: string; message: string; }
      const { conversationId, message } = options.input as { conversationId: string; message: string };

      console.log(`[ConvID: ${conversationId}] chatStream called with message: ${message.substring(0, 50)}...`);

      try {
        await saveMessageToDB(conversationId, 'user', message);
        const history = await getChatHistoryFromDB(conversationId);
        // The Gemini API expects history to not include the current user message if it's also passed as the last item in `contents`
        // or if you are using a specific prompt/message parameter.
        // For `generateContentStream({ contents: [...] })`, the last item in contents should be the newest user message.
        // Let's adjust `chatContents` to ensure the current message is the last part of the `contents` array.
        const chatContents: ChatMessage[] = [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ];


        console.log(`[ConvID: ${conversationId}] Calling model.generateContentStream. Contents length: ${chatContents.length}`);

        const result = await ai.models.generateContentStream({
          contents: chatContents,
          model: 'gemini-pro',
          config: {
              maxOutputTokens: 2000
          }
        });

        let accumulatedModelResponse = "";
        // Iterate over result.stream and use chunk.text
        for await (const chunk of result) {
          // Type assertion for chunk if necessary, though it should be inferred correctly now
          // chunk is of type GenerateContentResponse
          const currentChunkText = chunk.text; // Access as property, not method
          if (currentChunkText) { // Check if text is defined and not empty
            accumulatedModelResponse += currentChunkText;
            yield { type: 'chunk', data: currentChunkText };
          }
        }

        if (accumulatedModelResponse) {
          await saveMessageToDB(conversationId, 'model', accumulatedModelResponse);
        }
        yield { type: 'end', data: 'Stream finished' };
        console.log(`[ConvID: ${conversationId}] Stream finished.`);
      } catch (error) {
        console.error(`[ConvID: ${conversationId}] Error streaming from Gemini:`, error);
        yield { type: 'error', data: `Error: ${error instanceof Error ? error.message : String(error)}` };
      }
    }
  )
};

// The export of 'procedures' typed as ChatProcedures is removed as ChatProcedures import is removed.
// The client should rely on the types from rpcDefinition.ts for its client creation.

export function createWebSocketServer(httpServer: HttpServer | HttpsServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/api/chat_orpc' });

  const orpcHandler = new ORPCHandler(routerProcedures);

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket via ws, upgrading with ORPC handler.');

    orpcHandler.upgrade(ws, {
      context: {}, // Provide your context if any
    });

    ws.on('close', () => console.log('Client underlying ws connection closed.'));
    ws.on('error', (error) => console.error('Underlying ws connection error:', error));
  });
  console.log(`Development WebSocket server (ws) is listening on ws://<host>:<port>/api/chat_orpc`);
}