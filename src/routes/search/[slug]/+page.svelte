<script>
	import Spinner from '$components/UI/spinner.svelte';
	import DefaultCard from '$components/default_card.svelte';
	import cfg from '$config/main';

	import { page } from '$app/stores';
	import '$assets/app.css';

	export let data;

	let search_input, show_list;

	const delete_show = (id) => {
		show_del(data.supabase, data.session.user.id, id);

		let new_list = show_list.filter((o) => o.id !== id);
		show_list = new_list;
	};

	const search_shows = (query) => {
		show_list = fetch(cfg.api_show_search + query, cfg.api_options).then(
			(res) => {
				return res.json();
			}
		);

		console.log('You searched for: ', query);
	};

	$: search_shows($page.params.slug);
</script>

<div class="p-5 flex flex-col items-center gap-5">
	<div class="w-[500px]">
		<form class="">
			<label
				for="default-search"
				class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
				>Search</label
			>
			<div class="relative">
				<div
					class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
				>
					<svg
						class="w-4 h-4 text-gray-500 dark:text-gray-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 20"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
						/>
					</svg>
				</div>
				<input
					type="search"
					id="default-search"
					class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Search TV Shows..."
					bind:this={search_input}
					on:input={(e) => {
						search_shows(e.target.value);
					}}
					required
				/>
				<button
					type="submit"
					class="text-white absolute end-2.5 bottom-2.5 bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					>Search</button
				>
			</div>
		</form>
	</div>
	<div
		class="flex justify-center sm:justify-start sm:w-[95%] flex-wrap gap-3"
	>
		{#await show_list}
			<div
				class="w-full min-h-screen justify-center items-center flex -translate-y-20"
			>
				<Spinner />
			</div>
		{:then value}
			{#if value && value.results.length > 0}
				{#each value.results as el}
					<DefaultCard {el} {data} {delete_show} />
				{/each}
			{/if}
		{/await}
	</div>
</div>
