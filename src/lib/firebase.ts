import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAI, type AI, GoogleAIBackend } from 'firebase/ai';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let ai: AI | null = null;

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
	if (!app) {
		validateFirebaseConfig();
		app = initializeApp(firebaseConfig);
	}
	return app;
}

export function getAIInstance(): AI {
	if (!ai) {
		const app = getFirebaseApp();
		// Use GoogleAIBackend to connect to Gemini Developer API instead of Vertex AI
		ai = getAI(app, { backend: new GoogleAIBackend() });
	}
	return ai;
}
