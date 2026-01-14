import type { Page } from '@playwright/test';

export async function mockAuthenticatedUser(page: Page) {
	await page.addInitScript(() => {
		const mockUser = {
			uid: 'test-user-123',
			email: 'test@example.com',
			displayName: 'Test User',
			emailVerified: true,
			photoURL: null
		};

		(window as unknown as Record<string, unknown>).__MOCK_AUTH_USER__ = mockUser;

		localStorage.setItem('firebase:authUser:test-api-key:[DEFAULT]', JSON.stringify(mockUser));
	});
}

export async function clearAuthState(page: Page) {
	await page.addInitScript(() => {
		(window as unknown as Record<string, unknown>).__MOCK_AUTH_USER__ = null;
		localStorage.removeItem('firebase:authUser:test-api-key:[DEFAULT]');
	});
}

export async function waitForAuthInitialized(page: Page) {
	await page.waitForFunction(
		() => {
			const loadingIndicators = document.querySelectorAll('[data-loading="auth"]');
			return loadingIndicators.length === 0;
		},
		{ timeout: 10000 }
	);
}
