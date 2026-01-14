<script lang="ts">
	import SkeenLogo from '$lib/assets/skeen.svg';
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { AlertCircle, User, Info, Save, Search } from '@lucide/svelte';
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
			error: (err) => err.message || 'Failed to save product'
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
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<div class="mb-4 flex justify-center">
					<div class="rounded-full bg-primary/10 p-4">
						<User class="h-8 w-8 text-primary" />
					</div>
				</div>
				<Dialog.Title class="text-center text-xl">Complete Your Profile First</Dialog.Title>
				<Dialog.Description class="text-center">
					To get personalized skincare assessments tailored to your unique skin needs, please
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
	onclose={() => (showProductSearch = false)}
/>

<AuthGuard>
	<div class="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
		<!-- Hero Section -->
		<div
			class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
		>
			<div class="mb-4 flex items-center gap-3">
				<div class="rounded-xl bg-primary/20 p-3">
					<img src={SkeenLogo} alt="Skeen Logo" class="h-12 w-12" />
				</div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Skeen</h1>
			</div>
			<p class="max-w-2xl text-lg text-muted-foreground">
				Your AI-powered skincare product analyzer. Upload images or enter product details to get
				instant, science-backed assessments.
			</p>
		</div>

		<!-- Profile Incomplete Banner -->
		{#if profileStore.initialized && !profileStore.isComplete}
			<Alert.Root class="mb-6 border-blue-500/50 bg-blue-500/10">
				<Info class="h-4 w-4 text-blue-600" />
				<Alert.Title>Complete your profile for personalized assessments</Alert.Title>
				<Alert.Description class="flex items-center justify-between gap-4">
					<span>
						Get tailored skincare recommendations based on your skin type, concerns, and
						preferences.
					</span>
					<Button variant="outline" size="sm" onclick={goToProfile} class="shrink-0 gap-2">
						<User class="h-3.5 w-3.5" />
						Complete Profile
					</Button>
				</Alert.Description>
			</Alert.Root>
		{/if}

		<!-- Tabs for Manual Input and Image Upload -->
		<Tabs.Root bind:value={activeTab} class="mb-8">
			<Tabs.List class="grid w-full grid-cols-2 bg-muted/50 p-1">
				<Tabs.Trigger value="image" class="gap-2">📸 Image Upload</Tabs.Trigger>
				<Tabs.Trigger value="productinfo" class="gap-2">✍️ Product Info</Tabs.Trigger>
			</Tabs.List>

			<!-- Search Products Button -->
			<div class="mt-4 mb-4">
				<Button
					onclick={() => (showProductSearch = true)}
					variant="outline"
					class="w-full gap-2"
					disabled={loading}
				>
					<Search class="h-4 w-4" />
					Search Saved Products ({productsStore.items.length})
				</Button>
			</div>

			<!-- Image Upload Tab -->
			<Tabs.Content value="image">
				<ImageUpload
					bind:images
					{loading}
					onimageschange={handleImagesChange}
					onextract={extractProductInfo}
					onassess={assessProduct}
					onreset={reset}
				/>
			</Tabs.Content>

			<!-- Product Info Tab -->
			<Tabs.Content value="productinfo">
				<ProductEntry
					bind:this={productEntryComponent}
					{loading}
					onsubmit={handleManualSubmit}
					initialName={product?.name ?? ''}
					initialDescription={product?.description ?? ''}
					initialIngredients={product?.ingredients ?? []}
				/>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Error Display -->
		{#if error}
			<Alert.Root variant="destructive" class="mb-6 border-destructive/50">
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>{error}</Alert.Description>
			</Alert.Root>
		{/if}

		<!-- Product Information -->
		{#if product && !assessment}
			<div class="mb-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold">Extracted Product Information</h2>
					<Button
						onclick={saveProductToCache}
						variant="outline"
						size="sm"
						class="gap-2"
						disabled={loading || !!productsStore.findByName(product.name)}
					>
						<Save class="h-4 w-4" />
						{productsStore.findByName(product.name) ? 'Already Saved' : 'Save to Collection'}
					</Button>
				</div>
				<ProductInfo {product} />
			</div>
		{/if}

		<!-- Product Information (with assessment) -->
		{#if product && assessment}
			<ProductInfo {product} />

			<!-- Save to Collection Button under ProductInfo when assessment exists -->
			<div class="mb-6 flex justify-end">
				<Button
					onclick={saveProductToCache}
					variant="outline"
					size="sm"
					class="gap-2"
					disabled={loading || !!productsStore.findByName(product.name)}
				>
					<Save class="h-4 w-4" />
					{productsStore.findByName(product.name) ? 'Already Saved' : 'Add to Products'}
				</Button>
			</div>
		{/if}

		<!-- Assessment Results -->
		{#if assessment}
			<AssessmentResults {assessment} />
		{/if}
	</div>
</AuthGuard>
