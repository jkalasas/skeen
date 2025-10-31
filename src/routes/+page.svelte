<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Sparkles, AlertCircle } from '@lucide/svelte';
	import type { BaseAIClient, Product, ProductAssessment } from '$lib/ai/base';
	import ImageUpload from '$lib/components/custom/image-upload.svelte';
	import ProductEntry from '$lib/components/custom/product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import AssessmentResults from '$lib/components/custom/assessment-results.svelte';
	import { historyStore } from '$lib/stores/history.svelte';
	import { profileStore } from '$lib/stores/profile.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const aiClient = data.aiClient as BaseAIClient;

	onMount(() => {
		profileStore.load();
	});

	let images = $state<File[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let product = $state<Product | null>(null);
	let assessment = $state<ProductAssessment | null>(null);
	let activeTab = $state('image');

	let productEntryComponent = $state<ProductEntry | null>(null);

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
</script>

<div class="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
	<!-- Hero Section -->
	<div
		class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
	>
		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-xl bg-primary/20 p-3">
				<Sparkles class="h-8 w-8 text-primary" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Skeen</h1>
		</div>
		<p class="max-w-2xl text-lg text-muted-foreground">
			Your AI-powered skincare product analyzer. Upload images or enter product details to get
			instant, science-backed assessments.
		</p>
	</div>

	<!-- Tabs for Manual Input and Image Upload -->
	<Tabs.Root bind:value={activeTab} class="mb-8">
		<Tabs.List class="grid w-full grid-cols-2 bg-muted/50 p-1">
			<Tabs.Trigger value="image" class="gap-2">📸 Image Upload</Tabs.Trigger>
			<Tabs.Trigger value="productinfo" class="gap-2">✍️ Product Info</Tabs.Trigger>
		</Tabs.List>

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
	{#if product && assessment}
		<ProductInfo {product} />
	{/if}

	<!-- Assessment Results -->
	{#if assessment}
		<AssessmentResults {assessment} />
	{/if}
</div>
