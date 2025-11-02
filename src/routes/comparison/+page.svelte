<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { GitCompare, AlertCircle, User, Info, Plus } from '@lucide/svelte';
	import type { BaseAIClient, Product, ProductComparison } from '$lib/ai/base';
	import MultiProductEntry from '$lib/components/custom/multi-product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import ComparisonResults from '$lib/components/custom/comparison-results.svelte';
	import ProductSearch from '$lib/components/custom/product-search.svelte';
	import AuthGuard from '$lib/components/custom/auth-guard.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { productsStore } from '$lib/stores/products.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { PUBLIC_MAX_MULTI_COUNT } from '$env/static/public';

	let { data }: { data: PageData } = $props();

	const aiClient = data.aiClient as BaseAIClient;
	const maxProducts = PUBLIC_MAX_MULTI_COUNT ? parseInt(PUBLIC_MAX_MULTI_COUNT) : 5;

	onMount(() => {
		profileStore.load();
		productsStore.load();
	});

	let loading = $state(false);
	let error = $state<string | null>(null);
	let products = $state<(Product | null)[]>([null, null]);
	let comparison = $state<ProductComparison | null>(null);
	let showProfilePrompt = $state(false);
	let showProductSearch = $state(false);
	let searchTargetIndex = $state<number | null>(null);

	let productComponents = $state<(MultiProductEntry | null)[]>([]);

	function addProduct() {
		if (products.length < maxProducts) {
			products = [...products, null];
		}
	}

	function removeProduct(index: number) {
		if (products.length > 2) {
			products = products.filter((_, i) => i !== index);
			comparison = null;
		}
	}

	async function handleExtractFromImages(index: number, images: File[]) {
		loading = true;
		error = null;

		try {
			const extractedProduct = await aiClient.extractProductInfo(images);
			products[index] = extractedProduct;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to extract product information';
		} finally {
			loading = false;
		}
	}

	function handleManualSubmit(
		index: number,
		data: { name: string; description?: string; ingredients: string[] }
	) {
		products[index] = {
			name: data.name,
			description: data.description,
			ingredients: data.ingredients
		};
		error = null;
		comparison = null;
	}

	async function compareProducts() {
		const validProducts = products.filter((p): p is Product => p !== null);

		if (validProducts.length < 2) {
			error = 'Please add at least 2 products before comparing';
			return;
		}

		// Check if user has a profile
		if (!profileStore.isComplete) {
			showProfilePrompt = true;
			return;
		}

		loading = true;
		error = null;
		comparison = null;

		try {
			comparison = await aiClient.compareProducts(validProducts, profileStore.data);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to compare products';
		} finally {
			loading = false;
		}
	}

	function reset() {
		products = [null, null];
		comparison = null;
		error = null;
		productComponents.forEach((c) => c?.reset());
	}

	function goToProfile() {
		goto(resolveRoute('/profile'));
	}

	function openProductSearch(index: number) {
		searchTargetIndex = index;
		showProductSearch = true;
	}

	function handleProductSelect(selectedProduct: Product) {
		if (searchTargetIndex !== null) {
			products[searchTargetIndex] = selectedProduct;
			comparison = null;
			searchTargetIndex = null;
		}
	}

	let validProductCount = $derived(products.filter((p) => p !== null).length);
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
					To get personalized product comparisons tailored to your unique skin needs, please
					complete your profile first.
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

<!-- Product Search Dialog -->
<ProductSearch
	bind:open={showProductSearch}
	onselect={handleProductSelect}
	onclose={() => {
		showProductSearch = false;
		searchTargetIndex = null;
	}}
/>

<AuthGuard>
	<div class="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
		<!-- Hero Section -->
		<div
			class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
		>
			<div class="mb-4 flex items-center gap-3">
				<div class="rounded-xl bg-primary/20 p-3">
					<GitCompare class="h-8 w-8 text-primary" />
				</div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
					Product Comparison
				</h1>
			</div>
			<p class="max-w-2xl text-lg text-muted-foreground">
				Compare 2-{maxProducts} similar skincare products side-by-side to find the best match for your
				skin. Upload images or enter details manually.
			</p>
		</div>

		<!-- Profile Incomplete Banner -->
		{#if profileStore.initialized && !profileStore.isComplete}
			<Alert.Root class="mb-6 border-blue-500/50 bg-blue-500/10">
				<Info class="h-4 w-4 text-blue-600" />
				<Alert.Title>Complete your profile for personalized comparisons</Alert.Title>
				<Alert.Description class="flex items-center justify-between gap-4">
					<span>
						Get tailored product comparisons based on your skin type, concerns, and preferences.
					</span>
					<Button variant="outline" size="sm" onclick={goToProfile} class="shrink-0 gap-2">
						<User class="h-3.5 w-3.5" />
						Complete Profile
					</Button>
				</Alert.Description>
			</Alert.Root>
		{/if}

		<!-- Product Entry Forms -->
		<div class="mb-8 space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">
					Products to Compare ({validProductCount}/{products.length})
				</h2>
				<Button
					onclick={addProduct}
					variant="outline"
					size="sm"
					disabled={products.length >= maxProducts || loading}
					class="gap-2"
				>
					<Plus class="h-4 w-4" />
					Add Product
				</Button>
			</div>

			<div class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
				{#each products as product, index (index)}
					<MultiProductEntry
						bind:this={productComponents[index]}
						bind:product={products[index]}
						{index}
						{loading}
						onremove={() => removeProduct(index)}
						onextractfromimages={(images) => handleExtractFromImages(index, images)}
						onmanualsubmit={(data) => handleManualSubmit(index, data)}
						onsearchproducts={() => openProductSearch(index)}
					/>
				{/each}
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="mb-8 flex flex-wrap gap-4">
			<Button
				onclick={compareProducts}
				disabled={loading || validProductCount < 2}
				class="gap-2"
				size="lg"
			>
				<GitCompare class="h-5 w-5" />
				{loading ? 'Comparing...' : 'Compare Products'}
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

		<!-- Product Information -->
		{#if comparison}
			<div class="mb-6">
				<h2 class="mb-4 text-xl font-semibold">Product Details</h2>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each products as product (product?.name)}
						{#if product}
							<ProductInfo {product} />
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Comparison Results -->
		{#if comparison}
			<ComparisonResults {comparison} />
		{/if}
	</div>
</AuthGuard>
