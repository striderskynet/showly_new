<script>
	import cfg from '$config/main';
	import { show, show_toggle } from '$lib/shows';
	import Icon from '@iconify/svelte';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { humanFileSize } from './../../../../lib/index.js';

	import { Tooltip } from 'flowbite-svelte';

	dayjs.extend(relativeTime);

	export let data;
	let torrent_modal = false;

	const reload_all = () => {
		// defining logo
		let logo = data.show.images.logos.filter(
			(obj) => obj.iso_639_1 === 'en'
		);
		data.show.main_logo = logo[0];

		// defining poster
		let poster = data.show.images.posters.filter(
			(obj) => obj.iso_639_1 === 'en'
		);
		data.show.main_poster = poster[0];
	};
	console.log(data);

	$: data.show, reload_all();
</script>

<svelte:head>
	<!-- • {data.show.id} -->
	<title>Showly - {data.show.name}</title>

	<meta property="og:title" content="Showly - {data.show.name}" />
	<meta property="og:description" content={data.show.overview} />
	<meta
		property="og:image"
		content="{cfg.image_path}300{data.show.poster_path}"
	/>
</svelte:head>

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
			class="absolute h-full left-0 sm:w-52 top-0 bg-gradient-to-r from-black from-25%"
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
							class="max-w-[75px] sm:max-w-[100px] aspect-auto sm:ml-10 bg-white px-2 py-1 bg-opacity-50 rounded-xl backdrop-blur-3xl"
							alt={data.show.name}
						/>
					</div>
					<div
						class="text-slate-300 gap-2 flex w-full text-sm ml-5 -mt-3 justify-center sm:justify-normal flex-wrap"
					>
						{data.show?.tagline}
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

						<span
							class="border-l border-l-slate-700 pl-2 {data.show
								.status === 'In Production'
								? 'text-green-500'
								: ''} {data.show.status === 'Returning Series'
								? 'text-sky-500'
								: ''} {data.show.status === 'Ended' ||
							data.show.status === 'Canceled'
								? 'text-rose-500'
								: ''}"
						>
							{data.show.status}
						</span>

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

					{#if data.show.next_episode_to_air}
						<div
							class="text-slate-300 gap-2 flex w-full text-xs justify-center sm:justify-normal flex-wrap"
						>
							<span class="font-bold">Next Episode:</span>
							<span class="text-slate-400">
								{data.show.next_episode_to_air.air_date}
								<span class="ml-3">
									S{data.show.next_episode_to_air
										.season_number}E{data.show
										.next_episode_to_air.episode_number} -
								</span>
								{data.show.next_episode_to_air.name}
							</span>
						</div>
					{/if}

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
								class="text-gray-400 hover:text-white duration-300 ml-2"
							>
								<Icon icon="mdi:film-reel" class="text-3xl" />
								<!-- <Tooltip>Watch Trailer</Tooltip> -->
							</a>
						{/if}

						{#if data.show.homepage}
							<a
								href={data.show.homepage}
								target="_blank"
								class="text-gray-400 hover:text-white duration-300 ml-2"
							>
								<Icon icon="mdi:web" class="text-3xl" />
								<!-- <Tooltip>Go to Homepage</Tooltip> -->
							</a>
						{/if}

						{#if data.show.torrent_list?.torrents?.length > 0}
							<a
								href={'./torrent'}
								on:click|preventDefault={() => {
									torrent_modal = true;
								}}
								target="_blank"
								class="text-gray-400 hover:text-white duration-300 ml-2"
							>
								<Icon icon="mdi:magnet" class="text-3xl" />
								<!-- <Tooltip>Go to Homepage</Tooltip> -->
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
					<div class="mt-5 flex gap-5 flex-wrap flex-grow">
						{#each data.show.credits.cast as cast, i}
							{#if i <= 5}
								<div
									class="flex flex-col justify-center items-center"
								>
									<a
										href={'/cast/' + cast.id}
										on:click|preventDefault={() => {}}
										class="relative overflow-hidden aspect-square w-24 border-2 rounded-full {cast.gender ===
										0
											? 'border-white text-white'
											: cast.gender === 1
												? 'border-rose-700 text-rose-700'
												: 'border-blue-700 text-blue-700'} "
									>
										{#if cast.profile_path}
											<img
												src={cfg.image_path +
													'300' +
													cast.profile_path}
												alt={cast.name}
												class="absolute w-full h-full hover:scale-125 object-cover duration-500"
											/>
										{:else}
											<div
												class="absolute w-full h-full flex justify-center items-center"
											>
												<Icon
													icon={cast.gender === 0
														? 'mdi:gender-non-binary'
														: cast.gender === 1
															? 'mdi:gender-female'
															: 'mdi:gender-male'}
													class="text-7xl"
												/>
											</div>
										{/if}
									</a>
									<span class="text-sm mt-2">{cast.name}</span
									>
									<span
										class="text-xs text-gray-500 text-center mt-1"
									>
										{@html cast.character.replaceAll(
											'/',
											'<br />'
										)}
									</span>
								</div>
								<Tooltip>{cast.name}</Tooltip>
							{/if}
						{/each}
					</div>
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

			<div class="flex flex-col mt-5">
				<span class="ml-10">List of Seasons</span>
				<Splide
					options={{
						arrows: true,
						perPage: 'auto',
						focus: 'left',
						snap: true,
						pagination: false,
						gap: '12px',
					}}
					class="w-full overflow-hidden p-2"
				>
					{#each data.show.seasons as season}
						<SplideSlide class="flex flex-col items-center gap-1">
							<card
								class="w-[250px] flex aspect-[1/1.5] border-gray-500 border overflow-hidden relative rounded-xl"
							>
								{#if season.poster_path}
									<img
										alt="Poster Imagen"
										src={cfg.image_path +
											'780' +
											season.poster_path}
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

								{#if season.vote_average}
									<span
										class="absolute top-2 right-2 bg-sky-800 text-white px-2 rounded-lg"
									>
										{season.vote_average}
									</span>
								{/if}

								{#if season.air_date}
									<span
										class="absolute top-2 left-2 bg-sky-800 text-white px-2 rounded-lg"
									>
										{dayjs(season.air_date).format('YYYY')}
									</span>
								{/if}
							</card>
							<span>{season.name}</span>
							<span class="text-xs -mt-2 text-gray-400">
								{season.episode_count} episodes
							</span>
						</SplideSlide>
					{/each}
				</Splide>
			</div>

			{#if data.show.recommendations?.results.length > 0}
				<div class="flex flex-col mt-5">
					<span class="ml-10">You would also like</span>
					<Splide
						options={{
							arrows: true,
							perPage: 'auto',
							focus: 'left',
							snap: true,
							pagination: false,
							gap: '12px',
						}}
						class="w-full overflow-hidden p-2"
					>
						{#each data.show.recommendations.results as r_show}
							<SplideSlide
								class="flex flex-col items-center gap-1"
							>
								<a
									href={'/show/' +
										r_show.id +
										'/' +
										r_show.name.replaceAll(' ', '-')}
									class="w-[250px] flex aspect-[1/1.5] border-gray-500 border overflow-hidden relative rounded-xl group"
								>
									{#if r_show.poster_path}
										<img
											alt="Poster Imagen"
											src={cfg.image_path +
												'780' +
												r_show.poster_path}
											class="absolute object-contain w-full group-hover:blur duration-300 group-hover:backdrop-blur-sm"
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

									{#if r_show.vote_average}
										<span
											class="absolute top-2 right-2 bg-sky-800 text-white px-2 rounded-lg"
										>
											{Math.round(r_show.vote_average)}
										</span>
									{/if}

									{#if r_show.first_air_date}
										<span
											class="absolute top-2 left-2 bg-sky-800 text-white px-2 rounded-lg"
										>
											{dayjs(
												r_show.first_air_date
											).format('YYYY')}
										</span>
									{/if}
								</a>
								<span>{r_show.name}</span>
							</SplideSlide>
						{/each}
					</Splide>
				</div>
			{/if}
		</section>
	</div>
</div>

<button
	on:click={() => {
		torrent_modal = false;
	}}
	class="{torrent_modal
		? ''
		: 'hidden'} fixed w-screen h-full bg-black bg-opacity-50 backdrop-blur-sm top-0 left-0 cursor-default"
/>
<div class="w-full justify-center flex {torrent_modal ? '' : 'hidden'}">
	<div
		class="absolute overflow-hidden flex flex-col w-full rounded-xl shadow-xl max-w-7xl bg-gray-800 text-slate-300 top-[25%]"
	>
		<h1
			class="uppercase w-full flex bg-slate-700 pb-2 pt-3 px-5 justify-between items-center"
		>
			Torrent list
			<a
				href={'#'}
				on:click|preventDefault={() => {
					torrent_modal = false;
				}}
				class="hover:bg-slate-300 hover:text-slate-600 rounded-xl p-1"
			>
				<Icon icon="mdi:close" class="text-2xl" />
			</a>
		</h1>
		<div class="p-5 flex flex-col gap-1">
			{#if !data.show.torrent_list.torrents.length === 0}
				<div class="w-full text-center my-20 text-sm text-slate-500">
					There is no torrent for this show, you can check the
					following sites:
					<div
						class="flex gap-2 text-center w-full justify-center mt-2 text-base"
					>
						<a
							href="https://torrentgalaxy.to/"
							class="text-slate-200 hover:text-slate-100 hover:bg-sky-600 bg-sky-800 px-2 py-1 rounded duration-300"
							>torrentgalaxy.to</a
						>
						<a
							href="https://eztvx.to/"
							class="text-slate-200 hover:text-slate-100 hover:bg-sky-600 bg-sky-800 px-2 py-1 rounded duration-300"
							>eztvx.to</a
						>
					</div>
				</div>
			{/if}
			{#each data.show.torrent_list.torrents as t, i}
				{#if t.title.includes('MeGusta')}
					<div
						role="button"
						tabindex="0"
						on:keydown={() => {
							navigator.clipboard.writeText(t.magnet_url);
						}}
						on:click={() => {
							navigator.clipboard.writeText(t.magnet_url);
						}}
						class="flex items-center w-full bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 cursor-pointer duration-300 justify-between"
						title="Click to Copy Magnet to Clipboard"
					>
						<span>
							{t.title}
							<span class="text-slate-500 text-xs">
								[S{t.season}.E{t.episode}]
							</span>
						</span>
						<div class="flex gap-2 items-center">
							<span class="text-xs text-slate-400">
								{dayjs.unix(t.date_released_unix).fromNow()}
							</span>
							<div
								class="min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400"
							/>
							<span class="text-xs text-slate-400">
								{humanFileSize(Number(t.size_bytes))}
							</span>
							<a
								href={t.torrent_url}
								alt="Torrent URL"
								title="Torrent URL"
								class="hover:bg-slate-300 hover:text-slate-600 p-1 rounded-xl"
							>
								<Icon
									icon="simple-icons:utorrent"
									class="text-2xl"
								/>
							</a>
							<a
								href={t.magnet_url}
								alt="Magnet URL"
								title="Magnet URL"
								class="hover:bg-slate-300 hover:text-slate-600 p-1 rounded-xl"
							>
								<Icon icon="mdi:magnet" class="text-2xl" />
							</a>
						</div>
					</div>{/if}
			{/each}
			<div
				class="w-full flex justify-end text-sm text-slate-500 mt-5 items-center gap-3"
			>
				You can find more torrents in the following sites:
				<div class="flex gap-2 mt-2 text-base">
					<a
						href="https://torrentgalaxy.to/"
						class="text-slate-200 hover:text-slate-100 hover:bg-sky-600 bg-sky-800 px-2 py-1 rounded duration-300"
						>torrentgalaxy.to</a
					>
					<a
						href="https://eztvx.to/"
						class="text-slate-200 hover:text-slate-100 hover:bg-sky-600 bg-sky-800 px-2 py-1 rounded duration-300"
						>eztvx.to</a
					>
				</div>
			</div>
		</div>
	</div>
</div>
