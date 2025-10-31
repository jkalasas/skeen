<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import type {
		SkinType,
		AgeRange,
		SkinConcern,
		SunExposure,
		UserProfile
	} from '$lib/types/profile';
	import {
		Droplet,
		Wind,
		Users,
		Thermometer,
		Sparkles,
		Sun,
		Calendar,
		Target,
		AlertCircle
	} from '@lucide/svelte';

	interface Props {
		initialProfile?: UserProfile | null;
		loading?: boolean;
		onsubmit: (profile: UserProfile) => void;
	}

	let { initialProfile = null, loading = false, onsubmit }: Props = $props();

	// Form state
	let skinType = $state<SkinType | null>(initialProfile?.skinType ?? null);
	let isSensitive = $state<boolean>(initialProfile?.isSensitive ?? false);
	let ageRange = $state<AgeRange | null>(initialProfile?.ageRange ?? null);
	let selectedConcerns = $state<SkinConcern[]>(initialProfile?.skinConcerns ?? []);
	let sunExposure = $state<SunExposure | undefined>(initialProfile?.sunExposure);

	// Skin type options with icons
	const skinTypes: Array<{
		value: SkinType;
		label: string;
		icon: typeof Droplet;
		description: string;
	}> = [
		{ value: 'Oily', label: 'Oily', icon: Droplet, description: 'Shiny, prone to acne' },
		{ value: 'Dry', label: 'Dry', icon: Wind, description: 'Flaky, tight feeling' },
		{
			value: 'Combination',
			label: 'Combination',
			icon: Thermometer,
			description: 'Oily T-zone, dry cheeks'
		},
		{ value: 'Normal', label: 'Normal', icon: Sparkles, description: 'Balanced, few concerns' }
	];

	// Age ranges
	const ageRanges: AgeRange[] = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+'];

	// Skin concerns with icons
	const skinConcerns: Array<{
		value: SkinConcern;
		label: string;
		icon: typeof Target;
		description: string;
	}> = [
		{ value: 'Acne', label: 'Acne', icon: AlertCircle, description: 'Breakouts & blemishes' },
		{ value: 'Aging', label: 'Aging', icon: Calendar, description: 'Fine lines & wrinkles' },
		{ value: 'Dark Spots', label: 'Dark Spots', icon: Sun, description: 'Hyperpigmentation' },
		{ value: 'Dryness', label: 'Dryness', icon: Wind, description: 'Dehydrated skin' },
		{
			value: 'Redness',
			label: 'Redness',
			icon: AlertCircle,
			description: 'Irritation & inflammation'
		},
		{ value: 'Dullness', label: 'Dullness', icon: Sparkles, description: 'Lack of radiance' }
	];

	// Sun exposure options
	const sunExposureOptions: SunExposure[] = [
		'Low (mostly indoors)',
		'Medium (some outdoor)',
		'High (frequently outdoors)'
	];

	const canSubmit = $derived(
		skinType !== null && ageRange !== null && selectedConcerns.length > 0 && !loading
	);

	function handleSubmit() {
		if (!skinType || !ageRange || selectedConcerns.length === 0) return;

		const profile: UserProfile = {
			skinType,
			isSensitive,
			ageRange,
			skinConcerns: selectedConcerns,
			sunExposure
		};

		onsubmit(profile);
	}

	function toggleConcern(concern: SkinConcern) {
		if (selectedConcerns.includes(concern)) {
			selectedConcerns = selectedConcerns.filter((c) => c !== concern);
		} else {
			selectedConcerns = [...selectedConcerns, concern];
		}
	}
</script>

