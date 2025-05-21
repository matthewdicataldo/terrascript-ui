// src/lib/server/webSocketHandler.ts
import { Server as SocketIOServer } from 'socket.io';
import type { ChatMessage } from '../chatIntefaces'; // Keep for ChatMessage type
import { GoogleGenAI as genai } from '@google/genai';
import { db } from './db';
import { messagesTable, type InsertMessage } from './db/schema';
import { eq, asc } from 'drizzle-orm';

export function initWebSocketServer() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set – aborting Socket.IO server bootstrap.');
    throw new Error('GEMINI_API_KEY env-var is required');
  }

  const ai = new genai({ apiKey: GEMINI_API_KEY });

  // List available models for debugging (can be kept or removed)
  (async () => {
    try {
      const modelsPager = await ai.models.list(); // This returns a Pager which is an AsyncIterable
      const modelNames: string[] = [];
      for await (const model of modelsPager) { // Iterate directly over the Pager
        if (model && typeof model.name === 'string') {
          modelNames.push(model.name);
        }
      }
      console.log('Available Gemini Models:', modelNames.join(', '));
    } catch (error) {
      console.error('Error listing Gemini models:', error);
    }
  })();

  async function getChatHistoryFromDB(conversationId: string): Promise<ChatMessage[]> {
    try {
      console.log(`[Socket.IO][ConvID: ${conversationId}] Attempting to fetch history from DB.`);
      const dbMessages = await db.select({
        role: messagesTable.role,
        content: messagesTable.content
      })
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conversationId))
        .orderBy(asc(messagesTable.createdAt));
      console.log(`[Socket.IO][ConvID: ${conversationId}] Successfully fetched history from DB. Count: ${dbMessages.length}`);
      return dbMessages.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      }));
    } catch (error) {
      console.error(`[Socket.IO][ConvID: ${conversationId}] Error fetching history from DB with Drizzle:`, error);
      if (error instanceof Error) {
        console.error(`[Socket.IO][ConvID: ${conversationId}] DB History Error Details:`, error.message, error.stack);
      }
      return [];
    }
  }

  async function saveMessageToDB(conversationId: string, role: 'user' | 'model', text: string) {
    try {
      console.log(`[Socket.IO][ConvID: ${conversationId}] Attempting to save ${role} message to DB.`);
      const newMessage: InsertMessage = {
        conversationId,
        role,
        content: text,
      };
      const result = await db.insert(messagesTable).values(newMessage);
      console.log(`[Socket.IO][ConvID: ${conversationId}] Successfully saved ${role} message to DB. Result:`, result);
    } catch (error) {
      console.error(`[Socket.IO][ConvID: ${conversationId}] Error saving message to DB with Drizzle:`, error);
      if (error instanceof Error) {
        console.error(`[Socket.IO][ConvID: ${conversationId}] DB Save Error Details:`, error.message, error.stack);
      }
    }
  }

  const WS_PORT = 5174; // Define a separate port for the Socket.IO server

  const io = new SocketIOServer(WS_PORT, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('getHistory', async (conversationId: string, callback: (history: ChatMessage[]) => void) => {
      console.log(`[Socket.IO][ConvID: ${conversationId}] Received getHistory event from ${socket.id}`);
      const history = await getChatHistoryFromDB(conversationId);
      if (callback) {
        callback(history);
      }
    });

    socket.on('sendMessage', async (data: { conversationId: string; message: string }) => {
      const { conversationId, message } = data;
      console.log(`[Socket.IO][ConvID: ${conversationId}] Received sendMessage event from ${socket.id} with message: ${message.substring(0, 50)}...`);

      let accumulatedModelResponse = ""; // Declare here, outside the try block
      try {
        await saveMessageToDB(conversationId, 'user', message);
        // Optionally emit user message back to all clients in the room/conversation
        // socket.to(conversationId).emit('newUserMessage', { role: 'user', parts: [{ text: message }] });

        const history = await getChatHistoryFromDB(conversationId);
        const chatContents: ChatMessage[] = [
          ...history, // History already includes the user message saved above
        ];

        console.log(`[Socket.IO][ConvID: ${conversationId}] Calling model.generateContentStream. Contents length: ${chatContents.length}`);

        try {
          const result = await ai.models.generateContentStream({
            contents: chatContents,
            model: 'gemini-2.5-flash-preview-05-20',
          });

          for await (const chunk of result) {
            const currentChunkText = chunk.text;
            if (currentChunkText) {
              accumulatedModelResponse += currentChunkText;
              socket.emit('chatChunk', { conversationId, type: 'chunk', data: currentChunkText });
            }
          }

          if (accumulatedModelResponse) {
            await saveMessageToDB(conversationId, 'model', accumulatedModelResponse);
          }
        } catch (error) {
          console.error(`[Socket.IO][ConvID: ${conversationId}] Error during Gemini stream for ${socket.id}:`, error);
          socket.emit('streamError', { conversationId, type: 'error', data: `Stream Error: ${error instanceof Error ? error.message : String(error)}` });
        } finally {
          // Inner finally block, streamEnd emission moved to outer finally
        }

      } catch (error) {
        console.error(`[Socket.IO][ConvID: ${conversationId}] Error in sendMessage handler (before/after stream) for ${socket.id}:`, error);
        // If an error occurs *before* the stream starts (e.g., DB error), emit a general error
        // If an error occurred *during* the stream, streamError was already emitted in the inner catch
        // We still emit streamEnd in the finally block
        // Consider if a separate error type is needed for errors outside the stream
        if (!accumulatedModelResponse) { // Only emit a general error if no chunks were sent
          socket.emit('streamError', { conversationId, type: 'error', data: `General Error: ${error instanceof Error ? error.message : String(error)}` });
        }
      } finally {
        // Always emit streamEnd from the outer finally to ensure it's sent
        // regardless of where an error occurred or if the operation was successful.
        socket.emit('streamEnd', { conversationId, type: 'end', data: 'Operation finished' });
        console.log(`[Socket.IO][ConvID: ${conversationId}] sendMessage handler complete, streamEnd emitted for ${socket.id}.`);
      }
    });

    socket.on('clearRemoteConversation', async (conversationId: string, callback?: (success: boolean, error?: string) => void) => {
      console.log(`[Socket.IO][ConvID: ${conversationId}] Received clearRemoteConversation event from ${socket.id}`);
      try {
        await db.delete(messagesTable).where(eq(messagesTable.conversationId, conversationId));
        console.log(`[Socket.IO][ConvID: ${conversationId}] Successfully cleared remote conversation from DB.`);
        if (callback) callback(true);
      } catch (error) {
        console.error(`[Socket.IO][ConvID: ${conversationId}] Error clearing remote conversation from DB:`, error);
        if (callback) callback(false, error instanceof Error ? error.message : String(error));
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  console.log(`Socket.IO server is listening on port ${WS_PORT}`);
}