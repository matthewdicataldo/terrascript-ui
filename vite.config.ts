import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';
import { createWebSocketServer } from './src/lib/server/webSocketHandler'; // Restore import
import type { Server } from 'http';

// Vite plugin for WebSocket server setup
const webSocketPlugin: PluginOption = {
	name: 'webSocketServer',
	configureServer(server) {
		if (server.httpServer) {
			createWebSocketServer(server.httpServer as Server); // Cast to Server
		} else {
			console.warn('HTTP server not available at configureServer hook. WebSocket server for dev might not start.');
		}
	}
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), webSocketPlugin], // Restore webSocketPlugin
	ssr: {
		// noExternal: ['@orpc/client'] // Comment out to make it external for SSR
	},
	build: {
		rollupOptions: {
			// external: ['@orpc/client'] // Comment out for now
		}
	}
});
