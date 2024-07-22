<script>
	import { onMount } from 'svelte';

	let api_url =
		'https://api.cambiocuba.money/api/v1/x-rates-by-date-range-history?trmi=true&period=4Y&cur=';
	let currency = ['ECU', 'USD', 'MLC'];
	let res = {};

	let chart_el;
	let series = [];
	let cat = [];

	onMount(async () => {
		for (const el of currency) {
			let tmp = await fetch(api_url + el);
			res[el] = await tmp.json();

			let curr = el;
			if (curr === 'ECU') curr = 'EUR';
			//console.log(res[el]);
			let data = { name: curr, data: [] };
			res[el].forEach((e) => {
				if (e.last.date.includes('2024')) {
					data.data = [...data.data, e.median];
					cat = [...cat, e._id];
				}
			});
			series = [...series, data];
		}
		// currency.forEach(async (el) => {
		// 	let tmp = await fetch(api_url + el);
		// 	res[el] = await tmp.json();

		// 	let data = { name: el, data: [] };
		// 	res[el].forEach((e) => {
		// 		data.data = [...data.data, e.median];
		// 	});

		// 	series = [...series, data];
		// });

		console.log(series);
		var options = {
			series: series,
			chart: {
				type: 'area',
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: 'smooth',
			},

			yaxis: {
				labels: {
					formatter: (value) => {
						return value.toFixed();
					},
				},
			},

			xaxis: {
				type: 'date',
				categories: cat,
			},
			tooltip: {
				x: {
					format: 'dd/MM/yy HH:mm',
				},
			},
		};

		var chart = new ApexCharts(chart_el, options);

		chart.render();
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
</svelte:head>

<div class="flex h-screen w-full bg-white text-black">
	<div class="mx-auto my-auto w-[90%]" bind:this={chart_el}></div>
</div>
