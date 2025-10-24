import { PUBLIC_GEMINI_KEY } from "$env/static/public";

import { GeminiAIClient } from "$lib/ai/gemini";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
    const aiClient = new GeminiAIClient(PUBLIC_GEMINI_KEY);

    return {
        aiClient
    };
}