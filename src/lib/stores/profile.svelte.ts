import type { UserProfile } from '$lib/types/profile';

const STORAGE_KEY = 'skeen_user_profile';

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
		if (typeof window === 'undefined') return;

		this._loading = true;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				this.profile = JSON.parse(stored);
			}
		} catch (err) {
			console.error('Failed to load profile:', err);
		} finally {
			this._loading = false;
			this._initialized = true;
		}
	}

	async save(profile: UserProfile) {
		if (typeof window === 'undefined') return;

		this._loading = true;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
			this.profile = profile;
		} catch (err) {
			console.error('Failed to save profile:', err);
			throw err;
		} finally {
			this._loading = false;
		}
	}

	async clear() {
		if (typeof window === 'undefined') return;

		try {
			localStorage.removeItem(STORAGE_KEY);
			this.profile = null;
		} catch (err) {
			console.error('Failed to clear profile:', err);
			throw err;
		}
	}
}

export const profileStore = new ProfileStore();
