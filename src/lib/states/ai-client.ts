import { BaseAIClient } from '$lib/ai/base';
import { createContext } from 'svelte';

export const [getAiClientContext, setAiClientContext] = createContext<BaseAIClient>();
