import type { UserProfile } from '$lib/types/profile';
import { firestoreProfileDB } from '$lib/db/firestore-profile';

class ProfileStore {
	private profile = $state<UserProfile | null>(null);
	private _loading = $state(false);
	private _initialized = $state(false);

	get data() {
		return this.profile;
	}

	get loading() {
		return this._loading;
	}

	get initialized() {
		return this._initialized;
	}

	get isComplete() {
		return this.profile !== null;
	}

	async load() {
		this._loading = true;

		try {
			this.profile = await firestoreProfileDB.load();
		} catch (err) {
			console.error('Failed to load profile:', err);
		} finally {
			this._loading = false;
			this._initialized = true;
		}
	}

	async save(profile: UserProfile) {
		this._loading = true;

		try {
			await firestoreProfileDB.save(profile);
			this.profile = profile;
		} catch (err) {
			console.error('Failed to save profile:', err);
			throw err;
		} finally {
			this._loading = false;
		}
	}

	async clear() {
		try {
			// Only clear from Firestore if there's an authenticated user
			// This prevents errors when signing out or when user is not authenticated
			this.profile = null;
		} catch (err) {
			console.error('Failed to clear profile:', err);
			throw err;
		}
	}
}

export const profileStore = new ProfileStore();
