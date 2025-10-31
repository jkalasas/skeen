<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { History, Sparkles, User, GitCompare, Heart } from '@lucide/svelte';

	let { children } = $props();

	const isHistoryPage = $derived($page.url.pathname === '/history');
	const isProfilePage = $derived($page.url.pathname === '/profile');
	const isComparisonPage = $derived($page.url.pathname === '/comparison');
	const isCompanionPage = $derived($page.url.pathname === '/companion');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Navigation -->
	<nav
		class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<a href="/" class="flex items-center gap-2 text-xl font-bold">
					<Sparkles class="h-6 w-6 text-primary" />
					Skeen
				</a>
				<div class="flex items-center gap-2">
					<Button
						variant={isComparisonPage ? 'default' : 'ghost'}
						href="/comparison"
						class="gap-2"
					>
						<GitCompare class="h-4 w-4" />
						<span class="hidden sm:inline">Compare</span>
					</Button>
					<Button variant={isCompanionPage ? 'default' : 'ghost'} href="/companion" class="gap-2">
						<Heart class="h-4 w-4" />
						<span class="hidden sm:inline">Companion</span>
					</Button>
					<Button variant={isProfilePage ? 'default' : 'ghost'} href="/profile" class="gap-2">
						<User class="h-4 w-4" />
						<span class="hidden sm:inline">Profile</span>
					</Button>
					<Button variant={isHistoryPage ? 'default' : 'ghost'} href="/history" class="gap-2">
						<History class="h-4 w-4" />
						<span class="hidden sm:inline">History</span>
					</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main>
		{@render children?.()}
	</main>
</div>
