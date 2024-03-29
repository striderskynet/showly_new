<script>
	import '$assets/app.css';
	// import posthog from 'posthog-js';
	import { onMount } from 'svelte';
	import MenuLeft from './../components/UI/menu_left.svelte';
	import TopNavigation from './../components/UI/top_navigation.svelte';
	export let data;

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

<svelte:window
	on:scroll={() => {
		console.log('asd');
	}}
/>

<div class="w-screen h-screen bg-black flex relative overflow-x-hidden">
	<MenuLeft {data} />

	<TopNavigation {data} />

	<div class="sm:pl-16 sm:pt-0 w-full text-white"><slot /></div>
</div>
