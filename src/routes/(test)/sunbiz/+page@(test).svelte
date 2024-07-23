<script>
	import parse from 'node-html-parser';

	let loading = true;
	let response = [];

	const analize_data = async (data) => {
		let items = data.querySelectorAll('td.large-width');

		response = items;
		// console.log(items);
	};
	const start_search = async (query) => {
		loading = true;
		response = 'loading...';
		let res = await fetch('sunbiz/api/?q=' + query);
		let text = await res.text();
		let parsed = parse(text);

		let data = analize_data(parsed);

		// console.log(text);
		// response = res;
		loading = false;
	};
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-5">
	<input
		on:input={(e) => {
			let val = e.target.value;
			if (val.length <= 2) return false;

			start_search(val);
		}}
		class="rounded px-2 py-1 text-black placeholder:text-black"
		type="text"
		placeholder="Search"
	/>
	<results
		class="flex min-h-[600px] w-full max-w-5xl flex-col rounded-xl border p-5 shadow"
	>
		{#if !loading}
			{#each response as r, i}
				<div>{r.text}</div>
			{/each}
		{/if}
	</results>
</div>
