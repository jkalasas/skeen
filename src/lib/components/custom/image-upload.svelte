<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Camera,
		Upload,
		SwitchCamera,
		X,
		Sparkles,
		RefreshCw,
		Image as ImageIcon
	} from '@lucide/svelte';
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

	let imagePreviews = $derived(images.map((file) => URL.createObjectURL(file)));

	$effect(() => {
		return () => {
			imagePreviews.forEach((url) => URL.revokeObjectURL(url));
		};
	});

	onMount(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	});

	async function startCamera() {
		try {
			cameraError = null;
			videoReady = false;

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

		canvasElement.width = videoElement.videoWidth;
		canvasElement.height = videoElement.videoHeight;

		context.drawImage(videoElement, 0, 0);

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

<div class="glass-card rounded-3xl p-8 text-center border-dashed border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 bg-white/30 dark:bg-black/20 min-h-[400px] flex flex-col justify-center">
	{#if images.length === 0 && !isCameraActive}
        <div class="py-6 space-y-8 animate-in fade-in zoom-in-95">
            <div class="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center animate-pulse-slow ring-4 ring-primary/5">
                <Upload class="h-10 w-10 text-primary" />
            </div>
            <div class="space-y-2">
                <h3 class="text-2xl font-bold text-gradient">Upload Product Images</h3>
                <p class="text-muted-foreground max-w-xs mx-auto">
                    Drag & drop images here, or use your camera to capture the ingredients list.
                </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <div class="relative group w-full sm:w-auto">
                    <Button size="lg" class="w-full sm:w-auto min-w-[160px] rounded-full shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                        <ImageIcon class="mr-2 h-4 w-4"/>
                        Choose Files
                    </Button>
                    <Input
                        id="file-upload"
                        bind:ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onchange={handleFileSelect}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <Button size="lg" variant="outline" onclick={startCamera} class="w-full sm:w-auto min-w-[160px] rounded-full gap-2 border-primary/20 hover:bg-primary/5">
                    <Camera class="h-4 w-4" />
                    Use Camera
                </Button>
            </div>
        </div>

    {:else if isCameraActive}
        <div class="space-y-4 max-w-md mx-auto w-full animate-in fade-in">
            <div class="relative aspect-[3/4] overflow-hidden rounded-3xl border-2 border-primary/20 bg-black shadow-2xl">
                {#if !videoReady}
                    <div class="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                        <div class="flex flex-col items-center gap-3">
                            <Camera class="h-10 w-10 animate-pulse text-primary" />
                            <p class="text-sm text-white/80">Initializing Camera...</p>
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

                <!-- Camera Controls Overlay -->
                <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                     <Button
                        size="icon"
                        variant="outline"
                        onclick={stopCamera}
                        class="rounded-full h-10 w-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <X class="h-5 w-5" />
                    </Button>

                    <button
                        onclick={capturePhoto}
                        disabled={loading || !videoReady}
                        class="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-all active:scale-95"
                    >
                        <div class="h-12 w-12 rounded-full bg-white"></div>
                    </button>

                    <Button
                        size="icon"
                        variant="outline"
                        onclick={toggleCamera}
                        class="rounded-full h-10 w-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <SwitchCamera class="h-5 w-5" />
                    </Button>
                </div>
                {#if cameraError}
                    <div class="absolute top-4 left-4 right-4 p-2 bg-destructive/80 text-white rounded-lg text-sm text-center">
                        {cameraError}
                    </div>
                {/if}
            </div>
             <Button onclick={stopCamera} variant="ghost" class="text-muted-foreground hover:text-foreground">
                Cancel Camera Mode
            </Button>
        </div>

    {:else}
        <!-- Image Preview List -->
         <div class="space-y-6 w-full animate-in fade-in">
             <div class="flex items-center justify-between">
                <Badge variant="secondary" class="gap-1.5 px-3 py-1 text-sm rounded-full bg-secondary/50">
                    <ImageIcon class="h-3.5 w-3.5" />
                    {images.length} {images.length === 1 ? 'image' : 'images'} selected
                </Badge>
                <Button onclick={handleReset} variant="ghost" size="sm" disabled={loading} class="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full">
                    <RefreshCw class="h-4 w-4" />
                    Reset All
                </Button>
             </div>

            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {#each images as image, index}
                    <div class="group relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                        <img
                            src={imagePreviews[index]}
                            alt={image.name}
                            class="h-full w-full object-cover"
                        />
                        <div class="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                            <Button
                                size="icon"
                                variant="destructive"
                                onclick={() => removeImage(index)}
                                disabled={loading}
                                class="rounded-full h-10 w-10"
                            >
                                <X class="h-5 w-5" />
                            </Button>
                        </div>
                         <div class="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform">
                             <p class="truncate text-xs text-white text-center">{image.name}</p>
                         </div>
                    </div>
                {/each}

                 <!-- Add more button -->
                 <button
                    class="relative aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                    onclick={() => fileInput?.click()}
                 >
                    <Upload class="h-8 w-8" />
                    <span class="text-xs font-medium">Add More</span>
                    <Input
                        bind:ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onchange={handleFileSelect}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                 </button>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onclick={onextract} disabled={loading} size="lg" class="flex-1 gap-2 rounded-full shadow-lg shadow-primary/20">
                    <Sparkles class="h-4 w-4" />
                    {loading ? 'Extracting...' : 'Extract Info'}
                </Button>
                <Button
                    onclick={onassess}
                    disabled={loading}
                    variant="secondary"
                    size="lg"
                    class="flex-1 gap-2 rounded-full"
                >
                    <Sparkles class="h-4 w-4" />
                    {loading ? 'Assessing...' : 'Assess Directly'}
                </Button>
            </div>
        </div>
    {/if}
</div>
