<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { ProductAssessment } from '$lib/ai/base';

	interface Props {
		assessment: ProductAssessment;
	}

	let { assessment }: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Assessment Results</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Score -->
		<div class="text-center">
			<div class="mb-2 text-6xl font-bold text-primary">
				{assessment.score.toFixed(1)}/10
			</div>
			<p class="text-sm text-muted-foreground">Overall Score</p>
		</div>

		<!-- Pros -->
		<div class="space-y-3">
			<h3 class="flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
				Pros
			</h3>
			<ul class="space-y-2">
				{#each assessment.pros as pro}
					<li class="flex gap-2 text-sm">
						<span class="text-green-600 dark:text-green-400">✓</span>
						<span>{pro}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Cons -->
		<div class="space-y-3">
			<h3 class="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="15" y1="9" x2="9" y2="15"></line>
					<line x1="9" y1="9" x2="15" y2="15"></line>
				</svg>
				Cons
			</h3>
			<ul class="space-y-2">
				{#each assessment.cons as con}
					<li class="flex gap-2 text-sm">
						<span class="text-red-600 dark:text-red-400">✗</span>
						<span>{con}</span>
					</li>
				{/each}
			</ul>
		</div>
	</Card.Content>
</Card.Root>
