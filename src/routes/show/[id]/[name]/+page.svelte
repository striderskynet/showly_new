<script>
	import cfg from '$config/main';
	import { show, show_toggle } from '$lib/shows';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';

	export let data;

	// defining logo
	let logo = data.show.images.logos.filter((obj) => obj.iso_639_1 === 'en');
	data.show.main_logo = logo[0];

	// defining poster
	let poster = data.show.images.posters.filter(
		(obj) => obj.iso_639_1 === 'en'
	);
	data.show.main_poster = poster[0];

	console.log(data);

	$: data.show;
</script>

<div class="w-full relative">
	<div
		style="background: #ddd center / cover no-repeat url({cfg.image_path +
			'1280' +
			data.show.backdrop_path})"
		class="w-full h-screen p-10 justify-center items-center flex relative"
	>
		<div
			class="absolute w-full h-52 bg-gradient-to-t from-black from-20% bottom-0"
		></div>
		<div
			class="absolute h-screen left-0 sm:w-52 top-0 bg-gradient-to-r from-black from-25%"
		></div>
		<!-- <div
			class="absolute h-screen right-0 sm:w-52 top-0 bg-gradient-to-l from-black from-25%"
		></div> -->

		<section
			class="text-white translate-y-1/2 flex max-w-[80rem] w-full p-5 rounded-xl bg-black bg-opacity-30 backdrop-blur-sm"
		>
			<div class="flex flex-col w-2/3 gap-5">
				<div
					class="flex flex-col sm:flex-row justify-left items-center"
				>
					<div class="font-outline-2 text-4xl">
						{data.show.name}
					</div>

					<img
						src={cfg.image_path +
							'1280' +
							data.show.networks[0].logo_path}
						class="max-w-[100px] aspect-auto ml-10"
						alt={data.show.name}
					/>
				</div>

				<div class="text-slate-300 gap-2 flex w-full text-xs">
					<span>{dayjs(data.show.first_air_date).format('YYYY')}</span
					>
					{#if data.show.adult}
						<span class="border-l border-l-slate-700 pl-2">18+</span
						>
					{/if}
					<span class="border-l border-l-slate-700 pl-2"
						>{data.show.number_of_seasons > 1
							? data.show.number_of_seasons + ' seasons'
							: data.show.number_of_seasons + ' season'}</span
					>
					<span class="border-l border-l-slate-700 pl-2 gap-1 flex">
						{#each data.show.genres as g, i}
							<span>
								{#if i < data.show.genres.length - 1}
									{g.name},
								{:else}
									{g.name}
								{/if}
							</span>
						{/each}
					</span>
				</div>

				<div>
					{#if $show.includes(data.show.id)}
						<a
							data-sveltekit-preload-data="false"
							href={'/show/remove/' + data.show.id}
							on:click|preventDefault={show_toggle(
								data.supabase,
								data.session.user.id,
								data.show.id
							)}
							class="bg-red-500 flex max-w-max px-2 pe-4 py-1 items-center gap-2 rounded-lg hover:bg-red-700 active:bg-red-300"
						>
							<Icon icon="mdi:bookmark-remove" class="text-3xl" />
							Remove from watchlist
						</a>
					{:else}
						<a
							data-sveltekit-preload-data="false"
							href={'/show/add/' + data.show.id}
							on:click|preventDefault={show_toggle(
								data.supabase,
								data.session.user.id,
								data.show.id
							)}
							class="bg-sky-500 flex max-w-max px-2 pe-4 py-1 items-center gap-2 rounded-lg hover:bg-sky-700 active:bg-sky-300"
						>
							<Icon icon="mdi:bookmark-add" class="text-3xl" />
							Add to watchlist
						</a>
					{/if}
				</div>
				<div class="text-slate-200 ml-2 w-full">
					{data.show.overview}
				</div>
			</div>

			{#if data.show.main_poster?.file_path}
				<div class="flex flex-col w-1/3 gap-5 items-end">
					<img
						src={cfg.image_path +
							'300' +
							data.show.main_poster?.file_path}
						alt={data.show.name}
					/>
				</div>
			{/if}

			<!-- <div class="font-outline-2 text-7xl shadow-lg">
        {data.show.name}
    </div> -->
		</section>
	</div>

	<!-- Details -->
</div>

<style type="postcss">
	/* .font-outline-2 {
		-webkit-text-stroke: 2px black;
	} */
</style>
