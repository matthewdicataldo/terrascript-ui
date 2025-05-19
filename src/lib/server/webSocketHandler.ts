// src/lib/server/webSocketHandler.ts
import { WebSocketServer, type WebSocket } from 'ws';
import { type ChatProcedures, type ChatMessage } from '../rpcDefinition'; // Changed to relative path
import { GoogleGenAI } from '@google/genai';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { db } from './db'; // Drizzle client
import { messagesTable, type InsertMessage } from './db/schema';
import { eq, asc } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in .env file.");
}

// Initialize Gemini Client
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Helper function to get chat history from DB using Drizzle
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
      role: msg.role as 'user' | 'model', // Ensure role is correctly typed
      parts: [{ text: msg.content }]
    }));
  } catch (error) {
    console.error('Error fetching history from DB with Drizzle:', error);
    return [];
  }
}

// Helper function to save a message to DB using Drizzle
async function saveMessageToDB(conversationId: string, role: 'user' | 'model', text: string) {
  try {
    const newMessage: InsertMessage = {
      conversationId,
      role,
      content: text,
      // createdAt is handled by defaultNow() in schema
    };
    await db.insert(messagesTable).values(newMessage);
    console.log(`[ConvID: ${conversationId}] Saved ${role} message to DB.`);
  } catch (error) {
    console.error(`[ConvID: ${conversationId}] Error saving message to DB with Drizzle:`, error);
  }
}

export const procedures: ChatProcedures = {
  getHistory: async (conversationId: string): Promise<ChatMessage[]> => {
    console.log(`[ConvID: ${conversationId}] getHistory called.`);
    return getChatHistoryFromDB(conversationId);
  },

  chatStream: async function* ({ conversationId, message }: { conversationId: string; message: string }) {
    if (!genAI) {
      console.error(`[ConvID: ${conversationId}] Gemini client (genAI) not initialized.`);
      yield { type: 'error', data: 'Gemini client not initialized.' };
      return;
    }
    console.log(`[ConvID: ${conversationId}] chatStream called with message: ${message.substring(0, 50)}...`);
    
    try {
      await saveMessageToDB(conversationId, 'user', message);
      // Fetch history *after* saving the user's message, so it's part of the `contents`
      const history = await getChatHistoryFromDB(conversationId);

      const chatContents: ChatMessage[] = history; // The history now includes the latest user message.

      console.log(`[ConvID: ${conversationId}] Calling genAI.models.generateContentStream. Contents length: ${chatContents.length}`);
      
      const result = await genAI.models.generateContentStream({
        model: "gemini-1.5-pro-latest",
        contents: chatContents,
        // generationConfig options go directly into the config object
        config: {
          maxOutputTokens: 2000
          // safetySettings: [...] // Can be added here
        }
      });
      
      let accumulatedModelResponse = "";

      // Iterate directly over result, assuming it's the AsyncGenerator
      for await (const chunk of result) {
        // Each chunk is a GenerateContentResponse
        const textChunk = chunk.text; // Access as a property, not a method
        if (textChunk) {
          accumulatedModelResponse += textChunk;
          yield { type: 'chunk', data: textChunk };
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
};

export function createWebSocketServer(httpServer: HttpServer | HttpsServer) { // Accept either http or https server
  const wss = new WebSocketServer({ server: httpServer, path: '/api/chat_orpc' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket via ws');

    ws.onmessage = async (event) => {
      let messageId: string | number | null = null; // To store message ID for error responses
      try {
        const rawMessage = event.data.toString();
        const parsedRpcMessage = JSON.parse(rawMessage);
        messageId = parsedRpcMessage.id; // Capture ID early

        if (typeof parsedRpcMessage.method !== 'string' || !Array.isArray(parsedRpcMessage.params) || parsedRpcMessage.id === undefined) {
          throw new Error('Invalid oRPC message format');
        }
        const { method, params } = parsedRpcMessage;

        if (method === 'chatStream' && typeof procedures.chatStream === 'function') {
          const streamGenerator = procedures.chatStream(params[0] as { conversationId: string; message: string });
          for await (const chunk of streamGenerator) {
            ws.send(JSON.stringify({ jsonrpc: '2.0', id: messageId, result: chunk }));
          }
        } else if (method === 'getHistory' && typeof procedures.getHistory === 'function') {
          const history = await procedures.getHistory(params[0] as string);
          ws.send(JSON.stringify({ jsonrpc: '2.0', id: messageId, result: history }));
        } else {
          ws.send(JSON.stringify({ jsonrpc: '2.0', id: messageId, error: { code: -32601, message: 'Method not found' } }));
        }
      } catch (error) {
        console.error('Error processing oRPC message:', error);
        const errorResponse = { 
          jsonrpc: '2.0', 
          id: messageId, // Use captured ID, or null if parsing failed before ID was captured
          error: { message: error instanceof Error ? error.message : 'Internal server error' }
        };
        ws.send(JSON.stringify(errorResponse));
      }
    };
    ws.on('close', () => console.log('Client disconnected from ws'));
    ws.on('error', (error) => console.error('WebSocket (ws) error:', error));
  });
  console.log(`Development WebSocket server (ws) is listening on ws://<host>:<port>/api/chat_orpc`);
}