<Card.Root class="border-2 shadow-lg">
	<Card.Header class="space-y-1">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-primary/10 p-2">
				<Users class="h-5 w-5 text-primary" />
			</div>
			<Card.Title class="text-xl">Your Skin Profile</Card.Title>
		</div>
		<Card.Description>Help us personalize your skincare assessments</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="space-y-8">
			<!-- 1. Skin Type (Required) -->
			<div class="space-y-3">
				<Label class="flex items-center gap-2 text-sm font-semibold">
					<Droplet class="h-4 w-4" />
					Skin Type <span class="text-destructive">*</span>
				</Label>
				<div class="grid grid-cols-2 gap-3">
					{#each skinTypes as type (type.value)}
						{@const Icon = type.icon}
						<button
							type="button"
							onclick={() => (skinType = type.value)}
							class="relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 {skinType ===
							type.value
								? 'border-primary bg-primary/10'
								: 'border-border'}"
						>
							<Icon
								class="h-8 w-8 {skinType === type.value ? 'text-primary' : 'text-muted-foreground'}"
							/>
							<div class="text-center">
								<div class="text-sm font-semibold">{type.label}</div>
								<div class="mt-0.5 text-xs text-muted-foreground">{type.description}</div>
							</div>
							{#if skinType === type.value}
								<div class="absolute top-2 right-2">
									<div class="h-2 w-2 rounded-full bg-primary"></div>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- 2. Is Your Skin Sensitive? (Required) -->
			<div class="space-y-3">
				<Label class="flex items-center gap-2 text-sm font-semibold">
					<AlertCircle class="h-4 w-4" />
					Is Your Skin Sensitive? <span class="text-destructive">*</span>
				</Label>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => (isSensitive = true)}
						class="flex-1 rounded-lg border-2 p-3 transition-all hover:border-primary/50 hover:bg-primary/5 {isSensitive
							? 'border-primary bg-primary/10 font-semibold'
							: 'border-border'}"
					>
						Yes
					</button>
					<button
						type="button"
						onclick={() => (isSensitive = false)}
						class="flex-1 rounded-lg border-2 p-3 transition-all hover:border-primary/50 hover:bg-primary/5 {!isSensitive
							? 'border-primary bg-primary/10 font-semibold'
							: 'border-border'}"
					>
						No
					</button>
				</div>
			</div>

			<!-- 3. Age Range (Required) -->
			<div class="space-y-3">
				<Label for="age-range" class="flex items-center gap-2 text-sm font-semibold">
					<Calendar class="h-4 w-4" />
					Age Range <span class="text-destructive">*</span>
				</Label>
				<select
					id="age-range"
					bind:value={ageRange}
					class="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
				>
					<option value={null}>Select your age range</option>
					{#each ageRanges as range (range)}
						<option value={range}>{range}</option>
					{/each}
				</select>
			</div>

			<!-- 4. Skin Concerns (Required - Multiple Selection) -->
			<div class="space-y-3">
				<Label class="flex items-center gap-2 text-sm font-semibold">
					<Target class="h-4 w-4" />
					Skin Concerns <span class="text-destructive">*</span>
					<span class="text-xs font-normal text-muted-foreground">(Select all that apply)</span>
				</Label>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each skinConcerns as concern (concern.value)}
						{@const Icon = concern.icon}
						{@const isSelected = selectedConcerns.includes(concern.value)}
						<button
							type="button"
							onclick={() => toggleConcern(concern.value)}
							class="relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary/50 hover:bg-primary/5 {isSelected
								? 'border-primary bg-primary/10'
								: 'border-border'}"
						>
							<Icon class="h-6 w-6 {isSelected ? 'text-primary' : 'text-muted-foreground'}" />
							<div class="text-center">
								<div class="text-xs font-semibold">{concern.label}</div>
								<div class="mt-0.5 text-[10px] text-muted-foreground">{concern.description}</div>
							</div>
							{#if isSelected}
								<div class="absolute top-2 right-2">
									<div class="h-2 w-2 rounded-full bg-primary"></div>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- 5. Sun Exposure (Optional) -->
			<div class="space-y-3">
				<Label class="flex items-center gap-2 text-sm font-semibold">
					<Sun class="h-4 w-4" />
					Sun Exposure <span class="text-xs font-normal text-muted-foreground">(Optional)</span>
				</Label>
				<div class="space-y-2">
					{#each sunExposureOptions as option (option)}
						<label
							class="flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:border-primary/50 hover:bg-primary/5 {sunExposure ===
							option
								? 'border-primary bg-primary/10'
								: 'border-border'}"
						>
							<input
								type="radio"
								name="sun-exposure"
								value={option}
								bind:group={sunExposure}
								class="h-4 w-4 accent-primary"
							/>
							<span class="text-sm">{option}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Submit Button -->
			<Button onclick={handleSubmit} disabled={!canSubmit} class="h-11 w-full gap-2 text-base">
				<Sparkles class="h-4 w-4" />
				{loading ? 'Saving...' : 'Save Profile'}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
