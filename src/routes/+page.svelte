<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { BaseAIClient, Product, ProductAssessment } from '$lib/ai/base';
	import ImageUpload from '$lib/components/custom/image-upload.svelte';
	import ProductEntry from '$lib/components/custom/product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import AssessmentResults from '$lib/components/custom/assessment-results.svelte';
	import type { PageData } from './$types';
	import { PUBLIC_GEMINI_KEY } from '$env/static/public';

	let {data}: { data: PageData } = $props();

	const aiClient = data.aiClient as BaseAIClient;

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
		console.log(PUBLIC_GEMINI_KEY);
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
				assessment = await aiClient.assessProduct(product);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to assess product';
		} finally {
			loading = false;
		}
	}

	async function handleManualSubmit(data: { name: string; description?: string; ingredients: string[] }) {
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

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">Skeen - Skincare Product Assessor</h1>
		<p class="text-muted-foreground">Enter product information or upload images to get an AI-powered assessment</p>
	</div>

	<!-- Tabs for Manual Input and Image Upload -->
	<Tabs.Root bind:value={activeTab} class="mb-6">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="image">Image Upload</Tabs.Trigger>
			<Tabs.Trigger value="productinfo">Product Info</Tabs.Trigger>
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
		<Alert.Root variant="destructive" class="mb-6">
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
