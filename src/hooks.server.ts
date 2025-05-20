// src/hooks.server.ts
import { initWebSocketServer } from '$lib/server/webSocketHandler';

initWebSocketServer();

console.log('WebSocket server initialized via hooks.server.ts');