import { historyDB, type HistoryEntry } from '$lib/db/history';
import type { Product, ProductAssessment } from '$lib/ai/base';

class HistoryStore {
	private entries = $state<HistoryEntry[]>([]);
	private _loading = $state(false);
	private _error = $state<string | null>(null);

	get items() {
		return this.entries;
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
			this.entries = await historyDB.getAll();
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to load history';
			console.error('Failed to load history:', err);
		} finally {
			this._loading = false;
		}
	}

	async add(product: Product, assessment: ProductAssessment, imageData?: string) {
		this._error = null;

		try {
			const entry: Omit<HistoryEntry, 'id'> = {
				product,
				assessment,
				timestamp: Date.now(),
				imageData
			};

			const id = await historyDB.addEntry(entry);

			// Add to the beginning of the array (most recent first)
			this.entries = [{ ...entry, id }, ...this.entries];
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to save to history';
			console.error('Failed to save history:', err);
			throw err;
		}
	}

	async delete(id: number) {
		this._error = null;

		try {
			await historyDB.deleteEntry(id);
			this.entries = this.entries.filter((entry) => entry.id !== id);
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to delete entry';
			console.error('Failed to delete history entry:', err);
			throw err;
		}
	}

	async search(query: string) {
		this._loading = true;
		this._error = null;

		try {
			if (!query.trim()) {
				await this.load();
			} else {
				this.entries = await historyDB.search(query);
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to search history';
			console.error('Failed to search history:', err);
		} finally {
			this._loading = false;
		}
	}

	async clear() {
		this._error = null;

		try {
			await historyDB.clearAll();
			this.entries = [];
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to clear history';
			console.error('Failed to clear history:', err);
			throw err;
		}
	}
}

export const historyStore = new HistoryStore();
