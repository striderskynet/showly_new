<script>
	import Icon from '@iconify/svelte';
	import { Drawer } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';

	export let data;

	let hidden = true;
	let transitionParamsRight = {
		x: 320,
		duration: 200,
		easing: sineIn,
	};
</script>

<div
	class="fixed w-full top-2 z-30 md:hidden px-5 justify-between flex items-center"
>
	<a
		href="/search"
		class="text-gray-400 rounded-full bg-gray-800 hover:text-white flex items-center duration-300 h-10 w-10 justify-center"
	>
		<Icon icon="mdi:search" class="text-2xl" />
	</a>
	{#if data.session}
		<a
			href={'#'}
			on:click|preventDefault={() => {
				hidden = false;
			}}
			class="relative bg-transparent p-1 rounded-full hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300 w-10 aspect-square overflow-hidden text-sky-500 border border-sky-700"
		>
			<img
				src={data.session.user.user_metadata.avatar_url}
				alt="User Avatar"
				class="absolute w-full h-full flex left-0 top-0"
			/>
		</a>
	{:else}
		<a
			href="/login"
			on:click|preventDefault={() => {
				hidden = false;
			}}
			class="relative bg-gray-800 p-1 rounded-full hover:bg-gray-700 text-sky-500 hover:text-white flex items-center gap-2 duration-300 w-10 aspect-square overflow-hidden"
		>
			<Icon icon="mdi:user" class="w-8 text-2xl" />
		</a>
	{/if}
</div>

<Drawer
	placement="right"
	transitionType="fly"
	transitionParams={transitionParamsRight}
	bind:hidden
	width="w-1/2 h-screen"
	bgOpacity="bg-opacity-50 backdrop-blur-sm"
	rightOffset="end-0"
	id="sidebar6"
	divClass="overflow-y-auto z-50 py-4 px-2 bg-gray-800 text-white flex flex-col flex flex-col justify-between"
>
	<div class="flex w-full justify-between items-center">
		<h5
			id="drawer-label"
			class="inline-flex items-center mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400"
		>
			{data.session ? data.session.user.email : ''}
		</h5>

		<button on:click={() => (hidden = true)}>
			<Icon icon="mdi:close" class="text-2xl -mt-5" />
		</button>
	</div>
	<div class="w-full flex flex-col items-center">
		<div class="flex flex-col gap-1">
			<a
				href={'#'}
				class="flex max-w-min bg-transparent p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white gap-2 duration-300"
			>
				<Icon icon="mdi:help-circle" class="text-2xl" />
				<span class="opacity-100 delay-75 duration-300 pl-1">
					Help
				</span>
			</a>

			<a
				href={'#'}
				class="flex max-w-min bg-transparent p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white gap-2 duration-300"
			>
				<Icon icon="mdi:cog" class="text-2xl" />
				<span class="opacity-100 delay-75 duration-300 pl-1"
					>Settings
				</span>
			</a>
		</div>
		<hr class="flex border-t border-gray-700 w-full mt-4" />
		<div class="w-full flex mt-5">
			{#if data.session}
				<a
					href="/logout"
					class="bg-transparent p-1 text-rose-400 rounded hover:bg-rose-400 hover:text-white flex w-full justify-center items-center gap-2 duration-300"
				>
					<Icon icon="mdi:logout" class="text-2xl" />
					<span class="pl-1">Logout</span>
				</a>
			{:else}
				<a
					href="/login"
					class="bg-transparent p-1 text-sky-400 rounded hover:bg-sky-400 hover:text-white flex w-full justify-center items-center gap-2 duration-300"
				>
					<Icon icon="mdi:user" class="text-2xl" />
					<span class="pl-1">Login</span>
				</a>
			{/if}
		</div>
	</div>
</Drawer>
