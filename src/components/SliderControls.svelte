<script>
	import Icon from '@iconify/svelte';

	export let setIndex;
	export let currentIndex;
</script>

<button
	on:click={() => setIndex(currentIndex - 1)}
	class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
	aria-label="Previous"
>
	<Icon icon="mdi:chevron-left-circle" class="text-5xl" />
</button>

<button
	on:click={() => setIndex(currentIndex + 1)}
	class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
	aria-label="Next"
>
	<Icon icon="mdi:chevron-right-circle" class="text-5xl" />
</button>