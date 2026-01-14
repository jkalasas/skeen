import { test, expect } from '@playwright/test';

async function waitForAuthState(page: import('@playwright/test').Page) {
	await page.waitForLoadState('domcontentloaded');
}

test.describe('Home Page (Unauthenticated)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/skeen');
		await waitForAuthState(page);
	});

	test('displays the Skeen branding in navigation', async ({ page }) => {
		await expect(page.getByText('keen')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('nav').first()).toBeVisible();
	});

	test('shows authentication required message', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
		await expect(page.getByText(/please sign in to access this feature/i)).toBeVisible();
	});

	test('displays sign in with Google button', async ({ page }) => {
		await expect(page.getByText(/sign in with google/i).first()).toBeVisible();
	});
});

test.describe('Navigation', () => {
	test('can navigate to products page', async ({ page }) => {
		await page.goto('/skeen/products');
		await waitForAuthState(page);
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
	});

	test('can navigate to history page', async ({ page }) => {
		await page.goto('/skeen/history');
		await waitForAuthState(page);
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
	});

	test('can navigate to profile page', async ({ page }) => {
		await page.goto('/skeen/profile');
		await waitForAuthState(page);
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
	});

	test('can navigate to comparison page', async ({ page }) => {
		await page.goto('/skeen/comparison');
		await waitForAuthState(page);
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
	});

	test('can navigate to companion page', async ({ page }) => {
		await page.goto('/skeen/companion');
		await waitForAuthState(page);
		await expect(page.getByRole('heading', { name: /authentication required/i })).toBeVisible();
	});
});
