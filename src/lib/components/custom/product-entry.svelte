<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Package, FileText, Sparkles, FlaskConical } from '@lucide/svelte';

	interface Props {
		loading?: boolean;
		onsubmit: (data: { name: string; description?: string; ingredients: string[] }) => void;
		initialName?: string;
		initialDescription?: string;
		initialIngredients?: string[];
		buttonText?: string;
	}

	let {
		loading = false,
		onsubmit,
		initialName = '',
		initialDescription = '',
		initialIngredients = [],
		buttonText = 'Assess Product'
	}: Props = $props();

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
				.map((i) => i.trim())
				.filter((i) => i.length > 0)
		});
	}

	export function reset() {
		name = '';
		description = '';
		ingredients = '';
	}
</script>

<Card.Root class="border-2 shadow-lg">
	<Card.Header class="space-y-1">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-primary/10 p-2">
				<Package class="h-5 w-5 text-primary" />
			</div>
			<Card.Title class="text-xl">Product Details</Card.Title>
		</div>
		<Card.Description>Enter your product information manually for instant analysis</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="space-y-5">
			<div class="space-y-2">
				<Label for="manual-name" class="flex items-center gap-2 text-sm font-semibold">
					<Package class="h-3.5 w-3.5" />
					Product Name *
				</Label>
				<Input
					id="manual-name"
					bind:value={name}
					placeholder="e.g., CeraVe Moisturizing Cream"
					class="h-11"
				/>
			</div>

			<div class="space-y-2">
				<Label for="manual-description" class="flex items-center gap-2 text-sm font-semibold">
					<FileText class="h-3.5 w-3.5" />
					Description (optional)
				</Label>
				<Input
					id="manual-description"
					bind:value={description}
					placeholder="e.g., Daily moisturizing cream for dry skin"
					class="h-11"
				/>
			</div>

			<div class="space-y-2">
				<Label for="manual-ingredients" class="flex items-center gap-2 text-sm font-semibold">
					<FlaskConical class="h-3.5 w-3.5" />
					Ingredients (comma-separated, optional)
				</Label>
				<Textarea
					id="manual-ingredients"
					bind:value={ingredients}
					placeholder="e.g., Hyaluronic Acid, Ceramides, Niacinamide"
					rows={4}
					class="resize-none"
				/>
				<p class="text-xs text-muted-foreground">Separate each ingredient with a comma</p>
			</div>

			<Button
				onclick={handleSubmit}
				disabled={loading || !name.trim()}
				class="h-11 w-full gap-2 text-base"
			>
				<Sparkles class="h-4 w-4" />
				{loading ? 'Saving...' : buttonText}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
