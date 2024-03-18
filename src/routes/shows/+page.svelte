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

	let loading = true,
		show_list = [];

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
					res.date_diff = 1000;

					if (res.next_episode_to_air) {
						let newDay = dayjs(
							res.next_episode_to_air.air_date,
							'YYYY-MM-DD'
						);
						res.day_diff = newDay.diff(dayjs(), 'days');
						res.day_diff_title = newDay.fromNow();
					}

					console.log(res);
					show_list = [...show_list, res];

					show_list.sort(compare);
				});
		});
	});
</script>

<form class="max-w-md mx-auto">
	<label
		for="default-search"
		class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
		>Search</label
	>
	<div class="relative">
		<div
			class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
		>
			<svg
				class="w-4 h-4 text-gray-500 dark:text-gray-400"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 20 20"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
				/>
			</svg>
		</div>
		<input
			type="search"
			id="default-search"
			class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			placeholder="Search Mockups, Logos..."
			required
		/>
		<button
			type="submit"
			class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			>Search</button
		>
	</div>
</form>

<div
	class="p-5 flex justify-center sm:ml-20 {data.session ||
	show_list.length !== 0
		? ''
		: 'min-h-screen'}"
>
	<div
		class="flex justify-center sm:justify-start sm:w-[95%] flex-wrap gap-3"
	>
		{#if data.session}
			{#key show_list}
				{#if show_list.length > 0}
					{#each show_list as el}
						<DefaultCard {el} {data} {delete_show} />
					{/each}
				{:else}
					<EmptyShows />
				{/if}
			{/key}
		{:else}
			<NotLogged />
		{/if}
	</div>
</div>
