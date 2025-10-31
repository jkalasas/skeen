import type { Product } from '$lib/ai/base';

export interface StoredProduct extends Product {
	id?: number;
	timestamp: number;
	lastUsed?: number;
}

const DB_NAME = 'skeenDB';
const STORE_NAME = 'products';
const DB_VERSION = 2; // Increment version to add new object store

class ProductsDB {
	private db: IDBDatabase | null = null;

	async init(): Promise<void> {
		if (this.db) return;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Create products store if it doesn't exist
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const objectStore = db.createObjectStore(STORE_NAME, {
						keyPath: 'id',
						autoIncrement: true
					});

					// Create index for timestamp to enable sorting
					objectStore.createIndex('timestamp', 'timestamp', { unique: false });

					// Create index for product name to enable searching
					objectStore.createIndex('name', 'name', { unique: false });

					// Create index for lastUsed to enable sorting by recent usage
					objectStore.createIndex('lastUsed', 'lastUsed', { unique: false });
				}
			};
		});
	}

	async addProduct(product: Omit<StoredProduct, 'id'>): Promise<number> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.add(product);

			request.onsuccess = () => resolve(request.result as number);
			request.onerror = () => reject(request.error);
		});
	}

	async updateProduct(product: StoredProduct): Promise<void> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(product);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getAll(): Promise<StoredProduct[]> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const index = store.index('timestamp');
			const request = index.openCursor(null, 'prev'); // Get in reverse chronological order

			const products: StoredProduct[] = [];

			request.onsuccess = (event) => {
				const cursor = (event.target as IDBRequest).result;
				if (cursor) {
					products.push(cursor.value);
					cursor.continue();
				} else {
					resolve(products);
				}
			};

			request.onerror = () => reject(request.error);
		});
	}

	async getById(id: number): Promise<StoredProduct | undefined> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(id);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async deleteProduct(id: number): Promise<void> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async search(query: string): Promise<StoredProduct[]> {
		const allProducts = await this.getAll();
		const lowerQuery = query.toLowerCase();

		return allProducts.filter((product) => {
			const nameMatch = product.name?.toLowerCase().includes(lowerQuery);
			const descMatch = product.description?.toLowerCase().includes(lowerQuery);
			const ingredientsMatch = product.ingredients?.some((ing) =>
				ing.toLowerCase().includes(lowerQuery)
			);

			return nameMatch || descMatch || ingredientsMatch;
		});
	}

	async clearAll(): Promise<void> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getCount(): Promise<number> {
		await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.count();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async updateLastUsed(id: number): Promise<void> {
		await this.init();

		const product = await this.getById(id);
		if (product) {
			product.lastUsed = Date.now();
			await this.updateProduct(product);
		}
	}
}

export const productsDB = new ProductsDB();
