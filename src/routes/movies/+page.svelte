<script>
	import { dev } from '$app/environment';
	import Icon from '@iconify/svelte';
	import parse from 'node-html-parser';
	import { onMount } from 'svelte';
	import Spinner from '../../components/UI/spinner.svelte';
	import MovieCard from './../../components/movie_card.svelte';

	import { Splide, SplideSlide } from '@splidejs/svelte-splide/components';
	import '@splidejs/svelte-splide/css';

	import dayjs from 'dayjs';

	export let data;

	let streaming = Promise,
		stream_loading = true;

	let nowPlaying_list, popular_list, upcoming_list;

	const get_streaming_list = async () => {
		stream_loading = true;

		streaming = get_streaming_data(parse(await data.streaming));
		//console.log(await data.streaming);

		// let { data } = await axios.get('https://www.whentostream.com/');
		// get_streaming_data(parse(data));

		// streaming = await fetch(streaming_url, {
		// 	mode: 'cors',
		// 	method: 'GET',
		// 	headers: { 'Content-Type': 'application/html' },
		// })
		// 	.then((x) => x.text())
		// 	.then((x) => get_streaming_data(parse(x)));

		stream_loading = false;
		// console.log(await streaming);
		// streaming = get_streaming_data(streaming);
		//console.log(await movies_streaming);

		// let match = await movies_streaming.matchAll('href=".*?">(.*?)');
	};

	const get_streaming_data = (parsed) => {
		let sections = parsed.querySelectorAll(
			'section[data-test="page-section"]'
		);

		let temp = [];

		sections.forEach((e) => {
			let date = e.querySelector('p');

			if (date) {
				let items = e.querySelectorAll('ul');
				let d = dayjs(date.childNodes[0]._rawText);
				if (d.isValid()) date = d;

				items.forEach((x) => {
					let attr = JSON.parse(
						x.getAttribute('data-current-context')
					);

					attr.userItems.forEach((r) => {
						let title = r.button.buttonText;
						let reg = /\(.*?\)/;
						title = title.replace(reg, '').toLowerCase();

						temp = [
							...temp,
							{
								release_date: date,
								title: title,
								image: r.image.assetUrl,
							},
						];
					});

					// console.log(attr);
				});
			}
		});

		return temp;

		if (dev) console.log(temp);
	};

	onMount(() => {
		get_streaming_list();
	});

	$: nowPlaying_list = data.nowPlaying_list;
	$: popular_list = data.popular_list;
	$: upcoming_list = data.upcoming_list;

	//$: console.log(upcoming_list, data.upcoming_list);
</script>

<svelte:head>
	<title>Movies | Showly</title>
</svelte:head>

<div class="p-10">
	<div class="mt-5 sm:mt-5">
		{#if stream_loading}
			<di class="flex items-center justify-center flex-1 w-full">
				<Spinner />
			</di>
		{:else}
			<!-- {void console.log(streaming) || ''} -->
			<div class="flex justify-between w-full px-10 -mb-5 text-slate-500">
				<span>Streaming this month</span>
				<a
					href="https://whentostream.com"
					target="_blank"
					class="z-10 flex items-center gap-1 duration-300 hover:text-white"
				>
					Data from whentostream.com <Icon
						icon="mdi:chevron-right"
						class="text-2xl"
					/>
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
				class="w-full py-5 overflow-hidden"
			>
				{#each streaming as el}
					<SplideSlide class="flex aspect-[1/1.5]">
						<MovieCard {el} />
					</SplideSlide>
				{/each}
			</Splide>
		{/if}
	</div>

	<div class="mt-5 sm:mt-5">
		{#await nowPlaying_list}
			<di class="flex items-center justify-center flex-1 w-full">
				<Spinner />
			</di>
		{:then list}
			<div class="flex justify-between w-full px-10 -mb-5 text-slate-500">
				<span>Now in Theaters</span>
				<!-- <a
				href="/hot"
				class="z-10 flex items-center gap-1 duration-300 hover:text-white"
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
				class="w-full py-5 overflow-hidden"
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
			<di class="flex items-center justify-center flex-1 w-full">
				<Spinner />
			</di>
		{:then list}
			<div class="flex justify-between w-full px-10 -mb-5 text-slate-500">
				<span>Popular</span>
				<!-- <a
				href="/hot"
				class="z-10 flex items-center gap-1 duration-300 hover:text-white"
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
				class="w-full py-5 overflow-hidden"
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
			<di class="flex items-center justify-center flex-1 w-full">
				<Spinner />
			</di>
		{:then list}
			<div class="flex justify-between w-full px-10 -mb-5 text-slate-500">
				<span>Upcoming</span>
				<!-- <a
				href="/hot"
				class="z-10 flex items-center gap-1 duration-300 hover:text-white"
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
				class="w-full py-5 overflow-hidden"
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
