<script lang="ts">
	import { onMount } from 'svelte';
	import { historyStore } from '$lib/stores/history.svelte';
	import HistoryItem from '$lib/components/custom/history-item.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { History, Search, Trash2, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let searchQuery = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	// Computed values using $derived
	const filteredItems = $derived(
		searchQuery.trim()
			? historyStore.items.filter(item => {
					const query = searchQuery.toLowerCase();
					return (
						item.product.name?.toLowerCase().includes(query) ||
						item.product.description?.toLowerCase().includes(query) ||
						item.product.ingredients?.some(ing => ing.toLowerCase().includes(query))
					);
			  })
			: historyStore.items
	);

	const totalPages = $derived(Math.ceil(filteredItems.length / itemsPerPage));
	
	const paginatedItems = $derived(
		filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Reset to page 1 when search changes
	$effect(() => {
		searchQuery;
		currentPage = 1;
	});

	onMount(() => {
		historyStore.load();
	});

	async function handleDelete(id: number) {
		await historyStore.delete(id);
	}

	async function handleClearAll() {
		if (confirm('Are you sure you want to clear all assessment history? This action cannot be undone.')) {
			await historyStore.clear();
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			// Scroll to top when changing pages
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function getPaginationRange() {
		const range = [];
		const delta = 2; // Number of pages to show on each side of current page

		for (let i = 1; i <= totalPages; i++) {
			if (
				i === 1 ||
				i === totalPages ||
				(i >= currentPage - delta && i <= currentPage + delta)
			) {
				range.push(i);
			} else if (range[range.length - 1] !== '...') {
				range.push('...');
			}
		}

		return range;
	}
</script>

<svelte:head>
	<title>Assessment History - Skeen</title>
</svelte:head>

<div class="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<Button
				variant="ghost"
				size="icon"
				href="/"
				class="rounded-full"
			>
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div class="flex items-center gap-3">
				<div class="rounded-xl bg-primary/20 p-3">
					<History class="h-7 w-7 text-primary" />
				</div>
				<h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
					Assessment History
				</h1>
			</div>
		</div>
		<p class="text-muted-foreground ml-16">
			View and manage your past product assessments
		</p>
	</div>

	<!-- Search and Actions Bar -->
	<div class="mb-6 flex flex-col sm:flex-row gap-4">
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Search by product name, description, or ingredients..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
		{#if historyStore.items.length > 0}
			<Button
				variant="destructive"
				onclick={handleClearAll}
				class="gap-2"
			>
				<Trash2 class="h-4 w-4" />
				Clear All
			</Button>
		{/if}
	</div>

	<!-- Error Display -->
	{#if historyStore.error}
		<Alert.Root variant="destructive" class="mb-6">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{historyStore.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Loading State -->
	{#if historyStore.loading}
		<div class="flex justify-center items-center py-20">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
		</div>
	{:else if paginatedItems.length === 0}
		<!-- Empty State -->
		<div class="text-center py-20">
			<History class="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
			<h2 class="text-2xl font-semibold mb-2">
				{searchQuery ? 'No results found' : 'No assessments yet'}
			</h2>
			<p class="text-muted-foreground mb-6">
				{searchQuery
					? 'Try adjusting your search query'
					: 'Start assessing products to build your history'}
			</p>
			{#if !searchQuery}
				<Button href="/">Assess a Product</Button>
			{/if}
		</div>
	{:else}
		<!-- History List -->
		<div class="space-y-4 mb-8">
			{#each paginatedItems as entry (entry.id)}
				<HistoryItem {entry} ondelete={handleDelete} />
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
				<div class="text-sm text-muted-foreground">
					Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
						currentPage * itemsPerPage,
						filteredItems.length
					)} of {filteredItems.length} {filteredItems.length === 1 ? 'entry' : 'entries'}
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>

					{#each getPaginationRange() as page}
						{#if page === '...'}
							<span class="px-2 text-muted-foreground">…</span>
						{:else}
							<Button
								variant={currentPage === page ? 'default' : 'outline'}
								size="icon"
								onclick={() => goToPage(page as number)}
							>
								{page}
							</Button>
						{/if}
					{/each}

					<Button
						variant="outline"
						size="icon"
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
