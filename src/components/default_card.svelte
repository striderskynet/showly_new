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

	console.log(el);

	if (el.next_episode_to_air)
		el.air_date = dayjs(el.next_episode_to_air.air_date);
	else el.air_date = dayjs(el.first_air_date);

	// console.log(el.first_air_date, el.name);
	el.address = cfg.show_address(el);
	el.followed = $show.includes(el.id);
</script>

<a
	in:scale={{ duration: 500, delay: 200 }}
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
			: 'border-transparent'} hover:border-slate-800 duration-500"
>
	<!-- {void console.log(el.poster_path) || ''} -->
	{#if el.poster_path}
		<img
			alt="Poster Imagen"
			src={cfg.image_path + '780' + el.poster_path}
			class="absolute object-contain w-full group-hover:blur duration-300"
		/>
	{:else if el.backdrop_path}
		<img
			alt="Poster Imagen"
			src={cfg.image_path + '780' + el.backdrop_path}
			class="absolute object-cover w-full h-full group-hover:blur duration-300"
		/>
	{:else}
		<div
			class="flex w-full h-full justify-center items-center group-hover:blur duration-300"
		>
			<Icon
				icon="mdi:file-image-remove"
				class="text-white w-20 text-9xl "
			/>
		</div>
	{/if}

	{#if el.vote_average}
		<div
			class="absolute top-0 right-0 bg-black bg-opacity-75 rounded-lg h-6 text-white flex items-center px-2 gap-1 text-xs justify-center"
		>
			<Icon icon="mdi:star" class="text-yellow-500 text-2xl" />
			<span class="pt-1">
				{Number(el.vote_average).toFixed(
					Number(el.vote_average) % 10 === 0 ? 0 : 1
				)}
			</span>
		</div>
	{/if}
	<div
		class="absolute bottom-0 flex flex-col w-full bg-gradient-to-t from-black to-transparent backdrop-blur py-2 text-base text-white duration-300 justify-center"
	>
		{#if el.next_episode_to_air}
			<div
				class="flex flex-col opacity-0 group-hover:opacity-100 h-0 group-hover:h-12 duration-300"
			>
				<span
					class="line-clamp-1 text-clip text-pretty truncate px-5 text-xs text-center"
				>
					<!-- {el.next_episode_to_air.air_date} -->
					S{el.next_episode_to_air.season_number} E{el
						.next_episode_to_air.episode_number}
				</span>
				<span
					class="line-clamp-1 text-clip text-pretty truncate px-5 text-xs text-center"
				>
					{el.next_episode_to_air.name}
				</span>
				<hr class="border-gray-800 my-1" />
			</div>
		{:else if el.status}
			<div
				class="flex flex-col opacity-0 group-hover:opacity-100 h-0 group-hover:h-6 duration-300"
			>
				<span
					class="line-clamp-1 text-clip text-pretty truncate px-5 text-xs text-center"
				>
					{el.status}
				</span>
				<hr class="border-gray-800 my-1" />
			</div>
		{/if}

		<span class="line-clamp-1 text-clip text-pretty truncate text-center">
			{el.name}
		</span>
	</div>

	<span
		class="absolute bg-black bg-opacity-75 text-white h-6 items-center flex line-clamp-1 text-clip text-pretty truncate px-2 text-sm text-center rounded-lg"
	>
		{el?.air_date?.fromNow()}
	</span>

	{#if data.session}
		<span
			class="absolute top-2 right-2 sm:top-1/2 sm:left-1/2 sm:-translate-y-1/2 sm:-translate-x-[40%] sm:group-hover:opacity-100 sm:opacity-0 duration-300"
		>
			{#if el.followed}
				<a
					data-sveltekit-preload-data="false"
					href={'/show/remove/' + el.id}
					on:click|preventDefault={() => {
						delete_show(el.id);
						el.followed ^= true;
					}}
				>
					<Icon
						icon="mdi:bookmark-remove"
						class="text-4xl sm:text-7xl text-red-500 hover:text-rose-500 rounded duration-300"
					/>
				</a>
			{:else}
				<a
					data-sveltekit-preload-data="false"
					href={'/show/add/' + el.id}
					on:click|preventDefault={() => {
						// show_toggle(data.supabase, data.session.user.id, el.id);
						add_show(el.id, el);
						el.followed ^= true;
					}}
				>
					<Icon
						icon="mdi:bookmark-plus"
						class="text-4xl sm:text-7xl text-slate-200 hover:text-sky-500 rounded duration-300"
					/>
				</a>
			{/if}
		</span>
	{/if}
</a>
