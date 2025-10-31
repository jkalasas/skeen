<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import {
		TrendingUp,
		TrendingDown,
		Trophy,
		AlertCircle,
		CheckCircle2,
		XCircle
	} from '@lucide/svelte';
	import type { ProductComparison } from '$lib/ai/base';

	interface Props {
		comparison: ProductComparison;
		product1Name: string;
		product2Name: string;
	}

	let { comparison, product1Name, product2Name }: Props = $props();
</script>

{#if !comparison.areSimilar}
	<Alert.Root variant="destructive" class="mb-6">
		<AlertCircle class="h-4 w-4" />
		<Alert.Title>Products Cannot Be Compared</Alert.Title>
		<Alert.Description>{comparison.reason}</Alert.Description>
	</Alert.Root>
{:else}
	<Card.Root class="border-2 bg-gradient-to-br from-background to-primary/5 shadow-lg">
		<Card.Header class="space-y-1">
			<div class="flex items-center gap-2">
				<div class="rounded-lg bg-primary/10 p-2">
					<Trophy class="h-5 w-5 text-primary" />
				</div>
				<Card.Title class="text-xl">Product Comparison</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="space-y-6">
			<!-- Recommendation -->
			{#if comparison.recommendation}
				<div class="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
					<h3 class="mb-3 text-lg font-bold text-primary">Recommendation</h3>
					<p class="leading-relaxed">{comparison.recommendation}</p>
				</div>
			{/if}

			<!-- Products Side by Side -->
			<div class="grid gap-6 md:grid-cols-2">
				<!-- Product 1 -->
				{#if comparison.product1Analysis}
					<div class="space-y-4 rounded-xl border-2 bg-background/50 p-5">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-bold">{product1Name}</h3>
							<Badge variant="secondary" class="text-lg font-bold">
								{comparison.product1Analysis.score.toFixed(1)}/10
							</Badge>
						</div>

						<!-- Strengths -->
						<div
							class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20"
						>
							<h4 class="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
								<TrendingUp class="h-4 w-4" />
								Strengths
							</h4>
							<ul class="space-y-2">
								{#each comparison.product1Analysis.strengths as strength, i (i)}
									<li class="flex items-start gap-2">
										<CheckCircle2
											class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400"
										/>
										<span class="text-sm leading-relaxed">{strength}</span>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Weaknesses -->
						<div
							class="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20"
						>
							<h4 class="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
								<TrendingDown class="h-4 w-4" />
								Weaknesses
							</h4>
							<ul class="space-y-2">
								{#each comparison.product1Analysis.weaknesses as weakness, i (i)}
									<li class="flex items-start gap-2">
										<XCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
										<span class="text-sm leading-relaxed">{weakness}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}

				<!-- Product 2 -->
				{#if comparison.product2Analysis}
					<div class="space-y-4 rounded-xl border-2 bg-background/50 p-5">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-bold">{product2Name}</h3>
							<Badge variant="secondary" class="text-lg font-bold">
								{comparison.product2Analysis.score.toFixed(1)}/10
							</Badge>
						</div>

						<!-- Strengths -->
						<div
							class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20"
						>
							<h4 class="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
								<TrendingUp class="h-4 w-4" />
								Strengths
							</h4>
							<ul class="space-y-2">
								{#each comparison.product2Analysis.strengths as strength, i (i)}
									<li class="flex items-start gap-2">
										<CheckCircle2
											class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400"
										/>
										<span class="text-sm leading-relaxed">{strength}</span>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Weaknesses -->
						<div
							class="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20"
						>
							<h4 class="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
								<TrendingDown class="h-4 w-4" />
								Weaknesses
							</h4>
							<ul class="space-y-2">
								{#each comparison.product2Analysis.weaknesses as weakness, i (i)}
									<li class="flex items-start gap-2">
										<XCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
										<span class="text-sm leading-relaxed">{weakness}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
{/if}
