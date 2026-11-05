<script>
	import { createBubbler, stopPropagation } from 'svelte/legacy';

	const bubble = createBubbler();
	import { dev } from '$app/environment';
	import cfg from '$config/main';
	import { humanFileSize } from '$lib/index.js';
	import { show, show_toggle } from '$lib/shows';
	import Icon from '@iconify/svelte';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	/** @type {{data: any}} */
	let { data } = $props();

	let torrent_modal = $state(false);









	const splideOptions = {
		arrows: true,
		perPage: 'auto',
		focus: 'left',
		snap: true,
		pagination: false,
		gap: '12px',
	};

	/* ============ Helpers ============ */
	function getRatingStyle(r) {
		if (!r) return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
		if (r >= 8)
			return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
		if (r >= 7) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
		if (r >= 6)
			return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
		if (r >= 5)
			return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
		return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
	}

	function getStatusStyle(status) {
		switch (status) {
			case 'Returning Series':
				return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
			case 'In Production':
				return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
			case 'Ended':
			case 'Canceled':
				return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
			default:
				return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
		}
	}

	function buildKeyCrew(creators, crew) {
		const sections = [];
		if (creators.length)
			sections.push({ label: 'Created by', people: creators });

		const groups = [
			{ label: 'Executive Producers', jobs: ['Executive Producer'] },
			{
				label: 'Producers',
				jobs: ['Producer', 'Co-Producer', 'Co-Executive Producer'],
			},
			{
				label: 'Writers',
				jobs: [
					'Writer',
					'Screenplay',
					'Story',
					'Story Editor',
					'Staff Writer',
				],
			},
			{ label: 'Music', jobs: ['Original Music Composer'] },
			{ label: 'Cinematography', jobs: ['Director of Photography'] },
			{ label: 'Editing', jobs: ['Editor'] },
			{ label: 'Casting', jobs: ['Casting'] },
			{ label: 'Art Direction', jobs: ['Art Direction'] },
			{ label: 'Costume Design', jobs: ['Costume Design'] },
		];

		for (const g of groups) {
			const people = crew.filter((c) => g.jobs.includes(c.job));
			const unique = [...new Map(people.map((p) => [p.id, p])).values()];
			if (unique.length)
				sections.push({ label: g.label, people: unique });
		}
		return sections;
	}

	async function handleToggle(e) {
		e.preventDefault();
		if (!data.session || !showData) return;
		try {
			await show_toggle(data.supabase, data.session.user.id, showData.id);
		} catch (err) {
			if (dev) console.error('toggle failed', err);
		}
	}

	async function copyMagnet(url) {
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			/* clipboard bloqueado */
		}
	}

	function onTorrentKey(e, url) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			copyMagnet(url);
		}
	}

	function onKeydownGlobal(e) {
		if (e.key === 'Escape' && torrent_modal) torrent_modal = false;
	}
	/* ============ Derived ============ */
	let showData = $derived(data.show);
	let torrents = $derived(data.torrents ?? []);
	let mainPoster =
		$derived(showData?.images?.posters?.find(
			(p) => p.iso_639_1 === 'en' && p.iso_3166_1 === 'US',
		) ??
		showData?.images?.posters?.find((p) => p.iso_639_1 === 'en') ??
		showData?.images?.posters?.[0]);
	let posterUrl = $derived(mainPoster?.file_path
		? `${cfg.image_path}500${mainPoster.file_path}`
		: showData?.poster_path
			? `${cfg.image_path}500${showData.poster_path}`
			: null);
	let backdropUrl = $derived(showData?.backdrop_path
		? `${cfg.image_path}1280${showData.backdrop_path}`
		: null);
	let network = $derived(showData?.networks?.[0]);
	let isFollowed = $derived($show.includes(showData?.id));
	let year = $derived(showData?.first_air_date
		? dayjs(showData.first_air_date).format('YYYY')
		: null);
	let runtime = $derived(showData?.episode_run_time?.[0] ?? null);
	let rating = $derived(showData?.vote_average);
	let ratingStyle = $derived(getRatingStyle(rating));
	let statusStyle = $derived(getStatusStyle(showData?.status));
	let creators = $derived(showData?.created_by ?? []);
	let cast = $derived(showData?.credits?.cast ?? []);
	let crew = $derived(showData?.credits?.crew ?? []);
	let companies = $derived(showData?.production_companies ?? []);
	let countries = $derived(showData?.production_countries ?? []);
	let languages = $derived(showData?.spoken_languages ?? []);
	let seasons = $derived(showData?.seasons ?? []);
	let recommendations = $derived(showData?.recommendations?.results ?? []);
	let videos = $derived((showData?.videos?.results ?? []).filter(
		(v) => v.site === 'YouTube',
	));
	let trailer =
		$derived(videos.filter((v) => v.type === 'Trailer').at(-1) ?? videos.at(-1));
	let keyCrew = $derived(buildKeyCrew(creators, crew));
	let externalLinks = $derived([
		showData?.external_ids?.imdb_id && {
			label: 'IMDb',
			url: `https://www.imdb.com/title/${showData.external_ids.imdb_id}`,
			icon: 'simple-icons:imdb',
		},
		showData?.external_ids?.tvdb_id && {
			label: 'TheTVDB',
			url: `https://thetvdb.com/series/${showData.external_ids.tvdb_id}`,
			icon: 'simple-icons:thetvdb',
		},
		showData?.external_ids?.wikidata_id && {
			label: 'Wikidata',
			url: `https://www.wikidata.org/wiki/${showData.external_ids.wikidata_id}`,
			icon: 'simple-icons:wikidata',
		},
		showData?.homepage && {
			label: 'Official site',
			url: showData.homepage,
			icon: 'mdi:web',
		},
	].filter(Boolean));
	let stats = $derived([
		{
			label: 'Rating',
			value: rating ? rating.toFixed(1) : '—',
			sub: showData?.vote_count
				? `${showData.vote_count.toLocaleString()} votes`
				: null,
		},
		{ label: 'Seasons', value: showData?.number_of_seasons ?? '—' },
		{ label: 'Episodes', value: showData?.number_of_episodes ?? '—' },
		{
			label: 'Runtime',
			value: runtime ? `${runtime}m` : '—',
			sub: 'per episode',
		},
		{
			label: 'Popularity',
			value: showData?.popularity ? showData.popularity.toFixed(1) : '—',
		},
	]);
