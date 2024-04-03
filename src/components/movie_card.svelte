<script>
	import cfg from '$config/main';
	import Icon from '@iconify/svelte';

	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { scale } from 'svelte/transition';

	//console.log(data);
	dayjs.extend(relativeTime);
	export let el;

	el.air_date = dayjs(el.release_date);

	if (el.poster_path && !el.image)
		el.poster_path = cfg.image_path + '780' + el.poster_path;

	if (el.image) {
		el.poster_path = el.image;
		// console.log(el);
	}

	el.address = '/movie/' + el.id + '/' + el.title.replaceAll(' ', '-');
</script>

<a
	in:scale={{ duration: 500, delay: 200 }}
	out:scale={{ duration: 500 }}
	href={el.address}
	class="relative group sm:min-w-[200px] w-[200px] flex {el.poster_path
		? ''
		: 'bg-zinc-950 border-gray-600'} rounded-xl overflow-hidden cursor-pointer border
        border-transparent hover:border-slate-800 duration-500"
>
	<!-- {void console.log(el.poster_path) || ''} -->
	{#if el.poster_path}
		<img
			alt="Poster Imagen"
			src={el.poster_path}
			class="absolute object-contain w-full group-hover:scale-125 duration-300"
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
		class="absolute bottom-0 flex flex-col w-full bg-gradient-to-t from-black to-transparent backdrop-blur py-2 text-base text-white duration-300 justify-center"
	>
		<span
			class="line-clamp-1 text-clip text-pretty truncate text-center capitalize"
		>
			{el.title}
		</span>
	</div>

	<span
		class="absolute bg-sky-800 text-white line-clamp-1 text-clip text-pretty truncate px-2 text-sm text-center rounded"
	>
		<span class="group-hover:hidden duration-300 flex">
			{el?.air_date?.fromNow()}</span
		>
		<span class="group-hover:flex duration-300 hidden">
			{el?.air_date?.format('MMMM D')}</span
		>
	</span>
</a>
