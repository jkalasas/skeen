<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { Product } from '$lib/ai/base';

	interface Props {
		product: Product;
		loading?: boolean;
		onassess: () => void;
	}

	let { product, loading = false, onassess }: Props = $props();
</script>

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
		<Button onclick={onassess} disabled={loading}>
			{loading ? 'Assessing...' : 'Assess This Product'}
		</Button>
	</Card.Footer>
</Card.Root>
