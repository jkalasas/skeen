<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import { onMount } from 'svelte';

	import { PUBLIC_GEMINI_KEY } from '$env/static/public';
	import { setAiClientContext } from '$lib/states/ai-client';
	import { GeminiAIClient } from '$lib/ai/gemini';

	let { children } = $props();

	onMount(() => {
		setAiClientContext(new GeminiAIClient(PUBLIC_GEMINI_KEY));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
