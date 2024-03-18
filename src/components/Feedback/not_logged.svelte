<script>
	import Icon from '@iconify/svelte';
</script>

<div class="w-full h-full flex justify-center items-center">
	<div class="flex flex-col justify-center items-center text-sm">
		<Icon icon="mdi:account-cancel" class="text-gray-800 text-7xl m-3" />
		<span class="font-bold text-base text-slate-300"
			>You are not logged</span
		>
		<span class="text-slate-500"
			>Please login with a Google Account to start following shows
		</span>

		<div class="flex mt-5 gap-5">
			<a
				href="/login"
				class="bg-sky-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-sky-900 duration-300"
			>
				<Icon icon="mdi:google" class="text-2xl " /> Login with Google
			</a>
		</div>
	</div>
</div>
