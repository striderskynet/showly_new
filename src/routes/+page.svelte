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

	/** @type {{data: any}} */
	let { data } = $props();

	let loading = $state(true);
	let error = $state(null);
	let show_list = $state([]);

	const compare = (a, b) => a.day_diff - b.day_diff;

	/** Añade `day_diff` / `day_diff_title` usados para ordenar y mostrar. */
	function enrichShow(res) {
		const next = res?.next_episode_to_air;
		const nextDate = next?.air_date
			? dayjs(next.air_date, 'YYYY-MM-DD')
			: null;

		return {
			...res,
			day_diff: nextDate ? nextDate.diff(dayjs(), 'days') : 10000,
			day_diff_title: nextDate ? nextDate.fromNow() : undefined,
		};
	}

	async function fetchShow(id) {
		const res = await fetch(`${cfg.api_show_id}${id}`, cfg.api_options);
		if (!res.ok) throw new Error(`Failed to fetch show ${id}`);
		return enrichShow(await res.json());
	}

	async function loadShows() {
		loading = true;
		error = null;

		try {
			const ids = get(show) ?? [];
			const results = await Promise.allSettled(ids.map(fetchShow));

			show_list = results
				.filter((r) => r.status === 'fulfilled')
				.map((r) => r.value)
				.sort(compare);
		} catch (e) {
			error = e;
		} finally {
			loading = false;
		}
	}

	// Update optimista + rollback si falla la BD.
	async function add_show(id, show_item) {
		const enriched = enrichShow(show_item);
		show_list = [enriched, ...show_list].sort(compare);

		try {
			await show_add(data.supabase, data.session.user.id, id);
		} catch (e) {
			console.error('add_show failed', e);
			show_list = show_list.filter((s) => s.id !== id);
		}
	}

	async function delete_show(id) {
		const previous = show_list;
		show_list = show_list.filter((s) => s.id !== id);

		try {
			await show_del(data.supabase, data.session.user.id, id);
		} catch (e) {
			console.error('delete_show failed', e);
			show_list = previous;
		}
	}

	onMount(async () => {
		if (!data.session) {
			loading = false;
			return;
		}

		const { data: list_of_shows, error: dbError } = await data.supabase
			.from('shows_following')
			.select()
			.eq('user_id', data.session.user.id)
			.order('id', { ascending: true });

		if (dbError) {
			error = dbError;
			loading = false;
			return;
		}

		show.set(list_of_shows.map((e) => e.show));
		await loadShows();
	});

	let upcoming_list = $derived(data.upcoming_list);
	let trending_list = $derived(data.trending_list);
</script>

<div class="flex min-h-screen flex-col gap-6 px-5 py-6 sm:px-10">
	<!-- Mis series -->
	<section>
		<header class="mb-3 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-slate-200">My Shows</h2>
		</header>

		{#if !data.session}
			<NotLogged />
		{:else if loading}
			<div class="flex w-full justify-center py-12">
				<Spinner />
			</div>
		{:else if error}
			<div
				class="flex flex-col items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
			>
				<span>We couldn't load your shows.</span>
				<button
					class="font-medium underline underline-offset-2 transition hover:text-red-200"
					onclick={loadShows}
				>
					Try again
				</button>
			</div>
		{:else if show_list.length === 0}
			<EmptyShows />
		{:else}
			<ShowSlider list={show_list} {data} {add_show} {delete_show} />
		{/if}
	</section>

	<!-- Próximos -->
	<section>
		<header
			class="mb-3 flex items-center justify-between px-2 text-slate-400"
		>
			<h2 class="text-base font-medium">Upcoming</h2>
			<a
				href="/hot"
				class="z-10 flex items-center gap-1 transition hover:text-white"
			>
				More <Icon icon="mdi:chevron-right" class="text-2xl" />
			</a>
		</header>

		{#await upcoming_list}
			<div class="flex w-full justify-center py-12">
				<Spinner />
			</div>
		{:then list}
			<ShowSlider
				list={list.results}
				{data}
				{add_show}
				{delete_show}
				filterFollowed
			/>
		{:catch}
			<div
				class="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-400"
			>
				Couldn't load upcoming shows.
			</div>
		{/await}
	</section>

	<!-- Tendencias -->
	<section class="mb-16">
		<header
			class="mb-3 flex items-center justify-between px-2 text-slate-400"
		>
			<h2 class="text-base font-medium">Trending</h2>
			<a
				href="/trending"
				class="z-10 flex items-center gap-1 transition hover:text-white"
			>
				More <Icon icon="mdi:chevron-right" class="text-2xl" />
			</a>
		</header>

		{#await trending_list}
			<div class="flex w-full justify-center py-12">
				<Spinner />
			</div>
		{:then list}
			<ShowSlider
				list={list.results}
				{data}
				{add_show}
				{delete_show}
				filterFollowed
			/>
		{:catch}
			<div
				class="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-400"
			>
				Couldn't load trending shows.
			</div>
		{/await}
	</section>
</div>
