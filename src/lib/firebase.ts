import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAI, type AI, GoogleAIBackend } from 'firebase/ai';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { browser } from '$app/environment';

// Firebase configuration
const firebaseConfig = {
	apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
	authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let ai: AI | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function validateFirebaseConfig(): void {
	const requiredFields = [
		'apiKey',
		'authDomain',
		'projectId',
		'storageBucket',
		'messagingSenderId',
		'appId'
	] as const;

	const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);

	if (missingFields.length > 0) {
		throw new Error(
			`Missing required Firebase configuration: ${missingFields.join(', ')}. Please check your environment variables.`
		);
	}
}

export function getFirebaseApp(): FirebaseApp {
	if (!app && browser) {
		validateFirebaseConfig();
		app = initializeApp(firebaseConfig);
	}
	return app!;
}

export function getAIInstance(): AI {
	if (!ai && browser) {
		const app = getFirebaseApp();
		// Use GoogleAIBackend to connect to Gemini Developer API instead of Vertex AI
		ai = getAI(app, { backend: new GoogleAIBackend() });
	}
	return ai!;
}

export function getAuthInstance(): Auth {
	if (!auth && browser) {
		const app = getFirebaseApp();
		auth = getAuth(app);
	}
	return auth!;
}

export function getFirestoreInstance(): Firestore {
	if (!db && browser) {
		const app = getFirebaseApp();
		db = getFirestore(app);
	}
	return db!;
}
