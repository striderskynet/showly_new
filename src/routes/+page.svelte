<script>
	import cfg from '$config/main';
	import { show, show_add, show_del } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import EmptyShows from '$components/Feedback/empty_shows.svelte';
	import NotLogged from '$components/Feedback/not_logged.svelte';
	import ShowSlider from '$components/ShowSlider.svelte';
	import Spinner from './../components/UI/spinner.svelte';

	import '@splidejs/svelte-splide/css';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	export let data;

	let loading = true;
	let show_list = [];

	const compare = (a, b) => a.day_diff - b.day_diff;

	const add_show = (id, show_item) => {
		show_add(data.supabase, data.session.user.id, id);
		show_list = [show_item, ...show_list].sort(compare);
	};

	const delete_show = (id) => {
		show_del(data.supabase, data.session.user.id, id);
		show_list = show_list.filter((o) => o.id !== id);
	};

	/** Adds `day_diff` / `day_diff_title` used for sorting + display. */
	const enrichShow = (res) => {
		res.day_diff = 10000;

		if (res.next_episode_to_air) {
			const next = dayjs(res.next_episode_to_air.air_date, 'YYYY-MM-DD');
			res.day_diff = next.diff(dayjs(), 'days');
			res.day_diff_title = next.fromNow();
		}

		return res;
	};

	const load_shows = async () => {
		loading = true;

		const ids = get(show);
		const results = await Promise.all(
			ids.map((id) =>
				fetch(cfg.api_show_id + id, cfg.api_options)
					.then((res) => res.json())
					.then(enrichShow)
			)
		);

		show_list = results.sort(compare);
		loading = false;
	};

	onMount(async () => {
		if (data.session) {
			const { data: list_of_shows } = await data.supabase
				.from('shows_following')
				.select()
				.eq('user_id', data.session.user.id)
				.order('id', { ascending: true });

			show.set(list_of_shows.map((e) => e.show));
		}

		load_shows();
	});

	$: upcoming_list = data.upcoming_list;
	$: trending_list = data.trending_list;
</script>

<div class="flex min-h-screen flex-col p-5">
	<div
		class="relative mt-10 flex flex-wrap justify-center gap-3 sm:mt-0 sm:justify-start"
	>
		{#if data.session}
			{#key show_list}
				{#if !loading && show_list.length > 0}
					<ShowSlider
						list={show_list}
						{data}
						{add_show}
						{delete_show}
					/>
				{:else}
					<EmptyShows />
				{/if}
			{/key}
		{:else}
			<NotLogged />
		{/if}
	</div>

	<div class="relative mt-5 sm:mt-5">
		{#await upcoming_list}
			<div class="flex w-full flex-1 items-center justify-center">
				<Spinner />
			</div>
		{:then list}
			<div class="mb-2 flex w-full justify-between px-10 text-slate-500">
				<span>Upcoming</span>
				<a
					href="/hot"
					class="z-10 flex items-center gap-1 duration-300 hover:text-white"
				>
					More <Icon icon="mdi:chevron-right" class="text-2xl" />
				</a>
			</div>

			<ShowSlider
				list={list.results}
				{data}
				{add_show}
				{delete_show}
				filterFollowed
			/>
		{/await}
	</div>

	<div class="relative mb-20 sm:mt-5">
		{#await trending_list}
			<div class="flex w-full flex-1 items-center justify-center">
				<Spinner />
			</div>
		{:then list}
			<div class="flex w-full justify-between px-10 text-slate-500">
				<span>Trending</span>
				<a
					href="/trending"
					class="z-10 flex items-center gap-1 duration-300 hover:text-white"
				>
					More <Icon icon="mdi:chevron-right" class="text-2xl" />
				</a>
			</div>

			<ShowSlider
				list={list.results}
				{data}
				{add_show}
				{delete_show}
				filterFollowed
			/>
		{/await}
	</div>
</div>