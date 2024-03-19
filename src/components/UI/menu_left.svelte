<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import BottomNavigation from './bottom_navigation.svelte';

	export let data;
	//console.log(data);
	let menu_openned = [];

	let admin_menu = [
		{
			url: '/shows',
			icon: 'mdi:tv-box',
			label: 'My Shows',
			active: true,
		},
		{
			url: '/calendar',
			icon: 'mdi:calendar',
			label: 'Calendar',
			active: true,
		},
		{ url: '/hots', icon: 'mdi:fire', label: 'Upcoming', active: true },
		{
			url: '/trending',
			icon: 'mdi:format-list-bulleted-triangle',
			label: 'Trending',
			active: true,
		},
	];

	//console.log($page);
	// console.log($page, admin_menu);
</script>

<div
	class="hidden sm:flex flex-col justify-between h-screen overflow-y-auto fixed w-16 group hover:w-52 duration-300 items-start bg-gray-900 left-0 top-0 text-gray-200 border-r-2 border-r-gray-800 overflow-hidden z-50"
>
	<section
		class="flex px-2 py-2 w-full justify-center flex-col items-center text-2xl font-bold h-12 mt-2 duration-300"
	>
		<img
			src="/favicon.png"
			alt="Admin Logo"
			class="opacity-100 group-hover:opacity-0 absolute duration-300 w-6 rounded"
		/>
		<div
			class="opacity-0 group-hover:opacity-100 duration-300 flex justify-center flex-col items-center z-50"
		>
			<a href="/">Showly</a>
			<!-- <div class="flex text-[10px] uppercase font-normal -mt-4">
				<img
					src="/favicon.png"
					alt="Admin Logo"
					class="absolute duration-300 w-6 rounded"
				/>
			</div> -->
		</div>
	</section>

	<section
		class="h-full flex flex-col gap-2 mt-2 text-sm w-full items-start px-2"
	>
		<hr class="flex border-t border-gray-700 w-full mb-2" />
		{#each admin_menu as s, i}
			{@const is_active = $page.url.pathname === s.url}
			<section
				class="flex duration-500 transition-all gap-2 flex-col ml-2"
			>
				<!-- {#if is_active}{void (menu_openned[m.label] = true) ||
							''}{/if}
					{#if s.active} -->
				<a
					href={s.active ? s.url : '#'}
					class:active={is_active}
					class="relative bg-transparent p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300"
				>
					<Icon icon={s.icon} class="text-2xl" />
					<span class="hidden group-hover:flex w-32 px-2">
						{s.label}
					</span>
				</a>
				<!-- {/if} -->
			</section>
		{/each}

		<hr class="flex border-t border-gray-700 w-full mb-2" />

		<section class="flex duration-500 transition-all gap-2 flex-col ml-2">
			<a
				href="/search"
				class="relative bg-transparent p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300"
			>
				<Icon icon="mdi:search" class="text-2xl" />
				<span class="hidden group-hover:flex w-32 px-2"> Search </span>
			</a>
		</section>
	</section>
	<section
		class="h-full flex flex-col gap-2 mt-2 text-sm w-full items-start px-2 justify-end ml-2 mb-2"
	>
		<a
			href={'#'}
			class="relative bg-transparent p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300"
		>
			<Icon icon="mdi:help-circle" class="text-2xl" />
			<span class="hidden group-hover:flex w-32 pl-1"> Help </span>
		</a>

		<a
			href={'#'}
			class="relative bg-transparent p-1 text-gray-400 rounded hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300"
		>
			<Icon icon="mdi:cog" class="text-2xl" />
			<span class="hidden group-hover:flex w-32 pl-1">Settings </span>
		</a>

		{#if data.session}
			<a
				href={'#'}
				class="relative bg-transparent p-1 rounded hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300 -ml-1 text-sky-500"
			>
				<img
					src={data.session.user.user_metadata.avatar_url}
					alt="User Avatar"
					class="w-8 aspect-square flex rounded-xl"
				/>

				<span
					class="hidden group-hover:flex text-pretty w-40 truncate px-2 -ml-2"
				>
					{data.session.user.email}
				</span>
			</a>
			<hr class="flex border-t border-gray-700 w-full -ml-2" />
			<a
				href="/logout"
				class="relative bg-transparent p-1 text-rose-400 rounded hover:bg-rose-400 hover:text-white flex items-center gap-2 duration-300"
			>
				<Icon icon="mdi:logout" class="text-2xl" />
				<span class="hidden group-hover:flex w-32 pl-1">Logout</span>
			</a>
		{:else}
			<a
				href="/login"
				class="relative bg-transparent p-1 rounded hover:bg-gray-700 hover:text-white flex items-center gap-2 duration-300 -ml-1 text-sky-500"
			>
				<Icon icon="mdi:user" class="w-8 text-2xl" />

				<span class="hidden group-hover:flex w-32"> Log In </span>
			</a>
		{/if}
	</section>
</div>

<!-- Bottom NaV -->
<BottomNavigation {admin_menu} {data} />

<style type="postcss">
	.active {
		@apply bg-gray-300 text-gray-800;
	}
</style>
