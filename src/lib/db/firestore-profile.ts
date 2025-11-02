import { getFirestoreInstance } from '$lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import type { UserProfile } from '$lib/types/profile';
import { authStore } from '$lib/stores/auth.svelte';

class FirestoreProfileDB {
	private getCurrentUserId(): string {
		const user = authStore.currentUser;
		if (!user) {
			throw new Error('User must be authenticated to access profile');
		}
		return user.uid;
	}

	private getDocRef() {
		const db = getFirestoreInstance();
		const userId = this.getCurrentUserId();
		return doc(db, 'profiles', userId);
	}

	async load(): Promise<UserProfile | null> {
		const docRef = this.getDocRef();
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return docSnap.data() as UserProfile;
		}

		return null;
	}

	async save(profile: UserProfile): Promise<void> {
		const docRef = this.getDocRef();
		await setDoc(
			docRef,
			{
				...profile,
				updatedAt: Timestamp.now()
			},
			{ merge: true }
		);
	}

	async clear(): Promise<void> {
		const docRef = this.getDocRef();
		await setDoc(docRef, {});
	}
}

export const firestoreProfileDB = new FirestoreProfileDB();
