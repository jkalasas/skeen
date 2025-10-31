<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { GitCompare, AlertCircle, User, Info } from '@lucide/svelte';
	import type { BaseAIClient, Product, ProductComparison } from '$lib/ai/base';
	import ProductEntry from '$lib/components/custom/product-entry.svelte';
	import ProductInfo from '$lib/components/custom/product-info.svelte';
	import ComparisonResults from '$lib/components/custom/comparison-results.svelte';
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
	let product1 = $state<Product | null>(null);
	let product2 = $state<Product | null>(null);
	let comparison = $state<ProductComparison | null>(null);
	let showProfilePrompt = $state(false);

	let product1EntryComponent = $state<ProductEntry | null>(null);
	let product2EntryComponent = $state<ProductEntry | null>(null);

	async function handleProduct1Submit(data: {
		name: string;
		description?: string;
		ingredients: string[];
	}) {
		product1 = {
			name: data.name,
			description: data.description,
			ingredients: data.ingredients
		};
		error = null;
		comparison = null;
	}

	async function handleProduct2Submit(data: {
		name: string;
		description?: string;
		ingredients: string[];
	}) {
		product2 = {
			name: data.name,
			description: data.description,
			ingredients: data.ingredients
		};
		error = null;
		comparison = null;
	}

	async function compareProducts() {
		if (!product1 || !product2) {
			error = 'Please enter both products before comparing';
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
			comparison = await aiClient.compareProducts(product1, product2, profileStore.data);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to compare products';
		} finally {
			loading = false;
		}
	}

	function reset() {
		product1 = null;
		product2 = null;
		comparison = null;
		error = null;
		product1EntryComponent?.reset();
		product2EntryComponent?.reset();
	}

	function goToProfile() {
		goto(resolveRoute('/profile'));
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

<div class="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
	<!-- Hero Section -->
	<div
		class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
	>
		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-xl bg-primary/20 p-3">
				<GitCompare class="h-8 w-8 text-primary" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Product Comparison</h1>
		</div>
		<p class="max-w-2xl text-lg text-muted-foreground">
			Compare two similar skincare products side-by-side to find the best match for your skin.
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
	<div class="mb-8 grid gap-6 lg:grid-cols-2">
		<div>
			<h2 class="mb-4 text-xl font-semibold">Product 1</h2>
			<ProductEntry
				bind:this={product1EntryComponent}
				{loading}
				onsubmit={handleProduct1Submit}
				initialName={product1?.name ?? ''}
				initialDescription={product1?.description ?? ''}
				initialIngredients={product1?.ingredients ?? []}
			/>
		</div>
		<div>
			<h2 class="mb-4 text-xl font-semibold">Product 2</h2>
			<ProductEntry
				bind:this={product2EntryComponent}
				{loading}
				onsubmit={handleProduct2Submit}
				initialName={product2?.name ?? ''}
				initialDescription={product2?.description ?? ''}
				initialIngredients={product2?.ingredients ?? []}
			/>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="mb-8 flex flex-wrap gap-4">
		<Button
			onclick={compareProducts}
			disabled={loading || !product1 || !product2}
			class="gap-2"
			size="lg"
		>
			<GitCompare class="h-5 w-5" />
			{loading ? 'Comparing...' : 'Compare Products'}
		</Button>
		<Button onclick={reset} variant="outline" size="lg" disabled={loading}>Reset</Button>
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
	{#if product1 && product2 && comparison}
		<div class="mb-6 grid gap-6 lg:grid-cols-2">
			<ProductInfo product={product1} />
			<ProductInfo product={product2} />
		</div>
	{/if}

	<!-- Comparison Results -->
	{#if comparison}
		<ComparisonResults
			{comparison}
			product1Name={product1?.name ?? 'Product 1'}
			product2Name={product2?.name ?? 'Product 2'}
		/>
	{/if}
</div>
