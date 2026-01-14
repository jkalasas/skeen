import { vi } from 'vitest';

export const mockUser = {
	uid: 'test-user-id',
	email: 'test@example.com',
	displayName: 'Test User',
	photoURL: null,
	emailVerified: true
};

export const mockFirebaseApp = {
	name: '[DEFAULT]',
	options: {}
};

export const mockAuth = {
	currentUser: null as typeof mockUser | null,
	onAuthStateChanged: vi.fn((callback: (user: typeof mockUser | null) => void) => {
		callback(null);
		return vi.fn();
	}),
	signInWithPopup: vi.fn(),
	signOut: vi.fn()
};

export const mockFirestore = {
	collection: vi.fn(),
	doc: vi.fn(),
	addDoc: vi.fn(),
	getDocs: vi.fn(),
	getDoc: vi.fn(),
	updateDoc: vi.fn(),
	deleteDoc: vi.fn()
};

export const mockAI = {
	getGenerativeModel: vi.fn()
};

export function setupFirebaseMocks() {
	vi.mock('firebase/app', () => ({
		initializeApp: vi.fn(() => mockFirebaseApp),
		getApp: vi.fn(() => mockFirebaseApp)
	}));

	vi.mock('firebase/auth', () => ({
		getAuth: vi.fn(() => mockAuth),
		signInWithPopup: mockAuth.signInWithPopup,
		signInWithCredential: vi.fn(),
		signOut: mockAuth.signOut,
		onAuthStateChanged: mockAuth.onAuthStateChanged,
		GoogleAuthProvider: vi.fn(() => ({
			credential: vi.fn()
		}))
	}));

	vi.mock('firebase/firestore', () => ({
		getFirestore: vi.fn(() => mockFirestore),
		collection: mockFirestore.collection,
		doc: mockFirestore.doc,
		addDoc: mockFirestore.addDoc,
		getDocs: mockFirestore.getDocs,
		getDoc: mockFirestore.getDoc,
		updateDoc: mockFirestore.updateDoc,
		deleteDoc: mockFirestore.deleteDoc,
		query: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn(),
		Timestamp: { now: () => ({ toDate: () => new Date() }) }
	}));

	vi.mock('firebase/ai', () => ({
		getAI: vi.fn(() => mockAI),
		getGenerativeModel: mockAI.getGenerativeModel,
		GoogleAIBackend: vi.fn(),
		SchemaType: {
			OBJECT: 'object',
			ARRAY: 'array',
			STRING: 'string',
			NUMBER: 'number',
			BOOLEAN: 'boolean'
		}
	}));
}

export function resetFirebaseMocks() {
	mockAuth.currentUser = null;
	vi.clearAllMocks();
}

export function setMockUser(user: typeof mockUser | null) {
	mockAuth.currentUser = user;
}
