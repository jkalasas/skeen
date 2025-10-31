<script lang="ts">
	import { onMount } from 'svelte';
	import { productsStore } from '$lib/stores/products.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import {
		Package,
		Search,
		Trash2,
		AlertCircle,
		ArrowLeft,
		ChevronLeft,
		ChevronRight,
		Calendar
	} from '@lucide/svelte';

	let searchQuery = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 12;

	// Computed values using $derived
	const filteredItems = $derived(
		searchQuery.trim()
			? productsStore.items.filter((item) => {
					const query = searchQuery.toLowerCase();
					return (
						item.name?.toLowerCase().includes(query) ||
						item.description?.toLowerCase().includes(query) ||
						item.ingredients?.some((ing) => ing.toLowerCase().includes(query))
					);
				})
			: productsStore.items
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
		productsStore.load();
	});

	async function handleDelete(id: number) {
		if (confirm('Are you sure you want to delete this product?')) {
			await productsStore.delete(id);
		}
	}

	async function handleClearAll() {
		if (
			confirm('Are you sure you want to delete all saved products? This action cannot be undone.')
		) {
			await productsStore.clear();
		}
	}

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		return date.toLocaleDateString();
	}

	function goBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>Saved Products - Skeen</title>
</svelte:head>

<div class="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
	<!-- Header Section -->
	<div
		class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
	>
		<button
			onclick={goBack}
			class="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Back
		</button>

		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-xl bg-primary/20 p-3">
				<Package class="h-8 w-8 text-primary" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Saved Products</h1>
		</div>
		<p class="max-w-2xl text-lg text-muted-foreground">
			Manage your saved skincare products. Search, view, and delete products from your collection.
		</p>
	</div>

	<!-- Search and Actions -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				bind:value={searchQuery}
				placeholder="Search by name, description, or ingredients..."
				class="pl-9"
			/>
		</div>

		{#if productsStore.items.length > 0}
			<Button variant="destructive" onclick={handleClearAll} class="gap-2">
				<Trash2 class="h-4 w-4" />
				Clear All
			</Button>
		{/if}
	</div>

	<!-- Error Display -->
	{#if productsStore.error}
		<Alert.Root variant="destructive" class="mb-6">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{productsStore.error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Loading State -->
	{#if productsStore.loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div
					class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"
				></div>
				<p class="mt-4 text-sm text-muted-foreground">Loading products...</p>
			</div>
		</div>
	{:else if paginatedItems.length === 0}
		<!-- Empty State -->
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<Package class="mb-4 h-16 w-16 text-muted-foreground/50" />
			<h3 class="mb-2 text-lg font-semibold">
				{searchQuery ? 'No products found' : 'No saved products yet'}
			</h3>
			<p class="mb-4 text-sm text-muted-foreground">
				{searchQuery
					? 'Try a different search term'
					: 'Save products from the assessment page to see them here'}
			</p>
		</div>
	{:else}
		<!-- Products Count -->
		<div class="mb-4 text-sm text-muted-foreground">
			Showing {paginatedItems.length} of {filteredItems.length} product{filteredItems.length === 1
				? ''
				: 's'}
		</div>

		<!-- Products Grid -->
		<div class="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each paginatedItems as product (product.id)}
				<Card.Root class="relative flex flex-col">
					<Card.Header>
						<div class="flex items-start justify-between gap-2">
							<Card.Title class="line-clamp-2 text-base">{product.name}</Card.Title>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => handleDelete(product.id!)}
								class="h-8 w-8 shrink-0 p-0 text-destructive hover:bg-destructive/10"
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					</Card.Header>

					<Card.Content class="flex-1">
						{#if product.description}
							<p class="mb-3 line-clamp-3 text-sm text-muted-foreground">
								{product.description}
							</p>
						{/if}

						{#if product.ingredients && product.ingredients.length > 0}
							<div class="mb-3">
								<p class="mb-1 text-xs font-medium text-muted-foreground">Key Ingredients:</p>
								<div class="flex flex-wrap gap-1">
									{#each product.ingredients.slice(0, 3) as ingredient}
										<span
											class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
										>
											{ingredient}
										</span>
									{/each}
									{#if product.ingredients.length > 3}
										<span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
											+{product.ingredients.length - 3} more
										</span>
									{/if}
								</div>
							</div>
						{/if}

						<div class="flex items-center gap-2 text-xs text-muted-foreground">
							<Calendar class="h-3 w-3" />
							<span>Added {formatDate(product.timestamp)}</span>
						</div>

						{#if product.lastUsed && product.lastUsed !== product.timestamp}
							<div class="mt-1 text-xs text-muted-foreground">
								Last used {formatDate(product.lastUsed)}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft class="h-4 w-4" />
					Previous
				</Button>

				<div class="flex items-center gap-1">
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
						{#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
							<Button
								variant={currentPage === page ? 'default' : 'outline'}
								size="sm"
								onclick={() => (currentPage = page)}
								class="h-8 w-8 p-0"
							>
								{page}
							</Button>
						{:else if page === currentPage - 2 || page === currentPage + 2}
							<span class="px-2 text-muted-foreground">...</span>
						{/if}
					{/each}
				</div>

				<Button
					variant="outline"
					size="sm"
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					Next
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		{/if}
	{/if}
</div>
