// src/lib/server/webSocketHandler.ts
import { WebSocketServer, type WebSocket } from 'ws';
import { experimental_RPCHandler as ORPCHandler } from '@orpc/server/ws';
import { os } from '@orpc/server';
import type { ChatMessage } from '../rpcDefinition';
import { GoogleGenAI as genai } from '@google/genai';
import { db } from './db';
import { messagesTable, type InsertMessage } from './db/schema';
import { eq, asc } from 'drizzle-orm';
// import http from 'http'; // Import http module - Removed as it's no longer used

export function initWebSocketServer() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set – aborting WebSocket server bootstrap.');
    throw new Error('GEMINI_API_KEY env-var is required');
   }

  const ai = new genai({ apiKey: GEMINI_API_KEY });

  // List available models for debugging
  (async () => {
    try {
      const models = await ai.models.list();
      console.log('Available Gemini Models:', models);
    } catch (error) {
      console.error('Error listing Gemini models:', error);
    }
  })();

  async function getChatHistoryFromDB(conversationId: string): Promise<ChatMessage[]> {
    try {
      console.log(`[ConvID: ${conversationId}] Attempting to fetch history from DB.`); // Added logging
      const dbMessages = await db.select({
        role: messagesTable.role,
        content: messagesTable.content
      })
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conversationId))
        .orderBy(asc(messagesTable.createdAt));

      console.log(`[ConvID: ${conversationId}] Successfully fetched history from DB. Count: ${dbMessages.length}`); // Added logging
      return dbMessages.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      }));
    } catch (error) {
      console.error(`[ConvID: ${conversationId}] Error fetching history from DB with Drizzle:`, error); // Modified logging
      if (error instanceof Error) {
        console.error(`[ConvID: ${conversationId}] DB History Error Details:`, error.message, error.stack); // Added detailed logging
      }
      return [];
    }
  }

  async function saveMessageToDB(conversationId: string, role: 'user' | 'model', text: string) {
    try {
      console.log(`[ConvID: ${conversationId}] Attempting to save ${role} message to DB.`); // Added logging
      const newMessage: InsertMessage = {
        conversationId,
        role,
        content: text,
      };
      const result = await db.insert(messagesTable).values(newMessage); // Capture result
      console.log(`[ConvID: ${conversationId}] Successfully saved ${role} message to DB. Result:`, result); // Modified logging
    } catch (error) {
      console.error(`[ConvID: ${conversationId}] Error saving message to DB with Drizzle:`, error); // Modified logging
      if (error instanceof Error) {
        console.error(`[ConvID: ${conversationId}] DB Save Error Details:`, error.message, error.stack); // Added detailed logging
      }
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
            model: 'gemini-2.5-flash-preview-05-20',
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

  const WS_PORT = 5174; // Define a separate port for the WebSocket server

  // Create a separate HTTP server for the WebSocket server
  // const wsServer = http.createServer(); // Removed

  const wss = new WebSocketServer({ port: WS_PORT, path: '/api/chat_orpc' }); // Added port, removed server

  const orpcHandler = new ORPCHandler(routerProcedures);

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket server: Client connected.'); // Added logging
    console.log('WebSocket server: Attempting ORPC upgrade.'); // Added logging

    orpcHandler.upgrade(ws, {
      context: {}, // Provide your context if any
    });

    console.log('WebSocket server: ORPC upgrade attempted.'); // Added logging

    ws.on('close', (code, reason) => { // Added code and reason to close handler
      console.log(`WebSocket server: Client underlying ws connection closed. Code: ${code}, Reason: ${reason.toString()}`); // Added logging
    });
    ws.on('error', (error) => { // Modified error handler
      console.error('WebSocket server: Underlying ws connection error:', error); // Added logging
    });
  });

  // wsServer.listen(WS_PORT, () => { // Removed
  //   console.log(`WebSocket server is listening on ws://localhost:${WS_PORT}/api/chat_orpc`);
  // });

  wss.on('listening', () => { // Added listening event for wss
    console.log(`WebSocket server (wss) is listening on ws://localhost:${WS_PORT}/api/chat_orpc`);
  });

  // Export the WebSocket server instance if needed elsewhere, though not strictly necessary for this setup
  // export { wss };

  // The createWebSocketServer function is no longer needed as the server is created and started directly
  // export function createWebSocketServer(httpServer: HttpServer | HttpsServer) {
  //   const wss = new WebSocketServer({ server: httpServer, path: '/api/chat_orpc' });

  //   const orpcHandler = new ORPCHandler(routerProcedures);

  //   wss.on('connection', (ws: WebSocket) => {
  //     console.log('Client connected to WebSocket via ws, upgrading with ORPC handler.');

  //     orpcHandler.upgrade(ws, {
  //       context: {}, // Provide your context if any
  //     });

  //     ws.on('close', () => console.log('Client underlying ws connection closed.'));
  //     ws.on('error', (error) => console.error('Underlying ws connection error:', error));
  //   });
  //   console.log(`Development WebSocket server (ws) is listening on ws://<host>:<port>/api/chat_orpc`);
  // }
}