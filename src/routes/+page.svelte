<script>
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';
	import { show, show_add, show_del } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import { get } from 'svelte/store';
	import Spinner from './../components/UI/spinner.svelte';

	import EmptyShows from '$components/Feedback/empty_shows.svelte';
	import NotLogged from '$components/Feedback/not_logged.svelte';
	import '@splidejs/svelte-splide/css';

	import { TinySlider } from 'svelte-tiny-slider';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { onMount } from 'svelte';

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

	const load_shows = async () => {
		let val = get(show);

		loading = true;
		await val.forEach((element) => {
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
		loading = false;
	};

	onMount(async () => {
		if (data.session) {
			const { data: list_of_shows } = await data.supabase
				.from('shows_following')
				.select()
				.eq('user_id', data.session.user.id)
				.order('id', { ascending: true });

			let list = [];
			list_of_shows.forEach((e) => {
				list = [...list, e.show];
			});
			show.set(list);
		}

		load_shows();
	});

	//console.log(data);
	let upcoming_list, trending_list;

	$: upcoming_list = data.upcoming_list;
	$: trending_list = data.trending_list;
</script>

<div class="flex min-h-screen flex-col p-5">
	<div
		class="relative mt-10 flex flex-wrap justify-center gap-3 sm:mt-0 sm:justify-start"
	>
		{#if data.session}
			{#key show_list}
				{#if show_list.length > 0 && !loading}
					<TinySlider gap="4px">
						{#each show_list as el}
							<DefaultCard
								{el}
								{data}
								{add_show}
								{delete_show}
								defaultClass="flex aspect-[1/1.5]"
								shows={false}
							/>
						{/each}
						<svelte:fragment
							slot="controls"
							let:setIndex
							let:currentIndex
						>
							<button
								on:click={() => setIndex(currentIndex - 1)}
								class="absolute top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
							>
								<Icon
									icon="mdi:chevron-left-circle"
									class="text-5xl"
								/>
							</button>
							<button
								on:click={() => setIndex(currentIndex + 1)}
								class="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 duration-300 hover:opacity-100"
							>
								<Icon
									icon="mdi:chevron-right-circle"
									class="text-5xl"
								/>
							</button>
						</svelte:fragment>
					</TinySlider>
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
			<di class="flex w-full flex-1 items-center justify-center">
				<Spinner />
			</di>
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

			<TinySlider gap="4px">
				{#each list.results as el}
					{#if !$show.includes(el.id)}
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
						<Icon
							icon="mdi:chevron-right-circle"
							class="text-5xl"
						/>
					</button>
				</svelte:fragment>
			</TinySlider>
		{/await}
	</div>

	<div class="relative mb-20 sm:mt-5">
		{#await trending_list}
			<di class="flex w-full flex-1 items-center justify-center">
				<Spinner />
			</di>
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
			<TinySlider gap="4px">
				{#each list.results as el}
					{#if !$show.includes(el.id)}
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
						<Icon
							icon="mdi:chevron-right-circle"
							class="text-5xl"
						/>
					</button>
				</svelte:fragment>
			</TinySlider>
		{/await}
	</div>

	<!-- <div
		class="flex min-h-[30vh] flex-wrap justify-center gap-3 border sm:w-[95%] sm:justify-start"
	>
		asd
	</div> -->
</div>
