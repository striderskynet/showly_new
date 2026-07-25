<script>
	import { onMount } from 'svelte';
	// import inventory from './inventory_april_3.json';
	import inventory from './inventario_july_25.json';

	let searchTerm = '';
	let debouncedSearch = '';
	let selectedFamilies = ['Todas'];
	let isFiltersVisible = true;
	let cart = [];
	let isCartOpen = false;
	let isInfoOpen = false;
	let itemsToShow = 50;
	let timer;

	let isLoaded = false;

	onMount(() => {
		const savedCart = localStorage.getItem('cart_storage');
		if (savedCart) {
			try {
				cart = JSON.parse(savedCart);
			} catch (e) {
				console.error('Error cargando carrito', e);
				cart = [];
			}
		}
		isLoaded = true;
	});

	$: if (isLoaded) {
		localStorage.setItem('cart_storage', JSON.stringify(cart));
	}

	$: families = [
		...new Set(
			inventory
				.map((item) => item.family)
				.filter((f) => f && f.trim() !== ''),
		),
	].sort();

	$: {
		clearTimeout(timer);
		timer = setTimeout(() => {
			debouncedSearch = searchTerm;
			itemsToShow = 50;
		}, 1000);
	}

	function normalizeText(text) {
		return (
			text
				?.toString()
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '') || ''
		);
	}

	function toggleFamily(family) {
		if (family === 'Todas') {
			selectedFamilies = ['Todas'];
		} else {
			let newSelection = selectedFamilies.filter((f) => f !== 'Todas');
			if (newSelection.includes(family)) {
				newSelection = newSelection.filter((f) => f !== family);
			} else {
				newSelection = [...newSelection, family];
			}
			selectedFamilies =
				newSelection.length === 0 ? ['Todas'] : newSelection;
		}
		itemsToShow = 50;
	}

	$: filteredResults = inventory.filter((item) => {
		const matchesFamily =
			selectedFamilies.includes('Todas') ||
			selectedFamilies.includes(item.family);
		if (!matchesFamily) return false;

		const query = debouncedSearch.trim();
		if (query.length < 3) return true;

		const keywords = normalizeText(query).split(/\s+/);
		const itemContent = normalizeText(
			`${item?.code} ${item?.family} ${item?.description}`,
		);
		return keywords.every((word) => itemContent.includes(word));
	});

	$: displayItems = filteredResults.slice(0, itemsToShow);

	function handleScroll() {
		const { scrollHeight, scrollTop, clientHeight } =
			document.documentElement;
		if (scrollTop + clientHeight >= scrollHeight - 200) {
			if (itemsToShow < filteredResults.length) itemsToShow += 40;
		}
	}

	function addToCart(item) {
		const index = cart.findIndex((i) => i.code === item.code);
		if (index !== -1) {
			cart[index].quantity += 1;
			cart = [...cart];
		} else {
			cart = [...cart, { ...item, quantity: 1 }];
		}
	}

	function removeFromCart(code) {
		cart = cart.filter((i) => i.code !== code);
	}

	function formatCurrency(value, symbol) {
		return `${symbol}${value?.toFixed(2)}`;
	}
</script>

<svelte:window on:scroll={handleScroll} />

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</svelte:head>

