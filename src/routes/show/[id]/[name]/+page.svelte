<script>
	import cfg from '$config/main';
	import { show, show_toggle } from '$lib/shows';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import { Tooltip } from 'flowbite-svelte';

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
		class="w-full min-h-screen p-10 justify-center items-center flex relative"
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
			class="text-white translate-y-28 sm:translate-y-1/2 flex flex-col max-w-[80rem] w-full p-5 rounded-xl bg-black bg-opacity-30 backdrop-blur-sm"
		>
			<div class="flex">
				<div class="flex flex-col sm:w-2/3 gap-5">
					<div
						class="flex flex-col sm:flex-row justify-left items-center gap-5 sm:gap-0"
					>
						<div class="font-outline-2 sm:text-4xl text-xl">
							{data.show.name}
						</div>

						<img
							src={cfg.image_path +
								'1280' +
								data.show.networks[0].logo_path}
							class="max-w-[75px] sm:max-w-[100px] aspect-auto sm:ml-10"
							alt={data.show.name}
						/>
					</div>

					<div
						class="text-slate-300 gap-2 flex w-full text-xs justify-center sm:justify-normal flex-wrap"
					>
						<span
							>{dayjs(data.show.first_air_date).format(
								'YYYY'
							)}</span
						>
						{#if data.show.adult}
							<span class="border-l border-l-slate-700 pl-2"
								>18+</span
							>
						{/if}
						<span class="border-l border-l-slate-700 pl-2"
							>{data.show.number_of_seasons > 1
								? data.show.number_of_seasons + ' seasons'
								: data.show.number_of_seasons + ' season'}</span
						>
						<span
							class="border-l border-l-slate-700 pl-2 gap-1 flex"
						>
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

					<div class="flex gap-2 items-center">
						{#if data.session}
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
									<Icon
										icon="mdi:bookmark-remove"
										class="text-3xl"
									/>
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
									<Icon
										icon="mdi:bookmark-add"
										class="text-3xl"
									/>
									Add to watchlist
								</a>
							{/if}
						{:else}
							<a
								data-sveltekit-preload-data="false"
								href={'/login'}
								class="bg-sky-500 flex max-w-max px-2 pe-4 py-1 items-center gap-2 rounded-lg hover:bg-sky-700 active:bg-sky-300"
							>
								<Icon icon="mdi:google" class="text-3xl" />
								Login to follow
							</a>
						{/if}

						{#if data.show.videos?.results?.length > 0}
							<a
								href={'https://www.youtube.com/watch?v=' +
									data.show.videos.results.at(-1).key}
								target="_blank"
								class="text-gray-200 hover:text-white duration-300 ml-2"
							>
								<Icon icon="mdi:film-reel" class="text-3xl" />
								<Tooltip>Watch Trailer</Tooltip>
							</a>
						{/if}
					</div>
					<div
						class="text-slate-200 ml-2 w-full sm:text-base text-sm"
					>
						{data.show.overview}
					</div>

					{#if data.show.created_by?.length > 0}
						<div class="text-xs flex gap-2">
							<span>Created by:</span>
							<span class="flex gap-3 text-gray-400">
								{#each data.show.created_by as director}
									<a
										href={'/director/' + director.id}
										on:click|preventDefault={() => {}}
									>
										{director.name}
									</a>
								{/each}
							</span>
						</div>
					{/if}
				</div>

				{#if data.show.main_poster?.file_path}
					<div class="hidden sm:flex flex-col w-1/3 gap-5 items-end">
						<img
							src={cfg.image_path +
								'300' +
								data.show.main_poster?.file_path}
							alt={data.show.name}
							class="rounded-xl"
						/>
					</div>
				{/if}
			</div>

			<div class="mt-5 flex gap-5 flex-wrap flex-grow">
				{#each data.show.credits.cast as cast, i}
					{#if i <= 5}
						<div class="flex flex-col justify-center items-center">
							<a
								href={'/cast/' + cast.id}
								on:click|preventDefault={() => {}}
								class="relative overflow-hidden aspect-square w-24 border-2 rounded-full {cast.gender ===
								0
									? 'border-white'
									: cast.gender === 1
										? 'border-rose-700'
										: 'border-blue-700'} "
							>
								<img
									src={cfg.image_path +
										'300' +
										cast.profile_path}
									alt={cast.name}
									class="absolute w-full h-full hover:scale-125 object-cover duration-500"
								/>
							</a>
							<span class="text-sm mt-2">{cast.name}</span>
							<span class="text-xs text-gray-500"
								>{cast.character}</span
							>
						</div>
						<Tooltip>{cast.name}</Tooltip>
					{/if}
				{/each}
			</div>
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
