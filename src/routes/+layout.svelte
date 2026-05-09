<script>
	import '$assets/app.css';
	// import posthog from 'posthog-js';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import MenuLeft from './../components/UI/menu_left.svelte';
	import TopNavigation from './../components/UI/top_navigation.svelte';
	export let data;

	console.log($page);
	onMount(() => {
		// posthog.init('phc_q48EhR7TH2EIKrHDjsm1RjXa0Y7Gl6Pv90ETCN7ET3Z', {
		// 	api_host: 'https://app.posthog.com',
		// });
	});

	// console.log(data);
</script>

<svelteL:head>
	<title>Showly</title>
</svelteL:head>

{#if $page.route.id == '/truper'}
	<slot />
{:else}
	<div class="relative flex w-screen h-screen overflow-x-hidden bg-black">
		<MenuLeft {data} />

		<TopNavigation {data} />

		<div class="w-full text-white sm:pl-16 sm:pt-0"><slot /></div>
	</div>
{/if}
