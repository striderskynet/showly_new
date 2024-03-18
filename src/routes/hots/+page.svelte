<script>
	import Spinner from '$components/UI/spinner.svelte';
	import DefaultCard from '$components/default_card.svelte';
	import { show_add, show_del } from '$lib/shows';

	export let data;

	const add_show = (id) => {
		show_add(data.supabase, data.session.user.id, id);
	};

	const delete_show = (id) => {
		show_del(data.supabase, data.session.user.id, id);
	};

	let upcoming_list;
	//console.log(data);
	$: upcoming_list = data.upcoming_list;
</script>

<svelte:head>
	<title>Showly - Index</title>
</svelte:head>

<div class="p-5 flex justify-center sm:ml-20">
	<div
		class="flex justify-center sm:justify-start sm:w-[95%] flex-wrap gap-3"
	>
		{#await upcoming_list}
			<div
				class="w-full h-screen flex justify-center items-center scale-150"
			>
				<Spinner />
			</div>
		{:then list}
			<!-- {void console.log(list) || ''} -->
			{#each list.results as el}
				<DefaultCard {el} {data} {add_show} {delete_show} />
			{/each}
		{/await}
	</div>
</div>
