import type { Product, ProductAssessment } from '$lib/ai/base';

export interface HistoryEntry {
	id?: number;
	product: Product;
	assessment: ProductAssessment;
	timestamp: number;
	imageData?: string; // Base64 encoded image
}

const DB_NAME = 'skeenDB';
const STORE_NAME = 'assessmentHistory';
const DB_VERSION = 1;

class HistoryDB {
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
				
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const objectStore = db.createObjectStore(STORE_NAME, {
						keyPath: 'id',
						autoIncrement: true
					});
					
					// Create index for timestamp to enable sorting
					objectStore.createIndex('timestamp', 'timestamp', { unique: false });
					
					// Create index for product name to enable searching
					objectStore.createIndex('productName', 'product.name', { unique: false });
				}
			};
		});
	}

	async addEntry(entry: Omit<HistoryEntry, 'id'>): Promise<number> {
		await this.init();
		
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.add(entry);

			request.onsuccess = () => resolve(request.result as number);
			request.onerror = () => reject(request.error);
		});
	}

	async getAll(): Promise<HistoryEntry[]> {
		await this.init();
		
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const index = store.index('timestamp');
			const request = index.openCursor(null, 'prev'); // Get in reverse chronological order

			const entries: HistoryEntry[] = [];

			request.onsuccess = (event) => {
				const cursor = (event.target as IDBRequest).result;
				if (cursor) {
					entries.push(cursor.value);
					cursor.continue();
				} else {
					resolve(entries);
				}
			};

			request.onerror = () => reject(request.error);
		});
	}

	async getById(id: number): Promise<HistoryEntry | undefined> {
		await this.init();
		
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(id);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async deleteEntry(id: number): Promise<void> {
		await this.init();
		
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async search(query: string): Promise<HistoryEntry[]> {
		const allEntries = await this.getAll();
		const lowerQuery = query.toLowerCase();

		return allEntries.filter(entry => {
			const nameMatch = entry.product.name?.toLowerCase().includes(lowerQuery);
			const descMatch = entry.product.description?.toLowerCase().includes(lowerQuery);
			const ingredientsMatch = entry.product.ingredients?.some(
				ing => ing.toLowerCase().includes(lowerQuery)
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
}

export const historyDB = new HistoryDB();
