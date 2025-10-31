<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Package, Calendar } from '@lucide/svelte';
	import { productsStore } from '$lib/stores/products.svelte';
	import type { StoredProduct } from '$lib/db/products';
	import type { Product } from '$lib/ai/base';
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		onselect: (product: Product) => void;
		onclose: () => void;
	}

	let { open = $bindable(), onselect, onclose }: Props = $props();

	let searchQuery = $state('');
	let selectedProduct = $state<StoredProduct | null>(null);

	// Watch for open changes to trigger close callback
	$effect(() => {
		if (!open) {
			// Reset state when dialog closes
			searchQuery = '';
			selectedProduct = null;
		}
	});

	onMount(() => {
		// Load products when component mounts
		productsStore.load();
	});

	// Search products when query changes
	$effect(() => {
		if (open) {
			productsStore.search(searchQuery);
		}
	});

	function handleSelect(product: StoredProduct) {
		selectedProduct = product;
	}

	function confirmSelection() {
		if (selectedProduct) {
			// Update last used timestamp
			if (selectedProduct.id) {
				productsStore.updateLastUsed(selectedProduct.id);
			}

			// Return the product without the id and timestamp fields
			onselect({
				name: selectedProduct.name,
				description: selectedProduct.description,
				ingredients: selectedProduct.ingredients
			});
			handleClose();
		}
	}

	function handleClose() {
		open = false;
		onclose();
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

	let filteredProducts = $derived(productsStore.items);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex max-h-[80vh] flex-col sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Search class="h-5 w-5" />
				Search Saved Products
			</Dialog.Title>
			<Dialog.Description>
				Select a product from your saved collection to use it in your assessment.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-1 flex-col space-y-4 overflow-hidden">
			<!-- Search Input -->
			<div class="relative">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					bind:value={searchQuery}
					placeholder="Search by name, description, or ingredients..."
					class="pl-9"
					autofocus
				/>
			</div>

			<!-- Products Count -->
			{#if !productsStore.loading}
				<div class="text-sm text-muted-foreground">
					{filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
				</div>
			{/if}

			<!-- Products List -->
			<div class="flex-1 space-y-2 overflow-y-auto pr-2">
				{#if productsStore.loading}
					<div class="flex items-center justify-center py-8">
						<div class="text-center">
							<div
								class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"
							></div>
							<p class="mt-2 text-sm text-muted-foreground">Loading products...</p>
						</div>
					</div>
				{:else if filteredProducts.length === 0}
					<div class="flex flex-col items-center justify-center py-8 text-center">
						<Package class="h-12 w-12 text-muted-foreground/50" />
						<p class="mt-2 text-sm font-medium">No products found</p>
						<p class="mt-1 text-xs text-muted-foreground">
							{searchQuery
								? 'Try a different search term'
								: 'Add products from the assessment page'}
						</p>
					</div>
				{:else}
					{#each filteredProducts as product (product.id)}
						<button
							type="button"
							onclick={() => handleSelect(product)}
							class="w-full rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 hover:bg-accent/50 {selectedProduct?.id ===
							product.id
								? 'border-primary bg-accent'
								: 'border-border'}"
						>
							<div class="space-y-2">
								<div class="flex items-start justify-between gap-2">
									<div class="min-w-0 flex-1">
										<h4 class="truncate text-sm font-semibold">{product.name}</h4>
										{#if product.description}
											<p class="mt-1 line-clamp-2 text-xs text-muted-foreground">
												{product.description}
											</p>
										{/if}
									</div>
									{#if selectedProduct?.id === product.id}
										<Badge variant="default" class="shrink-0">Selected</Badge>
									{/if}
								</div>

								{#if product.ingredients && product.ingredients.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each product.ingredients.slice(0, 3) as ingredient, i (i)}
											<Badge variant="secondary" class="text-xs">{ingredient}</Badge>
										{/each}
										{#if product.ingredients.length > 3}
											<Badge variant="outline" class="text-xs">
												+{product.ingredients.length - 3} more
											</Badge>
										{/if}
									</div>
								{/if}

								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<Calendar class="h-3 w-3" />
									Added {formatDate(product.timestamp)}
									{#if product.lastUsed && product.lastUsed !== product.timestamp}
										• Last used {formatDate(product.lastUsed)}
									{/if}
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<Dialog.Footer class="flex-row gap-2">
			<Button variant="outline" onclick={handleClose} class="flex-1">Cancel</Button>
			<Button onclick={confirmSelection} disabled={!selectedProduct} class="flex-1 gap-2">
				<Package class="h-4 w-4" />
				Use Selected Product
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
