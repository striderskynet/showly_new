<script>
	import cfg from '$config/main';
	import { show } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	import { scale } from 'svelte/transition';

	dayjs.extend(relativeTime);

	export let data; // Data info for sessions and database;
	export let delete_show; // Return function
	export let add_show; // Return function
	export let el; // Element info
	export let shows = true;
	export let defaultClass = '';

	// if (dev) console.log(el, $show);

	if (el.next_episode_to_air)
		el.air_date = dayjs(el.next_episode_to_air.air_date);
	else el.air_date = dayjs(el.first_air_date);

	// console.log(el.first_air_date, el.name);
	el.address = cfg.show_address(el);
	el.followed = $show.includes(String(el.id));

	console.log(el, $show, $show.includes(el.id));
</script>

<a
	in:scale={{ duration: 500 }}
	out:scale={{ duration: 500 }}
	href={el.address}
	class="relative group sm:min-w-[200px] {shows
		? 'aspect-[1/1.5] min-w-[48%] '
		: 'w-full min-w-[200px]'} flex {el.poster_path
		? ''
		: 'bg-zinc-950 border-gray-600'} rounded-xl overflow-hidden cursor-pointer border
        {el.next_episode_to_air?.episode_number === 1
		? 'border-yellow-800'
		: el.followed
			? 'border-sky-800'
			: 'border-transparent'} hover:border-slate-800 duration-500 overflow-hidden {defaultClass}"
>
	<!-- {void console.log(el.poster_path) || ''} -->
	{#if el.poster_path}
		<img
			alt="Poster Imagen"
			src={cfg.image_path + '780' + el.poster_path}
			class="absolute object-contain w-full duration-300 group-hover:scale-110"
		/>
	{:else if el.backdrop_path}
		<img
			alt="Poster Imagen"
			src={cfg.image_path + '780' + el.backdrop_path}
			class="absolute object-cover w-full h-full duration-300 group-hover:scale-110"
		/>
	{:else}
		<div
			class="flex items-center justify-center w-full h-full duration-300 group-hover:blur"
		>
			<Icon
				icon="mdi:file-image-remove"
				class="w-20 text-white text-9xl "
			/>
		</div>
	{/if}

	{#if el.vote_average}
		<div
			class="absolute top-0 right-0 flex items-center justify-center h-6 gap-1 px-1 text-xs text-white bg-black bg-opacity-75 rounded-bl-lg"
		>
			<Icon icon="mdi:star" class="text-xl text-yellow-500" />
			<span class="">
				{Number(el.vote_average).toFixed(
					Number(el.vote_average) % 10 === 0 ? 0 : 1
				)}
			</span>
		</div>
	{/if}
	<div
		class="absolute bottom-0 flex flex-col w-full bg-gradient-to-t {el
			.next_episode_to_air?.episode_number === 1
			? 'from-yellow-800'
			: el.followed
				? 'from-sky-800'
				: 'from-black'} to-transparent backdrop-blur py-2 text-base text-white duration-300 justify-center"
	>
		{#if el.next_episode_to_air}
			<div
				class="flex flex-col h-0 duration-300 opacity-0 group-hover:opacity-100 group-hover:h-12"
			>
				<span
					class="px-5 text-xs text-center truncate line-clamp-1 text-clip text-pretty"
				>
					<!-- {el.next_episode_to_air.air_date} -->
					S{el.next_episode_to_air.season_number} E{el
						.next_episode_to_air.episode_number}
				</span>
				<span
					class="px-5 text-xs text-center truncate line-clamp-1 text-clip text-pretty"
				>
					{el.next_episode_to_air.name}
				</span>
				<hr class="my-1 border-gray-800" />
			</div>
		{:else if el.status}
			<div
				class="flex flex-col h-0 duration-300 opacity-0 group-hover:opacity-100 group-hover:h-6"
			>
				<span
					class="px-5 text-xs text-center truncate line-clamp-1 text-clip text-pretty"
				>
					{el.status}
				</span>
				<hr class="my-1 border-gray-800" />
			</div>
		{/if}

		<span class="text-center truncate line-clamp-1 text-clip text-pretty">
			{el.name}
		</span>
	</div>

	<span
		class="absolute flex items-center h-6 px-2 text-sm text-center text-white truncate bg-black bg-opacity-75 rounded-br-lg line-clamp-1 text-clip text-pretty"
	>
		<span class="flex duration-300 group-hover:hidden">
			{el?.air_date?.fromNow()}</span
		>
		<span class="hidden duration-300 group-hover:flex">
			{el?.air_date?.format('MMMM D')}</span
		>
	</span>

	{#if data.session}
		<span
			class="absolute flex items-center justify-center w-full h-full duration-300 sm:group-hover:opacity-100 sm:opacity-0"
		>
			{#if el.followed}
				<a
					data-sveltekit-preload-data="false"
					class="group-hover:bg-black rounded-xl group-hover:bg-opacity-50"
					href={'/show/remove/' + el.id}
					on:click|preventDefault={() => {
						delete_show(el.id);
						el.followed ^= true;
					}}
				>
					<Icon
						icon="mdi:bookmark-remove"
						class="text-4xl text-red-500 duration-300 rounded sm:text-7xl hover:text-rose-800"
					/>
				</a>
			{:else}
				<a
					data-sveltekit-preload-data="false"
					class="group-hover:bg-black rounded-xl group-hover:bg-opacity-50"
					href={'/show/add/' + el.id}
					on:click|preventDefault={() => {
						// show_toggle(data.supabase, data.session.user.id, el.id);
						add_show(el.id, el);
						el.followed ^= true;
					}}
				>
					<Icon
						icon="mdi:bookmark-plus"
						class="text-4xl duration-300 rounded sm:text-7xl text-slate-200 hover:text-sky-500"
					/>
				</a>
			{/if}
		</span>
	{/if}
</a>
