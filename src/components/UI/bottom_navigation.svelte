<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	export let data;
	export let admin_menu;

	//console.log($page);
	// console.log($page, admin_menu);
</script>

<div class="flex sm:hidden fixed w-screen bottom-3 px-5 justify-center z-50">
	<div
		class="w-full flex justify-evenly border-0 rounded-xl items-center px-2 bg-gray-300 text-gray-700"
	>
		{#each admin_menu as s, i}
			{@const is_active = $page.url.pathname === s.url}
			{#if i === 2}
				<a
					href={'/'}
					class="p-1 rounded-lg duration-300 relative flex w-12"
				>
					<img
						src="/favicon.png"
						alt="Admin Logo"
						class="opacity-100 group-hover:opacity-0 duration-300 w-12 aspect-square rounded absolute -top-5"
					/>
				</a>
			{/if}

			<div
				class="border-t-4 border-t-transparent flex duration-300"
				class:active={is_active}
			>
				<a href={s.url} class="p-1 rounded-lg duration-300">
					<Icon icon={s.icon} class="text-3xl" />
				</a>
			</div>
		{/each}
	</div>
</div>

<style type="postcss">
	.active {
		@apply border-t-red-500;
	}
</style>
