<script>
	import { dev } from '$app/environment';
	import Icon from '@iconify/svelte';
	import { parse } from 'node-html-parser';
	import { onMount } from 'svelte';
	import Spinner from '../../components/UI/spinner.svelte';
	import MovieCard from './../../components/movie_card.svelte';

	import { Splide, SplideSlide } from '@splidejs/svelte-splide/components';
	import '@splidejs/svelte-splide/css';

	import dayjs from 'dayjs';

	export let data;
	let streaming_url = `https://www.whentostream.com/${dayjs().format('MMMM-YYYY').toLowerCase()}-streaming`,
		streaming = Promise,
		stream_loading = true;

	let nowPlaying_list, popular_list, upcoming_list;

	const get_streaming_list = async () => {
		stream_loading = true;

		// let { data } = await axios.get('https://www.whentostream.com/');
		// get_streaming_data(parse(data));

		streaming = await fetch(streaming_url, {
			mode: 'cors',
			method: 'GET',
			headers: { 'Content-Type': 'application/html' },
		})
			.then((x) => x.text())
			.then((x) => get_streaming_data(parse(x)));

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

<div class="p-10">
	<div class="mt-5 sm:mt-5">
		{#if stream_loading}
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:else}
			{void console.log(streaming) || ''}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Streaming this month</span>
				<a
					href="https://whentostream.com"
					target="_blank"
					class="hover:text-white duration-300 flex items-center gap-1 z-10"
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
				class="w-full overflow-hidden py-5 "
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
			<di class="flex flex-1 w-full justify-center items-center">
				<Spinner />
			</di>
		{:then list}
			<div class="text-slate-500 -mb-5 flex w-full justify-between px-10">
				<span>Now in Theaters</span>
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
