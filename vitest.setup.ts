import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { vi, afterEach } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock crypto.randomUUID if not available
if (!globalThis.crypto?.randomUUID) {
	Object.defineProperty(globalThis, 'crypto', {
		value: {
			...globalThis.crypto,
			randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 11)
		}
	});
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Global cleanup after each test
afterEach(() => {
	vi.clearAllMocks();
});
