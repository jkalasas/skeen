import { describe, it, expect, beforeEach } from 'vitest';
import { historyDB } from '../history';

describe('HistoryDB', () => {
	beforeEach(async () => {
		await historyDB.clearAll();
	});

	describe('addEntry', () => {
		it('adds a history entry and returns its ID', async () => {
			const entry = {
				product: { name: 'Test Product', ingredients: [] },
				assessment: { pros: ['Good'], cons: ['Bad'], score: 7 },
				timestamp: Date.now()
			};

			const id = await historyDB.addEntry(entry);

			expect(id).toBeTypeOf('number');
			expect(id).toBeGreaterThan(0);
		});

		it('stores the complete entry data', async () => {
			const entry = {
				product: {
					name: 'CeraVe Cream',
					description: 'Moisturizing cream',
					ingredients: ['Ceramides', 'Hyaluronic Acid']
				},
				assessment: {
					pros: ['Hydrating', 'Affordable'],
					cons: ['Thick texture'],
					score: 8.5
				},
				timestamp: 1234567890
			};

			const id = await historyDB.addEntry(entry);
			const retrieved = await historyDB.getById(id);

			expect(retrieved?.product).toEqual(entry.product);
			expect(retrieved?.assessment).toEqual(entry.assessment);
			expect(retrieved?.timestamp).toBe(entry.timestamp);
		});
	});

	describe('getAll', () => {
		it('returns empty array when no entries exist', async () => {
			const entries = await historyDB.getAll();
			expect(entries).toEqual([]);
		});

		it('returns entries in reverse chronological order', async () => {
			await historyDB.addEntry({
				product: { name: 'Product 1' },
				assessment: { pros: [], cons: [], score: 5 },
				timestamp: 1000
			});
			await historyDB.addEntry({
				product: { name: 'Product 2' },
				assessment: { pros: [], cons: [], score: 8 },
				timestamp: 2000
			});
			await historyDB.addEntry({
				product: { name: 'Product 3' },
				assessment: { pros: [], cons: [], score: 6 },
				timestamp: 3000
			});

			const entries = await historyDB.getAll();

			expect(entries).toHaveLength(3);
			expect(entries[0].product.name).toBe('Product 3');
			expect(entries[1].product.name).toBe('Product 2');
			expect(entries[2].product.name).toBe('Product 1');
		});
	});

	describe('getById', () => {
		it('returns the entry when it exists', async () => {
			const id = await historyDB.addEntry({
				product: { name: 'Find Me' },
				assessment: { pros: ['Found'], cons: [], score: 10 },
				timestamp: Date.now()
			});

			const entry = await historyDB.getById(id);

			expect(entry).toBeDefined();
			expect(entry?.product.name).toBe('Find Me');
			expect(entry?.assessment.pros).toContain('Found');
		});

		it('returns undefined when entry does not exist', async () => {
			const entry = await historyDB.getById(99999);
			expect(entry).toBeUndefined();
		});
	});

	describe('search', () => {
		beforeEach(async () => {
			await historyDB.addEntry({
				product: {
					name: 'CeraVe Cream',
					description: 'Daily moisturizer',
					ingredients: ['Ceramides', 'Niacinamide']
				},
				assessment: { pros: ['Gentle'], cons: [], score: 8 },
				timestamp: Date.now()
			});
			await historyDB.addEntry({
				product: {
					name: 'Neutrogena Sunscreen',
					description: 'SPF 50',
					ingredients: ['Zinc Oxide']
				},
				assessment: { pros: ['High protection'], cons: ['White cast'], score: 7 },
				timestamp: Date.now()
			});
		});

		it('finds entries by product name (case-insensitive)', async () => {
			const results = await historyDB.search('cerave');
			expect(results).toHaveLength(1);
			expect(results[0].product.name).toBe('CeraVe Cream');
		});

		it('finds entries by product description', async () => {
			const results = await historyDB.search('spf');
			expect(results).toHaveLength(1);
			expect(results[0].product.name).toBe('Neutrogena Sunscreen');
		});

		it('finds entries by ingredient', async () => {
			const results = await historyDB.search('niacinamide');
			expect(results).toHaveLength(1);
			expect(results[0].product.name).toBe('CeraVe Cream');
		});

		it('returns empty array for no matches', async () => {
			const results = await historyDB.search('nonexistent');
			expect(results).toEqual([]);
		});
	});

	describe('deleteEntry', () => {
		it('deletes an entry', async () => {
			const id = await historyDB.addEntry({
				product: { name: 'To Delete' },
				assessment: { pros: [], cons: [], score: 5 },
				timestamp: Date.now()
			});

			await historyDB.deleteEntry(id);
			const result = await historyDB.getById(id);

			expect(result).toBeUndefined();
		});

		it('does not affect other entries when deleting', async () => {
			const id1 = await historyDB.addEntry({
				product: { name: 'Keep' },
				assessment: { pros: [], cons: [], score: 5 },
				timestamp: 1000
			});
			const id2 = await historyDB.addEntry({
				product: { name: 'Delete' },
				assessment: { pros: [], cons: [], score: 5 },
				timestamp: 2000
			});

			await historyDB.deleteEntry(id2);

			const kept = await historyDB.getById(id1);
			const deleted = await historyDB.getById(id2);

			expect(kept).toBeDefined();
			expect(deleted).toBeUndefined();
		});
	});

	describe('getCount', () => {
		it('returns 0 when no entries exist', async () => {
			const count = await historyDB.getCount();
			expect(count).toBe(0);
		});

		it('returns the correct count', async () => {
			await historyDB.addEntry({
				product: { name: 'Entry 1' },
				assessment: { pros: [], cons: [], score: 5 },
				timestamp: Date.now()
			});
			await historyDB.addEntry({
				product: { name: 'Entry 2' },
				assessment: { pros: [], cons: [], score: 6 },
				timestamp: Date.now()
			});

			const count = await historyDB.getCount();
			expect(count).toBe(2);
		});
	});

	describe('clearAll', () => {
		it('removes all entries', async () => {
			await historyDB.addEntry({
				product: { name: 'Entry 1' },
				assessment: { pros: [], cons: [], score: 5 },
				timestamp: Date.now()
			});
			await historyDB.addEntry({
				product: { name: 'Entry 2' },
				assessment: { pros: [], cons: [], score: 6 },
				timestamp: Date.now()
			});

			await historyDB.clearAll();

			const count = await historyDB.getCount();
			expect(count).toBe(0);
		});
	});
});
