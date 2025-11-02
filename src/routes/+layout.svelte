<script lang="ts">
	import '../app.css';
	import SkeenLogo from '$lib/assets/skeen.svg';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		History,
		Sparkles,
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

<div class="min-h-screen bg-background">
	<Toaster />
	<!-- Navigation -->
	<nav
		class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<nav
			class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
		>
			<div class="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 items-center justify-between">
					<a href="/" class="flex items-center text-xl font-bold">
						<!-- <Sparkles class="h-6 w-6 text-primary" /> -->
						<img src={SkeenLogo} alt="Skeen Logo" class="h-6 w-6" />
						<span class="text-2xl">keen</span>
					</a>
					<div class="flex items-center gap-2">
						{#if authStore.initialized && authStore.isAuthenticated}
							<Button
								variant={isComparisonPage ? 'default' : 'ghost'}
								href="/comparison"
								class="gap-2"
							>
								<GitCompare class="h-4 w-4" />
								<span class="hidden sm:inline">Compare</span>
							</Button>
							<Button
								variant={isCompanionPage ? 'default' : 'ghost'}
								href="/companion"
								class="gap-2"
							>
								<Heart class="h-4 w-4" />
								<span class="hidden sm:inline">Companion</span>
							</Button>
							<Button variant={isProductsPage ? 'default' : 'ghost'} href="/products" class="gap-2">
								<Package class="h-4 w-4" />
								<span class="hidden sm:inline">Products</span>
							</Button>
							<Button variant={isProfilePage ? 'default' : 'ghost'} href="/profile" class="gap-2">
								<User class="h-4 w-4" />
								<span class="hidden sm:inline">Profile</span>
							</Button>
							<Button variant={isHistoryPage ? 'default' : 'ghost'} href="/history" class="gap-2">
								<History class="h-4 w-4" />
								<span class="hidden sm:inline">History</span>
							</Button>
							<Button variant="ghost" onclick={handleSignOut} class="gap-2">
								<LogOut class="h-4 w-4" />
								<span class="hidden sm:inline">Sign Out</span>
							</Button>
						{:else if authStore.initialized}
							<Button variant="default" onclick={handleSignIn} class="gap-2">
								<LogIn class="h-4 w-4" />
								<span>Sign In with Google</span>
							</Button>
						{/if}
					</div>
				</div>
			</div>
		</nav>

		<!-- Main Content -->
		<main>
			{@render children?.()}
		</main>
	</nav>
</div>
