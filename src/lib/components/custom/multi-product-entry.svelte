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
		Trash2,
		SwitchCamera
	} from '@lucide/svelte';
	import type { Product } from '$lib/ai/base';
	import { onMount } from 'svelte';

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

	// Camera state
	let videoElement = $state<HTMLVideoElement | null>(null);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let stream = $state<MediaStream | null>(null);
	let isCameraActive = $state(false);
	let cameraError = $state<string | null>(null);
	let facingMode = $state<'user' | 'environment'>('environment');
	let videoReady = $state(false);

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

	onMount(() => {
		return () => {
			// Cleanup camera stream on unmount
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	});

	async function startCamera() {
		try {
			cameraError = null;
			videoReady = false;

			// Stop any existing stream first
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}

			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: facingMode }
				},
				audio: false
			});

			stream = mediaStream;
			isCameraActive = true;

			// Wait for next tick to ensure videoElement is bound
			await new Promise((resolve) => setTimeout(resolve, 100));

			if (videoElement && stream) {
				videoElement.srcObject = stream;
				videoElement.onloadedmetadata = async () => {
					try {
						await videoElement?.play();
						videoReady = true;
					} catch (err) {
						console.error('Error playing video:', err);
						cameraError = 'Could not start video playback.';
					}
				};
			}
		} catch (err) {
			console.error('Error accessing camera:', err);
			cameraError = 'Unable to access camera. Please check permissions.';
			isCameraActive = false;
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		if (videoElement) {
			videoElement.srcObject = null;
		}
		isCameraActive = false;
		videoReady = false;
	}

	function toggleCamera() {
		facingMode = facingMode === 'user' ? 'environment' : 'user';
		if (isCameraActive) {
			stopCamera();
			startCamera();
		}
	}

	function capturePhoto() {
		if (!videoElement || !canvasElement) return;

		const context = canvasElement.getContext('2d');
		if (!context) return;

		// Set canvas dimensions to match video
		canvasElement.width = videoElement.videoWidth;
		canvasElement.height = videoElement.videoHeight;

		// Draw the current video frame to canvas
		context.drawImage(videoElement, 0, 0);

		// Convert canvas to blob and create file
		canvasElement.toBlob(
			(blob) => {
				if (blob) {
					const timestamp = new Date().getTime();
					const file = new File([blob], `camera-${timestamp}.jpg`, { type: 'image/jpeg' });
					images = [...images, file];
				}
			},
			'image/jpeg',
			0.95
		);
	}

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
		stopCamera();
		if (fileInput) {
			fileInput.value = '';
		}
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
					<!-- File Upload and Camera Buttons -->
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-2">
							<Label class="text-sm font-semibold">Choose from Gallery</Label>
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
								class="w-full gap-2"
								disabled={loading}
							>
								<Upload class="h-4 w-4" />
								Choose Files
							</Button>
						</div>

						<div class="space-y-2">
							<Label class="text-sm font-semibold">Live Camera</Label>
							<Button
								onclick={() => (isCameraActive ? stopCamera() : startCamera())}
								variant="outline"
								class="w-full gap-2"
								disabled={loading}
							>
								<Camera class="h-4 w-4" />
								{isCameraActive ? 'Close Camera' : 'Open Camera'}
							</Button>
						</div>
					</div>

					<!-- Camera Error -->
					{#if cameraError}
						<div
							class="flex items-start gap-2 rounded-lg border-2 border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
						>
							<X class="mt-0.5 h-4 w-4 flex-shrink-0" />
							<span>{cameraError}</span>
						</div>
					{/if}

					<!-- Camera View -->
					{#if isCameraActive}
						<div class="space-y-3">
							<div
								class="relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-muted shadow-inner"
							>
								{#if !videoReady}
									<div class="absolute inset-0 flex items-center justify-center bg-black/90">
										<div class="flex flex-col items-center gap-2">
											<Camera class="h-6 w-6 animate-pulse text-white" />
											<p class="text-xs text-white">Loading camera...</p>
										</div>
									</div>
								{/if}
								<video
									bind:this={videoElement}
									autoplay
									playsinline
									muted
									class="h-full w-full object-cover"
								></video>
								<canvas bind:this={canvasElement} class="hidden"></canvas>
							</div>

							<div class="flex flex-wrap gap-2">
								<Button
									onclick={capturePhoto}
									disabled={loading || !videoReady}
									size="sm"
									class="flex-1 gap-2"
								>
									<Camera class="h-3.5 w-3.5" />
									Capture
								</Button>
								<Button
									onclick={toggleCamera}
									variant="outline"
									size="sm"
									disabled={loading || !videoReady}
									class="gap-2"
								>
									<SwitchCamera class="h-3.5 w-3.5" />
									Switch
								</Button>
								{#if !loading}
									<Button onclick={stopCamera} variant="outline" size="sm" class="gap-2">
										<X class="h-3.5 w-3.5" />
										Close
									</Button>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Image Previews -->
					{#if images.length > 0}
						<div class="space-y-3">
							<div class="flex items-center gap-2">
								<Badge variant="secondary" class="gap-1.5">
									<ImageIcon class="h-3 w-3" />
									{images.length}
									{images.length === 1 ? 'image' : 'images'}
								</Badge>
							</div>
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
						</div>
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
