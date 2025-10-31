<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	interface $$Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: $$Props = $props();
</script>

<DialogPrimitive.Portal {...restProps}>
	<div class={cn('fixed inset-0 z-50 flex items-start justify-center sm:items-center', className)}>
		{@render children?.()}
	</div>
</DialogPrimitive.Portal>
