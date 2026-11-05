<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import BottomNavigation from './bottom_navigation.svelte';

	/** @type {{data: any}} */
	let { data } = $props();

	const main_items = [
		{ url: '/shows', icon: 'mdi:tv-box', label: 'My Shows' },
		{ url: '/calendar', icon: 'mdi:calendar', label: 'Calendar' },
		{ url: '/hot', icon: 'mdi:fire', label: 'Upcoming' },
		{
			url: '/trending',
			icon: 'mdi:format-list-bulleted-triangle',
			label: 'Trending',
		},
	];

	const discover_items = [
		{ url: '/movies', icon: 'mdi:movie-roll', label: 'Movies', dot: true },
		{ url: '/search', icon: 'mdi:search', label: 'Search' },
	];

	const bottom_items = [
		{ url: '#', icon: 'mdi:help-circle', label: 'Help' },
		{ url: '#', icon: 'mdi:cog', label: 'Settings' },
	];

	// ---------- Design tokens ----------
	const itemBase =
		'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ' +
		'transition-colors duration-200 focus-visible:outline-none ' +
		'focus-visible:ring-2 focus-visible:ring-sky-400/60';

	const itemIdle = 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100';

	const itemActive =
		'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent ' +
		'text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';

	const iconGlow = 'drop-shadow-[0_0_8px_rgba(56,189,248,0.55)]';

	const labelClass =
		'whitespace-nowrap opacity-0 transition-opacity duration-200 delay-75 ' +
		'group-hover:opacity-100 group-focus-within:opacity-100';

	const activeBarClass =
		'pointer-events-none absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 ' +
		'rounded-r-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]';

	const dotClass =
		'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 ' +
		'ring-2 ring-zinc-950';

	let pathname = $derived($page.url.pathname);
	let isActive = $derived((url) => pathname === url || pathname.startsWith(url + '/'));
</script>

<!-- ============================ SIDEBAR ============================ -->
<aside
	class="group fixed inset-y-0 left-0 z-50 hidden w-20 flex-col overflow-hidden
	       border-r border-zinc-800/60 bg-zinc-950 text-zinc-300
	       transition-[width] duration-300 ease-out
	       hover:w-64 focus-within:w-64
	       hover:shadow-2xl hover:shadow-black/70
	       before:pointer-events-none before:absolute before:inset-x-0 before:top-0
	       before:h-48 before:bg-gradient-to-b before:from-sky-500/5 before:to-transparent
	       sm:flex"
	aria-label="Main navigation"
>
	<!-- Logo -->
	<a
		href="/"
		aria-label="Showly home"
		class="flex h-20 shrink-0 items-center gap-3 px-4"
	>
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
			       bg-gradient-to-br from-sky-500/20 to-sky-500/5 ring-1 ring-sky-400/20"
		>
			<img src="/favicon.png" alt="" class="h-6 w-6 rounded-md" />
		</div>
		<span
			class="whitespace-nowrap text-lg font-bold tracking-tight text-white
			       opacity-0 transition-opacity duration-200 delay-75
			       group-hover:opacity-100 group-focus-within:opacity-100"
		>
			Showly
		</span>
	</a>

	<div
		class="mx-3 h-px shrink-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
	></div>

	<!-- Main nav -->
	<nav
		class="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3"
	>
		{#each main_items as item}
			{@const active = isActive(item.url)}
			<a
				href={item.url}
				aria-current={active ? 'page' : undefined}
				class="{itemBase} {active ? itemActive : itemIdle}"
			>
				{#if active}<span class={activeBarClass} aria-hidden="true"
					></span>{/if}
				<Icon
					icon={item.icon}
					class="h-6 w-6 shrink-0 {active ? iconGlow : ''}"
				/>
				<span class="{labelClass} {active ? 'text-sky-300' : ''}"
					>{item.label}</span
				>
			</a>
		{/each}

		<div
			class="mx-2 my-3 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
		></div>

		{#each discover_items as item}
			{@const active = isActive(item.url)}
			<a
				href={item.url}
				aria-current={active ? 'page' : undefined}
				class="{itemBase} {active ? itemActive : itemIdle}"
			>
				{#if active}<span class={activeBarClass} aria-hidden="true"
					></span>{/if}
				<div class="relative shrink-0">
					<Icon
						icon={item.icon}
						class="h-6 w-6 {active ? iconGlow : ''}"
					/>
					{#if item.dot}
						<span class={dotClass} aria-hidden="true"></span>
					{/if}
				</div>
				<span class="{labelClass} {active ? 'text-sky-300' : ''}"
					>{item.label}</span
				>
			</a>
		{/each}
	</nav>

	<!-- Bottom -->
	<div class="flex flex-col gap-1 px-2 pb-3">
		<div
			class="mx-2 mb-2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
		></div>

		{#each bottom_items as item}
			<a href={item.url} class="{itemBase} {itemIdle}">
				<Icon icon={item.icon} class="h-6 w-6 shrink-0" />
				<span class={labelClass}>{item.label}</span>
			</a>
		{/each}

		<div
			class="mx-2 my-2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
		></div>

		{#if data.session}
			<a
				href="/profile"
				aria-label="Your profile"
				class="{itemBase} {itemIdle}"
			>
				<img
					src={data.session.user.user_metadata.avatar_url}
					alt=""
					class="h-7 w-7 shrink-0 rounded-lg object-cover ring-2 ring-white/10"
				/>
				<span
					class="{labelClass} min-w-0 truncate text-xs text-zinc-400"
				>
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
			<a
				href="/login"
				class="{itemBase} text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"
			>
				<Icon
					icon="mdi:account-circle-outline"
					class="h-6 w-6 shrink-0"
				/>
				<span class={labelClass}>Log In</span>
			</a>
		{/if}
	</div>
</aside>

<!-- ============================ MOBILE ============================ -->
<BottomNavigation items={[...main_items, discover_items[1]]} />
