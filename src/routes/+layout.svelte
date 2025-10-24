<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { History, Sparkles } from '@lucide/svelte';

	let { children } = $props();

	const isHistoryPage = $derived($page.url.pathname === '/history');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Navigation -->
	<nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
		<div class="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<a href="/" class="flex items-center gap-2 font-bold text-xl">
					<Sparkles class="h-6 w-6 text-primary" />
					Skeen
				</a>
				<div class="flex items-center gap-2">
					<Button
						variant={isHistoryPage ? 'default' : 'ghost'}
						href="/history"
						class="gap-2"
					>
						<History class="h-4 w-4" />
						History
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
