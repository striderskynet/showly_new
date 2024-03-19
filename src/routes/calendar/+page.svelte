<script>
	import dayjs from 'dayjs';

	import { show } from '$lib/shows';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let ordered_shows = [];
	onMount(() => {
		let val = get(show);

		val.forEach((el) => {
			let day = dayjs(el.next_episode_to_air).date();
			ordered_shows[day] = [...ordered_shows[day], el];
		});
		// let days_in_month = Array();
		// console.log(days_in_month);

		// for (let d = 1; d <= dayjs().daysInMonth(); d++) {
		// 	console.log(d + 'asd');
		// }
		// populate shows
	});
</script>

<div class="flex w-full justify-center min-w-[1880px]">
	<div class="flex flex-wrap p-5 min-w-min w-[99%] gap-5">
		{#each Array(dayjs().daysInMonth()) as d, i}
			{@const day = dayjs().date(i + 1)}

			{#if i === 0}
				{#each Array(day.day()) as d}
					<card class="sm:min-w-[13%] aspect-[1/1.2]"> </card>
				{/each}
			{/if}
			<card
				class="sm:min-w-[13%] aspect-[1/1.2] border rounded-lg p-3 bg-gray-100 text-black"
			>
				<div class="flex flex-col justify-center w-full items-center">
					<span class="uppercase text-xs">{day.format('dddd')}</span>
					<span>{day.format('D')}</span>

					{#if ordered_shows[i + 1]}
						{#each ordered_shows[i + 1] as os}
							<div
								class="event bg-sky-500 text-white rounded p-1 text-sm mb-1 cursor-pointer hover:bg-sky-400"
							>
								<span class="event-name"> {os.name} </span>
								<span class="time"> 12:00~14:00 </span>
							</div>
						{/each}
					{/if}
				</div>
				<!-- {day.format('DD/MM/YYYY')} -->
			</card>
		{/each}
	</div>
</div>
