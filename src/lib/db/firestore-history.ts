import { getFirestoreInstance } from '$lib/firebase';
import {
	collection,
	addDoc,
	getDocs,
	getDoc,
	doc,
	deleteDoc,
	query,
	orderBy,
	where,
	Timestamp
} from 'firebase/firestore';
import type { Product, ProductAssessment } from '$lib/ai/base';
import { authStore } from '$lib/stores/auth.svelte';

export interface HistoryEntry {
	id?: string;
	product: Product;
	assessment: ProductAssessment;
	timestamp: number;
	userId: string;
}

class FirestoreHistoryDB {
	private getCollectionRef() {
		const db = getFirestoreInstance();
		return collection(db, 'assessmentHistory');
	}

	private getCurrentUserId(): string {
		const user = authStore.currentUser;
		if (!user) {
			throw new Error('User must be authenticated to access history');
		}
		return user.uid;
	}

	async addEntry(entry: Omit<HistoryEntry, 'id' | 'userId'>): Promise<string> {
		const userId = this.getCurrentUserId();
		const docRef = await addDoc(this.getCollectionRef(), {
			...entry,
			userId,
			createdAt: Timestamp.now()
		});
		return docRef.id;
	}

	async getAll(): Promise<HistoryEntry[]> {
		const userId = this.getCurrentUserId();
		const q = query(
			this.getCollectionRef(),
			where('userId', '==', userId),
			orderBy('timestamp', 'desc')
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as HistoryEntry[];
	}

	async getById(id: string): Promise<HistoryEntry | undefined> {
		const docRef = doc(this.getCollectionRef(), id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				...docSnap.data()
			} as HistoryEntry;
		}

		return undefined;
	}

	async deleteEntry(id: string): Promise<void> {
		const docRef = doc(this.getCollectionRef(), id);
		await deleteDoc(docRef);
	}

	async search(searchQuery: string): Promise<HistoryEntry[]> {
		const allEntries = await this.getAll();
		const lowerQuery = searchQuery.toLowerCase();

		return allEntries.filter((entry) => {
			const nameMatch = entry.product.name?.toLowerCase().includes(lowerQuery);
			const descMatch = entry.product.description?.toLowerCase().includes(lowerQuery);
			const ingredientsMatch = entry.product.ingredients?.some((ing) =>
				ing.toLowerCase().includes(lowerQuery)
			);

			return nameMatch || descMatch || ingredientsMatch;
		});
	}

	async clearAll(): Promise<void> {
		const entries = await this.getAll();
		const deletePromises = entries.map((entry) => this.deleteEntry(entry.id!));
		await Promise.all(deletePromises);
	}

	async getCount(): Promise<number> {
		const entries = await this.getAll();
		return entries.length;
	}
}

export const firestoreHistoryDB = new FirestoreHistoryDB();
