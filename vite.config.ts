import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Check if running in Tauri development mode
const isTauriDev = process.env.TAURI_ENV_PLATFORM !== undefined;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	// Vite options tailored for Tauri development
	// https://v2.tauri.app/start/frontend/sveltekit/
	clearScreen: false,
	server: {
		// Tauri requires a consistent port
		port: 5173,
		strictPort: true,
		// Allow Tauri to access the dev server
		host: isTauriDev ? '0.0.0.0' : 'localhost',
		// Watch for changes in src-tauri as well
		watch: {
			ignored: ['**/src-tauri/**']
		}
	},
	// Environment variables starting with TAURI_ are available in the frontend
	envPrefix: ['VITE_', 'TAURI_ENV_']
});
