<script>
	/** @type {{canPrev: boolean, canNext: boolean, prev: () => void, next: () => void}} */
	let { canPrev, canNext, prev, next } = $props();
</script>

<div
	class="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between"
>
	<button
		type="button"
		onclick={prev}
		disabled={!canPrev}
		aria-label="Previous"
		class="pointer-events-auto -ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/90 disabled:opacity-0"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-5 w-5"
		>
			<path d="M15 18l-6-6 6-6" />
		</svg>
	</button>

	<button
		type="button"
		onclick={next}
		disabled={!canNext}
		aria-label="Next"
		class="pointer-events-auto -mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/90 disabled:opacity-0"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-5 w-5"
		>
			<path d="M9 18l6-6-6-6" />
		</svg>
	</button>
</div>
