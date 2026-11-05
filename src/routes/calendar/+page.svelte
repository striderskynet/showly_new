<script>
	import cfg from '$config/main';
	import { show } from '$lib/shows';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import 'dayjs/locale/es';
	import { untrack } from 'svelte';

	dayjs.locale('es');

	// ─── State ──────────────────────────────────────────────────────
	let loading = $state(true);
	let viewMonth = $state(dayjs().startOf('month'));
	let episodesByDate = $state({});
	let loadProgress = $state({ done: 0, total: 0 });
	let loadToken = 0;

	// ─── Config ─────────────────────────────────────────────────────
	const API_BASE = cfg.api_show_id; // ej: 'https://api.themoviedb.org/3/tv/'
	const CONCURRENCY = 10; // TMDB permite ~50 req/s → 10 es seguro

	// ─── Helpers de red ─────────────────────────────────────────────
	const fetchShowDetails = async (id) => {
		try {
			const res = await fetch(`${API_BASE}${id}`, cfg.api_options);
			if (!res.ok) return null;
			return await res.json();
		} catch {
			return null;
		}
	};

	const fetchSeason = async (id, seasonNumber) => {
		try {
			const res = await fetch(
				`${API_BASE}${id}/season/${seasonNumber}`,
				cfg.api_options,
			);
			if (!res.ok) return [];
			const data = await res.json();
			return data.episodes ?? [];
		} catch {
			return [];
		}
	};

	/** Lanza promesas en lotes para no reventar el rate limit de TMDB. */
	const batched = async (items, fn) => {
		const out = [];
		for (let i = 0; i < items.length; i += CONCURRENCY) {
			const slice = items.slice(i, i + CONCURRENCY);
			const res = await Promise.all(slice.map(fn));
			out.push(...res);
		}
		return out;
	};

	// ─── Carga principal ────────────────────────────────────────────
	const loadCalendar = async (ids) => {
		const token = ++loadToken;
		loading = true;
		loadProgress = { done: 0, total: ids.length };

		if (!ids.length) {
			episodesByDate = {};
			loading = false;
			return;
		}

		// 1. Detalles de todas las series (batched)
		const details = await batched(ids, async (id) => {
			const d = await fetchShowDetails(id);
			if (token === loadToken) loadProgress.done++;
			return d;
		});
		if (token !== loadToken) return;

		// 2. Determinar qué temporadas pedir por serie
		const seasonRequests = [];
		for (const showData of details) {
			if (!showData) continue;

			const seasonsToFetch = new Set();

			// Temporada del próximo episodio
			if (showData.next_episode_to_air?.season_number != null) {
				seasonsToFetch.add(showData.next_episode_to_air.season_number);
			}
			// Temporada del último episodio emitido
			if (showData.last_episode_to_air?.season_number != null) {
				seasonsToFetch.add(showData.last_episode_to_air.season_number);
			}
			// Temporada más reciente ya estrenada
			if (Array.isArray(showData.seasons)) {
				const today = dayjs().format('YYYY-MM-DD');
				const aired = showData.seasons
					.filter((s) => s.air_date && s.air_date <= today)
					.sort((a, b) => b.season_number - a.season_number);
				if (aired.length) seasonsToFetch.add(aired[0].season_number);
			}

			for (const sn of seasonsToFetch) {
				seasonRequests.push({ showData, seasonNumber: sn });
			}
		}

		// 3. Episodios por temporada (batched)
		const seasonData = await batched(seasonRequests, async (req) => {
			const episodes = await fetchSeason(
				req.showData.id,
				req.seasonNumber,
			);
			return { ...req, episodes };
		});
		if (token !== loadToken) return;

		// 4. Construir mapa por fecha
		const map = {};
		for (const { showData, episodes } of seasonData) {
			const address = cfg.show_address(showData);
			for (const ep of episodes) {
				if (!ep.air_date) continue;
				(map[ep.air_date] ??= []).push({
					show: showData,
					episode: ep,
					address,
				});
			}
		}

		// 5. Ordenar cada día por nombre de serie
		for (const date of Object.keys(map)) {
			map[date].sort((a, b) =>
				(a.show.name ?? '').localeCompare(b.show.name ?? '', 'es'),
			);
		}

		episodesByDate = map;
		loading = false;
	};

	// Reacciona a la lista de shows seguidos
	$effect(() => {
		const ids = $show ?? [];
		untrack(() => loadCalendar(ids));
	});

	// ─── Calendario ─────────────────────────────────────────────────
	const dayKey = (d) => d.format('YYYY-MM-DD');
	const todayStr = dayjs().format('YYYY-MM-DD');
	const weekdayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	let monthStart = $derived(viewMonth.startOf('month'));
	let monthEnd = $derived(viewMonth.endOf('month'));
	let offset = $derived((monthStart.day() + 6) % 7);
	let daysInMonth = $derived(viewMonth.daysInMonth());

	let calendarDays = $derived.by(() => {
		const days = [];
		for (let i = 0; i < offset; i++) {
			days.push({
				date: monthStart.subtract(offset - i, 'day'),
				inMonth: false,
			});
		}
		for (let i = 0; i < daysInMonth; i++) {
			days.push({ date: monthStart.add(i, 'day'), inMonth: true });
		}
		const rem = (7 - (days.length % 7)) % 7;
		for (let i = 1; i <= rem; i++) {
			days.push({ date: monthEnd.add(i, 'day'), inMonth: false });
		}
		return days;
	});

	let totalEpisodes = $derived.by(() => {
		const prefix = viewMonth.format('YYYY-MM');
		return Object.entries(episodesByDate)
			.filter(([date]) => date.startsWith(prefix))
			.reduce((sum, [, arr]) => sum + arr.length, 0);
	});

	// ─── Nav ────────────────────────────────────────────────────────
	const goPrev = () => (viewMonth = viewMonth.subtract(1, 'month'));
	const goNext = () => (viewMonth = viewMonth.add(1, 'month'));
	const goToday = () => (viewMonth = dayjs().startOf('month'));

	// ─── Helpers de presentación ────────────────────────────────────
	const episodeTag = (ep) =>
		ep.season_number != null && ep.episode_number != null
			? `S${ep.season_number}E${ep.episode_number}`
			: '';

	/** Colores según `episode_type` de TMDB. */
	const episodeColor = (ep, isPast) => {
		if (ep.episode_type === 'special')
			return 'bg-pink-900/60 hover:bg-pink-800/60';
		if (
			ep.episode_type === 'premiere' ||
			ep.episode_type === 'mid_season_premiere'
		)
			return 'bg-amber-900/60 hover:bg-amber-800/60';
		if (
			ep.episode_type === 'finale' ||
			ep.episode_type === 'mid_season_finale'
		)
			return 'bg-purple-900/60 hover:bg-purple-800/60';
		if (isPast) return 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800';
		return 'bg-sky-900/60 hover:bg-sky-800/60';
	};

	const relativeLabel = (d) => {
		const diff = d.startOf('day').diff(dayjs().startOf('day'), 'day');
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Mañana';
		if (diff === -1) return 'Ayer';
		return '';
	};
