import { browser } from '$app/environment';
import { PUBLIC_GEMINI_KEY } from '$env/static/public';
import { GeminiAIClient } from '$lib/ai/gemini';

export const prerender = true;
export const ssr = false;

export const load = async () => {
	if (!browser) return;

	const aiClient = new GeminiAIClient(PUBLIC_GEMINI_KEY);

	return {
		aiClient
	};
};
