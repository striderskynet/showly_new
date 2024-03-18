<script>
	import '$assets/app.css';
	import MenuLeft from './../components/UI/menu_left.svelte';

	export let data;

	// console.log(data);
</script>

<div class="w-screen h-screen bg-black flex relative overflow-x-hidden">
	<MenuLeft {data} />
	<div class="sm:pl-16 w-full text-white"><slot /></div>
</div>
