<script>
	import Spinner from '$components/UI/spinner.svelte';
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';
	import { show_add, show_del } from '$lib/shows';

	import { onMount } from 'svelte';
	import IntersectionObserver from '../../hooks/IntersectionObserver.svelte';

	export let data;

	let upcoming_list = [],
		current_page = 1,
		total_pages = 10,
		loading = true;

	const reload_list = async () => {
		loading = true;

		let response = await fetch(
			cfg.api_trending_url + '&page=' + current_page,
			cfg.api_options
		);

		const res = await response.json();

		total_pages = res.total_pages;
		current_page += 1;
		res.results.forEach((element) => {
			upcoming_list = [...upcoming_list, element];
		});

		loading = false;
	};
	const add_show = (id) => {
		show_add(data.supabase, data.session.user.id, id);
	};

	const delete_show = (id) => {
		show_del(data.supabase, data.session.user.id, id);
	};

	onMount(() => {
		reload_list();
	});
</script>

<div class="flex justify-center p-3">
	<div class="flex w-full flex-wrap justify-center gap-1">
		{#if loading && upcoming_list.length === 0}
			<div
				class="flex h-screen w-full scale-150 items-center justify-center"
			>
				<Spinner />
			</div>
		{:else}
			{#each upcoming_list as el}
				<DefaultCard {el} {data} {add_show} {delete_show} />
			{/each}

			<IntersectionObserver let:intersecting>
				{#if intersecting}
					{void reload_list() || ''}
				{/if}
			</IntersectionObserver>
		{/if}
	</div>
</div>
