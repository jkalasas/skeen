import { getFirestoreInstance } from '$lib/firebase';
import {
	collection,
	addDoc,
	getDocs,
	getDoc,
	doc,
	deleteDoc,
	updateDoc,
	query,
	orderBy,
	where,
	Timestamp
} from 'firebase/firestore';
import type { Product } from '$lib/ai/base';
import { authStore } from '$lib/stores/auth.svelte';

export interface StoredProduct extends Product {
	id?: string;
	timestamp: number;
	lastUsed?: number;
	userId: string;
}

class FirestoreProductsDB {
	private getCollectionRef() {
		const db = getFirestoreInstance();
		return collection(db, 'products');
	}

	private getCurrentUserId(): string {
		const user = authStore.currentUser;
		if (!user) {
			throw new Error('User must be authenticated to access products');
		}
		return user.uid;
	}

	async addProduct(product: Omit<StoredProduct, 'id' | 'userId'>): Promise<string> {
		const userId = this.getCurrentUserId();
		const docRef = await addDoc(this.getCollectionRef(), {
			...product,
			userId,
			createdAt: Timestamp.now()
		});
		return docRef.id;
	}

	async updateProduct(product: StoredProduct): Promise<void> {
		if (!product.id) {
			throw new Error('Product ID is required for update');
		}

		const docRef = doc(this.getCollectionRef(), product.id);
		const { id: _id, ...updateData } = product;
		await updateDoc(docRef, {
			...updateData,
			updatedAt: Timestamp.now()
		});
	}

	async getAll(): Promise<StoredProduct[]> {
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
		})) as StoredProduct[];
	}

	async getById(id: string): Promise<StoredProduct | undefined> {
		const docRef = doc(this.getCollectionRef(), id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				...docSnap.data()
			} as StoredProduct;
		}

		return undefined;
	}

	async deleteProduct(id: string): Promise<void> {
		const docRef = doc(this.getCollectionRef(), id);
		await deleteDoc(docRef);
	}

	async search(searchQuery: string): Promise<StoredProduct[]> {
		const allProducts = await this.getAll();
		const lowerQuery = searchQuery.toLowerCase();

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
		const products = await this.getAll();
		const deletePromises = products.map((product) => this.deleteProduct(product.id!));
		await Promise.all(deletePromises);
	}

	async getCount(): Promise<number> {
		const products = await this.getAll();
		return products.length;
	}

	async updateLastUsed(id: string): Promise<void> {
		const docRef = doc(this.getCollectionRef(), id);
		await updateDoc(docRef, {
			lastUsed: Date.now(),
			updatedAt: Timestamp.now()
		});
	}
}

export const firestoreProductsDB = new FirestoreProductsDB();
