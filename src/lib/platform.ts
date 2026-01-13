/**
 * Platform detection utilities for Tauri/Web hybrid app
 *
 * These utilities help determine the runtime environment and provide
 * platform-specific functionality.
 */

import { browser } from '$app/environment';

/**
 * Check if the app is running inside Tauri (desktop app)
 * This checks for the presence of the Tauri IPC bridge
 */
export function isTauri(): boolean {
	if (!browser) return false;

	// Check for Tauri's window.__TAURI__ object
	return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Check if the app is running in a web browser (not Tauri)
 */
export function isWeb(): boolean {
	return browser && !isTauri();
}

/**
 * Get the current platform type
 */
export function getPlatform(): 'tauri' | 'web' | 'server' {
	if (!browser) return 'server';
	return isTauri() ? 'tauri' : 'web';
}

/**
 * Platform information object for reactive use
 */
export const platform = {
	get isTauri() {
		return isTauri();
	},
	get isWeb() {
		return isWeb();
	},
	get type() {
		return getPlatform();
	}
};

/**
 * Open a URL in the appropriate way based on platform
 * - In Tauri: Uses the opener plugin to open in system browser
 * - In Web: Uses window.open()
 */
export async function openUrl(url: string): Promise<void> {
	if (isTauri()) {
		// Dynamically import Tauri's opener plugin
		const { openUrl: tauriOpenUrl } = await import('@tauri-apps/plugin-opener');
		await tauriOpenUrl(url);
	} else if (browser) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
}
