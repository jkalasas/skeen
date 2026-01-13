import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Check if we're building for Tauri (desktop app) vs web
const isTauriBuild = process.env.TAURI_ENV_PLATFORM !== undefined;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html' // Enable SPA fallback for client-side routing
		}),
		paths: {
			// Use empty base path for Tauri, /skeen for web deployment
			base: isTauriBuild ? '' : process.env.NODE_ENV === 'production' ? '/skeen' : ''
		},
		output: {
			bundleStrategy: 'single'
		}
	}
};

export default config;
