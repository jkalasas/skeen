<script lang="ts">
	import ProfileForm from '$lib/components/custom/profile-form.svelte';
	import AuthGuard from '$lib/components/custom/auth-guard.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { profileStore } from '$lib/stores/profile.svelte';
	import type { UserProfile } from '$lib/types/profile';
	import { User } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { toast } from 'svelte-sonner';

	async function handleSubmit(profile: UserProfile) {
		const promise = () =>
			new Promise<void>((resolve, reject) => {
				profileStore
					.save(profile)
					.then(() => {
						resolve();
						setTimeout(() => {
							goto(resolveRoute('/'));
						}, 1500);
					})
					.catch(reject);
			});

		toast.promise(promise, {
			loading: 'Saving profile...',
			success: 'Profile saved successfully! Redirecting...',
			error: 'Failed to save profile'
		});
	}
</script>

<svelte:head>
	<title>Profile - Skeen</title>
</svelte:head>

<AuthGuard>
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

		<!-- Profile Form -->
		<ProfileForm initialProfile={profileStore.data} onsubmit={handleSubmit} />
	</div>
</AuthGuard>
