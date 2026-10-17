<script>
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';
	import { show, show_add, show_del } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import Spinner from './../components/UI/spinner.svelte';

	import EmptyShows from '$components/Feedback/empty_shows.svelte';
	import NotLogged from '$components/Feedback/not_logged.svelte';
	import '@splidejs/svelte-splide/css';

	import { TinySlider } from 'svelte-tiny-slider';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	export let data;

	let loading = true;
	let show_list = [];
	let loaded_user_id = null;

	function compare(a, b) {
		if (a.day_diff < b.day_diff) return -1;
		if (a.day_diff > b.day_diff) return 1;
		return 0;
	}

	const add_show = (id, showItem) => {
		show_add(data.supabase, data.session.user.id, id);
		show_list = [showItem, ...show_list].sort(compare);
	};

	const delete_show = (id) => {
		show_del(data.supabase, data.session.user.id, id);
		show_list = show_list.filter((o) => o.id !== id);
	};

	const fetch_show = async (id) => {
		try {
			const res = await fetch(cfg.api_show_id + id, cfg.api_options).then((r) => r.json());
			res.day_diff = 10000;
			if (res.next_episode_to_air) {
				const newDay = dayjs(res.next_episode_to_air.air_date, 'YYYY-MM-DD');
				res.day_diff = newDay.diff(dayjs(), 'days');
				res.day_diff_title = newDay.fromNow();
			}
			return res;
		} catch (e) {
			console.error('Error loading show', id, e);
			return null;
		}
	};

	const load_shows = async (ids) => {
		const results = await Promise.all(ids.map((id) => fetch_show(id)));
		show_list = results.filter(Boolean).sort(compare);
	};

	const load_following_shows = async () => {
		loading = true;
		show_list = [];

		try {
			const { data: list_of_shows, error } = await data.supabase
				.from('shows_following')
				.select()
				.eq('user_id', data.session.user.id)
				.order('id', { ascending: true });

			if (error) throw error;

			const list = (list_of_shows ?? []).map((e) => e.show);
			show.set(list);

			await load_shows(list);
		} catch (e) {
			console.error('Error loading following shows', e);
			show_list = [];
		} finally {
			loading = false;
		}
	};

	// Reacciona a la llegada (o cambio) de la sesión — no depende de onMount
	$: {
		const userId = data?.session?.user?.id ?? null;

		if (userId && userId !== loaded_user_id) {
			loaded_user_id = userId;
			load_following_shows();
		} else if (!userId) {
			loaded_user_id = null;
			show_list = [];
			show.set([]);
			loading = false;
		}
	}

	let upcoming_list, trending_list;

	const safePromise = (p) =>
		Promise.resolve(p)
			.then((v) => v ?? { results: [] })
			.catch(() => ({ results: [] }));

	$: upcoming_list = safePromise(data?.upcoming_list);
	$: trending_list = safePromise(data?.trending_list);
</script>

<div class="flex min-h-screen flex-col p-5">
	<div class="relative mt-10 flex flex-wrap justify-center gap-3 sm:mt-0 sm:justify-start">
		{#if data.session}
			{#if loading}
				<div class="flex w-full items-center justify-center py-10">
					<Spinner />
				</div>
			{:else if show_list.length > 0}
				{#key show_list}
					<TinySlider gap="4px">
						{#each show_list as el (el.id)}
							<DefaultCard
								{el}
								{data}
								{add_show}
								{delete_show}
								defaultClass="flex aspect-[1/1.5]"
								shows={false}
							/>
						{/each}
						<svelte:fragment slot="controls" let:setIndex let:currentIndex>
							<button
								on:click={() => setIndex(currentIndex - 1)}
								class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
							>
								<Icon icon="mdi:chevron-left-circle" class="text-5xl" />
							</button>
							<button
								on:click={() => setIndex(currentIndex + 1)}
								class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
							>
								<Icon icon="mdi:chevron-right-circle" class="text-5xl" />
							</button>
						</svelte:fragment>
					</TinySlider>
				{/key}
			{:else}
				<EmptyShows />
			{/if}
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
				<a href="/hot" class="z-10 flex items-center gap-1 duration-300 hover:text-white">
					More <Icon icon="mdi:chevron-right" class="text-2xl" />
				</a>
			</div>

			<TinySlider gap="4px">
				{#each list.results as el (el.id)}
					{#if !$show?.includes(el.id)}
						<DefaultCard
							{el}
							{data}
							{add_show}
							{delete_show}
							defaultClass="flex aspect-[1/1.5]"
							shows={false}
						/>
					{/if}
				{/each}
				<svelte:fragment slot="controls" let:setIndex let:currentIndex>
					<button
						on:click={() => setIndex(currentIndex - 1)}
						class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
					>
						<Icon icon="mdi:chevron-left-circle" class="text-5xl" />
					</button>
					<button
						on:click={() => setIndex(currentIndex + 1)}
						class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
					>
						<Icon icon="mdi:chevron-right-circle" class="text-5xl" />
					</button>
				</svelte:fragment>
			</TinySlider>
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
				<a href="/trending" class="z-10 flex items-center gap-1 duration-300 hover:text-white">
					More <Icon icon="mdi:chevron-right" class="text-2xl" />
				</a>
			</div>
			<TinySlider gap="4px">
				{#each list.results as el (el.id)}
					{#if !$show?.includes(el.id)}
						<DefaultCard
							{el}
							{data}
							{add_show}
							{delete_show}
							defaultClass="flex aspect-[1/1.5]"
							shows={false}
						/>
					{/if}
				{/each}

				<svelte:fragment slot="controls" let:setIndex let:currentIndex>
					<button
						on:click={() => setIndex(currentIndex - 1)}
						class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
					>
						<Icon icon="mdi:chevron-left-circle" class="text-5xl" />
					</button>
					<button
						on:click={() => setIndex(currentIndex + 1)}
						class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
					>
						<Icon icon="mdi:chevron-right-circle" class="text-5xl" />
					</button>
				</svelte:fragment>
			</TinySlider>
		{/await}
	</div>
</div>