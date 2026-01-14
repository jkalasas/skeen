import { getAuthInstance } from '$lib/firebase';
import {
	signInWithPopup,
	signInWithCredential,
	GoogleAuthProvider,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { browser } from '$app/environment';
import { profileStore } from './profile.svelte';
import { isTauri, openUrl } from '$lib/platform';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

const AUTH_TIMEOUT_MS = 10000;
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

function buildGoogleOAuthUrl(redirectUri: string, nonce: string): string {
	const params = new URLSearchParams({
		client_id: PUBLIC_GOOGLE_CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: 'id_token',
		scope: 'openid email profile',
		nonce,
		prompt: 'select_account'
	});
	return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

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

	private _completeInitialization(error?: unknown) {
		if (error) {
			console.error('Error initializing auth:', error);
		}
		this.user = null;
		this._loading = false;
		this._initialized = true;
	}

	init() {
		if (!browser || this._initialized) return;

		// Set a timeout to ensure we don't stay in loading state forever
		const timeout = setTimeout(() => {
			if (!this._initialized) {
				console.warn('Auth initialization timeout - forcing completion');
				this._completeInitialization();
			}
		}, AUTH_TIMEOUT_MS);

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
						profileStore.clear();
					}
					this._loading = false;
					this._initialized = true;
				},
				(error) => {
					// Handle auth state change errors
					clearTimeout(timeout);
					this._completeInitialization(error);
				}
			);
		} catch (error) {
			// Handle errors in getting auth instance or setting up listener
			clearTimeout(timeout);
			this._completeInitialization(error);
		}
	}

	async signInWithGoogle() {
		if (!browser) return;

		this._loading = true;
		try {
			if (isTauri()) {
				await this.signInWithGoogleTauri();
			} else {
				await this.signInWithGoogleWeb();
			}
		} catch (error) {
			console.error('Error signing in with Google:', error);
			throw error;
		} finally {
			this._loading = false;
		}
	}

	private async signInWithGoogleWeb() {
		const auth = getAuthInstance();
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);
		this.user = result.user;
	}

	private async signInWithGoogleTauri() {
		const { invoke } = await import('@tauri-apps/api/core');
		const { listen } = await import('@tauri-apps/api/event');

		const redirectUri = await invoke<string>('get_oauth_redirect_uri');
		const nonce = crypto.randomUUID();

		return new Promise<void>((resolve, reject) => {
			const unlistenCallback = listen<string>('oauth-callback', async (event) => {
				try {
					const url = event.payload;
					const queryString = url.split('?')[1] || '';
					const params = new URLSearchParams(queryString);
					const idToken = params.get('id_token');

					if (idToken) {
						const auth = getAuthInstance();
						const credential = GoogleAuthProvider.credential(idToken);
						const result = await signInWithCredential(auth, credential);
						this.user = result.user;
						(await unlistenCallback)();
						resolve();
					}
				} catch (error) {
					(await unlistenCallback)();
					reject(error);
				}
			});

			const unlistenError = listen<string>('oauth-error', async (event) => {
				(await unlistenCallback)();
				(await unlistenError)();
				reject(new Error(event.payload));
			});

			invoke('start_oauth_server').catch(reject);

			openUrl(buildGoogleOAuthUrl(redirectUri, nonce));
		});
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
