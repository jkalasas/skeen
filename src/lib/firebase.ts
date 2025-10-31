import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAI, type AI } from 'firebase/ai';

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

export function getFirebaseApp(): FirebaseApp {
	if (!app) {
		app = initializeApp(firebaseConfig);
	}
	return app;
}

export function getAIInstance(): AI {
	if (!ai) {
		const app = getFirebaseApp();
		ai = getAI(app);
	}
	return ai;
}