<div class="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
	<!-- BOTONES FLOTANTES -->
	<button
		class="fixed z-50 flex items-center justify-center p-4 text-white transition-all transform bg-blue-600 rounded-full shadow-2xl bottom-3 left-6 hover:bg-blue-500 hover:scale-110 lg:bottom-auto lg:top-6"
		on:click={() => (isInfoOpen = !isInfoOpen)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="12" cy="12" r="10" /><line
				x1="12"
				y1="16"
				x2="12"
				y2="12"
			/><line x1="12" y1="8" x2="12.01" y2="8" /></svg
		>
	</button>

	<button
		class="fixed z-50 flex items-center justify-center p-4 text-white transition-all transform bg-orange-600 rounded-full shadow-2xl bottom-3 right-6 hover:bg-orange-500 hover:scale-110 lg:bottom-auto lg:top-6"
		on:click={() => (isCartOpen = !isCartOpen)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="8" cy="21" r="1" /><circle
				cx="19"
				cy="21"
				r="1"
			/><path
				d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
			/></svg
		>
		{#if cart.length > 0}
			<span
				class="absolute px-2 py-1 text-xs font-bold text-orange-600 bg-white border-2 border-orange-600 rounded-full -top-1 -right-1"
			>
				{cart.reduce((acc, i) => acc + i.quantity, 0)}
			</span>
		{/if}
	</button>

	{#if isCartOpen || isInfoOpen}
		<div
			class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
			on:click={() => {
				isCartOpen = false;
				isInfoOpen = false;
			}}
		></div>
	{/if}

	<!-- DRAWER INFO -->
	<aside
		class="fixed top-0 left-0 h-full w-full max-w-md bg-[#1e293b] z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform {isInfoOpen
			? 'translate-x-0'
			: '-translate-x-full'} border-r border-slate-700"
	>
		<div class="flex flex-col h-full">
			<div
				class="p-6 border-b border-slate-700 flex justify-between items-center bg-[#161e2e]"
			>
				<h2 class="flex items-center gap-2 text-xl font-bold">
					Información
				</h2>
				<button
					class="text-2xl text-slate-400 hover:text-white"
					on:click={() => (isInfoOpen = false)}>&times;</button
				>
			</div>
			<div class="flex-1 p-6 space-y-6 overflow-y-auto">
				<div>
					<h3
						class="mb-1 text-xs font-bold tracking-widest text-blue-400 uppercase"
					>
						Tienda
					</h3>
					<p class="text-lg font-bold">[Nombre]</p>
				</div>
				<div>
					<h3
						class="mb-1 text-xs font-bold tracking-widest text-blue-400 uppercase"
					>
						Ubicación
					</h3>
					<p class="text-sm text-slate-300">[Dirección]</p>
				</div>
			</div>
		</div>
	</aside>

	<!-- DRAWER CARRITO -->
	<aside
		class="fixed top-0 right-0 h-full w-full max-w-md bg-[#1e293b] z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform {isCartOpen
			? 'translate-x-0'
			: 'translate-x-full'} border-l border-slate-700"
	>
		<div class="flex flex-col h-full">
			<div
				class="p-6 border-b border-slate-700 flex justify-between items-center bg-[#161e2e]"
			>
				<h2 class="flex items-center gap-2 text-xl font-bold">
					🛒 Carrito
				</h2>
				<button
					class="text-2xl text-slate-400 hover:text-white"
					on:click={() => (isCartOpen = false)}>&times;</button
				>
			</div>
			<div class="flex-1 p-4 space-y-4 overflow-y-auto">
				{#if cart.length === 0}
					<div class="py-20 text-center opacity-40"><p>Vacío</p></div>
				{:else}
					{#each cart as item}
						<div
							class="flex gap-4 bg-[#0f172a] p-3 rounded-xl border border-slate-700 items-center"
						>
							<img
								src="https://www.truper.com/admin/images/ch/{item.code}.jpg"
								alt=""
								class="object-contain p-1 bg-white rounded-lg w-14 h-14"
							/>
							<div class="flex-1 min-w-0">
								<h4
									class="text-xs font-bold text-orange-400 truncate"
								>
									{item.code}
								</h4>
								<p
									class="text-[11px] text-slate-400 line-clamp-2 leading-tight"
								>
									{item.description}
								</p>
								<div
									class="flex items-center justify-between mt-1"
								>
									<span
										class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300"
										>Cant: {item.quantity}</span
									>
									<span
										class="text-xs font-bold text-green-400"
										>{formatCurrency(item.usd, '$')}</span
									>
								</div>
							</div>
							<button
								on:click={() => removeFromCart(item.code)}
								class="p-2 text-slate-500 hover:text-red-500"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><path
										d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
									/></svg
								>
							</button>
						</div>
					{/each}
				{/if}
			</div>
			<div class="p-6 border-t border-slate-700 bg-[#161e2e]">
				<div class="flex justify-between mb-4 text-lg font-bold">
					<span>Total:</span>
					<span class="text-green-400"
						>{formatCurrency(
							cart.reduce(
								(sum, i) => sum + i.usd * i.quantity,
								0,
							),
							'$',
						)}</span
					>
				</div>
				<button
					class="w-full py-3 text-sm font-bold tracking-widest uppercase transition-colors bg-orange-600 hover:bg-orange-500 rounded-xl"
					>Finalizar</button
				>
			</div>
		</div>
	</aside>

	<main class="px-4 py-8 mx-auto max-w-7xl">
		<header
			class="sticky z-40 mb-8 top-0 py-2 border-b border-slate-700 bg-[#0f172a]/95 backdrop-blur"
		>
			<div
				class="flex flex-col items-center max-w-4xl gap-4 mx-auto md:flex-row"
			>
				<div class="relative flex-1 w-full">
					<input
						type="text"
						placeholder="Buscar productos..."
						class="w-full bg-[#1e293b] border border-slate-700 focus:border-orange-500 rounded-lg py-2 px-6 outline-none transition-all text-sm"
						bind:value={searchTerm}
					/>
					{#if searchTerm !== debouncedSearch}
						<div class="absolute -translate-y-1/2 right-4 top-1/2">
							<div
								class="w-4 h-4 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"
							></div>
						</div>
					{/if}
				</div>

				<button
					on:click={() => (isFiltersVisible = !isFiltersVisible)}
					class="px-3 py-1.5 text-[10px] font-bold border rounded-md bg-slate-800 hover:bg-slate-700 border-slate-700 uppercase"
				>
					{isFiltersVisible ? 'Cerrar Familias' : 'Filtros'}
				</button>
			</div>

			{#if isFiltersVisible}
				<div
					class="flex justify-start gap-1.5 pb-2 mt-4 overflow-x-auto no-scrollbar md:justify-center flex-nowrap md:flex-wrap"
				>
					<button
						on:click={() => toggleFamily('Todas')}
						class="px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all {selectedFamilies.includes(
							'Todas',
						)
							? 'bg-orange-600 border-orange-500 text-white'
							: 'bg-slate-800 border-slate-700 text-slate-400'}"
					>
						TODAS
					</button>
					{#each families as family}
						<button
							on:click={() => toggleFamily(family)}
							class="px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all whitespace-nowrap {selectedFamilies.includes(
								family,
							)
								? 'bg-orange-600 border-orange-500 text-white'
								: 'bg-slate-800 border-slate-700 text-slate-400'}"
						>
							{family}
						</button>
					{/each}
				</div>
			{/if}

			<div
				class="mt-2 text-[10px] text-center text-slate-500 uppercase font-bold tracking-widest"
			>
				{filteredResults.length} resultados
			</div>
		</header>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each displayItems as item (item.code)}
				<div
					class="group bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden flex flex-col hover:border-orange-500/50 transition-all"
				>
					<div
						class="relative flex items-center justify-center h-48 p-6 bg-white"
					>
						<img
							src="https://www.truper.com/admin/images/ch/{item.code}.jpg"
							alt={item.description}
							class="object-contain max-w-full max-h-full transition-transform group-hover:scale-105"
						/>
						<div
							class="absolute top-2 left-2 bg-[#0f172a] px-2 py-1 rounded text-[10px] font-bold text-slate-400 uppercase"
						>
							{item.family}
						</div>
					</div>

					<div class="flex flex-col flex-1 p-5">
						<div
							class="flex items-start justify-between mb-2 -mt-2"
						>
							<div class="flex items-center gap-1 -mt-1">
								<span
									class="text-[9px] text-slate-500 uppercase font-bold"
									>Code:</span
								>
								<span
									class="font-mono text-base font-bold text-orange-500"
									>{item.code}</span
								>
							</div>
							<div class="flex items-center gap-1">
								<span
									class="text-[9px] text-slate-500 uppercase font-bold"
									>Stock / Unidad:</span
								>
								<span
									class="text-xs font-bold {item.amount > 0
										? 'text-slate-300'
										: 'text-red-500'}"
								>
									{item.amount} / {item.UM}
								</span>
							</div>
						</div>

						<h3
							class="h-16 mb-4 text-sm italic font-medium leading-tight"
						>
							{item.description}
						</h3>

						<div class="mt-auto space-y-3">
							<div class="flex gap-2">
								<div
									class="flex-1 p-2 text-center border rounded-lg bg-green-900/20 border-green-700/30"
								>
									<div
										class="text-[9px] text-green-500 uppercase font-bold"
									>
										USD
									</div>
									<div class="font-bold text-green-400">
										{formatCurrency(item.usd, '$')}
									</div>
								</div>
								<div
									class="flex-1 p-2 text-center border rounded-lg bg-blue-900/20 border-blue-700/30"
								>
									<div
										class="text-[9px] text-blue-500 uppercase font-bold"
									>
										EUR
									</div>
									<div class="font-bold text-blue-300">
										{formatCurrency(item.euro, '€')}
									</div>
								</div>
							</div>

							<button
								on:click={() => addToCart(item)}
								class="flex items-center justify-center w-full gap-2 py-2.5 font-bold text-white transition-all rounded-lg bg-slate-700 hover:bg-orange-600 disabled:opacity-30 disabled:hover:bg-slate-700"
								disabled={item.amount <= 0}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									><line
										x1="12"
										y1="5"
										x2="12"
										y2="19"
									/><line
										x1="5"
										y1="12"
										x2="19"
										y2="12"
									/></svg
								>
								{item.amount > 0 ? 'Añadir' : 'Sin Stock'}
							</button>

							<a
								href={`https://www.truper.com/ficha_tecnica/controllers/index.php?codigo=${item.code}&origen=nal`}
								target="_blank"
								class="flex items-center justify-center w-full gap-2 py-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors rounded"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									><path
										d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
									/><polyline points="14 2 14 8 20 8" /><line
										x1="16"
										y1="13"
										x2="8"
										y2="13"
									/><line
										x1="16"
										y1="17"
										x2="8"
										y2="17"
									/><polyline points="10 9 9 9 8 9" /></svg
								>
								Ver Ficha Técnica (PDF)
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if itemsToShow < filteredResults.length}
			<div
				class="py-12 text-xs font-bold tracking-widest text-center uppercase text-slate-500 animate-pulse"
			>
				Cargando...
			</div>
		{/if}
	</main>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
