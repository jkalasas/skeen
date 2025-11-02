<script lang="ts">
	import { onMount } from 'svelte';
	import { productsStore } from '$lib/stores/products.svelte';
	import type { StoredProduct } from '$lib/db/firestore-products';
	import type { Product } from '$lib/ai/base';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import ImageUpload from '$lib/components/custom/image-upload.svelte';
	import ProductEntry from '$lib/components/custom/product-entry.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
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
		Calendar,
		Plus,
		Edit,
		Sparkles,
		Info
	} from '@lucide/svelte';
	import type { PageData } from './$types';
	import AuthGuard from '$lib/components/custom/auth-guard.svelte';

	let { data }: { data: PageData } = $props();
	const aiClient = data.aiClient;

	let searchQuery = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 12;

	// Add/Edit dialog state
	let showAddEditDialog = $state(false);
	let editingProduct = $state<StoredProduct | null>(null);
	let dialogActiveTab = $state('image');
	let dialogImages = $state<File[]>([]);
	let dialogLoading = $state(false);
	let dialogError = $state<string | null>(null);
	let extractedProduct = $state<Product | null>(null);

	let productEntryComponent = $state<ProductEntry | null>(null);

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

	async function handleDelete(id: string) {
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

	// Add/Edit dialog functions
	function openAddDialog() {
		editingProduct = null;
		extractedProduct = null;
		dialogImages = [];
		dialogError = null;
		dialogActiveTab = 'image';
		showAddEditDialog = true;
	}

	function openEditDialog(product: StoredProduct) {
		editingProduct = product;
		extractedProduct = {
			name: product.name,
			description: product.description,
			ingredients: product.ingredients
		};
		dialogImages = [];
		dialogError = null;
		dialogActiveTab = 'manual';
		showAddEditDialog = true;
	}

	function closeDialog() {
		showAddEditDialog = false;
		editingProduct = null;
		extractedProduct = null;
		dialogImages = [];
		dialogError = null;
		productEntryComponent?.reset();
	}

	function handleDialogImagesChange() {
		extractedProduct = null;
		dialogError = null;
	}

	async function handleExtractProduct() {
		if (dialogImages.length === 0) {
			dialogError = 'Please select at least one image';
			return;
		}

		if (!aiClient) {
			dialogError = 'AI client not available';
			return;
		}

		dialogLoading = true;
		dialogError = null;

		try {
			const product = await aiClient.extractProductInfo(dialogImages);
			extractedProduct = product;
			dialogActiveTab = 'manual'; // Switch to manual tab to show extracted info
		} catch (err) {
			dialogError = err instanceof Error ? err.message : 'Failed to extract product information';
		} finally {
			dialogLoading = false;
		}
	}

	async function handleManualSubmit(data: {
		name: string;
		description?: string;
		ingredients: string[];
	}) {
		dialogLoading = true;
		dialogError = null;

		try {
			if (editingProduct) {
				// Update existing product
				await productsStore.update({
					...editingProduct,
					name: data.name,
					description: data.description,
					ingredients: data.ingredients
				});
			} else {
				// Add new product
				await productsStore.add({
					name: data.name,
					description: data.description,
					ingredients: data.ingredients
				});
			}
			closeDialog();
		} catch (err) {
			dialogError = err instanceof Error ? err.message : 'Failed to save product';
		} finally {
			dialogLoading = false;
		}
	}

	function handleDialogReset() {
		dialogImages = [];
		extractedProduct = null;
		dialogError = null;
		productEntryComponent?.reset();
	}
</script>

<svelte:head>
	<title>Saved Products - Skeen</title>
</svelte:head>

<AuthGuard>
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

			<div class="flex gap-2">
				<Button onclick={openAddDialog} class="gap-2">
					<Plus class="h-4 w-4" />
					Add Product
				</Button>

				{#if productsStore.items.length > 0}
					<Button variant="destructive" onclick={handleClearAll} class="gap-2">
						<Trash2 class="h-4 w-4" />
						Clear All
					</Button>
				{/if}
			</div>
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
								<div class="flex shrink-0 gap-1">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => openEditDialog(product)}
										class="h-8 w-8 p-0 hover:bg-accent"
									>
										<Edit class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleDelete(product.id!)}
										class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
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

	<!-- Add/Edit Product Dialog -->
	<Dialog.Root bind:open={showAddEditDialog}>
		<Dialog.Content class="flex max-h-[90vh] max-w-4xl flex-col">
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<Sparkles class="h-5 w-5" />
					{editingProduct ? 'Edit Product' : 'Add New Product'}
				</Dialog.Title>
				<Dialog.Description>
					{editingProduct
						? 'Update product information using image extraction or manual entry'
						: 'Extract product information from images or enter details manually'}
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex-1 overflow-y-auto">
				<!-- Error Display -->
				{#if dialogError}
					<Alert.Root variant="destructive" class="mb-4">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{dialogError}</Alert.Description>
					</Alert.Root>
				{/if}

				<Tabs.Root bind:value={dialogActiveTab}>
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="image">📸 Image Upload</Tabs.Trigger>
						<Tabs.Trigger value="manual">✍️ Product Info</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="image" class="mt-4">
						<ImageUpload
							bind:images={dialogImages}
							loading={dialogLoading}
							onimageschange={handleDialogImagesChange}
							onextract={handleExtractProduct}
							onassess={() => {}}
							onreset={handleDialogReset}
						/>

						{#if extractedProduct}
							<div class="mt-4">
								<Alert.Root>
									<Info class="h-4 w-4" />
									<Alert.Title>Product Information Extracted</Alert.Title>
									<Alert.Description>
										Switch to the "Product Info" tab to review and save the extracted information.
									</Alert.Description>
								</Alert.Root>
							</div>
						{/if}
					</Tabs.Content>

					<Tabs.Content value="manual" class="mt-4">
						<ProductEntry
							bind:this={productEntryComponent}
							loading={dialogLoading}
							initialName={extractedProduct?.name || editingProduct?.name || ''}
							initialDescription={extractedProduct?.description ||
								editingProduct?.description ||
								''}
							initialIngredients={extractedProduct?.ingredients ||
								editingProduct?.ingredients ||
								[]}
							buttonText="Save"
							onsubmit={handleManualSubmit}
						/>
					</Tabs.Content>
				</Tabs.Root>
			</div>

			<Dialog.Footer class="flex-col gap-2 sm:flex-row">
				<Button variant="outline" onclick={closeDialog}>Cancel</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</AuthGuard>
