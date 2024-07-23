<script>
	import parse from 'node-html-parser';

	let loading = true,
		timer;
	let response = [];

	const analize_data = async (data) => {
		let items = data.querySelectorAll(
			'div#search-results > table > tbody > tr'
		);

		let i = [];
		items.forEach((e) => {
			let title = e.querySelectorAll('td.large-width')[0].text;
			let id = e.querySelectorAll('td.medium-width')[0].text;
			let status = e.querySelectorAll('td.small-width')[0].text;
			i.push({ title: title, id: id, status: status });
		});

		console.log(i);
		return i;

		// response = items;
		// console.log(items);
	};
	const start_search = async (query) => {
		loading = true;
		response = 'loading...';
		let res = await fetch('sunbiz/api/?q=' + query);
		let text = await res.text();
		let parsed = parse(text);

		response = await analize_data(parsed);

		// console.log(text);
		// response = res;
		loading = false;
	};
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-5">
	<input
		on:input={(e) => {
			let val = e.target.value;
			//if (val.length <= 2) return false;

			clearTimeout(timer);
			timer = setTimeout(() => {
				start_search(val);
			}, 200);
		}}
		class="rounded px-2 py-1 text-black placeholder:text-black"
		type="text"
		placeholder="Search"
	/>
	<results class="flex min-h-[600px] w-full max-w-5xl flex-col gap-1 shadow">
		{#if !loading}
			{#each response as r, i}
				<div class="rounded border px-2 py-1">
					{r.title} | {r.id} | {r.status}
				</div>
			{/each}
		{/if}
	</results>
</div>
