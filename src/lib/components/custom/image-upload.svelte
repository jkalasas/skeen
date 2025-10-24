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
	let cameraInput = $state<HTMLInputElement | null>(null);
	
	// Generate preview URLs from images
	let imagePreviews = $derived(images.map(file => URL.createObjectURL(file)));

	// Cleanup preview URLs on component unmount
	$effect(() => {
		return () => {
			imagePreviews.forEach(url => URL.revokeObjectURL(url));
		};
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const newImages = Array.from(target.files);
			images = [...images, ...newImages];
			onimageschange(images);
		}
	}

	function handleCameraCapture(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const newImages = Array.from(target.files);
			images = [...images, ...newImages];
			onimageschange(images);
			// Reset the input so the same image can be captured again
			if (cameraInput) {
				cameraInput.value = '';
			}
		}
	}

	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
		onimageschange(images);
	}

	function handleReset() {
		images = [];
		if (fileInput) {
			fileInput.value = '';
		}
		if (cameraInput) {
			cameraInput.value = '';
		}
		onreset();
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Upload Product Images</Card.Title>
		<Card.Description>Select or capture images of your skincare product</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="file-upload">Choose from Gallery</Label>
					<Input
						id="file-upload"
						bind:ref={fileInput}
						type="file"
						accept="image/*"
						multiple
						onchange={handleFileSelect}
					/>
				</div>

				<div class="space-y-2">
					<Label for="camera-upload">Use Camera (Mobile)</Label>
					<Input
						id="camera-upload"
						bind:ref={cameraInput}
						type="file"
						accept="image/*"
						capture="environment"
						multiple
						onchange={handleCameraCapture}
					/>
				</div>
			</div>

			{#if images.length > 0}
				<div class="space-y-3">
					<div>
						<p class="mb-3 text-sm font-medium">{images.length} image(s) selected</p>
						
						<!-- Image Previews Grid -->
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
							{#each images as image, index}
								<div class="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
									<img
										src={imagePreviews[index]}
										alt={image.name}
										class="h-full w-full object-cover"
									/>
									<div class="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
										<div class="flex h-full flex-col items-center justify-center gap-2 p-2">
											<p class="truncate text-xs text-white" title={image.name}>
												{image.name}
											</p>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => removeImage(index)}
												disabled={loading}
											>
												Remove
											</Button>
										</div>
									</div>
								</div>
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
							Reset All
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
