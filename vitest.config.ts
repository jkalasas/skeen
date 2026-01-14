import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/unit/**/*.{test,spec}.{js,ts}'],
		exclude: ['node_modules', 'tests/e2e/**'],
		setupFiles: ['./vitest.setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
			include: ['src/lib/**/*.ts'],
			exclude: [
				'src/lib/components/**',
				'src/lib/stores/**',
				'src/lib/db/firestore-*.ts',
				'src/lib/firebase.ts',
				'src/lib/ai/firebase.ts',
				'**/*.d.ts',
				'**/__tests__/**',
				'**/index.ts'
			],
			thresholds: {
				global: {
					statements: 80,
					branches: 80,
					functions: 60,
					lines: 80
				}
			}
		},
		alias: {
			$lib: resolve('./src/lib'),
			'$app/environment': resolve('./tests/mocks/app-environment.ts'),
			'$app/navigation': resolve('./tests/mocks/app-navigation.ts'),
			'$app/paths': resolve('./tests/mocks/app-paths.ts'),
			'$env/static/public': resolve('./tests/mocks/env-public.ts')
		}
	}
});
