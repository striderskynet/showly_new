<script>
	import Spinner from '../../components/UI/spinner.svelte';
	import MovieCard from './../../components/movie_card.svelte';

	import { Splide, SplideSlide } from '@splidejs/svelte-splide/components';
	import '@splidejs/svelte-splide/css';

	export let data;

	let nowPlaying_list, popular_list, upcoming_list;

	$: nowPlaying_list = data.nowPlaying_list;
	$: popular_list = data.popular_list;
	$: upcoming_list = data.upcoming_list;

	//$: console.log(upcoming_list, data.upcoming_list);
</script>

<div class="p-10">
	<div class="mt-5 sm:mt-5">
		{#await nowPlaying_list}
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:then list}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Now Playing</span>
				<!-- <a
				href="/hot"
				class="hover:text-white duration-300 flex items-center gap-1 z-10"
			>
				More <Icon icon="mdi:chevron-right" class="text-2xl" />
			</a> -->
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
					<SplideSlide class="flex aspect-[1/1.5]">
						<MovieCard {el} />
					</SplideSlide>
				{/each}
			</Splide>
		{/await}
	</div>

	<div class="mt-5 sm:mt-5">
		{#await popular_list}
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:then list}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Popular</span>
				<!-- <a
				href="/hot"
				class="hover:text-white duration-300 flex items-center gap-1 z-10"
			>
				More <Icon icon="mdi:chevron-right" class="text-2xl" />
			</a> -->
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
					<SplideSlide class="flex aspect-[1/1.5]">
						<MovieCard {el} />
					</SplideSlide>
				{/each}
			</Splide>
		{/await}
	</div>

	<div class="mt-5 sm:mt-5">
		{#await upcoming_list}
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:then list}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Upcoming</span>
				<!-- <a
				href="/hot"
				class="hover:text-white duration-300 flex items-center gap-1 z-10"
			>
				More <Icon icon="mdi:chevron-right" class="text-2xl" />
			</a> -->
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
					<SplideSlide class="flex aspect-[1/1.5]">
						<MovieCard {el} />
					</SplideSlide>
				{/each}
			</Splide>
		{/await}
	</div>
</div>
