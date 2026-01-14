import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
	it('merges class names', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('handles conditional classes', () => {
		const shouldInclude = false;
		const shouldIncludeTrue = true;
		expect(cn('foo', shouldInclude && 'bar', 'baz')).toBe('foo baz');
		expect(cn('foo', shouldIncludeTrue && 'bar', 'baz')).toBe('foo bar baz');
	});

	it('merges Tailwind classes correctly (last wins)', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
		expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
	});

	it('handles arrays', () => {
		expect(cn(['foo', 'bar'])).toBe('foo bar');
		expect(cn(['foo'], ['bar', 'baz'])).toBe('foo bar baz');
	});

	it('handles objects', () => {
		expect(cn({ foo: true, bar: false })).toBe('foo');
		expect(cn({ foo: true, bar: true })).toBe('foo bar');
	});

	it('handles undefined and null', () => {
		expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
	});

	it('handles empty strings', () => {
		expect(cn('foo', '', 'bar')).toBe('foo bar');
	});

	it('handles mixed inputs', () => {
		expect(cn('foo', ['bar', 'baz'], { qux: true, quux: false })).toBe('foo bar baz qux');
	});

	it('returns empty string when no valid classes', () => {
		expect(cn()).toBe('');
		expect(cn(undefined, null, false)).toBe('');
	});

	it('handles Tailwind merge conflicts correctly', () => {
		expect(cn('p-4 px-2')).toBe('p-4 px-2');
		expect(cn('p-4', 'p-2')).toBe('p-2');
		expect(cn('bg-red-500 hover:bg-red-600', 'bg-blue-500')).toBe('hover:bg-red-600 bg-blue-500');
	});
});
