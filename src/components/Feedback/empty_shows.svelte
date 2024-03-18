<script>
	import Icon from '@iconify/svelte';
</script>

<div class="w-full h-full flex justify-center items-center">
	<div class="flex flex-col justify-center items-center text-sm">
		<Icon
			icon="mdi:folder-plus-outline"
			class="text-gray-800 text-7xl m-3"
		/>
		<span class="font-bold text-base text-slate-300">This is empty</span>
		<span class="text-slate-500">Get started by following some Shows </span>

		<div class="flex mt-5 gap-5 text-xs">
			<a
				href="/hot"
				class="bg-sky-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-sky-900 duration-300"
			>
				<Icon icon="mdi:fire" class="text-2xl " /> Upcoming shows
			</a>

			<a
				href="/trending"
				class="bg-sky-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-sky-900 duration-300"
			>
				<Icon
					icon="mdi:format-list-bulleted-triangle"
					class="text-2xl "
				/> Trending shows
			</a>
		</div>
	</div>
</div>
