<script lang="ts">
	import { page } from '$app/state';
	import { resolveRoute } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import {
		History,
		User,
		GitCompare,
		Heart,
		Package,
		LogOut,
		LogIn,
		Menu,
		X
	} from '@lucide/svelte';
	import SkeenLogo from '$lib/assets/skeen.svg';
	import { authStore } from '$lib/stores/auth.svelte';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let isOpen = $state(false);

	const links = [
		{ href: '/comparison', label: 'Compare', icon: GitCompare },
		{ href: '/companion', label: 'Companion', icon: Heart },
		{ href: '/products', label: 'Products', icon: Package },
		{ href: '/profile', label: 'Profile', icon: User },
		{ href: '/history', label: 'History', icon: History }
	];

	async function handleSignOut() {
		isOpen = false;
		toast.promise(authStore.signOut(), {
			loading: 'Signing out...',
			success: 'Signed out successfully',
			error: 'Error signing out'
		});
	}

	async function handleSignIn() {
		isOpen = false;
		toast.promise(authStore.signInWithGoogle(), {
			loading: 'Signing in...',
			success: 'Signed in successfully',
			error: 'Error signing in'
		});
	}

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function closeMenu() {
		isOpen = false;
	}
</script>

<nav
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div
		class="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
	>
		<a
			href={resolveRoute('/')}
			class="flex items-center gap-2 text-xl font-bold"
			onclick={closeMenu}
		>
			<img src={SkeenLogo} alt="Skeen Logo" class="h-8 w-8" />
			<span class="text-2xl tracking-tight text-foreground">skeen</span>
		</a>

		<div class="hidden md:flex md:items-center md:gap-1">
			{#if authStore.initialized && authStore.isAuthenticated}
				{#each links as link}
					{@const active = page.url.pathname === link.href}
					<Button
						variant={active ? 'secondary' : 'ghost'}
						href={link.href}
						class="group gap-2 transition-all duration-200 hover:bg-secondary/10"
					>
						<link.icon
							class="h-4 w-4 transition-transform duration-300 group-hover:scale-110 {active
								? 'text-primary'
								: 'text-muted-foreground'}"
						/>
						<span class={active ? 'font-medium' : ''}>{link.label}</span>
					</Button>
				{/each}
				<div class="ml-2 border-l pl-2">
					<Button
						variant="ghost"
						onclick={handleSignOut}
						class="group gap-2 text-muted-foreground hover:text-destructive"
					>
						<LogOut class="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
						<span class="hidden lg:inline">Sign Out</span>
					</Button>
				</div>
			{:else if authStore.initialized}
				<Button
					variant="default"
					onclick={handleSignIn}
					class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<LogIn class="h-4 w-4" />
					<span>Sign In</span>
				</Button>
			{/if}
		</div>

		<div class="flex items-center md:hidden">
			<Button variant="ghost" size="icon" onclick={toggleMenu} aria-label="Toggle Menu">
				{#if isOpen}
					<X class="h-6 w-6" />
				{:else}
					<Menu class="h-6 w-6" />
				{/if}
			</Button>
		</div>
	</div>
</nav>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
		onclick={closeMenu}
	></div>

	<div
		transition:fly={{ x: '100%', duration: 300, opacity: 1, easing: cubicOut }}
		class="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col border-l bg-background p-6 shadow-2xl sm:max-w-sm md:hidden"
	>
		<div class="mb-8 flex items-center justify-between">
			<span class="text-lg font-bold">Menu</span>
			<Button variant="ghost" size="icon" onclick={closeMenu}>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<div class="flex flex-1 flex-col gap-2">
			{#if authStore.initialized && authStore.isAuthenticated}
				{#each links as link}
					{@const active = page.url.pathname === link.href}
					<a
						href={link.href}
						class="group flex items-center gap-4 rounded-md p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground {active
							? 'bg-secondary/10 text-foreground'
							: 'text-muted-foreground'}"
						onclick={closeMenu}
					>
						<div
							class="rounded-md border p-2 {active
								? 'border-primary bg-background'
								: 'border-transparent bg-muted group-hover:bg-background'}"
						>
							<link.icon
								class="h-5 w-5 transition-transform duration-300 group-hover:scale-110 {active
									? 'text-primary'
									: ''}"
							/>
						</div>
						{link.label}
					</a>
				{/each}

				<div class="mt-auto border-t pt-4">
					<button
						onclick={handleSignOut}
						class="group flex w-full items-center gap-4 rounded-md p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
					>
						<div
							class="rounded-md border border-transparent bg-muted p-2 group-hover:bg-background"
						>
							<LogOut class="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
						</div>
						Sign Out
					</button>
				</div>
			{:else if authStore.initialized}
				<Button variant="default" onclick={handleSignIn} class="w-full gap-2">
					<LogIn class="h-4 w-4" />
					<span>Sign In with Google</span>
				</Button>
			{/if}
		</div>
	</div>
{/if}
