import { firestoreHistoryDB, type HistoryEntry } from '$lib/db/firestore-history';
import type { Product, ProductAssessment } from '$lib/ai/base';
import { authStore } from './auth.svelte';

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
			this.entries = await firestoreHistoryDB.getAll();
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to load history';
			console.error('Failed to load history:', err);
		} finally {
			this._loading = false;
		}
	}

	async add(product: Product, assessment: ProductAssessment) {
		this._error = null;

		try {
			const entry: Omit<HistoryEntry, 'id' | 'userId'> = {
				product,
				assessment,
				timestamp: Date.now()
			};

			const id = await firestoreHistoryDB.addEntry(entry);

			// Add to the beginning of the array (most recent first)
			const userId = authStore.currentUser?.uid || '';
			this.entries = [{ ...entry, id, userId }, ...this.entries];
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to save to history';
			console.error('Failed to save history:', err);
			throw err;
		}
	}

	async delete(id: string) {
		this._error = null;

		try {
			await firestoreHistoryDB.deleteEntry(id);
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
				this.entries = await firestoreHistoryDB.search(query);
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
			await firestoreHistoryDB.clearAll();
			this.entries = [];
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to clear history';
			console.error('Failed to clear history:', err);
			throw err;
		}
	}
}

export const historyStore = new HistoryStore();
