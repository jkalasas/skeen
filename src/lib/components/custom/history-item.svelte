<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Trash2, Calendar, Star } from '@lucide/svelte';
	import type { HistoryEntry } from '$lib/db/history';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	let { entry, ondelete }: { entry: HistoryEntry; ondelete: (id: number) => void } = $props();

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			return 'Today';
		} else if (days === 1) {
			return 'Yesterday';
		} else if (days < 7) {
			return `${days} days ago`;
		} else {
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		}
	}

	function getScoreColor(score: number): string {
		if (score >= 8) return 'bg-green-500';
		if (score >= 6) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	function getScoreVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
		if (score >= 8) return 'default';
		if (score >= 6) return 'secondary';
		return 'destructive';
	}

	async function handleDelete() {
		if (entry.id && confirm('Are you sure you want to delete this assessment?')) {
			ondelete(entry.id);
		}
	}
</script>

<Card.Root class="overflow-hidden transition-shadow hover:shadow-lg">
	<div class="flex flex-col sm:flex-row gap-4">
		{#if entry.imageData}
			<div class="w-full sm:w-32 h-48 sm:h-auto flex-shrink-0">
				<img
					src={entry.imageData}
					alt={entry.product.name}
					class="w-full h-full object-cover"
				/>
			</div>
		{/if}

		<div class="flex-1 p-4 sm:p-6">
			<div class="flex justify-between items-start gap-4 mb-3">
				<div class="flex-1">
					<h3 class="text-xl font-semibold mb-1">{entry.product.name}</h3>
					{#if entry.product.description}
						<p class="text-sm text-muted-foreground mb-2">{entry.product.description}</p>
					{/if}
				</div>

				<div class="flex items-center gap-3 flex-shrink-0">
					<Badge variant={getScoreVariant(entry.assessment.score)} class="flex items-center gap-1">
						<Star class="h-3 w-3" />
						{entry.assessment.score}/10
					</Badge>
					<Button
						variant="ghost"
						size="icon"
						onclick={handleDelete}
						class="text-destructive hover:text-destructive hover:bg-destructive/10"
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div class="flex items-center gap-2 text-xs text-muted-foreground mb-4">
				<Calendar class="h-3 w-3" />
				<span>{formatDate(entry.timestamp)}</span>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#if entry.assessment.pros.length > 0}
					<div>
						<h4 class="text-sm font-semibold text-green-600 dark:text-green-500 mb-2">Pros</h4>
						<ul class="text-sm space-y-1">
							{#each entry.assessment.pros.slice(0, 3) as pro}
								<li class="text-muted-foreground">• {pro}</li>
							{/each}
							{#if entry.assessment.pros.length > 3}
								<li class="text-xs text-muted-foreground/70">
									+{entry.assessment.pros.length - 3} more
								</li>
							{/if}
						</ul>
					</div>
				{/if}

				{#if entry.assessment.cons.length > 0}
					<div>
						<h4 class="text-sm font-semibold text-red-600 dark:text-red-500 mb-2">Cons</h4>
						<ul class="text-sm space-y-1">
							{#each entry.assessment.cons.slice(0, 3) as con}
								<li class="text-muted-foreground">• {con}</li>
							{/each}
							{#if entry.assessment.cons.length > 3}
								<li class="text-xs text-muted-foreground/70">
									+{entry.assessment.cons.length - 3} more
								</li>
							{/if}
						</ul>
					</div>
				{/if}
			</div>

			{#if entry.product.ingredients && entry.product.ingredients.length > 0}
				<div class="mt-4 pt-4 border-t">
					<h4 class="text-xs font-semibold text-muted-foreground mb-2">Key Ingredients</h4>
					<div class="flex flex-wrap gap-1">
						{#each entry.product.ingredients.slice(0, 5) as ingredient}
							<Badge variant="outline" class="text-xs">{ingredient}</Badge>
						{/each}
						{#if entry.product.ingredients.length > 5}
							<Badge variant="outline" class="text-xs">
								+{entry.product.ingredients.length - 5} more
							</Badge>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</Card.Root>
