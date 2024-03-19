<script>
	import cfg from '$config/main';
	import dayjs from 'dayjs';

	import { show } from '$lib/shows';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let ordered_shows = [];
	onMount(async () => {
		let val = get(show);

		await val.forEach(async (el) => {
			let res = await fetch(cfg.api_show_id + el, cfg.api_options);
			res = await res.json();

			if (res.next_episode_to_air) {
				let day = res.next_episode_to_air.air_date;
				res.address = cfg.show_address(res);
				// console.log(day);
				if (!ordered_shows[day]) ordered_shows[day] = [];
				ordered_shows[day] = [...ordered_shows[day], res];
			}
		});
	});
</script>

<div class="flex w-full justify-center sm:h-screen">
	<div class="flex flex-col sm:flex-row sm:flex-wrap p-5 w-full gap-5">
		{#each Array(dayjs().daysInMonth()) as d, i}
			{@const day = dayjs().date(i + 1)}
			{@const today = dayjs().isSame(day)}
			{@const today_formatted = day.format('YYYY-MM-DD')}

			{#if i === 0}
				{#each Array(day.day()) as d}
					<card class="sm:min-w-[13%] aspect-[1/1] hidden"> </card>
				{/each}
			{/if}
			<card
				class="sm:w-[13%] sm:aspect-[1/1] rounded-lg p-3
                {ordered_shows[today_formatted] ? '' : 'hidden'}
                {Number(day.format('D')) < Number(dayjs().format('D'))
					? 'blur-sm opacity-50 sm:flex hidden'
					: ''} {today
					? 'bg-gray-700'
					: 'bg-gray-900'} text-gray-300 flex items-start"
			>
				<div class="flex flex-col justify-center w-full items-center">
					<span class="uppercase text-xs">{day.format('dddd')}</span>
					<span>{day.format('D')}</span>

					{#if ordered_shows[today_formatted]}
						{#each ordered_shows[today_formatted] as os}
							<!-- {void console.log(os) || ''} -->
							<a
								href={os.address}
								class=" bg-sky-800 text-white rounded p-1 text-sm mb-1 cursor-pointer hover:bg-sky-400 w-[100%] sm:mt-0 mt-2"
							>
								<span
									class="event-name flex truncate text-pretty w-full text-clip line-clamp-1"
									>{os.name}
								</span>
							</a>
						{/each}
					{/if}
				</div>
				<!-- {day.format('DD/MM/YYYY')} -->
			</card>
		{/each}
	</div>
</div>
