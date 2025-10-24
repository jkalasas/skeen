<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { Product, ProductAssessment } from '$lib/ai/base';
	import ImageUpload from '$lib/components/custom/image-upload.svelte';
	import ManualEntry from '$lib/components/custom/manual-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import AssessmentResults from '$lib/components/custom/assessment-results.svelte';

	let { data } = $props();

	let images = $state<File[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let product = $state<Product | null>(null);
	let assessment = $state<ProductAssessment | null>(null);

	let manualEntryComponent = $state<ManualEntry | null>(null);

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
			product = await data.aiClient.extractProductInfo(images);
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
			if (product) {
				assessment = await data.aiClient.assessProduct(product);
			} else {
				assessment = await data.aiClient.assessProductFromImages(images);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to assess product';
		} finally {
			loading = false;
		}
	}

	function handleManualSubmit(data: { name: string; description?: string; ingredients: string[] }) {
		product = {
			name: data.name,
			description: data.description,
			ingredients: data.ingredients
		};
		error = null;
	}

	function reset() {
		images = [];
		product = null;
		assessment = null;
		error = null;
		manualEntryComponent?.reset();
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">Skeen - Skincare Product Assessor</h1>
		<p class="text-muted-foreground">Enter product information or upload images to get an AI-powered assessment</p>
	</div>

	<!-- Tabs for Manual Input and Image Upload -->
	<Tabs.Root value="image" class="mb-6">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="image">Image Upload</Tabs.Trigger>
			<Tabs.Trigger value="manual">Manual Entry</Tabs.Trigger>
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

		<!-- Manual Input Tab -->
		<Tabs.Content value="manual">
			<ManualEntry
				bind:this={manualEntryComponent}
				{loading}
				onsubmit={handleManualSubmit}
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
	{#if product}
		<ProductInfo {product} {loading} onassess={assessProduct} />
	{/if}

	<!-- Assessment Results -->
	{#if assessment}
		<AssessmentResults {assessment} />
	{/if}
</div>
