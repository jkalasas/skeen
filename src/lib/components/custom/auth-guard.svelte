<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { LogIn } from '@lucide/svelte';

	let { children } = $props();

	async function handleSignIn() {
		try {
			await authStore.signInWithGoogle();
		} catch (error) {
			console.error('Error signing in:', error);
		}
	}
</script>

{#if authStore.loading}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="text-center">
			<div class="mb-4 text-lg">Loading...</div>
		</div>
	</div>
{:else if !authStore.isAuthenticated}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="text-center">
			<h2 class="mb-4 text-2xl font-bold">Authentication Required</h2>
			<p class="mb-6 text-muted-foreground">Please sign in to access this feature.</p>
			<Button onclick={handleSignIn} class="gap-2">
				<LogIn class="h-4 w-4" />
				Sign In with Google
			</Button>
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}
