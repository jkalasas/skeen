import { getAuthInstance } from '$lib/firebase';
import {
	signInWithPopup,
	GoogleAuthProvider,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { browser } from '$app/environment';

class AuthStore {
	private user = $state<User | null>(null);
	private _loading = $state(true);
	private _initialized = $state(false);

	get currentUser() {
		return this.user;
	}

	get loading() {
		return this._loading;
	}

	get initialized() {
		return this._initialized;
	}

	get isAuthenticated() {
		return this.user !== null;
	}

	init() {
		if (!browser || this._initialized) return;

		const auth = getAuthInstance();

		onAuthStateChanged(auth, (user) => {
			this.user = user;
			this._loading = false;
			this._initialized = true;
		});
	}

	async signInWithGoogle() {
		if (!browser) return;

		this._loading = true;
		try {
			const auth = getAuthInstance();
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			this.user = result.user;
		} catch (error) {
			console.error('Error signing in with Google:', error);
			throw error;
		} finally {
			this._loading = false;
		}
	}

	async signOut() {
		if (!browser) return;

		this._loading = true;
		try {
			const auth = getAuthInstance();
			await firebaseSignOut(auth);
			this.user = null;
		} catch (error) {
			console.error('Error signing out:', error);
			throw error;
		} finally {
			this._loading = false;
		}
	}
}

export const authStore = new AuthStore();
