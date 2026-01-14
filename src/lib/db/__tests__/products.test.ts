import { describe, it, expect, beforeEach } from 'vitest';
import { productsDB } from '../products';

describe('ProductsDB', () => {
	beforeEach(async () => {
		await productsDB.clearAll();
	});

	describe('addProduct', () => {
		it('adds a product and returns its ID', async () => {
			const product = {
				name: 'Test Product',
				description: 'A test product',
				ingredients: ['Water', 'Glycerin'],
				timestamp: Date.now()
			};

			const id = await productsDB.addProduct(product);

			expect(id).toBeTypeOf('number');
			expect(id).toBeGreaterThan(0);
		});

		it('stores the product with all fields', async () => {
			const product = {
				name: 'Test Product',
				description: 'A test product',
				ingredients: ['Water', 'Glycerin'],
				timestamp: Date.now()
			};

			const id = await productsDB.addProduct(product);
			const retrieved = await productsDB.getById(id);

			expect(retrieved).toMatchObject(product);
			expect(retrieved?.id).toBe(id);
		});

		it('handles products without optional fields', async () => {
			const product = {
				name: 'Minimal Product',
				timestamp: Date.now()
			};

			const id = await productsDB.addProduct(product);
			const retrieved = await productsDB.getById(id);

			expect(retrieved?.name).toBe('Minimal Product');
			expect(retrieved?.description).toBeUndefined();
			expect(retrieved?.ingredients).toBeUndefined();
		});
	});

	describe('getAll', () => {
		it('returns empty array when no products exist', async () => {
			const products = await productsDB.getAll();
			expect(products).toEqual([]);
		});

		it('returns all products in reverse chronological order', async () => {
			const product1 = { name: 'Product 1', timestamp: 1000 };
			const product2 = { name: 'Product 2', timestamp: 2000 };
			const product3 = { name: 'Product 3', timestamp: 3000 };

			await productsDB.addProduct(product1);
			await productsDB.addProduct(product2);
			await productsDB.addProduct(product3);

			const products = await productsDB.getAll();

			expect(products).toHaveLength(3);
			expect(products[0].name).toBe('Product 3');
			expect(products[1].name).toBe('Product 2');
			expect(products[2].name).toBe('Product 1');
		});
	});

	describe('getById', () => {
		it('returns the product when it exists', async () => {
			const id = await productsDB.addProduct({
				name: 'Find Me',
				timestamp: Date.now()
			});

			const product = await productsDB.getById(id);

			expect(product).toBeDefined();
			expect(product?.name).toBe('Find Me');
		});

		it('returns undefined when product does not exist', async () => {
			const product = await productsDB.getById(99999);
			expect(product).toBeUndefined();
		});
	});

	describe('search', () => {
		beforeEach(async () => {
			await productsDB.addProduct({
				name: 'CeraVe Moisturizer',
				description: 'Hydrating cream',
				ingredients: ['Hyaluronic Acid', 'Ceramides'],
				timestamp: Date.now()
			});
			await productsDB.addProduct({
				name: 'Neutrogena Sunscreen',
				description: 'SPF 50 protection',
				ingredients: ['Zinc Oxide'],
				timestamp: Date.now()
			});
		});

		it('finds products by name (case-insensitive)', async () => {
			const results = await productsDB.search('cerave');
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('CeraVe Moisturizer');
		});

		it('finds products by description', async () => {
			const results = await productsDB.search('spf');
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('Neutrogena Sunscreen');
		});

		it('finds products by ingredient', async () => {
			const results = await productsDB.search('hyaluronic');
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('CeraVe Moisturizer');
		});

		it('returns empty array for no matches', async () => {
			const results = await productsDB.search('nonexistent');
			expect(results).toEqual([]);
		});

		it('finds multiple matching products', async () => {
			await productsDB.addProduct({
				name: 'Another Moisturizer',
				description: 'Also moisturizing',
				timestamp: Date.now()
			});

			const results = await productsDB.search('moistur');
			expect(results).toHaveLength(2);
		});
	});

	describe('updateProduct', () => {
		it('updates an existing product', async () => {
			const id = await productsDB.addProduct({
				name: 'Original Name',
				timestamp: Date.now()
			});

			const product = await productsDB.getById(id);
			await productsDB.updateProduct({
				...product!,
				name: 'Updated Name'
			});

			const updated = await productsDB.getById(id);
			expect(updated?.name).toBe('Updated Name');
		});

		it('preserves other fields when updating', async () => {
			const id = await productsDB.addProduct({
				name: 'Original',
				description: 'Keep this',
				ingredients: ['Water'],
				timestamp: 1000
			});

			const product = await productsDB.getById(id);
			await productsDB.updateProduct({
				...product!,
				name: 'Updated'
			});

			const updated = await productsDB.getById(id);
			expect(updated?.name).toBe('Updated');
			expect(updated?.description).toBe('Keep this');
			expect(updated?.ingredients).toEqual(['Water']);
			expect(updated?.timestamp).toBe(1000);
		});
	});

	describe('deleteProduct', () => {
		it('deletes a product', async () => {
			const id = await productsDB.addProduct({
				name: 'To Delete',
				timestamp: Date.now()
			});

			await productsDB.deleteProduct(id);
			const result = await productsDB.getById(id);

			expect(result).toBeUndefined();
		});

		it('does not affect other products when deleting', async () => {
			const id1 = await productsDB.addProduct({ name: 'Keep', timestamp: 1000 });
			const id2 = await productsDB.addProduct({ name: 'Delete', timestamp: 2000 });

			await productsDB.deleteProduct(id2);

			const kept = await productsDB.getById(id1);
			const deleted = await productsDB.getById(id2);

			expect(kept).toBeDefined();
			expect(deleted).toBeUndefined();
		});
	});

	describe('getCount', () => {
		it('returns 0 when no products exist', async () => {
			const count = await productsDB.getCount();
			expect(count).toBe(0);
		});

		it('returns the correct count', async () => {
			await productsDB.addProduct({ name: 'Product 1', timestamp: Date.now() });
			await productsDB.addProduct({ name: 'Product 2', timestamp: Date.now() });

			const count = await productsDB.getCount();
			expect(count).toBe(2);
		});
	});

	describe('clearAll', () => {
		it('removes all products', async () => {
			await productsDB.addProduct({ name: 'Product 1', timestamp: Date.now() });
			await productsDB.addProduct({ name: 'Product 2', timestamp: Date.now() });

			await productsDB.clearAll();

			const count = await productsDB.getCount();
			expect(count).toBe(0);
		});
	});

	describe('updateLastUsed', () => {
		it('sets the lastUsed timestamp', async () => {
			const id = await productsDB.addProduct({
				name: 'Product',
				timestamp: Date.now()
			});

			const before = await productsDB.getById(id);
			expect(before?.lastUsed).toBeUndefined();

			await productsDB.updateLastUsed(id);

			const after = await productsDB.getById(id);
			expect(after?.lastUsed).toBeTypeOf('number');
			expect(after?.lastUsed).toBeGreaterThan(0);
		});

		it('updates the lastUsed timestamp on subsequent calls', async () => {
			const id = await productsDB.addProduct({
				name: 'Product',
				timestamp: Date.now()
			});

			await productsDB.updateLastUsed(id);
			const first = await productsDB.getById(id);

			await new Promise((resolve) => setTimeout(resolve, 10));

			await productsDB.updateLastUsed(id);
			const second = await productsDB.getById(id);

			expect(second?.lastUsed).toBeGreaterThanOrEqual(first?.lastUsed ?? 0);
		});
	});
});
