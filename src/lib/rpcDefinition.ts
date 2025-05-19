// src/lib/rpcDefinition.ts
// This file now only defines the interfaces for type safety.
// The oRPC client instance will be created directly in the component that uses it.

export interface ChatMessage { // This represents the structure used in communication and Gemini history
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatProcedures {
  chatStream: (params: { conversationId: string; message: string }) => AsyncGenerator<{ type: 'chunk' | 'error' | 'end'; data: string | ChatMessage[] }>;
  getHistory: (conversationId: string) => Promise<ChatMessage[]>; // Returns an array of Gemini-compatible history messages
}

// No chatOrpc object exported from here anymore.