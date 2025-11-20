<script lang="ts">
	import '../app.css';
	import SkeenLogo from '$lib/assets/skeen.svg';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		History,
		User,
		GitCompare,
		Heart,
		Package,
		LogOut,
		LogIn
	} from '@lucide/svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { toast } from 'svelte-sonner';

	let { children } = $props();

	const isHistoryPage = $derived(page.url.pathname === '/history');
	const isProfilePage = $derived(page.url.pathname === '/profile');
	const isComparisonPage = $derived(page.url.pathname === '/comparison');
	const isCompanionPage = $derived(page.url.pathname === '/companion');
	const isProductsPage = $derived(page.url.pathname === '/products');

	onMount(() => {
		authStore.init();
	});

	async function handleSignOut() {
		toast.promise(authStore.signOut(), {
			loading: 'Signing out...',
			success: 'Signed out successfully',
			error: 'Error signing out'
		});
	}

	async function handleSignIn() {
		toast.promise(authStore.signInWithGoogle(), {
			loading: 'Signing in...',
			success: 'Signed in successfully',
			error: 'Error signing in'
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={SkeenLogo} />
</svelte:head>

<!-- Animated Background -->
<div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div class="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-primary/20 blur-[100px] animate-pulse-slow"></div>
    <div class="absolute top-[30%] right-[0%] h-[50%] w-[50%] rounded-full bg-accent/15 blur-[120px] animate-float" style="animation-delay: 1s;"></div>
    <div class="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-secondary/20 blur-[100px] animate-pulse-slow" style="animation-delay: 2s;"></div>
</div>

<div class="min-h-screen bg-transparent">
	<Toaster />

    <!-- Navigation -->
	<nav class="sticky top-4 z-50 mx-auto max-w-6xl px-4">
        <div class="glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300">
            <a href="/" class="flex items-center gap-2 group">
                <div class="relative">
                    <div class="absolute inset-0 bg-primary/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src={SkeenLogo} alt="Skeen Logo" class="h-8 w-8 relative z-10 transition-transform group-hover:scale-110" />
                </div>
                <span class="text-2xl font-bold tracking-tight text-gradient">skeen</span>
            </a>

            <div class="flex items-center gap-1">
                {#if authStore.initialized && authStore.isAuthenticated}
                    <Button
                        variant={isComparisonPage ? 'default' : 'ghost'}
                        href="/comparison"
                        class="rounded-full gap-2 hover:bg-primary/10 hover:text-primary"
                    >
                        <GitCompare class="h-4 w-4" />
                        <span class="hidden sm:inline">Compare</span>
                    </Button>
                    <Button
                        variant={isCompanionPage ? 'default' : 'ghost'}
                        href="/companion"
                        class="rounded-full gap-2 hover:bg-primary/10 hover:text-primary"
                    >
                        <Heart class="h-4 w-4" />
                        <span class="hidden sm:inline">Companion</span>
                    </Button>
                    <Button variant={isProductsPage ? 'default' : 'ghost'} href="/products" class="rounded-full gap-2 hover:bg-primary/10 hover:text-primary">
                        <Package class="h-4 w-4" />
                        <span class="hidden sm:inline">Products</span>
                    </Button>
                    <Button variant={isProfilePage ? 'default' : 'ghost'} href="/profile" class="rounded-full gap-2 hover:bg-primary/10 hover:text-primary">
                        <User class="h-4 w-4" />
                        <span class="hidden sm:inline">Profile</span>
                    </Button>
                    <Button variant={isHistoryPage ? 'default' : 'ghost'} href="/history" class="rounded-full gap-2 hover:bg-primary/10 hover:text-primary">
                        <History class="h-4 w-4" />
                        <span class="hidden sm:inline">History</span>
                    </Button>
                    <Button variant="ghost" onclick={handleSignOut} class="rounded-full gap-2 hover:bg-destructive/10 hover:text-destructive ml-2">
                        <LogOut class="h-4 w-4" />
                        <span class="hidden sm:inline">Sign Out</span>
                    </Button>
                {:else if authStore.initialized}
                    <Button variant="default" onclick={handleSignIn} class="rounded-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                        <LogIn class="h-4 w-4" />
                        <span>Sign In with Google</span>
                    </Button>
                {/if}
            </div>
        </div>
	</nav>

	<!-- Main Content -->
	<main class="pt-6 pb-12">
		{#if authStore.initialized}
			{@render children?.()}
		{:else}
			<div class="flex h-[calc(100vh-100px)] items-center justify-center">
                <div class="flex flex-col items-center gap-4">
                    <div class="relative h-12 w-12">
                        <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div class="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                    </div>
				    <p class="text-muted-foreground animate-pulse">Loading Skeen...</p>
                </div>
			</div>
		{/if}
	</main>
</div>
