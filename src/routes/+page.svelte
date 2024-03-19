<script>
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';
	import { show, show_add, show_del } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Spinner from './../components/UI/spinner.svelte';

	import EmptyShows from '$components/Feedback/empty_shows.svelte';
	import NotLogged from '$components/Feedback/not_logged.svelte';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css';

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

	const add_show = (id, show) => {
		show_add(data.supabase, data.session.user.id, id);
		show_list = [show, ...show_list];

		show_list.sort(compare);
	};

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

	let upcoming_list, trending_list;

	$: (upcoming_list = data.upcoming_list),
		(trending_list = data.trending_list);
</script>

<div class="p-5 flex flex-col min-h-screen">
	<div class="flex justify-center sm:justify-start flex-wrap gap-3">
		{#if data.session}
			{#key show_list}
				{#if show_list.length > 0}
					<Splide
						options={{
							arrows: true,
							perPage: 6.3,
							focus: 'left',
							snap: true,
							pagination: false,
							gap: '12px',
						}}
						class="w-full overflow-hidden py-5"
					>
						{#each show_list as el}
							<SplideSlide class="flex aspect-[1/1.5]">
								<DefaultCard
									{el}
									{data}
									{add_show}
									{delete_show}
									shows={false}
								/>
							</SplideSlide>
						{/each}
					</Splide>
				{:else}
					<EmptyShows />
				{/if}
			{/key}
		{:else}
			<NotLogged />
		{/if}
	</div>

	<div class="mt-20 sm:mt-5">
		{#await upcoming_list}
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:then list}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Upcoming</span>
				<a
					href="/hots"
					class="hover:text-white duration-300 flex items-center gap-1 z-10"
				>
					More <Icon icon="mdi:chevron-right" class="text-2xl" />
				</a>
			</div>
			<Splide
				options={{
					arrows: true,
					perPage: 'auto',
					focus: 'left',
					snap: true,
					pagination: false,
					gap: '12px',
				}}
				class="w-full overflow-hidden py-5 "
			>
				<!-- {void console.log(list) || ''} -->
				{#each list.results as el}
					{#if !$show.includes(el.id)}
						<SplideSlide class="flex aspect-[1/1.5]">
							<DefaultCard
								{el}
								{data}
								{add_show}
								{delete_show}
								shows={false}
							/>
						</SplideSlide>
					{/if}
				{/each}
			</Splide>
		{/await}
	</div>

	<div class="mt-20 sm:mt-0 mb-20">
		{#await trending_list}
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:then list}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Trending</span>
				<a
					href="/trending"
					class="hover:text-white duration-300 flex items-center gap-1 z-10"
				>
					More <Icon icon="mdi:chevron-right" class="text-2xl" />
				</a>
			</div>
			<Splide
				options={{
					arrows: true,
					perPage: 'auto',
					focus: 'left',
					snap: true,
					pagination: false,
					gap: '12px',
				}}
				class="w-full overflow-hidden py-5 "
			>
				<!-- {void console.log(list) || ''} -->
				{#each list.results as el}
					{#if !$show.includes(el.id)}
						<SplideSlide class="flex aspect-[1/1.5]">
							<DefaultCard
								{el}
								{data}
								{add_show}
								{delete_show}
								shows={false}
							/>
						</SplideSlide>
					{/if}
				{/each}
			</Splide>
		{/await}
	</div>

	<!-- <div
		class="flex justify-center sm:justify-start sm:w-[95%] min-h-[30vh] flex-wrap gap-3 border"
	>
		asd
	</div> -->
</div>
