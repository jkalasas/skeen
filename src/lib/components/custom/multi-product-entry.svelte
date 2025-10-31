<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Camera,
		Upload,
		X,
		Package,
		FileText,
		FlaskConical,
		Image as ImageIcon,
		Trash2
	} from '@lucide/svelte';
	import type { Product } from '$lib/ai/base';

	interface Props {
		product: Product | null;
		index: number;
		loading?: boolean;
		onremove: () => void;
		onextractfromimages: (images: File[]) => void;
		onmanualsubmit: (data: { name: string; description?: string; ingredients: string[] }) => void;
	}

	let {
		product = $bindable(),
		index,
		loading = false,
		onremove,
		onextractfromimages,
		onmanualsubmit
	}: Props = $props();

	let activeTab = $state<string>('image');
	let images = $state<File[]>([]);
	let name = $state('');
	let description = $state('');
	let ingredientsText = $state('');
	let fileInput = $state<HTMLInputElement | null>(null);

	// Update form when product changes
	$effect(() => {
		if (product) {
			name = product.name || '';
			description = product.description || '';
			ingredientsText = product.ingredients?.join(', ') || '';
		}
	});

	let imagePreviews = $derived(images.map((file) => URL.createObjectURL(file)));

	$effect(() => {
		return () => {
			imagePreviews.forEach((url) => URL.revokeObjectURL(url));
		};
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			images = [...images, ...Array.from(target.files)];
		}
	}

	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
	}

	function handleExtractFromImages() {
		if (images.length > 0) {
			onextractfromimages(images);
			activeTab = 'manual';
		}
	}

	function handleManualSubmit() {
		const ingredients = ingredientsText
			.split(',')
			.map((i) => i.trim())
			.filter((i) => i.length > 0);

		onmanualsubmit({
			name,
			description: description || undefined,
			ingredients
		});
	}

	export function reset() {
		images = [];
		name = '';
		description = '';
		ingredientsText = '';
		activeTab = 'image';
	}
</script>

<Card.Root class="relative border-2">
	<Button
		variant="ghost"
		size="sm"
		onclick={onremove}
		class="absolute top-3 right-3 z-10"
		disabled={loading}
	>
		<Trash2 class="h-4 w-4 text-destructive" />
	</Button>

	<Card.Header>
		<Card.Title>Product {index + 1}</Card.Title>
	</Card.Header>

	<Card.Content>
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="grid w-full grid-cols-2 bg-muted/50 p-1">
				<Tabs.Trigger value="image">📸 Image</Tabs.Trigger>
				<Tabs.Trigger value="manual">✍️ Manual</Tabs.Trigger>
			</Tabs.List>

			<!-- Image Upload Tab -->
			<Tabs.Content value="image">
				<div class="space-y-4">
					<!-- File Input -->
					<div>
						<Label>Upload Images</Label>
						<input
							bind:this={fileInput}
							type="file"
							accept="image/*"
							multiple
							onchange={handleFileSelect}
							class="hidden"
						/>
						<Button
							variant="outline"
							onclick={() => fileInput?.click()}
							class="mt-2 w-full gap-2"
							disabled={loading}
						>
							<Upload class="h-4 w-4" />
							Choose Files
						</Button>
					</div>

					<!-- Image Previews -->
					{#if images.length > 0}
						<div class="grid grid-cols-2 gap-2">
							{#each imagePreviews as preview, i (i)}
								<div class="relative">
									<img
										src={preview}
										alt="Preview {i + 1}"
										class="h-24 w-full rounded object-cover"
									/>
									<Button
										variant="destructive"
										size="sm"
										onclick={() => removeImage(i)}
										class="absolute top-1 right-1 h-6 w-6 p-0"
										disabled={loading}
									>
										<X class="h-3 w-3" />
									</Button>
								</div>
							{/each}
						</div>

						<Button onclick={handleExtractFromImages} disabled={loading} class="w-full gap-2">
							<ImageIcon class="h-4 w-4" />
							{loading ? 'Extracting...' : 'Extract Product Info'}
						</Button>
					{/if}
				</div>
			</Tabs.Content>

			<!-- Manual Entry Tab -->
			<Tabs.Content value="manual">
				<div class="space-y-4">
					<div>
						<Label for="name-{index}">
							<Package class="mr-1 inline h-3.5 w-3.5" />
							Product Name *
						</Label>
						<Input
							id="name-{index}"
							bind:value={name}
							placeholder="e.g., CeraVe Moisturizing Cream"
							disabled={loading}
						/>
					</div>

					<div>
						<Label for="description-{index}">
							<FileText class="mr-1 inline h-3.5 w-3.5" />
							Description (optional)
						</Label>
						<Textarea
							id="description-{index}"
							bind:value={description}
							placeholder="e.g., Daily moisturizing cream for dry skin"
							disabled={loading}
							rows={2}
						/>
					</div>

					<div>
						<Label for="ingredients-{index}">
							<FlaskConical class="mr-1 inline h-3.5 w-3.5" />
							Ingredients (comma-separated, optional)
						</Label>
						<Textarea
							id="ingredients-{index}"
							bind:value={ingredientsText}
							placeholder="e.g., Hyaluronic Acid, Ceramides, Niacinamide"
							disabled={loading}
							rows={2}
						/>
						<p class="mt-1 text-xs text-muted-foreground">Separate each ingredient with a comma</p>
					</div>

					<Button onclick={handleManualSubmit} disabled={loading || !name} class="w-full">
						{loading ? 'Saving...' : 'Save Product'}
					</Button>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Product Preview -->
		{#if product}
			<div class="mt-4 space-y-2 rounded-lg border bg-muted/20 p-3">
				<div class="flex items-center gap-2">
					<Badge variant="secondary">Saved</Badge>
					<span class="font-semibold">{product.name}</span>
				</div>
				{#if product.description}
					<p class="text-xs text-muted-foreground">{product.description}</p>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
