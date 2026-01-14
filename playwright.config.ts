import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html', { outputFolder: 'playwright-report' }],
		['junit', { outputFile: 'test-results/e2e-results.xml' }]
	],
	timeout: 30000,
	use: {
		baseURL: 'http://localhost:4173/skeen',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'bun run build && bun run preview',
		url: 'http://localhost:4173/skeen',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: {
			PUBLIC_FIREBASE_API_KEY: 'test-api-key',
			PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
			PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
			PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
			PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
			PUBLIC_FIREBASE_APP_ID: '1:123456789:web:abc123',
			PUBLIC_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
			PUBLIC_MAX_MULTI_COUNT: '5'
		}
	}
});
