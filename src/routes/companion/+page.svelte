<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Heart, AlertCircle, User, Info, Plus, Trash2 } from '@lucide/svelte';
	import type { BaseAIClient, Product, ProductCombination } from '$lib/ai/base';
	import ProductEntry from '$lib/components/custom/product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import CombinationResults from '$lib/components/custom/combination-results.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';

	let { data }: { data: PageData } = $props();

	const aiClient = data.aiClient as BaseAIClient;

	onMount(() => {
		profileStore.load();
	});

	let loading = $state(false);
	let error = $state<string | null>(null);
	let products = $state<Product[]>([]);
	let combination = $state<ProductCombination | null>(null);
	let showProfilePrompt = $state(false);
	let editingIndex = $state<number | null>(null);

	let productEntryComponent = $state<ProductEntry | null>(null);

	function startAddingProduct() {
		editingIndex = products.length;
		productEntryComponent?.reset();
	}

	function handleProductSubmit(data: { name: string; description?: string; ingredients: string[] }) {
		const newProduct: Product = {
			name: data.name,
			description: data.description,
			ingredients: data.ingredients
		};

		if (editingIndex !== null && editingIndex < products.length) {
			// Edit existing product
			products[editingIndex] = newProduct;
		} else {
			// Add new product
			products = [...products, newProduct];
		}

		editingIndex = null;
		error = null;
		combination = null;
		productEntryComponent?.reset();
	}

	function editProduct(index: number) {
		editingIndex = index;
		// The component will re-render with the product data
	}

	function removeProduct(index: number) {
		products = products.filter((_, i) => i !== index);
		combination = null;
		if (editingIndex === index) {
			editingIndex = null;
			productEntryComponent?.reset();
		}
	}

	function cancelEdit() {
		editingIndex = null;
		productEntryComponent?.reset();
	}

	async function assessCombination() {
		if (products.length < 2) {
			error = 'Please add at least 2 products to assess their combination';
			return;
		}

		// Check if user has a profile
		if (!profileStore.isComplete) {
			showProfilePrompt = true;
			return;
		}

		loading = true;
		error = null;
		combination = null;

		try {
			combination = await aiClient.assessProductCombination(products, profileStore.data);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to assess product combination';
		} finally {
			loading = false;
		}
	}

	function reset() {
		products = [];
		combination = null;
		error = null;
		editingIndex = null;
		productEntryComponent?.reset();
	}

	function goToProfile() {
		goto(resolveRoute('/profile'));
	}

	// Get current editing product if any
	let currentProduct = $derived(
		editingIndex !== null && editingIndex < products.length ? products[editingIndex] : null
	);
</script>

<!-- Profile Prompt Dialog -->
{#if showProfilePrompt}
	<Dialog.Root bind:open={showProfilePrompt}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<div class="mb-4 flex justify-center">
					<div class="rounded-full bg-primary/10 p-4">
						<User class="h-8 w-8 text-primary" />
					</div>
				</div>
				<Dialog.Title class="text-center text-xl">Complete Your Profile First</Dialog.Title>
				<Dialog.Description class="text-center">
					To get personalized product combination assessments tailored to your unique skin needs,
					please complete your profile first.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="flex-col gap-2 sm:flex-col">
				<Button onclick={goToProfile} class="w-full gap-2">
					<User class="h-4 w-4" />
					Complete Profile
				</Button>
				<Button variant="ghost" onclick={() => (showProfilePrompt = false)} class="w-full">
					Maybe Later
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<div class="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
	<!-- Hero Section -->
	<div
		class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
	>
		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-xl bg-primary/20 p-3">
				<Heart class="h-8 w-8 text-primary" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
				Product Companion
			</h1>
		</div>
		<p class="max-w-2xl text-lg text-muted-foreground">
			Assess how well multiple products work together in your skincare routine.
		</p>
	</div>

	<!-- Profile Incomplete Banner -->
	{#if profileStore.initialized && !profileStore.isComplete}
		<Alert.Root class="mb-6 border-blue-500/50 bg-blue-500/10">
			<Info class="h-4 w-4 text-blue-600" />
			<Alert.Title>Complete your profile for personalized assessments</Alert.Title>
			<Alert.Description class="flex items-center justify-between gap-4">
				<span>
					Get tailored combination assessments based on your skin type, concerns, and preferences.
				</span>
				<Button variant="outline" size="sm" onclick={goToProfile} class="shrink-0 gap-2">
					<User class="h-3.5 w-3.5" />
					Complete Profile
				</Button>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Product List -->
	{#if products.length > 0}
		<div class="mb-6">
			<h2 class="mb-4 text-xl font-semibold">Your Products ({products.length})</h2>
			<div class="grid gap-4 md:grid-cols-2">
				{#each products as product, index}
					<Card.Root class="border-2">
						<Card.Header>
							<Card.Title class="flex items-center justify-between">
								<span>{product.name}</span>
								<div class="flex gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => editProduct(index)}
										disabled={loading}
									>
										Edit
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => removeProduct(index)}
										disabled={loading}
									>
										<Trash2 class="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</Card.Title>
						</Card.Header>
						{#if product.description}
							<Card.Content>
								<p class="text-sm text-muted-foreground">{product.description}</p>
							</Card.Content>
						{/if}
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Product Entry Form -->
	<div class="mb-8">
		{#if editingIndex !== null}
			<h2 class="mb-4 text-xl font-semibold">
				{editingIndex < products.length ? 'Edit Product' : 'Add Product'}
			</h2>
			<ProductEntry
				bind:this={productEntryComponent}
				{loading}
				onsubmit={handleProductSubmit}
				initialName={currentProduct?.name ?? ''}
				initialDescription={currentProduct?.description ?? ''}
				initialIngredients={currentProduct?.ingredients ?? []}
			/>
			<div class="mt-4">
				<Button variant="outline" onclick={cancelEdit}>Cancel</Button>
			</div>
		{:else}
			<Button onclick={startAddingProduct} variant="outline" class="gap-2" disabled={loading}>
				<Plus class="h-4 w-4" />
				Add Product
			</Button>
		{/if}
	</div>

	<!-- Action Buttons -->
	<div class="mb-8 flex flex-wrap gap-4">
		<Button
			onclick={assessCombination}
			disabled={loading || products.length < 2}
			class="gap-2"
			size="lg"
		>
			<Heart class="h-5 w-5" />
			{loading ? 'Assessing...' : 'Assess Combination'}
		</Button>
		<Button onclick={reset} variant="outline" size="lg" disabled={loading}>Reset All</Button>
	</div>

	<!-- Error Display -->
	{#if error}
		<Alert.Root variant="destructive" class="mb-6 border-destructive/50">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Product Information Grid -->
	{#if products.length > 0 && combination}
		<div class="mb-6">
			<h2 class="mb-4 text-xl font-semibold">Product Details</h2>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each products as product}
					<ProductInfo {product} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Combination Results -->
	{#if combination}
		<CombinationResults {combination} />
	{/if}
</div>
