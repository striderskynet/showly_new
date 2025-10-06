<script>
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';
	import { show, show_del } from '$lib/shows.js';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import EmptyShows from '$components/Feedback/empty_shows.svelte';
	import NotLogged from '$components/Feedback/not_logged.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	export let data;

	let show_list = [];

	function compare(a, b) {
		if (a.day_diff < b.day_diff) {
			return -1;
		}
		if (a.day_diff > b.day_diff) {
			return 1;
		}
		return 0;
	}

	const delete_show = (id) => {
		show_del(data.supabase, data.session.user.id, id);

		let new_list = show_list.filter((o) => o.id !== id);
		show_list = new_list;
	};

	onMount(() => {
		let val = get(show);

		val.forEach((element) => {
			fetch(cfg.api_show_id + element, cfg.api_options)
				.then((res) => res.json())
				.then((res) => {
					res.day_diff = 10000;

					if (res.next_episode_to_air) {
						let newDay = dayjs(
							res.next_episode_to_air.air_date,
							'YYYY-MM-DD'
						);
						res.day_diff = newDay.diff(dayjs(), 'days');
						res.day_diff_title = newDay.fromNow();
					}

					show_list = [...show_list, res];

					show_list.sort(compare);
				});
		});
	});
</script>

<svelte:head>
	<title>My Shows | Showly</title>
</svelte:head>
{#if data.session}
	<div
		class="p-5 flex justify-center w-full {data.session ||
		show_list.length !== 0
			? ''
			: 'min-h-screen'}"
	>
		<div
			class="flex justify-center sm:justify-start w-full sm:w-[95%] flex-wrap gap-3"
		>
			{#key show_list}
				{#if show_list.length > 0}
					{#each show_list as el}
						<DefaultCard
							{el}
							{data}
							{delete_show}
							add_show={null}
						/>
					{/each}
				{:else}
					<EmptyShows />
				{/if}
			{/key}
		</div>
	</div>
{:else}
	<div class="flex p-5">
		<NotLogged />
	</div>
{/if}
