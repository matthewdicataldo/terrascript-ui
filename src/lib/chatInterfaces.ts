export interface ChatMessage { // This represents the structure used in communication and Gemini history
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatProcedures {
  chatStream: (params: { conversationId: string; message: string }) => AsyncGenerator<{ type: 'chunk' | 'error' | 'end'; data: string }>;
  getHistory: (conversationId: string) => Promise<ChatMessage[]>; // Returns an array of Gemini-compatible history messages
}

