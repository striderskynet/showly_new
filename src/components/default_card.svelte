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

	$: nextEpisode = el.next_episode_to_air;
	$: isSeasonPremiere = nextEpisode?.episode_number === 1;
	$: followed = $show.includes(String(el.id));

	$: airDate = nextEpisode
		? dayjs(nextEpisode.air_date)
		: dayjs(el.first_air_date);

	$: address = cfg.show_address(el);

	$: imageSrc = el.poster_path
		? cfg.image_path + '780' + el.poster_path
		: el.backdrop_path
			? cfg.image_path + '780' + el.backdrop_path
			: null;

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

	function toggleFollow() {
		if (followed) delete_show(el.id);
		else add_show(el.id, el);
	}

	if (dev) console.log(el, $show, $show.includes(el.id));
</script>

<a
	in:scale={{ duration: 400, start: 0.95 }}
	out:scale={{ duration: 400 }}
	href={address}
	class="relative group block overflow-hidden rounded-2xl bg-zinc-900
	       ring-1 {accentRing} cursor-pointer transition-all duration-500
	       hover:ring-2
	       hover:shadow-2xl hover:shadow-black/60
	       {shows
		? 'aspect-[2/3] min-w-[240px] sm:min-w-[280px]'
		: 'w-full min-w-[280px] aspect-[2/3]'}
	       {defaultClass}"
>
	<!-- Poster -->
	{#if imageSrc}
		<img
			alt={el.name || 'Poster'}
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

	<!-- Rating pill (top-left) -->
	{#if el.vote_average}
		<div
			class="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full
			       bg-black/60 px-2.5 py-1 text-xs font-semibold text-white
			       ring-1 ring-white/15 backdrop-blur-md"
		>
			<Icon icon="mdi:star" class="h-3.5 w-3.5 text-amber-400" />
			<span>
				{Number(el.vote_average).toFixed(
					Number(el.vote_average) % 10 === 0 ? 0 : 1,
				)}
			</span>
		</div>
	{/if}

	<!-- Follow button (top-right) -->
	{#if data.session}
		<button
			type="button"
			aria-label={followed ? 'Unfollow show' : 'Follow show'}
			class="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center
			       rounded-full bg-black/60 ring-1 ring-white/15 backdrop-blur-md
			       transition-all duration-300
			       hover:scale-110 hover:bg-black/90
			       opacity-100 sm:opacity-0 sm:group-hover:opacity-100
			       {followed ? 'text-sky-400' : 'text-white/80 hover:text-white'}"
			on:click|preventDefault|stopPropagation={toggleFollow}
		>
			<Icon
				icon={followed ? 'mdi:bookmark' : 'mdi:bookmark-outline'}
				class="h-5 w-5"
			/>
		</button>
	{/if}

	<!-- Bottom overlay -->
	<div
		class="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end
		       bg-gradient-to-t {bottomGradient} to-transparent
		       p-4 pt-20"
	>
		<!-- Next episode / status — reveals on hover -->
		{#if nextEpisode}
			<div
				class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out
				       group-hover:grid-rows-[1fr]"
			>
				<div class="overflow-hidden">
					<div class="mb-2 flex items-center gap-2">
						<span
							class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]
							       font-semibold uppercase tracking-wider text-white/80
							       ring-1 ring-white/10"
						>
							S{nextEpisode.season_number} · E{nextEpisode.episode_number}
						</span>
					</div>
					<p class="mb-2 line-clamp-1 text-xs text-white/70">
						{nextEpisode.name}
					</p>
				</div>
			</div>
		{:else if el.status}
			<div
				class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out
				       group-hover:grid-rows-[1fr]"
			>
				<div class="overflow-hidden">
					<p class="mb-2 text-xs text-white/70">{el.status}</p>
				</div>
			</div>
		{/if}

		<!-- Title -->
		<h3
			class="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-white"
		>
			{el.name}
		</h3>

		<!-- Air date -->
		<p class="mt-1 text-xs font-medium text-white/60">
			<span class="group-hover:hidden">{airDate.fromNow()}</span>
			<span class="hidden group-hover:inline"
				>{airDate.format('MMM D, YYYY')}</span
			>
		</p>
	</div>
</a>
