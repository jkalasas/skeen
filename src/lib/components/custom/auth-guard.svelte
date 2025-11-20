<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { LogIn, Lock } from '@lucide/svelte';

	let { children } = $props();

	async function handleSignIn() {
		try {
			await authStore.signInWithGoogle();
		} catch (error) {
			console.error('Error signing in:', error);
		}
	}
</script>

{#if !authStore.initialized || authStore.loading}
	<div class="flex min-h-[50vh] items-center justify-center">
        <div class="relative h-16 w-16">
            <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div class="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
	</div>
{:else if !authStore.isAuthenticated}
	<div class="flex min-h-[40vh] items-center justify-center p-4">
		<div class="glass-card max-w-md w-full p-8 rounded-3xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div class="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <Lock class="h-8 w-8 text-primary" />
            </div>
			<div class="space-y-2">
                <h2 class="text-2xl font-bold">Unlock Full Access</h2>
			    <p class="text-muted-foreground">Sign in to analyze products, save your history, and get personalized recommendations.</p>
            </div>
			<Button onclick={handleSignIn} class="w-full rounded-full gap-2 shadow-lg shadow-primary/20">
				<LogIn class="h-4 w-4" />
				Sign In with Google
			</Button>
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}
