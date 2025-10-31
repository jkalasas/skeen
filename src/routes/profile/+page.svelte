<script lang="ts">
	import ProfileForm from '$lib/components/custom/profile-form.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { profileStore } from '$lib/stores/profile.svelte';
	import type { UserProfile } from '$lib/types/profile';
	import { CheckCircle2, User } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	onMount(() => {
		profileStore.load();
	});

	async function handleSubmit(profile: UserProfile) {
		loading = true;
		error = null;
		success = false;

		try {
			await profileStore.save(profile);
			success = true;

			// Redirect to home after a brief delay
			setTimeout(() => {
				goto(resolveRoute('/'));
			}, 1500);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save profile';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Profile - Skeen</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
	<!-- Hero Section -->
	<div
		class="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-10"
	>
		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-xl bg-primary/20 p-3">
				<User class="h-8 w-8 text-primary" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Your Profile</h1>
		</div>
		<p class="max-w-2xl text-lg text-muted-foreground">
			Complete your skin profile to get personalized product assessments tailored to your unique
			needs.
		</p>
	</div>

	<!-- Success Message -->
	{#if success}
		<Alert.Root variant="default" class="mb-6 border-green-500/50 bg-green-500/10">
			<CheckCircle2 class="h-4 w-4 text-green-600" />
			<Alert.Title>Profile Saved!</Alert.Title>
			<Alert.Description>Your profile has been saved successfully. Redirecting...</Alert.Description
			>
		</Alert.Root>
	{/if}

	<!-- Error Display -->
	{#if error}
		<Alert.Root variant="destructive" class="mb-6 border-destructive/50">
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{error}</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Profile Form -->
	<ProfileForm initialProfile={profileStore.data} {loading} onsubmit={handleSubmit} />
</div>
