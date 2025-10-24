<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		images: File[];
		loading?: boolean;
		onimageschange: (images: File[]) => void;
		onextract: () => void;
		onassess: () => void;
		onreset: () => void;
	}

	let { images = $bindable(), loading = false, onimageschange, onextract, onassess, onreset }: Props = $props();

	let fileInput = $state<HTMLInputElement | null>(null);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const newImages = Array.from(target.files);
			images = newImages;
			onimageschange(newImages);
		}
	}

	function handleReset() {
		images = [];
		if (fileInput) {
			fileInput.value = '';
		}
		onreset();
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Upload Product Images</Card.Title>
		<Card.Description>Select one or more images of your skincare product</Card.Description>
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
						<Button onclick={onextract} disabled={loading}>
							{loading ? 'Extracting...' : 'Extract Product Info'}
						</Button>
						<Button onclick={onassess} disabled={loading} variant="secondary">
							{loading ? 'Assessing...' : 'Assess Product Directly'}
						</Button>
						<Button onclick={handleReset} variant="outline" disabled={loading}>
							Reset
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
