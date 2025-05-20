import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite'; // Removed type PluginOption

// Removed import of createWebSocketServer and Server
// Removed webSocketPlugin definition

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()], // Removed webSocketPlugin
	server: {
		hmr: {
			port: 0 // Let the system choose a free port for HMR
		}
	},
	ssr: {
		// noExternal: ['@orpc/client'] // Comment out to make it external for SSR
	},
	build: {
		rollupOptions: {
			// external: ['@orpc/client'] // Comment out for now
		}
	}
});
