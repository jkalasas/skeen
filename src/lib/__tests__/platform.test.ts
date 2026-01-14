import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTauriMocks } from '../../../tests/mocks/tauri';

describe('platform utilities', () => {
	beforeEach(() => {
		vi.resetModules();
		setupTauriMocks(false);
	});

	afterEach(() => {
		setupTauriMocks(false);
	});

	describe('isTauri', () => {
		it('returns false when not in Tauri environment', async () => {
			setupTauriMocks(false);
			const { isTauri } = await import('../platform');
			expect(isTauri()).toBe(false);
		});

		it('returns true when __TAURI__ is present', async () => {
			setupTauriMocks(true);
			const { isTauri } = await import('../platform');
			expect(isTauri()).toBe(true);
		});
	});

	describe('isWeb', () => {
		it('returns true when in web browser', async () => {
			setupTauriMocks(false);
			const { isWeb } = await import('../platform');
			expect(isWeb()).toBe(true);
		});

		it('returns false when in Tauri', async () => {
			setupTauriMocks(true);
			const { isWeb } = await import('../platform');
			expect(isWeb()).toBe(false);
		});
	});

	describe('getPlatform', () => {
		it('returns "web" for browser environment', async () => {
			setupTauriMocks(false);
			const { getPlatform } = await import('../platform');
			expect(getPlatform()).toBe('web');
		});

		it('returns "tauri" for Tauri environment', async () => {
			setupTauriMocks(true);
			const { getPlatform } = await import('../platform');
			expect(getPlatform()).toBe('tauri');
		});
	});

	describe('platform object', () => {
		it('has reactive getters that reflect current state', async () => {
			setupTauriMocks(false);
			const { platform } = await import('../platform');

			expect(platform.isTauri).toBe(false);
			expect(platform.isWeb).toBe(true);
			expect(platform.type).toBe('web');
		});
	});

	describe('openUrl', () => {
		it('uses window.open in web environment', async () => {
			setupTauriMocks(false);
			const { openUrl } = await import('../platform');

			const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

			await openUrl('https://example.com');

			expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');

			mockOpen.mockRestore();
		});
	});
});
