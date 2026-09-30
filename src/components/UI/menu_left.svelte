<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import BottomNavigation from './bottom_navigation.svelte';

	export let data;

	const main_items = [
		{ url: '/shows',    icon: 'mdi:tv-box',                        label: 'My Shows' },
		{ url: '/calendar', icon: 'mdi:calendar',                      label: 'Calendar' },
		{ url: '/hot',      icon: 'mdi:fire',                          label: 'Upcoming' },
		{ url: '/trending', icon: 'mdi:format-list-bulleted-triangle', label: 'Trending' },
	];

	const discover_items = [
		{ url: '/movies', icon: 'mdi:movie-roll', label: 'Movies', dot: true },
		{ url: '/search', icon: 'mdi:search',     label: 'Search' },
	];

	const bottom_items = [
		{ url: '#', icon: 'mdi:help-circle', label: 'Help' },
		{ url: '#', icon: 'mdi:cog',         label: 'Settings' },
	];

	// Shared class tokens — keeps every item visually identical
	const itemBase   = 'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200';
	const itemIdle   = 'text-zinc-400 hover:bg-white/5 hover:text-white';
	const itemActive = 'bg-white/10 text-white';
	const labelClass = 'whitespace-nowrap opacity-0 transition-opacity duration-200 delay-100 group-hover:opacity-100';

	$: pathname = $page.url.pathname;
	$: isActive = (url) => pathname === url || pathname.startsWith(url + '/');
</script>

<!-- Sidebar (desktop) -->
<aside
	class="group fixed inset-y-0 left-0 z-50 hidden w-16 flex-col overflow-hidden
	       border-r border-zinc-800 bg-zinc-950 text-zinc-300
	       transition-[width] duration-300 ease-out
	       hover:w-64 hover:shadow-2xl hover:shadow-black/60
	       sm:flex"
>
	<!-- Logo -->
	<a href="/" class="flex h-16 shrink-0 items-center gap-3 px-4">
		<img src="/favicon.png" alt="Showly" class="h-8 w-8 shrink-0 rounded-md" />
		<span
			class="whitespace-nowrap text-lg font-bold tracking-tight text-white
			       opacity-0 transition-opacity duration-200 delay-100
			       group-hover:opacity-100"
		>
			Showly
		</span>
	</a>

	<div class="mx-4 h-px shrink-0 bg-zinc-800/80"></div>

	<!-- Main nav -->
	<nav class="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3">
		{#each main_items as item}
			{@const active = isActive(item.url)}
			<a href={item.url} class="{itemBase} {active ? itemActive : itemIdle}">
				{#if active}
					<span class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-400"></span>
				{/if}
				<Icon icon={item.icon} class="h-6 w-6 shrink-0" />
				<span class={labelClass}>{item.label}</span>
			</a>
		{/each}

		<div class="my-2 h-px bg-zinc-800/80"></div>

		{#each discover_items as item}
			{@const active = isActive(item.url)}
			<a href={item.url} class="{itemBase} {active ? itemActive : itemIdle}">
				{#if active}
					<span class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-400"></span>
				{/if}
				<div class="relative shrink-0">
					<Icon icon={item.icon} class="h-6 w-6" />
					{#if item.dot}
						<span class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-zinc-950"></span>
					{/if}
				</div>
				<span class={labelClass}>{item.label}</span>
			</a>
		{/each}
	</nav>

	<!-- Bottom: help / settings / user -->
	<div class="flex flex-col gap-1 px-2 pb-3">
		<div class="mx-2 mb-2 h-px bg-zinc-800/80"></div>

		{#each bottom_items as item}
			<a href={item.url} class="{itemBase} {itemIdle}">
				<Icon icon={item.icon} class="h-6 w-6 shrink-0" />
				<span class={labelClass}>{item.label}</span>
			</a>
		{/each}

		<div class="mx-2 my-2 h-px bg-zinc-800/80"></div>

		{#if data.session}
			<a href="/profile" class="{itemBase} {itemIdle}">
				<img
					src={data.session.user.user_metadata.avatar_url}
					alt="User Avatar"
					class="h-6 w-6 shrink-0 rounded-md object-cover ring-1 ring-white/10"
				/>
				<span class="{labelClass} w-36 truncate text-xs text-zinc-400">
					{data.session.user.email}
				</span>
			</a>

			<a
				href="/logout"
				class="{itemBase} text-rose-400/90 hover:bg-rose-500/10 hover:text-rose-300"
			>
				<Icon icon="mdi:logout" class="h-6 w-6 shrink-0" />
				<span class={labelClass}>Logout</span>
			</a>
		{:else}
			<a href="/login" class="{itemBase} text-sky-400 hover:bg-sky-500/10 hover:text-sky-300">
				<Icon icon="mdi:account-circle-outline" class="h-6 w-6 shrink-0" />
				<span class={labelClass}>Log In</span>
			</a>
		{/if}
	</div>
</aside>

<!-- Mobile nav -->
<BottomNavigation items={main_items} />