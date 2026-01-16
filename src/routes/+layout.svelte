<script lang="ts">
	import '../app.css';
	import SkeenLogo from '$lib/assets/skeen.svg';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { invoke } from '@tauri-apps/api/core';
	import Navbar from '$lib/components/custom/Navbar.svelte';
	import { requestCameraPermission, isAndroid } from '$lib/permissions';

	let { children } = $props();

	async function requestPermissionsOnStartup() {
		const isOnAndroid = await isAndroid();
		if (isOnAndroid) {
			await requestCameraPermission();
		}
	}

	onMount(async () => {
		authStore.init();

		if (typeof window !== 'undefined' && '__TAURI__' in window) {
			try {
				await invoke('close_splashscreen');
			} catch (e) {
				console.error('Failed to close splashscreen:', e);
			}

			requestPermissionsOnStartup();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={SkeenLogo} />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<Toaster />

	<Navbar />

	<main>
		{#if authStore.initialized}
			{@render children?.()}
		{:else}
			<div class="flex h-[calc(100vh-4rem)] items-center justify-center">
				<p class="animate-pulse text-muted-foreground">Loading...</p>
			</div>
		{/if}
	</main>
</div>