</script>

<svelte:head>
	<title>{showData?.name ?? 'Show'} · Showly</title>
	<meta property="og:title" content="{showData?.name} · Showly" />
	<meta property="og:description" content={showData?.overview} />
	{#if showData?.poster_path}
		<meta
			property="og:image"
			content="{cfg.image_path}300{showData.poster_path}"
		/>
	{/if}
</svelte:head>

<svelte:window onkeydown={onKeydownGlobal} />

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<!-- ============ HERO ============ -->
	<section class="relative">
		{#if backdropUrl}
			<div class="absolute inset-0 overflow-hidden">
				<img
					src={backdropUrl}
					alt=""
					class="h-full w-full object-cover"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/40"
				></div>
				<div
					class="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent"
				></div>
			</div>
		{:else}
			<div
				class="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950"
			></div>
		{/if}

		<div
			class="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-10 sm:pt-24"
		>
			<div
				class="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10"
			>
				<!-- Poster -->
				{#if posterUrl}
					<div class="mx-auto w-44 shrink-0 sm:mx-0 sm:w-60">
						<div
							class="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ring-black/40"
						>
							<img
								src={posterUrl}
								alt={showData?.name}
								class="h-full w-full object-cover"
							/>
						</div>
					</div>
				{/if}

				<!-- Info -->
				<div class="flex min-w-0 flex-1 flex-col gap-5">
					<!-- Title row -->
					<div class="flex flex-wrap items-start gap-4">
						<div class="min-w-0 flex-1">
							<h1
								class="text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
							>
								{showData?.name}
							</h1>
							{#if showData?.original_name && showData.original_name !== showData.name}
								<p class="mt-1 text-sm text-zinc-400">
									{showData.original_name}
								</p>
							{/if}
						</div>

						{#if network?.logo_path}
							<img
								src="{cfg.image_path}300{network.logo_path}"
								alt={network.name}
								class="h-7 w-auto shrink-0 rounded-md bg-white/90 px-2 py-1 sm:h-9"
							/>
						{/if}
					</div>

					<!-- Tagline -->
					{#if showData?.tagline}
						<p
							class="max-w-2xl text-base italic text-zinc-400 sm:text-lg"
						>
							"{showData.tagline}"
						</p>
					{/if}

					<!-- Meta row -->
					<div class="flex flex-wrap items-center gap-2 text-xs">
						{#if rating}
							<span
								class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold {ratingStyle}"
							>
								<Icon icon="mdi:star" class="h-3.5 w-3.5" />
								{rating.toFixed(1)}
							</span>
						{/if}

						{#if year}
							<span
								class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300"
							>
								{year}
							</span>
						{/if}

						{#if showData?.status}
							<span
								class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 {statusStyle}"
							>
								{#if showData.in_production}
									<span
										class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
									></span>
								{/if}
								{showData.status}
							</span>
						{/if}

						{#if showData?.type}
							<span
								class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300"
							>
								{showData.type}
							</span>
						{/if}

						{#if showData?.adult}
							<span
								class="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-400"
							>
								18+
							</span>
						{/if}

						{#if showData?.origin_country?.length}
							<span
								class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300"
							>
								{showData.origin_country.join(' · ')}
							</span>
						{/if}

						{#if showData?.original_language}
							<span
								class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 uppercase text-zinc-300"
							>
								{showData.original_language}
							</span>
						{/if}

						{#if showData?.genres?.length}
							<span
								class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300"
							>
								{showData.genres.map((g) => g.name).join(' · ')}
							</span>
						{/if}
					</div>

					<!-- Overview -->
					{#if showData?.overview}
						<p
							class="max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base"
						>
							{showData.overview}
						</p>
					{/if}

					<!-- Actions -->
					<div class="flex flex-wrap items-center gap-2">
						{#if data.session}
							<button
								type="button"
								onclick={handleToggle}
								class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
								       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60
								       {isFollowed
									? 'bg-rose-500/90 text-white hover:bg-rose-500'
									: 'bg-sky-500/90 text-white hover:bg-sky-400'}"
							>
								<Icon
									icon={isFollowed
										? 'mdi:bookmark-remove'
										: 'mdi:bookmark-plus'}
									class="h-5 w-5"
								/>
								{isFollowed
									? 'Remove from watchlist'
									: 'Add to watchlist'}
							</button>
						{:else}
							<a
								href="/login"
								class="flex items-center gap-2 rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm
								       font-semibold text-white transition-colors hover:bg-sky-400
								       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
							>
								<Icon icon="mdi:google" class="h-5 w-5" />
								Login to follow
							</a>
						{/if}

						{#if trailer?.key}
							<a
								href="https://www.youtube.com/watch?v={trailer.key}"
								target="_blank"
								rel="noreferrer"
								class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5
								       text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10
								       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
							>
								<Icon
									icon="mdi:play-circle"
									class="h-5 w-5 text-sky-400"
								/>
								Watch trailer
							</a>
						{/if}

						{#if torrents.length > 0}
							<button
								type="button"
								onclick={() => (torrent_modal = true)}
								class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5
								       text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10
								       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
							>
								<Icon
									icon="mdi:magnet"
									class="h-5 w-5 text-sky-400"
								/>
								Torrents
								<span
									class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400"
								>
									{torrents.length}
								</span>
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- ============ STATS BAR (floating) ============ -->
		<div class="relative mx-auto -mb-10 max-w-7xl px-5 sm:px-10">
			<div
				class="grid grid-cols-2 divide-x divide-white/5 overflow-hidden rounded-2xl
				       border border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl
				       sm:grid-cols-5"
			>
				{#each stats as stat, i}
					<div
						class="flex flex-col items-center gap-0.5 px-4 py-4 text-center
						       {i >= 2 ? 'border-t border-white/5 sm:border-t-0' : ''}"
					>
						<span
							class="text-xs font-medium uppercase tracking-wide text-zinc-500"
							>{stat.label}</span
						>
						<span
							class="text-xl font-bold text-zinc-100 sm:text-2xl"
							>{stat.value}</span
						>
						{#if stat.sub}
							<span class="text-[10px] text-zinc-500"
								>{stat.sub}</span
							>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============ NEXT EPISODE ============ -->
	{#if showData?.next_episode_to_air}
		{@const next = showData.next_episode_to_air}
		<section class="mx-auto max-w-7xl px-5 pt-16 sm:px-10">
			<div
				class="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.08] via-zinc-900/60 to-zinc-900/40 p-5 sm:p-6"
			>
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
					{#if next.still_path}
						<div
							class="w-full shrink-0 overflow-hidden rounded-xl border border-white/10 sm:w-56"
						>
							<img
								src="{cfg.image_path}300{next.still_path}"
								alt={next.name}
								class="h-full w-full object-cover"
							/>
						</div>
					{/if}

					<div class="flex-1">
						<div
							class="mb-1 flex items-center gap-2 text-xs font-medium text-sky-400"
						>
							<span
								class="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400"
							></span>
							Next episode · S{String(
								next.season_number,
							).padStart(2, '0')}E{String(
								next.episode_number,
							).padStart(2, '0')}
						</div>
						<h3 class="text-lg font-bold sm:text-xl">
							{next.name}
						</h3>
						<p class="mt-1 text-sm text-zinc-400">
							{dayjs(next.air_date).format('MMMM D, YYYY')}
							<span class="text-zinc-600">·</span>
							{dayjs(next.air_date).fromNow()}
						</p>
						{#if next.overview}
							<p
								class="mt-2 line-clamp-2 max-w-2xl text-sm text-zinc-300"
							>
								{next.overview}
							</p>
						{/if}
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- ============ CONTENT GRID ============ -->
	<div class="mx-auto max-w-7xl px-5 py-12 sm:px-10">
		<div class="grid gap-10 lg:grid-cols-[1fr_320px]">
			<!-- ============ MAIN ============ -->
			<div class="flex min-w-0 flex-col gap-12">
				<!-- CAST -->
				{#if cast.length > 0}
					<section>
						<header class="mb-4 flex items-end justify-between">
							<h2 class="text-lg font-semibold text-zinc-200">
								Cast
							</h2>
							<span class="text-xs text-zinc-500"
								>{cast.length} members</span
							>
						</header>
						<Splide options={splideOptions} class="overflow-hidden">
							{#each cast as member (member.id)}
								<SplideSlide>
									<a
										href="/cast/{member.id}"
										class="group flex w-32 flex-col items-center gap-2"
									>
										<div
											class="relative aspect-square w-32 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all duration-300 group-hover:border-sky-500/40 group-hover:ring-2 group-hover:ring-sky-500/20"
										>
											{#if member.profile_path}
												<img
													src="{cfg.image_path}300{member.profile_path}"
													alt={member.name}
													class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
													loading="lazy"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center"
												>
													<Icon
														icon="mdi:account"
														class="h-12 w-12 text-zinc-700"
													/>
												</div>
											{/if}
										</div>
										<div class="w-full text-center">
											<p
												class="truncate text-xs font-semibold text-zinc-200"
											>
												{member.name}
											</p>
											{#if member.character}
												<p
													class="truncate text-[10px] text-zinc-500"
												>
													{member.character}
												</p>
											{/if}
										</div>
									</a>
								</SplideSlide>
							{/each}
						</Splide>
					</section>
				{/if}

				<!-- CREW -->
				{#if keyCrew.length > 0}
					<section>
						<h2 class="mb-4 text-lg font-semibold text-zinc-200">
							Crew
						</h2>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each keyCrew as section}
								<div
									class="rounded-xl border border-white/5 bg-white/[0.02] p-4"
								>
									<p
										class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
									>
										{section.label}
									</p>
									<p class="text-sm text-zinc-300">
										{section.people
											.map((p) => p.name)
											.join(', ')}
									</p>
								</div>
							{/each}
						</div>
					</section>
				{/if}

				<!-- SEASONS -->
				{#if seasons.length > 0}
					<section>
						<header class="mb-4 flex items-end justify-between">
							<h2 class="text-lg font-semibold text-zinc-200">
								Seasons
							</h2>
							<span class="text-xs text-zinc-500"
								>{seasons.length} total</span
							>
						</header>
						<Splide options={splideOptions} class="overflow-hidden">
							{#each seasons as season (season.id)}
								<SplideSlide>
									<div class="flex w-[200px] flex-col gap-2">
										<div
											class="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
										>
											{#if season.poster_path}
												<img
													src="{cfg.image_path}500{season.poster_path}"
													alt={season.name}
													class="absolute inset-0 h-full w-full object-cover"
													loading="lazy"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center"
												>
													<Icon
														icon="mdi:file-image-remove"
														class="h-16 w-16 text-zinc-700"
													/>
												</div>
											{/if}

											{#if season.vote_average}
												<span
													class="absolute right-2 top-2 rounded-md border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 backdrop-blur-md"
												>
													{season.vote_average.toFixed(
														1,
													)}
												</span>
											{/if}

											{#if season.air_date}
												<span
													class="absolute left-2 top-2 rounded-md border border-white/20 bg-zinc-950/70 px-2 py-0.5 text-xs font-medium text-zinc-200 backdrop-blur-md"
												>
													{dayjs(
														season.air_date,
													).format('YYYY')}
												</span>
											{/if}

											<div
												class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 to-transparent p-3 pt-8"
											>
												<p
													class="text-xs font-medium text-zinc-300"
												>
													{season.episode_count} episodes
												</p>
											</div>
										</div>
										<div>
											<p
												class="truncate text-sm font-semibold text-zinc-200"
											>
												{season.name}
											</p>
											{#if season.overview}
												<p
													class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500"
												>
													{season.overview}
												</p>
											{/if}
										</div>
									</div>
								</SplideSlide>
							{/each}
						</Splide>
					</section>
				{/if}

				<!-- VIDEOS -->
				{#if videos.length > 1}
					<section>
						<h2 class="mb-4 text-lg font-semibold text-zinc-200">
							Videos
						</h2>
						<Splide options={splideOptions} class="overflow-hidden">
							{#each videos as video (video.id)}
								<SplideSlide>
									<a
										href="https://www.youtube.com/watch?v={video.key}"
										target="_blank"
										rel="noreferrer"
										class="group flex w-[280px] flex-col gap-2"
									>
										<div
											class="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
										>
											<img
												src="https://img.youtube.com/vi/{video.key}/maxresdefault.jpg"
												alt={video.name}
												class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
												loading="lazy"
											/>
											<div
												class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											>
												<div
													class="flex h-14 w-14 items-center justify-center rounded-full bg-white/95"
												>
													<Icon
														icon="mdi:play"
														class="h-6 w-6 text-zinc-900"
													/>
												</div>
											</div>
											<span
												class="absolute bottom-2 right-2 rounded-md border border-white/20 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur-md"
											>
												{video.type}
											</span>
										</div>
										<p
											class="truncate text-xs font-medium text-zinc-300 group-hover:text-white"
										>
											{video.name}
										</p>
									</a>
								</SplideSlide>
							{/each}
						</Splide>
					</section>
				{/if}

				<!-- RECOMMENDATIONS -->
				{#if recommendations.length > 0}
					<section>
						<h2 class="mb-4 text-lg font-semibold text-zinc-200">
							You may also like
						</h2>
						<Splide options={splideOptions} class="overflow-hidden">
							{#each recommendations as rec (rec.id)}
								<SplideSlide>
									<a
										href="/show/{rec.id}/{rec.name.replaceAll(
											' ',
											'-',
										)}"
										class="group flex w-[200px] flex-col gap-2"
									>
										<div
											class="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all duration-300 group-hover:border-sky-500/40 group-hover:ring-2 group-hover:ring-sky-500/20"
										>
											{#if rec.poster_path}
												<img
													src="{cfg.image_path}500{rec.poster_path}"
													alt={rec.name}
													class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
													loading="lazy"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center"
												>
													<Icon
														icon="mdi:file-image-remove"
														class="h-16 w-16 text-zinc-700"
													/>
												</div>
											{/if}

											{#if rec.vote_average}
												<span
													class="absolute right-2 top-2 rounded-md border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 backdrop-blur-md"
												>
													{Math.round(
														rec.vote_average,
													)}
												</span>
											{/if}

											{#if rec.first_air_date}
												<span
													class="absolute left-2 top-2 rounded-md border border-white/20 bg-zinc-950/70 px-2 py-0.5 text-xs font-medium text-zinc-200 backdrop-blur-md"
												>
													{dayjs(
														rec.first_air_date,
													).format('YYYY')}
												</span>
											{/if}
										</div>
										<p
											class="truncate text-sm font-medium text-zinc-200 group-hover:text-white"
										>
											{rec.name}
										</p>
									</a>
								</SplideSlide>
							{/each}
						</Splide>
					</section>
				{/if}
			</div>

			<!-- ============ SIDEBAR ============ -->
			<aside class="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
				<!-- Details -->
				<div
					class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
				>
					<h3
						class="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400"
					>
						Details
					</h3>
					<dl class="flex flex-col gap-3 text-sm">
						{#if showData?.status}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Status</dt>
								<dd class="text-right text-zinc-200">
									{showData.status}
								</dd>
							</div>
						{/if}
						{#if showData?.type}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Type</dt>
								<dd class="text-right text-zinc-200">
									{showData.type}
								</dd>
							</div>
						{/if}
						{#if network?.name}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Network</dt>
								<dd class="text-right text-zinc-200">
									{network.name}
								</dd>
							</div>
						{/if}
						{#if showData?.first_air_date}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">First aired</dt>
								<dd class="text-right text-zinc-200">
									{dayjs(showData.first_air_date).format(
										'MMM D, YYYY',
									)}
								</dd>
							</div>
						{/if}
						{#if showData?.last_air_date}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Last aired</dt>
								<dd class="text-right text-zinc-200">
									{dayjs(showData.last_air_date).format(
										'MMM D, YYYY',
									)}
								</dd>
							</div>
						{/if}
						{#if countries.length}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Country</dt>
								<dd class="text-right text-zinc-200">
									{countries.map((c) => c.name).join(', ')}
								</dd>
							</div>
						{/if}
						{#if languages.length}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Languages</dt>
								<dd class="text-right text-zinc-200">
									{languages
										.map((l) => l.english_name)
										.join(', ')}
								</dd>
							</div>
						{/if}
						{#if runtime}
							<div class="flex items-start justify-between gap-4">
								<dt class="text-zinc-500">Runtime</dt>
								<dd class="text-right text-zinc-200">
									{runtime} min
								</dd>
							</div>
						{/if}
					</dl>
				</div>

				<!-- Production companies -->
				{#if companies.length}
					<div
						class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
					>
						<h3
							class="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400"
						>
							Production
						</h3>
						<div class="flex flex-col gap-3">
							{#each companies as company}
								<div class="flex items-center gap-3">
									{#if company.logo_path}
										<div
											class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/90"
										>
											<img
												src="{cfg.image_path}300{company.logo_path}"
												alt={company.name}
												class="max-h-full max-w-full object-contain"
											/>
										</div>
									{:else}
										<div
											class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5"
										>
											<Icon
												icon="mdi:office-building"
												class="h-4 w-4 text-zinc-500"
											/>
										</div>
									{/if}
									<div class="min-w-0">
										<p
											class="truncate text-xs font-medium text-zinc-200"
										>
											{company.name}
										</p>
										{#if company.origin_country}
											<p
												class="text-[10px] text-zinc-500"
											>
												{company.origin_country}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- External links -->
				{#if externalLinks.length}
					<div
						class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
					>
						<h3
							class="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400"
						>
							Links
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each externalLinks as link}
								<a
									href={link.url}
									target="_blank"
									rel="noreferrer"
									class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
								>
									<Icon
										icon={link.icon}
										class="h-3.5 w-3.5"
									/>
									{link.label}
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</aside>
		</div>
	</div>
</div>

<!-- ============ TORRENT MODAL ============ -->
{#if torrent_modal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="torrent-title"
	>
		<button
			type="button"
			onclick={() => (torrent_modal = false)}
			aria-label="Close"
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
		></button>

		<div
			class="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/80"
		>
			<header
				class="flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-5 py-3 backdrop-blur-xl"
			>
				<h2
					id="torrent-title"
					class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-200"
				>
					<Icon icon="mdi:magnet" class="h-5 w-5 text-sky-400" />
					Torrents
					<span
						class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400"
					>
						{torrents.length}
					</span>
				</h2>
				<button
					type="button"
					onclick={() => (torrent_modal = false)}
					aria-label="Close"
					class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
				>
					<Icon icon="mdi:close" class="h-5 w-5" />
				</button>
			</header>

			<div class="flex-1 overflow-y-auto p-4">
				<div class="flex flex-col gap-1.5">
					{#each torrents as t, i (t.hash ?? i)}
						<div
							role="button"
							tabindex="0"
							onclick={() => copyMagnet(t.magnet_url)}
							onkeydown={(e) => onTorrentKey(e, t.magnet_url)}
							title="Click to copy magnet link"
							class="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-800/40 px-3 py-2 text-xs transition-colors hover:border-sky-500/30 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
						>
							<span class="min-w-0 flex-1 truncate text-zinc-200">
								{t.title || t.filename}
								{#if t.season != null && t.episode != null && t.episode !== '0'}
									<span class="ml-1 text-zinc-500"
										>[S{t.season}E{t.episode}]</span
									>
								{/if}
							</span>

							<div class="flex shrink-0 items-center gap-2">
								{#if t.seeds != null}
									<span
										class="flex items-center gap-0.5 text-emerald-400/80"
										title="Seeds"
									>
										<Icon
											icon="mdi:arrow-up"
											class="h-3 w-3"
										/>{t.seeds}
									</span>
								{/if}
								{#if t.peers != null}
									<span
										class="flex items-center gap-0.5 text-rose-400/80"
										title="Peers"
									>
										<Icon
											icon="mdi:arrow-down"
											class="h-3 w-3"
										/>{t.peers}
									</span>
								{/if}
								<span class="h-3 w-px bg-white/10"></span>
								<span class="text-zinc-500">
									{dayjs.unix(t.date_released_unix).fromNow()}
								</span>
								<span class="h-3 w-px bg-white/10"></span>
								<span class="text-zinc-400"
									>{humanFileSize(Number(t.size_bytes))}</span
								>
								<a
									href={t.torrent_url}
									target="_blank"
									rel="noreferrer"
									aria-label="Download .torrent"
									title="Download .torrent"
									onclick={stopPropagation(bubble('click'))}
									class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
								>
									<Icon
										icon="simple-icons:utorrent"
										class="h-4 w-4"
									/>
								</a>
								<a
									href={t.magnet_url}
									aria-label="Open magnet link"
									title="Open magnet link"
									onclick={stopPropagation(bubble('click'))}
									class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
								>
									<Icon icon="mdi:magnet" class="h-4 w-4" />
								</a>
							</div>
						</div>
					{/each}
				</div>

				<div
					class="mt-5 flex flex-wrap items-center justify-end gap-2 text-xs text-zinc-500"
				>
					<span>More torrents:</span>
					<a
						href="https://torrentgalaxy.to/"
						target="_blank"
						rel="noreferrer"
						class="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-medium text-sky-300 transition-colors hover:bg-sky-500/20"
					>
						torrentgalaxy.to
					</a>
					<a
						href="https://eztvx.to/"
						target="_blank"
						rel="noreferrer"
						class="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-medium text-sky-300 transition-colors hover:bg-sky-500/20"
					>
						eztvx.to
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
