<script>
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		invalidateAll(true);

		window.location = '/';
	});
</script>
