<script>
	import cfg from '$config/main';
	import { show } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	import { scale } from 'svelte/transition';

	export let data;

	export let delete_show;
	export let add_show;
	export let shows = true;

	//console.log(data);
	dayjs.extend(relativeTime);
	export let el;

	const show_address = () => {
		let name = el.name.replaceAll(' ', '-');
		let address = '/show/' + el.id + '/' + name;
		return address;
	};

	el.air_date = dayjs(el.first_air_date);

	// console.log(el.first_air_date, el.name);
	el.address = show_address();
	el.followed = $show.includes(el.id);
</script>

<a
	in:scale={{ duration: 500, delay: 200 }}
	out:scale={{ duration: 500 }}
	href={el.address}
	on:click={console.log(el)}
	class="relative group {shows
		? 'w-[80%] sm:w-[15%] aspect-[1/1.5]'
		: 'w-full'} flex {el.poster_path
		? ''
		: 'bg-slate-500'} rounded-xl overflow-hidden cursor-pointer border {el.followed
		? 'border-sky-500'
		: 'border-transparent'} hover:border-slate-800 duration-500"
>
	<!-- {void console.log(el.poster_path) || ''} -->
	{#if el.poster_path}
		<img
			alt="Poster Imagen"
			src={cfg.image_path + '780' + el.poster_path}
			class="absolute object-contain w-full group-hover:blur duration-300"
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

	<div
		class="absolute bottom-0 flex w-full bg-gradient-to-t from-black to-transparent backdrop-blur py-2 text-base text-white duration-300 justify-center"
	>
		<span
			class="line-clamp-1 text-clip text-pretty truncate w-[80%] text-center"
		>
			{el.name}
		</span>
	</div>

	<span
		class="absolute bg-sky-800 text-white line-clamp-1 text-clip text-pretty truncate px-2 text-sm text-center rounded"
	>
		{el?.air_date?.fromNow()}
	</span>

	{#if data.session}
		<span
			class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:opacity-100 opacity-0 duration-300"
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
						class="text-7xl text-red-500 hover:text-rose-500 rounded duration-300"
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
						class="text-7xl text-slate-200 hover:text-sky-500 rounded duration-300"
					/>
				</a>
			{/if}
		</span>
	{/if}
</a>
