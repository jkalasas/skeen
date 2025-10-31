<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Heart, AlertTriangle, Lightbulb, CheckCircle2, XCircle } from '@lucide/svelte';
	import type { ProductCombination } from '$lib/ai/base';

	interface Props {
		combination: ProductCombination;
	}

	let { combination }: Props = $props();
</script>

<Card.Root class="border-2 bg-gradient-to-br from-background to-primary/5 shadow-lg">
	<Card.Header class="space-y-1">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-primary/10 p-2">
				<Heart class="h-5 w-5 text-primary" />
			</div>
			<Card.Title class="text-xl">Product Combination Assessment</Card.Title>
		</div>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Compatibility Status -->
		<div
			class="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 text-center"
		>
			<div class="mb-3">
				{#if combination.isCompatible}
					<div class="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
						<CheckCircle2 class="h-8 w-8" />
						<span class="text-2xl font-bold">Compatible</span>
					</div>
				{:else}
					<div class="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
						<XCircle class="h-8 w-8" />
						<span class="text-2xl font-bold">Not Compatible</span>
					</div>
				{/if}
			</div>
			<div
				class="mb-3 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-6xl font-bold text-transparent"
			>
				{combination.compatibilityScore.toFixed(1)}<span class="text-3xl">/10</span>
			</div>
			<p class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
				Compatibility Score
			</p>
		</div>

		<!-- Synergies -->
		{#if combination.synergies.length > 0}
			<div
				class="space-y-4 rounded-xl border-2 border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20"
			>
				<h3 class="flex items-center gap-2 text-lg font-bold text-green-700 dark:text-green-400">
					<div class="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/40">
						<Heart class="h-5 w-5" />
					</div>
					Synergies
				</h3>
				<ul class="space-y-3">
					{#each combination.synergies as synergy}
						<li class="flex items-start gap-3">
							<CheckCircle2
								class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400"
							/>
							<span class="text-sm leading-relaxed">{synergy}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Conflicts -->
		{#if combination.conflicts.length > 0}
			<div
				class="space-y-4 rounded-xl border-2 border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20"
			>
				<h3 class="flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-400">
					<div class="rounded-lg bg-red-100 p-1.5 dark:bg-red-900/40">
						<AlertTriangle class="h-5 w-5" />
					</div>
					Potential Conflicts
				</h3>
				<ul class="space-y-3">
					{#each combination.conflicts as conflict}
						<li class="flex items-start gap-3">
							<XCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
							<span class="text-sm leading-relaxed">{conflict}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Recommendations -->
		{#if combination.recommendations.length > 0}
			<div
				class="space-y-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/20"
			>
				<h3 class="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-400">
					<div class="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/40">
						<Lightbulb class="h-5 w-5" />
					</div>
					Recommendations
				</h3>
				<ul class="space-y-3">
					{#each combination.recommendations as recommendation}
						<li class="flex items-start gap-3">
							<Lightbulb
								class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
							/>
							<span class="text-sm leading-relaxed">{recommendation}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