</script>

<svelte:head>
	<title>Calendario · Showly</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-200">
	<!-- ── Header ───────────────────────────────────────────────── -->
	<header
		class="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md"
	>
		<div
			class="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-3 sm:px-5"
		>
			<div>
				<h1
					class="text-base font-semibold capitalize text-zinc-100 sm:text-lg"
				>
					{viewMonth.format('MMMM YYYY')}
				</h1>
				{#if totalEpisodes > 0}
					<p class="text-[11px] text-zinc-500">
						{totalEpisodes}
						{totalEpisodes === 1 ? 'episodio' : 'episodios'} este mes
					</p>
				{:else if loading}
					<p class="text-[11px] text-zinc-500">
						Cargando {loadProgress.done}/{loadProgress.total}…
					</p>
				{/if}
			</div>

			<div class="ml-auto flex items-center gap-1">
				<button
					type="button"
					aria-label="Mes anterior"
					onclick={goPrev}
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
				>
					<Icon icon="mdi:chevron-left" class="text-lg" />
				</button>
				<button
					type="button"
					onclick={goToday}
					class="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
				>
					Hoy
				</button>
				<button
					type="button"
					aria-label="Mes siguiente"
					onclick={goNext}
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
				>
					<Icon icon="mdi:chevron-right" class="text-lg" />
				</button>
			</div>
		</div>
	</header>

	<!-- ── Grid ─────────────────────────────────────────────────── -->
	<main
		class="mx-auto sm:max-w-[calc(100vw-10rem)] px-2 py-3 sm:px-4 sm:py-4 pb-20"
	>
		<div class="mb-1.5 hidden grid-cols-7 gap-1.5 sm:grid">
			{#each weekdayNames as wd (wd)}
				<div
					class="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500"
				>
					{wd}
				</div>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-7">
			{#each calendarDays as cell (dayKey(cell.date))}
				{@const events = episodesByDate[dayKey(cell.date)] ?? []}
				{@const isToday = dayKey(cell.date) === todayStr}
				{@const isPast = cell.date.isBefore(dayjs(), 'day')}
				{@const rel = relativeLabel(cell.date)}
				{@const hideOnMobile =
					!cell.inMonth || (!events.length && !isToday)}

				<div
					class="
						flex flex-col rounded-lg border p-2 transition
						{isToday
						? 'border-orange-500/60 bg-zinc-900 ring-1 ring-orange-500/40'
						: 'border-zinc-800/60'}
						{!isToday && (isPast ? 'bg-zinc-900/40' : 'bg-zinc-900/70')}
						{!cell.inMonth ? 'opacity-40' : ''}
						{hideOnMobile ? 'hidden sm:flex' : ''}
						sm:min-h-40 sm:h-100
					"
				>
					<header
						class="mb-1 flex shrink-0 items-center justify-between"
					>
						<span
							class="text-[11px] font-semibold
								{isToday ? 'text-orange-400' : isPast ? 'text-zinc-600' : 'text-zinc-400'}"
						>
							{#if rel}
								{rel}
							{:else}
								{cell.date.format('D')}
								{#if cell.date.date() === 1}
									<span
										class="ml-1 text-[10px] font-normal uppercase text-zinc-500"
									>
										{cell.date.format('MMM')}
									</span>
								{/if}
							{/if}
						</span>
						{#if events.length > 0}
							<span class="text-[10px] font-medium text-zinc-600">
								{events.length}
							</span>
						{/if}
					</header>

					{#if events.length > 0}
						<ul
							class="flex flex-col gap-1 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:pr-0.5"
						>
							{#each events as ev (ev.show.id + '-' + ev.episode.id)}
								<li>
									<a
										href={ev.address}
										title={`${ev.show.name} · ${episodeTag(ev.episode)}${ev.episode.name ? ' · ' + ev.episode.name : ''}`}
										class="flex flex-col rounded px-1.5 py-1 text-[11px] leading-tight text-white transition {episodeColor(
											ev.episode,
											isPast,
										)}"
									>
										<span class="truncate font-medium">
											{ev.show.name}
										</span>
										{#if episodeTag(ev.episode)}
											<span
												class="truncate text-[10px] opacity-80"
											>
												{episodeTag(ev.episode)}
												{#if ev.episode.name}
													· {ev.episode.name}
												{/if}
											</span>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>

		{#if loading}
			<div class="py-8 text-center text-xs text-zinc-600">
				Cargando episodios… ({loadProgress.done}/{loadProgress.total})
			</div>
		{:else if totalEpisodes === 0}
			<div
				class="mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-16 text-center"
			>
				<p class="text-sm text-zinc-400">No hay episodios este mes.</p>
				<p class="mt-1 text-xs text-zinc-600">
					Prueba a navegar a otro mes o sigue más series.
				</p>
			</div>
		{/if}
	</main>
</div>
