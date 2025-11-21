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
		SwitchCamera,
		Search
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
		onsearchproducts?: () => void;
	}

	let {
		product = $bindable(),
		index,
		loading = false,
		onremove,
		onextractfromimages,
		onmanualsubmit,
		onsearchproducts
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

<div class="glass-card relative rounded-2xl transition-all hover:scale-[1.01] hover:shadow-xl duration-300 bg-white/40 dark:bg-black/40 border-white/20">
	<Button
		variant="ghost"
		size="icon"
		onclick={onremove}
		class="absolute top-3 right-3 z-20 rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
		disabled={loading}
	>
		<Trash2 class="h-4 w-4" />
	</Button>

	<div class="p-4 sm:p-6 space-y-5">
        <h3 class="font-bold text-lg pr-8 text-gradient">Product {index + 1}</h3>

		{#if onsearchproducts}
			<div class="mb-2">
				<Button
					onclick={onsearchproducts}
					variant="outline"
					class="w-full gap-2 rounded-full border-dashed hover:border-primary/50 hover:text-primary"
					disabled={loading}
					size="sm"
				>
					<Search class="h-3.5 w-3.5" />
					Search Saved Products
				</Button>
			</div>
		{/if}

		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-full mb-4">
				<Tabs.Trigger value="image" class="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">📸 Image</Tabs.Trigger>
				<Tabs.Trigger value="manual" class="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">✍️ Manual</Tabs.Trigger>
			</Tabs.List>

			<!-- Image Upload Tab -->
			<Tabs.Content value="image" class="mt-0">
				<div class="space-y-4">
					<!-- File Upload and Camera Buttons -->
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-2">
							<Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gallery</Label>
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
								class="w-full gap-2 rounded-xl h-12 hover:bg-primary/5 hover:border-primary/30"
								disabled={loading}
							>
								<Upload class="h-4 w-4" />
								Choose Files
							</Button>
						</div>

						<div class="space-y-2">
							<Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Camera</Label>
							<Button
								onclick={() => (isCameraActive ? stopCamera() : startCamera())}
								variant="outline"
								class="w-full gap-2 rounded-xl h-12 hover:bg-primary/5 hover:border-primary/30"
								disabled={loading}
							>
								<Camera class="h-4 w-4" />
								{isCameraActive ? 'Close' : 'Open'}
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
						<div class="space-y-3 animate-in fade-in">
							<div
								class="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-primary/20 bg-black shadow-inner"
							>
								{#if !videoReady}
									<div class="absolute inset-0 flex items-center justify-center bg-black/90">
										<div class="flex flex-col items-center gap-2">
											<Camera class="h-6 w-6 animate-pulse text-primary" />
											<p class="text-xs text-white/80">Initializing...</p>
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
									class="flex-1 gap-2 rounded-full shadow-lg shadow-primary/20"
								>
									<Camera class="h-3.5 w-3.5" />
									Capture
								</Button>
								<Button
									onclick={toggleCamera}
									variant="outline"
									size="sm"
									disabled={loading || !videoReady}
									class="gap-2 rounded-full"
								>
									<SwitchCamera class="h-3.5 w-3.5" />
									Switch
								</Button>
							</div>
						</div>
					{/if}

					<!-- Image Previews -->
					{#if images.length > 0}
						<div class="space-y-3 animate-in fade-in">
							<div class="flex items-center gap-2">
								<Badge variant="secondary" class="gap-1.5 rounded-full px-2.5">
									<ImageIcon class="h-3 w-3" />
									{images.length}
								</Badge>
							</div>
							<div class="grid grid-cols-2 gap-2">
								{#each imagePreviews as preview, i (i)}
									<div class="relative group">
										<img
											src={preview}
											alt="Preview {i + 1}"
											class="h-24 w-full rounded-xl object-cover border border-border"
										/>
										<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onclick={() => removeImage(i)}
                                                class="h-8 w-8 rounded-full"
                                                disabled={loading}
                                            >
                                                <X class="h-4 w-4" />
                                            </Button>
                                        </div>
									</div>
								{/each}
							</div>

							<Button onclick={handleExtractFromImages} disabled={loading} class="w-full gap-2 rounded-full shadow-md">
								<ImageIcon class="h-4 w-4" />
								{loading ? 'Extracting...' : 'Extract Product Info'}
							</Button>
						</div>
					{/if}
				</div>
			</Tabs.Content>

			<!-- Manual Entry Tab -->
			<Tabs.Content value="manual" class="mt-0">
				<div class="space-y-4">
					<div>
						<Label for="name-{index}" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
							Product Name *
						</Label>
						<div class="relative">
                            <Package class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						    <Input
							    id="name-{index}"
							    bind:value={name}
							    placeholder="e.g., CeraVe Moisturizing Cream"
							    disabled={loading}
                                class="pl-9 rounded-xl bg-white/50 dark:bg-black/20 border-primary/10 focus-visible:ring-primary/50"
						    />
                        </div>
					</div>

					<div>
						<Label for="description-{index}" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
							Description
						</Label>
                        <div class="relative">
                            <FileText class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						    <Textarea
							    id="description-{index}"
							    bind:value={description}
							    placeholder="Short description"
							    disabled={loading}
							    rows={2}
                                class="pl-9 rounded-xl bg-white/50 dark:bg-black/20 border-primary/10 focus-visible:ring-primary/50 min-h-[80px]"
						    />
                        </div>
					</div>

					<div>
						<Label for="ingredients-{index}" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
							Ingredients
						</Label>
                        <div class="relative">
                            <FlaskConical class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						    <Textarea
							    id="ingredients-{index}"
							    bind:value={ingredientsText}
							    placeholder="e.g., Hyaluronic Acid, Ceramides"
							    disabled={loading}
							    rows={2}
                                class="pl-9 rounded-xl bg-white/50 dark:bg-black/20 border-primary/10 focus-visible:ring-primary/50 min-h-[80px]"
						    />
                        </div>
						<p class="mt-1 text-[10px] text-muted-foreground text-right">Comma-separated</p>
					</div>

					<Button onclick={handleManualSubmit} disabled={loading || !name} class="w-full rounded-full shadow-md">
						{loading ? 'Saving...' : 'Save Product'}
					</Button>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Product Preview -->
		{#if product}
			<div class="mt-4 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2">
				<div class="flex items-center gap-2">
					<Badge variant="secondary" class="bg-white/50 dark:bg-black/20">Saved</Badge>
					<span class="font-semibold truncate">{product.name}</span>
				</div>
			</div>
		{/if}
	</div>
</div>
