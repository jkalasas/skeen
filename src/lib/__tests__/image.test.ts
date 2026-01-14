import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imageFileToBase64 } from '../image';

describe('imageFileToBase64', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('converts a file to base64 string', async () => {
		const mockBase64 = 'SGVsbG8gV29ybGQ=';
		const mockDataUrl = `data:image/jpeg;base64,${mockBase64}`;

		const mockFileReader = {
			readAsDataURL: vi.fn(function (this: { onload: () => void }) {
				setTimeout(() => this.onload(), 0);
			}),
			result: mockDataUrl,
			onload: null as (() => void) | null,
			onerror: null as ((error: unknown) => void) | null
		};

		vi.spyOn(globalThis, 'FileReader').mockImplementation(
			() => mockFileReader as unknown as FileReader
		);

		const mockFile = new File(['Hello World'], 'test.jpg', { type: 'image/jpeg' });
		const result = await imageFileToBase64(mockFile);

		expect(result).toBe(mockBase64);
		expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
	});

	it('rejects on FileReader error', async () => {
		const mockError = new Error('Read failed');

		const mockFileReader = {
			readAsDataURL: vi.fn(function (this: { onerror: (e: Error) => void }) {
				setTimeout(() => this.onerror(mockError), 0);
			}),
			result: null,
			onload: null as (() => void) | null,
			onerror: null as ((error: unknown) => void) | null
		};

		vi.spyOn(globalThis, 'FileReader').mockImplementation(
			() => mockFileReader as unknown as FileReader
		);

		const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

		await expect(imageFileToBase64(mockFile)).rejects.toThrow();
	});

	it('rejects if result is not a string', async () => {
		const mockFileReader = {
			readAsDataURL: vi.fn(function (this: { onload: () => void }) {
				setTimeout(() => this.onload(), 0);
			}),
			result: new ArrayBuffer(0),
			onload: null as (() => void) | null,
			onerror: null as ((error: unknown) => void) | null
		};

		vi.spyOn(globalThis, 'FileReader').mockImplementation(
			() => mockFileReader as unknown as FileReader
		);

		const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

		await expect(imageFileToBase64(mockFile)).rejects.toThrow('Failed to read file as string');
	});

	it('extracts base64 part from data URL correctly', async () => {
		const testCases = [
			{
				mimeType: 'image/png',
				base64:
					'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
			},
			{ mimeType: 'image/gif', base64: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }
		];

		for (const { mimeType, base64 } of testCases) {
			const mockDataUrl = `data:${mimeType};base64,${base64}`;

			const mockFileReader = {
				readAsDataURL: vi.fn(function (this: { onload: () => void }) {
					setTimeout(() => this.onload(), 0);
				}),
				result: mockDataUrl,
				onload: null as (() => void) | null,
				onerror: null as ((error: unknown) => void) | null
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(
				() => mockFileReader as unknown as FileReader
			);

			const mockFile = new File([''], `test.${mimeType.split('/')[1]}`, { type: mimeType });
			const result = await imageFileToBase64(mockFile);

			expect(result).toBe(base64);
		}
	});
});
