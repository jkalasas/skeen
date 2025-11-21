<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { GitCompare, AlertCircle, User, Info, Plus, LogIn } from '@lucide/svelte';
	import type { BaseAIClient, Product, ProductComparison } from '$lib/ai/base';
	import MultiProductEntry from '$lib/components/custom/multi-product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import ComparisonResults from '$lib/components/custom/comparison-results.svelte';
	import ProductSearch from '$lib/components/custom/product-search.svelte';
	import AuthGuard from '$lib/components/custom/auth-guard.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { productsStore } from '$lib/stores/products.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { PUBLIC_MAX_MULTI_COUNT } from '$env/static/public';
	import { toast } from 'svelte-sonner';

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
		const promise = aiClient.extractProductInfo(images);

		toast.promise(promise, {
			loading: 'Extracting product info...',
			success: (product) => {
				products[index] = product;
				return `Extracted: ${product.name}`;
			},
			error: 'Failed to extract product info'
		});
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
		<Dialog.Content class="sm:max-w-md glass border-none shadow-2xl">
			<Dialog.Header>
				<div class="mb-4 flex justify-center">
					<div class="rounded-full bg-primary/20 p-6 ring-4 ring-primary/10">
						<User class="h-10 w-10 text-primary" />
					</div>
				</div>
				<Dialog.Title class="text-center text-2xl font-bold">Complete Your Profile</Dialog.Title>
				<Dialog.Description class="text-center text-lg pt-2">
					To get personalized product comparisons tailored to your unique skin needs, please
					complete your profile first.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="flex-col gap-3 sm:flex-col mt-4">
				<Button onclick={goToProfile} class="w-full gap-2 rounded-full text-lg h-12 shadow-lg shadow-primary/20">
					<User class="h-5 w-5" />
					Complete Profile Now
				</Button>
				<Button variant="ghost" onclick={() => (showProfilePrompt = false)} class="w-full rounded-full">
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

<div class="container mx-auto max-w-7xl px-4">
    <!-- Hero Section -->
    <div class="py-12 sm:py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-1000">
        <div class="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20 shadow-inner">
            <GitCompare class="h-10 w-10 text-primary" />
        </div>
        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            <span class="text-gradient">Compare</span> & Decide.
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Side-by-side analysis of 2-{maxProducts} products. Find the perfect match for your skin.
        </p>
        {#if authStore.initialized && !authStore.isAuthenticated}
            <div class="mt-8 flex justify-center">
                 <Button onclick={() => authStore.signInWithGoogle()} size="lg" class="rounded-full gap-2 shadow-lg shadow-primary/20 animate-pulse-slow">
                    <LogIn class="h-5 w-5" />
                    Sign In to Compare
                </Button>
            </div>
        {/if}
    </div>

    <AuthGuard>
		<!-- Profile Incomplete Banner -->
		{#if profileStore.initialized && !profileStore.isComplete}
            <div class="mb-8 animate-in slide-in-from-top-4">
                <Alert.Root class="glass border-l-4 border-l-primary border-y-0 border-r-0 rounded-r-xl bg-primary/5">
                    <Info class="h-5 w-5 text-primary" />
                    <Alert.Title class="font-bold text-primary">Personalize Your Experience</Alert.Title>
                    <Alert.Description class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <span class="text-muted-foreground">
                             Get tailored product comparisons based on your skin type, concerns, and preferences.
                        </span>
                        <Button size="sm" onclick={goToProfile} class="shrink-0 gap-2 rounded-full shadow-md">
                            <User class="h-3.5 w-3.5" />
                            Complete Profile
                        </Button>
                    </Alert.Description>
                </Alert.Root>
            </div>
		{/if}

		<!-- Product Entry Forms -->
		<div class="glass rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl ring-1 ring-white/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold flex items-center gap-2">
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-extrabold">{validProductCount}/{products.length}</span>
                    Products
                </h2>
				<Button
					onclick={addProduct}
					variant="outline"
					disabled={products.length >= maxProducts || loading}
					class="gap-2 rounded-full border-primary/20 hover:border-primary hover:bg-primary/5"
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

            <!-- Action Buttons (Moved inside the glass card for better grouping) -->
            <div class="mt-8 pt-8 border-t border-border/50 flex flex-wrap gap-4 justify-end">
                <Button onclick={reset} variant="ghost" size="lg" disabled={loading} class="rounded-full hover:bg-destructive/10 hover:text-destructive">
                    Reset All
                </Button>
                <Button
                    onclick={compareProducts}
                    disabled={loading || validProductCount < 2}
                    class="gap-2 rounded-full shadow-lg shadow-primary/20"
                    size="lg"
                >
                    <GitCompare class="h-5 w-5" />
                    {loading ? 'Analyzing...' : 'Compare Products'}
                </Button>
            </div>
		</div>

		<!-- Error Display -->
		{#if error}
            <div class="mb-8 animate-in fade-in slide-in-from-bottom-4">
                <Alert.Root variant="destructive" class="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl">
                    <AlertCircle class="h-5 w-5" />
                    <Alert.Title class="text-lg font-semibold">Oops!</Alert.Title>
                    <Alert.Description>{error}</Alert.Description>
                </Alert.Root>
            </div>
		{/if}

		<!-- Product Information -->
		{#if comparison}
			<div class="mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
				<h2 class="text-2xl font-bold">Product Details</h2>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each products as product (product?.name)}
						{#if product}
                            <div class="glass-card rounded-2xl overflow-hidden">
							    <ProductInfo {product} />
                            </div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Comparison Results -->
		{#if comparison}
            <div class="glass-card rounded-3xl overflow-hidden ring-2 ring-primary/20 shadow-primary/10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
			    <ComparisonResults {comparison} />
            </div>
		{/if}
    </AuthGuard>
</div>
