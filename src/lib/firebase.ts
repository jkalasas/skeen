import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAI, type AI, GoogleAIBackend } from 'firebase/ai';

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
