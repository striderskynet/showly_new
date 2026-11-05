<script>
	import DefaultCard from '$components/default_card.svelte';
	import { show } from '$lib/shows.js';
	import { TinySlider } from 'svelte-tiny-slider';
	import SliderControls from './SliderControls.svelte';

	export let list = [];
	export let data;
	export let add_show;
	export let delete_show;
	/** If true, hides shows the user already follows (used for Upcoming/Trending). */
	export let filterFollowed = false;

	$: visible = filterFollowed
		? list.filter((el) => !$show.includes(el.id))
		: list;
</script>

{#if visible.length > 0}
	{#key visible}
		<TinySlider gap="10px">
			{#each visible as el (el.id)}
				<DefaultCard
					{el}
					{data}
					{add_show}
					{delete_show}
					defaultClass="flex aspect-[1/1.5]"
					shows={false}
				/>
			{/each}

			<svelte:fragment slot="controls" let:setIndex let:currentIndex>
				<SliderControls {setIndex} {currentIndex} />
			</svelte:fragment>
		</TinySlider>
	{/key}
{/if}
