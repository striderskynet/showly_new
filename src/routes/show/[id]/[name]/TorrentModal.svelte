<script>
	import { createBubbler, stopPropagation } from 'svelte/legacy';
	const bubble = createBubbler();

	import { humanFileSize } from '$lib/index.js';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	/** @type {{ torrents?: any[], open?: boolean }} */
	let { torrents = [], open = $bindable(false) } = $props();

	/* ============ State ============ */
	let selectedSeason = $state(null);
	/** @type {string[]} */
	let selectedQualities = $state([]);

	/* ============ Quality helpers ============ */
	const QUALITY_ORDER = ['2160p', '1080p', '720p', '480p', 'XviD', 'Other'];

	function getQuality(t) {
		const s = `${t.title ?? ''} ${t.filename ?? ''}`.toLowerCase();
		if (/\b2160p\b|\b4k\b/.test(s)) return '2160p';
		if (/\b1080p\b/.test(s)) return '1080p';
		if (/\b720p\b/.test(s)) return '720p';
		if (/\b480p\b/.test(s)) return '480p';
		if (/\bxvid\b/.test(s)) return 'XviD';
		return 'Other';
	}

	function qualityClass(q) {
		switch (q) {
			case '2160p':
				return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
			case '1080p':
				return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
			case '720p':
				return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
			case '480p':
				return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
			case 'XviD':
				return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
			default:
				return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
		}
	}

	function episodeLabel(ep) {
		if (ep === '0' || ep == null || ep === '?') return 'Full Season';
		return `Episode ${String(ep).padStart(2, '0')}`;
	}

	/* ============ Filter helpers ============ */
	function toggleQuality(q) {
		if (selectedQualities.includes(q)) {
			selectedQualities = selectedQualities.filter((x) => x !== q);
		} else {
			selectedQualities = [...selectedQualities, q];
		}
	}

	function clearFilters() {
		selectedQualities = [];
	}

	let filterActive = $derived(selectedQualities.length > 0);

	/* ============ Available qualities + counts ============ */
	let qualityOptions = $derived.by(() => {
		const counts = new Map();
		for (const t of torrents) {
			const q = getQuality(t);
			counts.set(q, (counts.get(q) ?? 0) + 1);
		}
		return QUALITY_ORDER.filter((q) => counts.has(q)).map((q) => ({
			quality: q,
			count: counts.get(q),
		}));
	});

	/* ============ Organized structure (filtered) ============ */
	let organized = $derived.by(() => {
		const isSelected = (q) =>
			selectedQualities.length === 0 || selectedQualities.includes(q);

		const seasonMap = new Map();

		for (const t of torrents) {
			const quality = getQuality(t);
			if (!isSelected(quality)) continue;

			const season = String(t.season ?? '?');
			const episode = String(t.episode ?? '?');

			if (!seasonMap.has(season)) seasonMap.set(season, new Map());
			const epMap = seasonMap.get(season);
			if (!epMap.has(episode)) epMap.set(episode, new Map());
			const qMap = epMap.get(episode);
			if (!qMap.has(quality)) qMap.set(quality, []);
			qMap.get(quality).push(t);
		}

		const seasonsSorted = [...seasonMap.keys()].sort((a, b) => {
			const na = Number(a);
			const nb = Number(b);
			if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
			return nb - na; // newest season first
		});

		return seasonsSorted.map((season) => {
			const epMap = seasonMap.get(season);
			const epsSorted = [...epMap.keys()].sort((a, b) => {
				const na = Number(a);
				const nb = Number(b);
				if (Number.isNaN(na) || Number.isNaN(nb))
					return a.localeCompare(b);
				if (na === 0 && nb !== 0) return -1; // full-season pack first
				if (nb === 0 && na !== 0) return 1;
				return nb - na; // newest episode first
			});

			const episodes = epsSorted.map((episode) => {
				const qMap = epMap.get(episode);
				const qualities = [...qMap.keys()].sort(
					(a, b) =>
						QUALITY_ORDER.indexOf(a) - QUALITY_ORDER.indexOf(b),
				);
				const total = qualities.reduce(
					(n, q) => n + qMap.get(q).length,
					0,
				);
				return {
					episode,
					label: episodeLabel(episode),
					total,
					qualities: qualities.map((quality) => ({
						quality,
						torrents: qMap
							.get(quality)
							.sort((a, b) => (b.seeds ?? 0) - (a.seeds ?? 0)),
					})),
				};
			});

			return {
				season,
				label: season === '?' ? 'Unknown' : `Season ${season}`,
				total: episodes.reduce((n, e) => n + e.total, 0),
				episodes,
			};
		});
	});

	let selectedSeasonData = $derived(
		organized.find((s) => s.season === selectedSeason) ??
			organized[0] ??
			null,
	);

	/* ============ Actions ============ */
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
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={onKeydownGlobal} />
{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="torrent-title"
	>
		<button
			type="button"
			onclick={() => (open = false)}
			aria-label="Close"
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
		></button>

		<div
			class="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/80"
		>
			<!-- ============ HEADER ============ -->
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
					onclick={() => (open = false)}
					aria-label="Close"
					class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
				>
					<Icon icon="mdi:close" class="h-5 w-5" />
				</button>
			</header>

			<!-- ============ SEASON TABS ============ -->
			{#if organized.length > 0}
				<div
					class="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-white/10 bg-zinc-900/60 px-4 py-2"
				>
					{#each organized as s (s.season)}
						{@const active =
							selectedSeasonData?.season === s.season}
						<button
							type="button"
							onclick={() => (selectedSeason = s.season)}
							class="flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors
								{active
								? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
								: 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'}"
						>
							{s.label}
							<span
								class="rounded bg-black/20 px-1 text-[10px] text-zinc-400"
								>{s.total}</span
							>
						</button>
					{/each}
				</div>
			{/if}

			<!-- ============ QUALITY FILTER ============ -->
			{#if qualityOptions.length > 0}
				<div
					class="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-white/10 bg-zinc-900/40 px-4 py-2"
				>
					<span
						class="mr-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
					>
						<Icon icon="mdi:filter-variant" class="h-3.5 w-3.5" />
						Quality
					</span>

					<!-- "All" reset -->
					<button
						type="button"
						onclick={clearFilters}
						aria-pressed={!filterActive}
						class="rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-colors
							{!filterActive
							? 'border-white/20 bg-white/15 text-white'
							: 'border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:bg-white/5 hover:text-zinc-200'}"
					>
						All
					</button>

					{#each qualityOptions as opt (opt.quality)}
						{@const active = selectedQualities.includes(
							opt.quality,
						)}
						<button
							type="button"
							onclick={() => toggleQuality(opt.quality)}
							aria-pressed={active}
							class="flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-colors
								{active
								? `${qualityClass(opt.quality)} ring-1 ring-inset ring-current`
								: 'border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:bg-white/5 hover:text-zinc-200'}"
						>
							{opt.quality}
							<span class="text-[10px] opacity-70"
								>({opt.count})</span
							>
						</button>
					{/each}

					{#if filterActive}
						<button
							type="button"
							onclick={clearFilters}
							class="ml-auto flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:text-zinc-200"
						>
							<Icon
								icon="mdi:close-circle-outline"
								class="h-3.5 w-3.5"
							/>
							Clear
						</button>
					{/if}
				</div>
			{/if}

			<!-- ============ CONTENT ============ -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if selectedSeasonData}
					<div class="flex flex-col gap-2">
						{#each selectedSeasonData.episodes as ep, idx (`${selectedSeasonData.season}-${ep.episode}`)}
							<details
								open={idx === 0}
								class="group overflow-hidden rounded-xl border border-white/5 bg-zinc-800/30"
							>
								<summary
									class="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.03] group-open:bg-white/[0.02]"
								>
									<div
										class="flex min-w-0 items-center gap-2"
									>
										<Icon
											icon="mdi:chevron-right"
											class="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-90"
										/>
										<span
											class="text-sm font-semibold text-zinc-100"
											>{ep.label}</span
										>
										<span
											class="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
										>
											{ep.total}
										</span>
									</div>
									<div
										class="flex shrink-0 flex-wrap justify-end gap-1"
									>
										{#each ep.qualities as g (g.quality)}
											<span
												class="rounded border px-1.5 py-0.5 text-[10px] font-medium {qualityClass(
													g.quality,
												)}"
											>
												{g.quality}
											</span>
										{/each}
									</div>
								</summary>

								<div
									class="flex flex-col gap-3 border-t border-white/5 px-3 py-3"
								>
									{#each ep.qualities as group (group.quality)}
										<div>
											<div
												class="mb-1.5 flex items-center gap-2"
											>
												<span
													class="rounded border px-1.5 py-0.5 text-[10px] font-semibold {qualityClass(
														group.quality,
													)}"
												>
													{group.quality}
												</span>
												<span
													class="text-[10px] text-zinc-500"
												>
													{group.torrents.length}
													release{group.torrents
														.length !== 1
														? 's'
														: ''}
												</span>
											</div>

											<div class="flex flex-col gap-1">
												{#each group.torrents as t, i (t.hash ?? t.id ?? i)}
													<div
														role="button"
														tabindex="0"
														onclick={() =>
															copyMagnet(
																t.magnet_url,
															)}
														onkeydown={(e) =>
															onTorrentKey(
																e,
																t.magnet_url,
															)}
														title="Click to copy magnet link"
														class="group/row flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-900/40 px-3 py-2 text-xs transition-colors hover:border-sky-500/30 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
													>
														<span
															class="min-w-0 flex-1 truncate text-zinc-200"
														>
															{t.title ||
																t.filename ||
																'Unknown release'}
														</span>

														<div
															class="flex shrink-0 items-center gap-2"
														>
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
															<span
																class="h-3 w-px bg-white/10"
															></span>
															<span
																class="text-zinc-500"
															>
																{dayjs
																	.unix(
																		t.date_released_unix,
																	)
																	.fromNow()}
															</span>
															<span
																class="h-3 w-px bg-white/10"
															></span>
															<span
																class="text-zinc-400"
																>{humanFileSize(
																	Number(
																		t.size_bytes,
																	),
																)}</span
															>

															{#if t.torrent_url}
																<a
																	href={t.torrent_url}
																	target="_blank"
																	rel="noreferrer"
																	aria-label="Download .torrent"
																	title="Download .torrent"
																	onclick={stopPropagation(
																		bubble(
																			'click',
																		),
																	)}
																	class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
																>
																	<Icon
																		icon="simple-icons:utorrent"
																		class="h-4 w-4"
																	/>
																</a>
															{/if}
															<a
																href={t.magnet_url}
																aria-label="Open magnet link"
																title="Open magnet link"
																onclick={stopPropagation(
																	bubble(
																		'click',
																	),
																)}
																class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
															>
																<Icon
																	icon="mdi:magnet"
																	class="h-4 w-4"
																/>
															</a>
														</div>
													</div>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							</details>
						{/each}
					</div>
				{:else if torrents.length === 0}
					<div class="py-12 text-center text-sm text-zinc-500">
						No torrents available.
					</div>
				{:else}
					<!-- All torrents filtered out -->
					<div
						class="flex flex-col items-center gap-3 py-12 text-center"
					>
						<Icon
							icon="mdi:filter-remove-outline"
							class="h-10 w-10 text-zinc-600"
						/>
						<p class="text-sm text-zinc-400">
							No torrents match the selected qualities.
						</p>
						<button
							type="button"
							onclick={clearFilters}
							class="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/20"
						>
							Clear filters
						</button>
					</div>
				{/if}

				<!-- External links -->
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
