import { test, expect } from '@playwright/test';

async function waitForAuthState(page: import('@playwright/test').Page) {
	await page.waitForSelector('h2, [data-loading="auth"]', { timeout: 15000 });
	await page.waitForFunction(
		() =>
			!document.querySelector('[data-loading="auth"]') &&
			!document.body.textContent?.includes('Loading...'),
		{ timeout: 15000 }
	);
}

test.describe('Products Page (Unauthenticated)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/skeen/products');
		await waitForAuthState(page);
	});

	test('displays authentication required message', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
	});

	test('shows sign in option', async ({ page }) => {
		await expect(page.getByText(/sign in with google/i).first()).toBeVisible();
	});

	test('has correct URL', async ({ page }) => {
		expect(page.url()).toContain('/products');
	});
});
