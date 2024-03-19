<script>
	import Icon from '@iconify/svelte';
</script>

<div
	class="w-full flex justify-center items-center border-2 border-gray-900 rounded-3xl p-2 sm:p-5 border-dashed bg-gray-950 max-h-[300px]"
>
	<div class="flex flex-col justify-center items-center text-sm">
		<Icon icon="mdi:account" class="text-sky-500 text-4xl sm:text-7xl " />
		<span class="font-bold text-gray-200 text-base sm:text-lg"
			>Please log in to...</span
		>
		<span class="text-gray-200 text-lg sm:text-xl sm:mt-2">
			Follow, Rate and Comment
		</span>

		<div class="flex mt-2 sm:mt-8 gap-5">
			<a
				href="/login"
				class="bg-sky-700 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-sky-900 duration-300"
			>
				<Icon icon="mdi:google" class="text-2xl " /> Login with Google
			</a>
		</div>
	</div>
</div>
