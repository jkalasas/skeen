import { getAuthInstance } from '$lib/firebase';
import {
	signInWithPopup,
	GoogleAuthProvider,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { browser } from '$app/environment';
import { profileStore } from './profile.svelte';

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

		// Set a timeout to ensure we don't stay in loading state forever
		const timeout = setTimeout(() => {
			if (!this._initialized) {
				console.warn('Auth initialization timeout - forcing completion');
				this._loading = false;
				this._initialized = true;
			}
		}, 10000); // 10 second timeout

		try {
			const auth = getAuthInstance();

			onAuthStateChanged(
				auth,
				async (user) => {
					clearTimeout(timeout);
					this.user = user;
					if (user) {
						await profileStore.load();
					} else {
						await profileStore.clear();
					}
					this._loading = false;
					this._initialized = true;
				},
				(error) => {
					// Handle auth state change errors
					clearTimeout(timeout);
					console.error('Error in auth state change:', error);
					this.user = null;
					this._loading = false;
					this._initialized = true;
				}
			);
		} catch (error) {
			// Handle errors in getting auth instance or setting up listener
			clearTimeout(timeout);
			console.error('Error initializing auth:', error);
			this.user = null;
			this._loading = false;
			this._initialized = true;
		}
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
