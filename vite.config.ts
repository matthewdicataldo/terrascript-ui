import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';
import { createWebSocketServer } from './src/lib/server/webSocketHandler'; // Restore import

// Vite plugin for WebSocket server setup
const webSocketPlugin: PluginOption = {
	name: 'webSocketServer',
	configureServer(server) {
		if (server.httpServer) {
			createWebSocketServer(server.httpServer as any); // Cast to any to bypass strict type check
		} else {
			console.warn('HTTP server not available at configureServer hook. WebSocket server for dev might not start.');
		}
	}
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), webSocketPlugin] // Restore webSocketPlugin
});
