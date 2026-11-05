<script>
	import DefaultCard from '$components/default_card.svelte';
	import { show } from '$lib/shows.js';
	import { onMount } from 'svelte';
	import SliderControls from './SliderControls.svelte';

	/** @type {{list?: any, data: any, add_show: any, delete_show: any, filterFollowed?: boolean}} */
	let {
		list = [],
		data,
		add_show,
		delete_show,
		filterFollowed = false,
	} = $props();

	let visible = $derived(
		filterFollowed ? list.filter((el) => !$show.includes(el.id)) : list,
	);

	/** @type {HTMLDivElement | undefined} */
	let track = $state();
	let canPrev = $state(false);
	let canNext = $state(false);
	let isDragging = $state(false);

	// Estado caliente del drag (no reactivo a propósito)
	let pendingDrag = false;
	let dragStartX = 0;
	let dragStartScroll = 0;
	let dragMoved = 0;

	const THRESHOLD = 6;

	function updateArrows() {
		if (!track) return;
		canPrev = track.scrollLeft > 4;
		canNext = track.scrollLeft + track.clientWidth < track.scrollWidth - 4;
	}

	/** @param {-1 | 1} dir */
	function scrollBy(dir) {
		if (!track) return;
		track.scrollBy({
			left: dir * Math.round(track.clientWidth * 0.8),
			behavior: 'smooth',
		});
	}

	const prev = () => scrollBy(-1);
	const next = () => scrollBy(1);

	/** @param {PointerEvent} e */
	function onPointerDown(e) {
		if (e.button !== 0) return;
		if (!track) return;

		// NO preventDefault, NO setPointerCapture aquí:
		// si lo hacemos, el click del <a> del card deja de disparar.
		pendingDrag = true;
		dragStartX = e.clientX;
		dragStartScroll = track.scrollLeft;
		dragMoved = 0;

		window.addEventListener('pointermove', onWindowPointerMove);
		window.addEventListener('pointerup', onWindowPointerUp, { once: true });
		window.addEventListener('pointercancel', onWindowPointerUp, {
			once: true,
		});
	}

	/** @param {PointerEvent} e */
	function onWindowPointerMove(e) {
		if (!pendingDrag || !track) return;

		const dx = e.clientX - dragStartX;
		const moved = Math.abs(dx);

		if (moved < THRESHOLD) return;

		if (!isDragging) {
			isDragging = true;
			track.style.scrollSnapType = 'none';
			track.style.scrollBehavior = 'auto';
		}
		dragMoved = Math.max(dragMoved, moved);
		track.scrollLeft = dragStartScroll - dx;
	}

	/** @param {PointerEvent} _e */
	function onWindowPointerUp(_e) {
		window.removeEventListener('pointermove', onWindowPointerMove);

		if (!pendingDrag) return;
		pendingDrag = false;

		if (!isDragging) return;

		isDragging = false;
		if (track) {
			track.style.scrollSnapType = '';
			track.style.scrollBehavior = '';
		}

		// Fue un drag → comemos el click que sigue para no navegar
		const swallow = (/** @type {Event} */ ev) => {
			ev.stopPropagation();
			ev.preventDefault();
		};
		track?.addEventListener('click', swallow, {
			capture: true,
			once: true,
		});
		setTimeout(() => {
			track?.removeEventListener('click', swallow, { capture: true });
		}, 80);
	}

	/** @param {DragEvent} e */
	function onDragStart(e) {
		// Mata el drag nativo de <img>/<a> sin tocar el click.
		e.preventDefault();
	}

	onMount(() => {
		if (!track) return;
		updateArrows();
		track.addEventListener('scroll', updateArrows, { passive: true });
		const ro = new ResizeObserver(updateArrows);
		ro.observe(track);
		return () => {
			track?.removeEventListener('scroll', updateArrows);
			ro.disconnect();
		};
	});

	$effect(() => {
		visible;
		queueMicrotask(updateArrows);
	});
</script>

{#if visible.length > 0}
	<div class="relative">
		<div
			bind:this={track}
			class="track flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 select-none"
			class:cursor-grab={!isDragging}
			class:cursor-grabbing={isDragging}
			ondragstart={onDragStart}
			onpointerdown={onPointerDown}
		>
			{#each visible as el (el.id)}
				<div
					class="w-60 shrink-0 snap-start sm:w-48 md:w-52 lg:w-56 xl:w-80"
				>
					<DefaultCard
						{el}
						{data}
						{add_show}
						{delete_show}
						defaultClass="flex aspect-[1/1.5]"
						shows={false}
					/>
				</div>
			{/each}
		</div>

		{#if canPrev}
			<div
				class="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black to-transparent"
			></div>
		{/if}
		{#if canNext}
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent"
			></div>
		{/if}

		<SliderControls {canPrev} {canNext} {prev} {next} />
	</div>
{/if}

<style>
	.track {
		scrollbar-width: none;
		-ms-overflow-style: none;
		-webkit-overflow-scrolling: touch;
		touch-action: pan-x pan-y;
	}
	.track::-webkit-scrollbar {
		display: none;
	}

	/* Evita drag nativo de imágenes y selección de texto (Firefox / Safari) */
	.track :global(img),
	.track :global(a) {
		-webkit-user-drag: none;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.track {
			scroll-behavior: auto;
		}
	}
</style>
