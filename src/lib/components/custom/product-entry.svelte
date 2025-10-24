<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		loading?: boolean;
		onsubmit: (data: { name: string; description?: string; ingredients: string[] }) => void;
		initialName?: string;
		initialDescription?: string;
		initialIngredients?: string[];
	}

	let { loading = false, onsubmit, initialName = '', initialDescription = '', initialIngredients = [] }: Props = $props();

	let name = $state(initialName);
	let description = $state(initialDescription);
	let ingredients = $state(initialIngredients.join(', '));

	$effect(() => {
		name = initialName;
		description = initialDescription;
		ingredients = initialIngredients.join(', ');
	});

	function handleSubmit() {
		if (!name.trim()) {
			return;
		}

		onsubmit({
			name: name.trim(),
			description: description.trim() || undefined,
			ingredients: ingredients
				.split(',')
				.map(i => i.trim())
				.filter(i => i.length > 0)
		});
	}

	export function reset() {
		name = '';
		description = '';
		ingredients = '';
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Product</Card.Title>
		<Card.Description>Enter your product information</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="manual-name">Product Name *</Label>
				<Input
					id="manual-name"
					bind:value={name}
					placeholder="e.g., CeraVe Moisturizing Cream"
				/>
			</div>

			<div class="space-y-2">
				<Label for="manual-description">Description (optional)</Label>
				<Input
					id="manual-description"
					bind:value={description}
					placeholder="e.g., Daily moisturizing cream for dry skin"
				/>
			</div>

			<div class="space-y-2">
				<Label for="manual-ingredients">Ingredients (comma-separated, optional)</Label>
				<Textarea
					id="manual-ingredients"
					bind:value={ingredients}
					placeholder="e.g., Hyaluronic Acid, Ceramides, Niacinamide"
				/>
			</div>

			<Button onclick={handleSubmit} disabled={loading || !name.trim()}>
				{loading ? 'Assessing...' : 'Assess Product'}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
