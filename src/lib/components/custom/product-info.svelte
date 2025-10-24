<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Package, FileText, FlaskConical } from '@lucide/svelte';
	import type { Product } from '$lib/ai/base';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();
</script>

<Card.Root class="mb-6 border-2 shadow-lg bg-gradient-to-br from-background to-muted/20">
	<Card.Header class="space-y-1">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-primary/10 p-2">
				<Package class="h-5 w-5 text-primary" />
			</div>
			<Card.Title class="text-xl">Product Information</Card.Title>
		</div>
	</Card.Header>
	<Card.Content class="space-y-5">
		<div class="space-y-2 rounded-lg bg-background/50 p-4 border">
			<h3 class="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
				<Package class="h-3.5 w-3.5" />
				Product Name
			</h3>
			<p class="text-base font-medium">{product.name}</p>
		</div>

		{#if product.description}
			<div class="space-y-2 rounded-lg bg-background/50 p-4 border">
				<h3 class="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
					<FileText class="h-3.5 w-3.5" />
					Description
				</h3>
				<p class="text-base leading-relaxed">{product.description}</p>
			</div>
		{/if}

		{#if product.ingredients && product.ingredients.length > 0}
			<div class="space-y-3 rounded-lg bg-background/50 p-4 border">
				<h3 class="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
					<FlaskConical class="h-3.5 w-3.5" />
					Ingredients ({product.ingredients.length})
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each product.ingredients as ingredient}
						<Badge variant="secondary" class="px-3 py-1.5 text-sm">{ingredient}</Badge>
					{/each}
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
