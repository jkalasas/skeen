<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Camera, SwitchCamera, X, Sparkles, RefreshCw, Image as ImageIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	interface Props {
		images: File[];
		loading?: boolean;
		onimageschange: (images: File[]) => void;
		onextract: () => void;
		onassess: () => void;
		onreset: () => void;
	}

	let {
		images = $bindable(),
		loading = false,
		onimageschange,
		onextract,
		onassess,
		onreset
	}: Props = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let videoElement = $state<HTMLVideoElement | null>(null);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let stream = $state<MediaStream | null>(null);
	let isCameraActive = $state(false);
	let cameraError = $state<string | null>(null);
	let facingMode = $state<'user' | 'environment'>('environment');
	let videoReady = $state(false);

	// Generate preview URLs from images
	let imagePreviews = $derived(images.map((file) => URL.createObjectURL(file)));

	// Cleanup preview URLs on component unmount
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
					onimageschange(images);
				}
			},
			'image/jpeg',
			0.95
		);
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const newImages = Array.from(target.files);
			images = [...images, ...newImages];
			onimageschange(images);
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
		stopCamera();
		onreset();
	}
</script>

<Card.Root class="border-2 shadow-lg">
	<Card.Header class="space-y-1">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-primary/10 p-2">
				<ImageIcon class="h-5 w-5 text-primary" />
			</div>
			<Card.Title class="text-xl">Upload Product Images</Card.Title>
		</div>
		<Card.Description
			>Select or capture images of your skincare product for analysis</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="space-y-6">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="file-upload" class="text-sm font-semibold">Choose from Gallery</Label>
					<div class="relative">
						<Input
							id="file-upload"
							bind:ref={fileInput}
							type="file"
							accept="image/*"
							multiple
							onchange={handleFileSelect}
							class="h-full file:mr-4 file:mb-2 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-semibold">Live Camera</Label>
					<Button
						onclick={() => (isCameraActive ? stopCamera() : startCamera())}
						variant="outline"
						class="h-13 w-full gap-2"
						disabled={loading}
					>
						<Camera class="h-4 w-4" />
						{isCameraActive ? 'Close Camera' : 'Open Camera'}
					</Button>
				</div>
			</div>

			{#if cameraError}
				<div
					class="flex items-start gap-2 rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<X class="mt-0.5 h-4 w-4 flex-shrink-0" />
					<span>{cameraError}</span>
				</div>
			{/if}

			{#if isCameraActive}
				<div class="space-y-4">
					<div
						class="relative aspect-[3/4] overflow-hidden rounded-xl border-2 bg-muted shadow-inner"
					>
						{#if !videoReady}
							<div class="absolute inset-0 flex items-center justify-center bg-black/90">
								<div class="flex flex-col items-center gap-3">
									<Camera class="h-8 w-8 animate-pulse text-white" />
									<p class="text-sm text-white">Loading camera...</p>
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
							class="flex-1 gap-2 sm:flex-none"
						>
							<Camera class="h-4 w-4" />
							Capture Photo
						</Button>
						<Button
							onclick={toggleCamera}
							variant="outline"
							disabled={loading || !videoReady}
							class="gap-2"
						>
							<SwitchCamera class="h-4 w-4" />
							Switch
						</Button>
						{#if !loading}
							<Button onclick={stopCamera} variant="outline" class="gap-2">
								<X class="h-4 w-4" />
								Close
							</Button>
						{/if}
					</div>
				</div>
			{/if}

			{#if images.length > 0}
				<div class="space-y-4">
					<div class="rounded-lg bg-muted/50 p-4">
						<div class="mb-4 flex items-center gap-2">
							<Badge variant="secondary" class="gap-1.5">
								<ImageIcon class="h-3 w-3" />
								{images.length}
								{images.length === 1 ? 'image' : 'images'}
							</Badge>
						</div>

						<!-- Image Previews Grid -->
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
							{#each images as image, index (index)}
								<div
									class="group relative aspect-square overflow-hidden rounded-xl border-2 bg-muted shadow-sm transition-shadow hover:shadow-md"
								>
									<img
										src={imagePreviews[index]}
										alt={image.name}
										class="h-full w-full object-cover"
									/>
									<div
										class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
									>
										<div class="flex h-full flex-col items-center justify-end gap-2 p-3">
											<p
												class="w-full truncate text-center text-xs font-medium text-white"
												title={image.name}
											>
												{image.name}
											</p>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => removeImage(index)}
												disabled={loading}
												class="w-full gap-1.5"
											>
												<X class="h-3 w-3" />
												Remove
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="flex flex-wrap gap-2 pt-2">
						<Button onclick={onextract} disabled={loading} class="flex-1 gap-2 sm:flex-none">
							<Sparkles class="h-4 w-4" />
							{loading ? 'Extracting...' : 'Extract Product Info'}
						</Button>
						<Button
							onclick={onassess}
							disabled={loading}
							variant="secondary"
							class="flex-1 gap-2 sm:flex-none"
						>
							<Sparkles class="h-4 w-4" />
							{loading ? 'Assessing...' : 'Assess Directly'}
						</Button>
						<Button onclick={handleReset} variant="outline" disabled={loading} class="gap-2">
							<RefreshCw class="h-4 w-4" />
							Reset
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
