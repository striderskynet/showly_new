<script>
	import '$assets/app.css';
	// import posthog from 'posthog-js';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MenuLeft from './../components/UI/menu_left.svelte';
	import TopNavigation from './../components/UI/top_navigation.svelte';
	/** @type {{data: any, children?: import('svelte').Snippet}} */
	let { data, children } = $props();

	onMount(() => {
		// posthog.init('phc_q48EhR7TH2EIKrHDjsm1RjXa0Y7Gl6Pv90ETCN7ET3Z', {
		// 	api_host: 'https://app.posthog.com',
		// });
	});

	// console.log(data);
</script>

<svelte:head>
	<title>Showly</title>
</svelte:head>

{#if $page.route.id == '/truper'}
	{@render children?.()}
{:else}
	<div class="relative flex w-screen h-screen overflow-x-hidden bg-black">
		<MenuLeft {data} />

		<TopNavigation {data} />

		<div class="w-full text-white sm:pl-16 sm:pt-0">
			{@render children?.()}
		</div>
	</div>
{/if}
