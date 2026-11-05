<script>
	import { dev } from '$app/environment';
	import cfg from '$config/main';
	import { show } from '$lib/shows.js';
	import Icon from '@iconify/svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { scale } from 'svelte/transition';

	dayjs.extend(relativeTime);

	export let data;
	export let delete_show;
	export let add_show;
	export let el;
	export let shows = true;
	export let defaultClass = '';

	// ---- Derived ----
	$: nextEpisode = el.next_episode_to_air ?? null;
	$: isSeasonPremiere = nextEpisode?.episode_number === 1;

	// El store puede contener numbers (TMDb) o strings (Supabase) — normalizamos ambos lados.
	$: followed = $show.some((id) => String(id) === String(el.id));

	$: airDate = nextEpisode?.air_date
		? dayjs(nextEpisode.air_date)
		: el.first_air_date
			? dayjs(el.first_air_date)
			: null;

	$: daysUntil = airDate ? airDate.diff(dayjs(), 'days') : Infinity;
	$: isUpcoming = daysUntil > 0;
	$: isPremiereSoon = isUpcoming && daysUntil <= 30;

	$: address = cfg.show_address(el);

	$: imageSrc = el.poster_path
		? cfg.image_path + '500' + el.poster_path
		: el.backdrop_path
			? cfg.image_path + '780' + el.backdrop_path
			: null;

	$: ratingValue = Number(el.vote_average) || 0;
	$: hasRating = ratingValue > 0;
	$: ratingText = Number.isInteger(ratingValue)
		? ratingValue.toFixed(0)
		: ratingValue.toFixed(1);
	$: ratingColor =
		ratingValue >= 8
			? 'text-emerald-400'
			: ratingValue >= 7
				? 'text-sky-400'
				: ratingValue >= 6
					? 'text-yellow-400'
					: 'text-amber-400';

	// Fecha inteligente: relativa para cerca, absoluta para lejos.
	$: dateLabel = (() => {
		if (!airDate) return null;
		if (Math.abs(daysUntil) <= 90) return airDate.fromNow();
		return airDate.format('MMM D, YYYY');
	})();

	$: accentRing = isSeasonPremiere
		? 'ring-amber-400/50'
		: followed
			? 'ring-sky-500/50'
			: 'ring-white/10';

	$: bottomGradient = isSeasonPremiere
		? 'from-amber-950/95 via-black/60'
		: followed
			? 'from-sky-950/95 via-black/60'
			: 'from-black/95 via-black/60';

	// Quitamos min-w-[280px] en el caso slider: TinySlider ya controla el ancho del slide.
	$: sizingClass = shows
		? 'aspect-[2/3] min-w-[240px] sm:min-w-[280px]'
		: 'aspect-[2/3] w-full';

	// ---- Actions ----
	let pending = false;
	async function toggleFollow() {
		if (pending) return;
		pending = true;
		try {
			if (followed) await delete_show(el.id);
			else await add_show(el.id, el);
		} catch (e) {
			if (dev) console.error('toggleFollow failed', e);
		} finally {
			pending = false;
		}
	}
</script>

<a
	in:scale={{ duration: 400, start: 0.95 }}
	out:scale={{ duration: 400 }}
	href={address}
	class="relative w-80 aspect-[1/1.7] group block overflow-hidden rounded-2xl bg-zinc-900
	       ring-1 {accentRing} cursor-pointer transition-all duration-500
	       hover:ring-2 hover:shadow-2xl hover:shadow-black/60
	       {sizingClass} {defaultClass}"
>
	<!-- Poster -->
	{#if imageSrc}
		<img
			alt=""
			src={imageSrc}
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover
			       transition-transform duration-700 ease-out
			       group-hover:scale-105"
		/>
	{:else}
		<div
			class="absolute inset-0 flex items-center justify-center bg-zinc-950"
		>
			<Icon
				icon="mdi:file-image-remove"
				class="h-20 w-20 text-zinc-700"
			/>
		</div>
	{/if}

	<!-- Top-left: rating o "Soon" -->
	{#if hasRating}
		<div
			class="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full
			       bg-black/60 px-2.5 py-1 text-xs font-semibold text-white
			       ring-1 ring-white/15 backdrop-blur-md"
		>
			<Icon icon="mdi:star" class="h-3.5 w-3.5 {ratingColor}" />
			<span>{ratingText}</span>
		</div>
	{:else if isPremiereSoon}
		<div
			class="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full
			       bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
			       text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-md"
		>
			<Icon icon="mdi:fire" class="h-3 w-3" />
			Soon
		</div>
	{/if}

	<!-- Top-right: premiere badge + follow button -->
	<div class="absolute right-3 top-3 z-20 flex items-center gap-1.5">
		{#if isSeasonPremiere}
			<span
				class="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase
				       tracking-wider text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-md"
			>
				Premiere
			</span>
		{/if}

		{#if data.session}
			<button
				type="button"
				aria-label={followed ? 'Unfollow show' : 'Follow show'}
				disabled={pending}
				class="flex h-9 w-9 items-center justify-center rounded-full
				       bg-black/60 ring-1 ring-white/15 backdrop-blur-md
				       transition-all duration-300
				       hover:scale-110 hover:bg-black/90
				       opacity-100 sm:opacity-0 sm:group-hover:opacity-100
				       disabled:cursor-wait disabled:opacity-70
				       {followed ? 'text-sky-400' : 'text-white/80 hover:text-white'}"
				on:click|preventDefault|stopPropagation={toggleFollow}
			>
				<Icon
					icon={pending
						? 'mdi:loading'
						: followed
							? 'mdi:bookmark'
							: 'mdi:bookmark-outline'}
					class="h-5 w-5 {pending ? 'animate-spin' : ''}"
				/>
			</button>
		{/if}
	</div>

	<!-- Bottom overlay -->
	<div
		class="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end
		       bg-gradient-to-t {bottomGradient} to-transparent
		       p-4 pt-20"
	>
		<!-- Hover-reveal: next episode / status / overview -->
		<div
			class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out
			       group-hover:grid-rows-[1fr]"
		>
			<div class="overflow-hidden">
				{#if nextEpisode}
					<div class="mb-2 flex items-center gap-2">
						<span
							class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]
							       font-semibold uppercase tracking-wider text-white/80
							       ring-1 ring-white/10"
						>
							S{nextEpisode.season_number} · E{nextEpisode.episode_number}
						</span>
						<span
							class="text-[10px] font-medium uppercase tracking-wider text-white/50"
						>
							Next
						</span>
					</div>
					{#if nextEpisode.name}
						<p class="mb-2 line-clamp-1 text-xs text-white/70">
							{nextEpisode.name}
						</p>
					{/if}
				{:else if el.status}
					<p class="mb-2 text-xs text-white/70">{el.status}</p>
				{:else if el.overview}
					<p
						class="mb-2 line-clamp-2 text-xs leading-relaxed text-white/60"
					>
						{el.overview}
					</p>
				{/if}
			</div>
		</div>

		<!-- Título -->
		<h3
			class="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-white"
		>
			{el.name ?? el.original_name ?? 'Untitled'}
		</h3>

		<!-- Fecha -->
		{#if dateLabel}
			<p class="mt-1 text-xs font-medium text-white/60">
				<span class="group-hover:hidden">{dateLabel}</span>
				<span class="hidden group-hover:inline">
					{airDate.format('MMM D, YYYY')}
				</span>
			</p>
		{/if}
	</div>
</a>
