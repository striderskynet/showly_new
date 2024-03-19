<script>
	import '$assets/app.css';
	import MenuLeft from './../components/UI/menu_left.svelte';
	import TopNavigation from './../components/UI/top_navigation.svelte';

	export let data;

	// console.log(data);
</script>

<svelteL:head>
	<title>Showly 2.0</title>
</svelteL:head>

<div class="w-screen h-screen bg-black flex relative overflow-x-hidden">
	<MenuLeft {data} />

	<TopNavigation {data} />

	<div class="sm:pl-16 pt-10 sm:pt-0 w-full text-white"><slot /></div>
</div>
