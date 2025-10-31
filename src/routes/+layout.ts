import { browser } from '$app/environment';
import { FirebaseAIClient } from '$lib/ai/firebase';

export const prerender = true;
export const ssr = false;

export const load = async () => {
	if (!browser) return;

	const aiClient = new FirebaseAIClient();

	return {
		aiClient
	};
};
