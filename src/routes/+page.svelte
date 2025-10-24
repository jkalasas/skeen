<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import type { Product, ProductAssessment } from '$lib/ai/base';

	let { data } = $props();

	let images = $state<File[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let product = $state<Product | null>(null);
	let assessment = $state<ProductAssessment | null>(null);

	// Manual input fields
	let manualName = $state('');
	let manualDescription = $state('');
	let manualIngredients = $state('');

	let fileInput = $state<HTMLInputElement | null>(null);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			images = Array.from(target.files);
			product = null;
			assessment = null;
			error = null;
		}
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

	function useManualInput() {
		if (!manualName.trim()) {
			error = 'Please enter a product name';
			return;
		}

		product = {
			name: manualName.trim(),
			description: manualDescription.trim() || undefined,
			ingredients: manualIngredients
				.split(',')
				.map(i => i.trim())
				.filter(i => i.length > 0)
		};
		
		error = null;
	}

	function reset() {
		images = [];
		product = null;
		assessment = null;
		error = null;
		manualName = '';
		manualDescription = '';
		manualIngredients = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">Skeen - Skincare Product Assessor</h1>
		<p class="text-muted-foreground">Upload images of your skincare product to get an AI-powered assessment</p>
	</div>

	<!-- Manual Input -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Manual Product Entry</Card.Title>
			<Card.Description>Enter product information manually</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="manual-name">Product Name *</Label>
					<Input
						id="manual-name"
						bind:value={manualName}
						placeholder="e.g., CeraVe Moisturizing Cream"
					/>
				</div>

				<div class="space-y-2">
					<Label for="manual-description">Description (optional)</Label>
					<Input
						id="manual-description"
						bind:value={manualDescription}
						placeholder="e.g., Daily moisturizing cream for dry skin"
					/>
				</div>

				<div class="space-y-2">
					<Label for="manual-ingredients">Ingredients (comma-separated, optional)</Label>
					<Input
						id="manual-ingredients"
						bind:value={manualIngredients}
						placeholder="e.g., Hyaluronic Acid, Ceramides, Niacinamide"
					/>
				</div>

				<Button onclick={useManualInput} disabled={loading}>
					Use This Product Info
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Image Upload -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Upload Product Images</Card.Title>
			<Card.Description>Or select one or more images of your skincare product</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="file-upload">Product Images</Label>
					<Input
						id="file-upload"
						bind:ref={fileInput}
						type="file"
						accept="image/*"
						multiple
						onchange={handleFileSelect}
					/>
				</div>

				{#if images.length > 0}
					<div class="space-y-3">
						<div>
							<p class="mb-2 text-sm font-medium">{images.length} image(s) selected:</p>
							<div class="flex flex-wrap gap-2">
								{#each images as image}
									<Badge variant="secondary">{image.name}</Badge>
								{/each}
							</div>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button onclick={extractProductInfo} disabled={loading}>
								{loading ? 'Extracting...' : 'Extract Product Info'}
							</Button>
							<Button onclick={assessProduct} disabled={loading} variant="secondary">
								{loading ? 'Assessing...' : 'Assess Product Directly'}
							</Button>
							<Button onclick={reset} variant="outline" disabled={loading}>
								Reset
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Error Display -->
	{#if error}
		<Alert.Root variant="destructive" class="mb-6">
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Product Information -->
	{#if product}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title>Product Information</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1">
					<h3 class="text-sm font-medium">Name</h3>
					<p class="text-sm text-muted-foreground">{product.name}</p>
				</div>

				{#if product.description}
					<div class="space-y-1">
						<h3 class="text-sm font-medium">Description</h3>
						<p class="text-sm text-muted-foreground">{product.description}</p>
					</div>
				{/if}

				{#if product.ingredients && product.ingredients.length > 0}
					<div class="space-y-2">
						<h3 class="text-sm font-medium">Ingredients</h3>
						<div class="flex flex-wrap gap-2">
							{#each product.ingredients as ingredient}
								<Badge variant="secondary">{ingredient}</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer>
				<Button onclick={assessProduct} disabled={loading}>
					{loading ? 'Assessing...' : 'Assess This Product'}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}

	<!-- Assessment Results -->
	{#if assessment}
		<Card.Root>
			<Card.Header>
				<Card.Title>Assessment Results</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Score -->
				<div class="text-center">
					<div class="mb-2 text-6xl font-bold text-primary">
						{assessment.score.toFixed(1)}/10
					</div>
					<p class="text-sm text-muted-foreground">Overall Score</p>
				</div>

				<!-- Pros -->
				<div class="space-y-3">
					<h3 class="flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						Pros
					</h3>
					<ul class="space-y-2">
						{#each assessment.pros as pro}
							<li class="flex gap-2 text-sm">
								<span class="text-green-600 dark:text-green-400">✓</span>
								<span>{pro}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Cons -->
				<div class="space-y-3">
					<h3 class="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="15" y1="9" x2="9" y2="15"></line>
							<line x1="9" y1="9" x2="15" y2="15"></line>
						</svg>
						Cons
					</h3>
					<ul class="space-y-2">
						{#each assessment.cons as con}
							<li class="flex gap-2 text-sm">
								<span class="text-red-600 dark:text-red-400">✗</span>
								<span>{con}</span>
							</li>
						{/each}
					</ul>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
