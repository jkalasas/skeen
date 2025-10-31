import { productsDB, type StoredProduct } from '$lib/db/products';
import type { Product } from '$lib/ai/base';

class ProductsStore {
	private products = $state<StoredProduct[]>([]);
	private _loading = $state(false);
	private _error = $state<string | null>(null);

	get items() {
		return this.products;
	}

	get loading() {
		return this._loading;
	}

	get error() {
		return this._error;
	}

	async load() {
		this._loading = true;
		this._error = null;

		try {
			this.products = await productsDB.getAll();
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to load products';
			console.error('Failed to load products:', err);
		} finally {
			this._loading = false;
		}
	}

	async add(product: Product): Promise<number> {
		this._error = null;

		try {
			// Sanitize product data for IndexedDB storage
			// Create a clean object with only serializable values
			const sanitizedProduct: Omit<StoredProduct, 'id'> = {
				name: String(product.name),
				timestamp: Date.now(),
				lastUsed: Date.now()
			};

			// Only add description if it's a non-empty string
			if (product.description && typeof product.description === 'string') {
				sanitizedProduct.description = product.description;
			}

			// Only add ingredients if it's a non-empty array of strings
			if (
				product.ingredients &&
				Array.isArray(product.ingredients) &&
				product.ingredients.length > 0
			) {
				// Filter out any non-string values and create a new array
				const validIngredients = product.ingredients
					.filter((ing) => typeof ing === 'string' && ing.trim().length > 0)
					.map((ing) => String(ing));

				if (validIngredients.length > 0) {
					sanitizedProduct.ingredients = validIngredients;
				}
			}

			const id = await productsDB.addProduct(sanitizedProduct);

			// Add to the beginning of the array (most recent first)
			this.products = [{ ...sanitizedProduct, id }, ...this.products];

			return id;
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to save product';
			console.error('Failed to save product:', err);
			throw err;
		}
	}

	async update(product: StoredProduct): Promise<void> {
		this._error = null;

		try {
			// Sanitize product data for IndexedDB storage
			const sanitizedProduct: StoredProduct = {
				id: product.id,
				name: String(product.name),
				timestamp: product.timestamp,
				lastUsed: Date.now()
			};

			// Only add description if it's a non-empty string
			if (product.description && typeof product.description === 'string') {
				sanitizedProduct.description = product.description;
			}

			// Only add ingredients if it's a non-empty array of strings
			if (
				product.ingredients &&
				Array.isArray(product.ingredients) &&
				product.ingredients.length > 0
			) {
				// Filter out any non-string values and create a new array
				const validIngredients = product.ingredients
					.filter((ing) => typeof ing === 'string' && ing.trim().length > 0)
					.map((ing) => String(ing));

				if (validIngredients.length > 0) {
					sanitizedProduct.ingredients = validIngredients;
				}
			}

			await productsDB.updateProduct(sanitizedProduct);

			// Update in the array
			const index = this.products.findIndex((p) => p.id === product.id);
			if (index !== -1) {
				this.products[index] = sanitizedProduct;
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to update product';
			console.error('Failed to update product:', err);
			throw err;
		}
	}

	async delete(id: number) {
		this._error = null;

		try {
			await productsDB.deleteProduct(id);
			this.products = this.products.filter((product) => product.id !== id);
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to delete product';
			console.error('Failed to delete product:', err);
			throw err;
		}
	}

	async search(query: string): Promise<StoredProduct[]> {
		this._loading = true;
		this._error = null;

		try {
			if (!query.trim()) {
				await this.load();
				return this.products;
			} else {
				const results = await productsDB.search(query);
				this.products = results;
				return results;
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to search products';
			console.error('Failed to search products:', err);
			return [];
		} finally {
			this._loading = false;
		}
	}

	async updateLastUsed(id: number): Promise<void> {
		try {
			await productsDB.updateLastUsed(id);
			const product = this.products.find((p) => p.id === id);
			if (product) {
				product.lastUsed = Date.now();
			}
		} catch (err) {
			console.error('Failed to update last used:', err);
		}
	}

	async clear() {
		this._error = null;

		try {
			await productsDB.clearAll();
			this.products = [];
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to clear products';
			console.error('Failed to clear products:', err);
			throw err;
		}
	}

	// Helper to check if a product with the same name already exists
	findByName(name: string): StoredProduct | undefined {
		const lowerName = name.toLowerCase();
		return this.products.find((p) => p.name.toLowerCase() === lowerName);
	}
}

export const productsStore = new ProductsStore();
