<script lang="ts">
	import SkeenLogo from '$lib/assets/skeen.svg';
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Sparkles, AlertCircle, User, Info, Save, Search, Camera, Type, LogIn } from '@lucide/svelte';
	import type { BaseAIClient, Product, ProductAssessment } from '$lib/ai/base';
	import ImageUpload from '$lib/components/custom/image-upload.svelte';
	import ProductEntry from '$lib/components/custom/product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import AssessmentResults from '$lib/components/custom/assessment-results.svelte';
	import ProductSearch from '$lib/components/custom/product-search.svelte';
	import AuthGuard from '$lib/components/custom/auth-guard.svelte';
	import { historyStore } from '$lib/stores/history.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { productsStore } from '$lib/stores/products.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	const aiClient = data.aiClient as BaseAIClient;

	let images = $state<File[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let product = $state<Product | null>(null);
	let assessment = $state<ProductAssessment | null>(null);
	let activeTab = $state('image');
	let showProfilePrompt = $state(false);
	let showProductSearch = $state(false);

	let productEntryComponent = $state<ProductEntry | null>(null);

	onMount(() => {
		profileStore.load();
		productsStore.load();
	});

	function handleImagesChange() {
		product = null;
		assessment = null;
		error = null;
	}

	async function extractProductInfo() {
		if (images.length === 0) {
			error = 'Please select at least one image';
			return;
		}

		loading = true;
		error = null;
		product = null;
		assessment = null;

		try {
			product = await aiClient.extractProductInfo(images);
			activeTab = 'productinfo';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to extract product information';
		} finally {
			loading = false;
		}
	}

	async function assessProduct() {
		if (!product && images.length === 0) {
			error = 'Please extract product information first or upload images';
			return;
		}

		// Check if user has a profile
		if (!profileStore.isComplete) {
			showProfilePrompt = true;
			return;
		}

		loading = true;
		error = null;
		assessment = null;

		try {
			// If no product info exists but we have images, extract it first
			if (!product && images.length > 0) {
				product = await aiClient.extractProductInfo(images);
			}

			// Now assess the product
			if (product) {
				assessment = await aiClient.assessProduct(product, profileStore.data);

				// Save to history with deep clone to ensure serializability
				if (assessment) {
					const cleanProduct = JSON.parse(
						JSON.stringify({
							name: product.name,
							description: product.description || undefined,
							ingredients: product.ingredients || undefined
						})
					);

					const cleanAssessment = JSON.parse(
						JSON.stringify({
							pros: assessment.pros,
							cons: assessment.cons,
							score: assessment.score
						})
					);

					await historyStore.add(cleanProduct, cleanAssessment);
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to assess product';
		} finally {
			loading = false;
		}
	}

	async function handleManualSubmit(data: {
		name: string;
		description?: string;
		ingredients: string[];
	}) {
		product = {
			name: data.name,
			description: data.description,
			ingredients: data.ingredients
		};
		error = null;

		// Immediately assess the product
		await assessProduct();
	}

	function reset() {
		images = [];
		product = null;
		assessment = null;
		error = null;
		productEntryComponent?.reset();
	}

	function goToProfile() {
		goto(resolveRoute('/profile'));
	}

	async function saveProductToCache() {
		if (!product) return;

		const promise = productsStore.add(product);

		toast.promise(promise, {
			loading: 'Saving product...',
			success: 'Product saved to your collection!',
			error: (err) => (err instanceof Error ? err.message : 'Failed to save product')
		});
	}

	function handleProductSelect(selectedProduct: Product) {
		product = selectedProduct;
		error = null;
		assessment = null;
		activeTab = 'productinfo';

		// Update the product entry component if it exists
		if (productEntryComponent) {
			productEntryComponent.reset();
		}
	}
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
					To get personalized skincare assessments tailored to your unique skin needs, we need to know a bit more about you.
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
	onclose={() => (showProductSearch = false)}
/>

<div class="container mx-auto max-w-5xl px-4">
    <!-- Hero Section - Always Visible -->
    <div class="py-12 sm:py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-1000">
        <h1 class="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            <span class="block">Skincare Science,</span>
            <span class="text-gradient">Simplified.</span>
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Instant, AI-powered analysis for your skincare products.
            Discover what's really in your bottle.
        </p>

        {#if authStore.initialized && !authStore.isAuthenticated}
            <div class="mt-8 flex justify-center">
                    <Button onclick={() => authStore.signInWithGoogle()} size="lg" class="rounded-full gap-2 shadow-lg shadow-primary/20 animate-pulse-slow">
                    <LogIn class="h-5 w-5" />
                    Get Started with Google
                </Button>
            </div>
        {/if}
    </div>

    <!-- Main Interaction Area - Protected -->
    <AuthGuard>
		<!-- Profile Incomplete Banner -->
		{#if profileStore.initialized && !profileStore.isComplete}
            <div class="mb-8 animate-in slide-in-from-top-4">
                <Alert.Root class="glass border-l-4 border-l-primary border-y-0 border-r-0 rounded-r-xl bg-primary/5">
                    <Info class="h-5 w-5 text-primary" />
                    <Alert.Title class="font-bold text-primary">Personalize Your Experience</Alert.Title>
                    <Alert.Description class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <span class="text-muted-foreground">
                            Complete your profile to get tailored skincare recommendations based on your skin type.
                        </span>
                        <Button size="sm" onclick={goToProfile} class="shrink-0 gap-2 rounded-full shadow-md">
                            <User class="h-3.5 w-3.5" />
                            Complete Profile
                        </Button>
                    </Alert.Description>
                </Alert.Root>
            </div>
		{/if}

        <div class="glass rounded-3xl p-1 sm:p-2 shadow-2xl ring-1 ring-white/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Tabs.Root bind:value={activeTab} class="w-full">
                <div class="flex justify-center pb-6 pt-4">
                    <Tabs.List class="glass rounded-full p-1 grid grid-cols-2 w-full max-w-md h-auto bg-muted/20">
                        <Tabs.Trigger value="image" class="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                            <span class="flex items-center gap-2 font-medium">
                                <Camera class="h-4 w-4" />
                                <span>Scan Product</span>
                            </span>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="productinfo" class="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                            <span class="flex items-center gap-2 font-medium">
                                <Type class="h-4 w-4" />
                                <span>Manual Entry</span>
                            </span>
                        </Tabs.Trigger>
                    </Tabs.List>
                </div>

                <!-- Search Trigger -->
                 <div class="flex justify-center mb-8">
                    <Button
                        onclick={() => showProductSearch = true}
                        variant="outline"
                        class="rounded-full border-dashed border-2 px-8 py-6 hover:bg-primary/5 hover:border-primary/50 transition-all gap-2 text-muted-foreground hover:text-primary"
                    >
                        <Search class="h-4 w-4" />
                        Search your collection ({productsStore.items.length})
                    </Button>
                </div>

                <div class="px-4 pb-8 sm:px-8">
                     <!-- Content -->
                    <Tabs.Content value="image" class="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                        <ImageUpload
                            bind:images
                            {loading}
                            onimageschange={handleImagesChange}
                            onextract={extractProductInfo}
                            onassess={assessProduct}
                            onreset={reset}
                        />
                    </Tabs.Content>

                    <Tabs.Content value="productinfo" class="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                        <div class="glass-card rounded-2xl p-6 bg-white/40 dark:bg-black/20">
                            <ProductEntry
                                bind:this={productEntryComponent}
                                {loading}
                                onsubmit={handleManualSubmit}
                                initialName={product?.name ?? ''}
                                initialDescription={product?.description ?? ''}
                                initialIngredients={product?.ingredients ?? []}
                            />
                        </div>
                    </Tabs.Content>
                </div>
            </Tabs.Root>
        </div>

        <!-- Error Display -->
        {#if error}
            <div class="mt-8 animate-in fade-in slide-in-from-bottom-4">
                 <Alert.Root variant="destructive" class="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl">
                    <AlertCircle class="h-5 w-5" />
                    <Alert.Title class="text-lg font-semibold">Oops!</Alert.Title>
                    <Alert.Description class="text-base">{error}</Alert.Description>
                </Alert.Root>
            </div>
        {/if}

        {#if product}
            <div class="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div class="flex items-center justify-between">
                     <h2 class="text-2xl font-bold flex items-center gap-3">
                        <Sparkles class="h-6 w-6 text-primary" />
                        Analysis Result
                    </h2>
                     <Button
                        onclick={saveProductToCache}
                        variant="secondary"
                        class="rounded-full gap-2 shadow-sm hover:shadow-md transition-all"
                        disabled={loading || !!productsStore.findByName(product.name)}
                    >
                        <Save class="h-4 w-4" />
                        {productsStore.findByName(product.name) ? 'Saved' : 'Save to Collection'}
                    </Button>
                </div>

                <div class="glass-card rounded-3xl overflow-hidden">
                    <ProductInfo {product} />
                </div>

                {#if assessment}
                    <div class="glass-card rounded-3xl overflow-hidden ring-2 ring-primary/20 shadow-primary/10 shadow-2xl">
                        <AssessmentResults {assessment} />
                    </div>
                {/if}
            </div>
        {/if}
    </AuthGuard>

</div>
