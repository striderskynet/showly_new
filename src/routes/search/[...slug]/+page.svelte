<script>
	import { dev } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	import '$assets/app.css';
	import Spinner from '$components/UI/spinner.svelte';
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';
	import { show_add, show_del } from '$lib/shows.js';

	export let data;

	let query = $page.params.slug ?? '';
	let results = [];
	let loading = false;
	let error = null;
	let controller = null;
	let debounceTimer = null;

	async function runSearch(q) {
		// Cancela la petición anterior (evita race conditions)
		controller?.abort();
		controller = new AbortController();
		const { signal } = controller;

		const trimmed = q?.trim() ?? '';
		if (!trimmed) {
			results = [];
			loading = false;
			error = null;
			return;
		}

		loading = true;
		error = null;

		try {
			const res = await fetch(
				cfg.api_show_search + encodeURIComponent(trimmed),
				{ ...cfg.api_options, signal },
			);
			if (!res.ok) throw new Error(`Search failed (${res.status})`);
			const json = await res.json();
			results = json.results ?? [];
		} catch (e) {
			if (e.name === 'AbortError') return;
			if (dev) console.error(e);
			error = e;
			results = [];
		} finally {
			if (!signal.aborted) loading = false;
		}
	}

	function handleInput(value) {
		query = value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			runSearch(query);
			syncUrl();
		}, 300);
	}

	function handleSubmit(e) {
		e.preventDefault();
		clearTimeout(debounceTimer);
		runSearch(query);
		syncUrl();
	}

	function clearSearch() {
		query = '';
		results = [];
		controller?.abort();
		loading = false;
		error = null;
		syncUrl();
	}

	/** Mantiene la URL compartible sin recargar la ruta. Requiere SvelteKit 2+. */
	function syncUrl() {
		const slug = query.trim();
		replaceState(
			slug ? `/search/${encodeURIComponent(slug)}` : '/search',
			{},
		);
	}

	async function add_show(id) {
		if (!data.session) return;
		try {
			await show_add(data.supabase, data.session.user.id, id);
		} catch (e) {
			if (dev) console.error('add_show failed', e);
		}
	}

	async function delete_show(id) {
		if (!data.session) return;
		try {
			await show_del(data.supabase, data.session.user.id, id);
		} catch (e) {
			if (dev) console.error('delete_show failed', e);
		}
	}

	onMount(() => {
		if (query) runSearch(query);
	});

	onDestroy(() => {
		controller?.abort();
		clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>{query ? `Search: ${query}` : 'Search'} · Showly</title>
</svelte:head>

<div class="min-h-screen px-5 py-6 sm:px-10">
	<!-- Sticky search bar -->
	<div
		class="sticky top-0 z-40 -mx-5 mb-6 bg-zinc-950/80 px-5 py-3 backdrop-blur-xl sm:-mx-10 sm:px-10"
	>
		<form on:submit={handleSubmit} class="mx-auto w-full max-w-2xl">
			<label for="search" class="sr-only">Search TV shows</label>
			<div class="group relative">
				<Icon
					icon="mdi:magnify"
					class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2
					       text-zinc-500 transition-colors group-focus-within:text-sky-400"
				/>
				<input
					id="search"
					type="search"
					value={query}
					on:input={(e) => handleInput(e.currentTarget.value)}
					placeholder="Search TV shows…"
					autocomplete="off"
					spellcheck="false"
					class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3 pl-12 pr-28
					       text-sm text-zinc-100 placeholder:text-zinc-500
					       transition-all duration-200
					       focus:border-sky-400/50 focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-sky-400/10"
				/>
				<div
					class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1"
				>
					{#if loading}
						<div
							class="flex h-8 w-8 items-center justify-center"
							aria-label="Searching"
						>
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400"
							></div>
						</div>
					{:else if query}
						<button
							type="button"
							on:click={clearSearch}
							aria-label="Clear search"
							class="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500
							       transition-colors hover:bg-white/5 hover:text-zinc-200
							       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
						>
							<Icon icon="mdi:close" class="h-4 w-4" />
						</button>
					{/if}
					<button
						type="submit"
						class="hidden rounded-xl bg-sky-500/90 px-4 py-1.5 text-xs font-semibold text-white
						       transition-colors hover:bg-sky-400
						       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60
						       sm:block"
					>
						Search
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Results -->
	<div class="mx-auto w-full max-w-7xl">
		{#if error}
			<div
				class="flex flex-col items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
			>
				<span>Search failed. Please try again.</span>
				<button
					class="font-medium underline underline-offset-2 transition hover:text-red-200"
					on:click={() => runSearch(query)}
				>
					Retry
				</button>
			</div>
		{:else if loading && results.length === 0}
			<div class="flex justify-center py-20">
				<Spinner />
			</div>
		{:else if query.trim() && results.length === 0}
			<div class="flex flex-col items-center gap-3 py-20 text-center">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/5"
				>
					<Icon
						icon="mdi:magnify-close"
						class="h-8 w-8 text-zinc-600"
					/>
				</div>
				<div>
					<p class="text-sm font-medium text-zinc-300">
						No results for "{query}"
					</p>
					<p class="mt-1 text-xs text-zinc-500">
						Try a different title.
					</p>
				</div>
			</div>
		{:else if results.length > 0}
			<div class="flex flex-wrap justify-center gap-3 sm:justify-start">
				{#each results as el (el.id)}
					<DefaultCard {el} {data} {delete_show} {add_show} />
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center gap-3 py-20 text-center">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/5"
				>
					<Icon
						icon="mdi:television-search"
						class="h-8 w-8 text-zinc-600"
					/>
				</div>
				<div>
					<p class="text-sm font-medium text-zinc-300">
						Find your next show
					</p>
					<p class="mt-1 text-xs text-zinc-500">
						Start typing to search.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
