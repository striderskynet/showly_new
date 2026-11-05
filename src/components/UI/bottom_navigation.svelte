<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	export let items = [];

	$: pathname = $page.url.pathname;
	$: isActive = (url) => pathname === url || pathname.startsWith(url + '/');
</script>

<!-- Wrapper centra la pastilla; pointer-events trick para no bloquear contenido -->
<div
	class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:hidden"
>
	<nav
		class="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto
		       rounded-full border border-zinc-800/60 bg-zinc-900/80 p-1.5
		       shadow-2xl shadow-black/60 backdrop-blur-xl
		       [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
		aria-label="Mobile navigation"
	>
		{#each items as item}
			{@const active = isActive(item.url)}
			<a
				href={item.url}
				aria-current={active ? 'page' : undefined}
				class="flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2
				       text-sm font-medium transition-all duration-300
				       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60
				       {active
					? 'bg-sky-500/15 text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
					: 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}"
			>
				<Icon
					icon={item.icon}
					class="h-5 w-5 shrink-0 {active
						? 'drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]'
						: ''}"
				/>
				{#if active}
					<span class="text-xs font-semibold">{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>
</div>
