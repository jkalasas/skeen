import { vi } from 'vitest';

export const mockTauriInvoke = vi.fn();
export const mockTauriListen = vi.fn(() => Promise.resolve(vi.fn()));
export const mockTauriOpenUrl = vi.fn();
export const mockOnOpenUrl = vi.fn();

export function setupTauriMocks(isTauri = false) {
	const win = window as unknown as Record<string, unknown>;
	if (isTauri) {
		win.__TAURI__ = {};
		win.__TAURI_INTERNALS__ = {};
	} else {
		delete win.__TAURI__;
		delete win.__TAURI_INTERNALS__;
	}
}

export function setupTauriModuleMocks() {
	vi.mock('@tauri-apps/api/core', () => ({
		invoke: mockTauriInvoke
	}));

	vi.mock('@tauri-apps/api/event', () => ({
		listen: mockTauriListen
	}));

	vi.mock('@tauri-apps/plugin-opener', () => ({
		openUrl: mockTauriOpenUrl
	}));

	vi.mock('@tauri-apps/plugin-deep-link', () => ({
		onOpenUrl: mockOnOpenUrl
	}));
}

export function resetTauriMocks() {
	setupTauriMocks(false);
	mockTauriInvoke.mockReset();
	mockTauriListen.mockReset();
	mockTauriOpenUrl.mockReset();
	mockOnOpenUrl.mockReset();
}
