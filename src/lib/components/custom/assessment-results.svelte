<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { CheckCircle2, XCircle, Trophy, TrendingUp, TrendingDown } from '@lucide/svelte';
	import type { ProductAssessment } from '$lib/ai/base';

	interface Props {
		assessment: ProductAssessment;
	}

	let { assessment }: Props = $props();
</script>

<Card.Root class="border-2 bg-gradient-to-br from-background to-primary/5 shadow-lg">
	<Card.Header class="space-y-1">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-primary/10 p-2">
				<Trophy class="h-5 w-5 text-primary" />
			</div>
			<Card.Title class="text-xl">Assessment Results</Card.Title>
		</div>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Score -->
		<div
			class="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 text-center"
		>
			<div class="absolute top-4 right-4 opacity-10">
				<Trophy class="h-16 w-16" />
			</div>
			<div
				class="mb-3 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-7xl font-bold text-transparent"
			>
				{assessment.score.toFixed(1)}<span class="text-4xl">/10</span>
			</div>
			<p class="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
				Overall Score
			</p>
		</div>

		<!-- Pros -->
		<div
			class="space-y-4 rounded-xl border-2 border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20"
		>
			<h3 class="flex items-center gap-2 text-lg font-bold text-green-700 dark:text-green-400">
				<div class="rounded-lg bg-green-100 p-1.5 dark:bg-green-900/40">
					<TrendingUp class="h-5 w-5" />
				</div>
				Strengths
			</h3>
			<ul class="space-y-3">
				{#each assessment.pros as pro, i (i)}
					<li class="flex items-start gap-3">
						<CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
						<span class="text-sm leading-relaxed">{pro}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Cons -->
		<div
			class="space-y-4 rounded-xl border-2 border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20"
		>
			<h3 class="flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-400">
				<div class="rounded-lg bg-red-100 p-1.5 dark:bg-red-900/40">
					<TrendingDown class="h-5 w-5" />
				</div>
				Concerns
			</h3>
			<ul class="space-y-3">
				{#each assessment.cons as con, i (i)}
					<li class="flex items-start gap-3">
						<XCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
						<span class="text-sm leading-relaxed">{con}</span>
					</li>
				{/each}
			</ul>
		</div>
	</Card.Content>
</Card.Root>
