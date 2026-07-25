<script>
	import { onMount } from 'svelte';
	import inventory from './inventario_july_25.json';

	let searchTerm = '';
	let debouncedSearch = '';
	let selectedFamilies = ['Todas'];
	let isFiltersVisible = false;
	let cart = [];
	let isCartOpen = false;
	let isInfoOpen = false;
	let itemsToShow = 50;
	let timer = null;
	let isLoaded = false;

	onMount(() => {
		const savedCart = localStorage.getItem('cart_storage');
		if (savedCart) {
			try {
				cart = JSON.parse(savedCart);
			} catch (error) {
				console.error('Error loading cart', error);
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
				.filter((family) => family && family.trim() !== ''),
		),
	].sort();

	$: {
		const term = searchTerm;
		clearTimeout(timer);
		timer = setTimeout(() => {
			debouncedSearch = term;
			itemsToShow = 50;
		}, 1000);
	}

	/**
	 * Normalizes input string by converting to lowercase and removing accent marks.
	 * @param {string} text - The input string to normalize.
	 * @returns {string} The normalized string.
	 */
	const normalizeText = (text) => {
		return (
			text
				?.toString()
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '') || ''
		);
	};

	/**
	 * Toggles selection state for product family filters.
	 * @param {string} family - The category/family name to toggle.
	 */
	const toggleFamily = (family) => {
		if (family === 'Todas') {
			selectedFamilies = ['Todas'];
		} else {
			let newSelection = selectedFamilies.filter(
				(item) => item !== 'Todas',
			);
			if (newSelection.includes(family)) {
				newSelection = newSelection.filter((item) => item !== family);
			} else {
				newSelection = [...newSelection, family];
			}
			selectedFamilies =
				newSelection.length === 0 ? ['Todas'] : newSelection;
		}
		itemsToShow = 50;
	};

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

	$: cartTotal = cart.reduce(
		(sum, item) => sum + item.usd * item.quantity,
		0,
	);

	$: totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

	/**
	 * Handles infinite scrolling to load more products dynamically.
	 */
	const handleScroll = () => {
		const { scrollHeight, scrollTop, clientHeight } =
			document.documentElement;
		if (scrollTop + clientHeight >= scrollHeight - 200) {
			if (itemsToShow < filteredResults.length) {
				itemsToShow += 40;
			}
		}
	};

	/**
	 * Adds an item to the cart or increments its quantity if it already exists.
	 * @param {Object} item - The product item to add.
	 */
	const addToCart = (item) => {
		const index = cart.findIndex((cartItem) => cartItem.code === item.code);
		if (index !== -1) {
			cart[index].quantity += 1;
			cart = [...cart];
		} else {
			cart = [...cart, { ...item, quantity: 1 }];
		}
	};

	/**
	 * Removes an item from the cart by its product code.
	 * @param {string} code - The product code to remove.
	 */
	const removeFromCart = (code) => {
		cart = cart.filter((item) => item.code !== code);
	};

	/**
	 * Formats a numeric value into currency format with a specific symbol.
	 * @param {number} value - The numeric value to format.
	 * @param {string} symbol - The currency symbol to prepend.
	 * @returns {string} The formatted currency string.
	 */
	const formatCurrency = (value, symbol) => {
		return `${symbol}${value?.toFixed(2)}`;
	};
</script>

<svelte:window on:scroll={handleScroll} />

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</svelte:head>

<div class="min-h-screen bg-[#0f172a] font-sans text-slate-200">
	<!-- FLOATING BUTTONS -->
	<button
		class="fixed bottom-3 left-6 z-50 flex items-center justify-center transform rounded-full bg-blue-600 p-4 text-white shadow-2xl transition-all hover:scale-110 hover:bg-blue-500 lg:bottom-auto lg:top-6"
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
		class="fixed bottom-3 right-6 z-50 flex items-center justify-center transform rounded-full bg-orange-600 p-4 text-white shadow-2xl transition-all hover:scale-110 hover:bg-orange-500 lg:bottom-auto lg:top-6"
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
				class="absolute -right-1 -top-1 rounded-full border-2 border-orange-600 bg-white px-2 py-1 text-xs font-bold text-orange-600"
			>
				{totalCartItems}
			</span>
		{/if}
	</button>

	{#if isCartOpen || isInfoOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
			on:click={() => {
				isCartOpen = false;
				isInfoOpen = false;
			}}
		></div>
	{/if}

	<!-- INFO DRAWER -->
	<aside
		class="fixed left-0 top-0 z-[70] h-full w-full max-w-md transform border-r border-slate-700 bg-[#1e293b] shadow-2xl transition-transform duration-300 ease-in-out {isInfoOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<div
				class="flex items-center justify-between border-b border-slate-700 bg-[#161e2e] p-6"
			>
				<h2 class="flex items-center gap-2 text-xl font-bold">
					Información
				</h2>
				<button
					class="text-2xl text-slate-400 hover:text-white"
					on:click={() => (isInfoOpen = false)}>&times;</button
				>
			</div>
			<div class="flex-1 space-y-6 overflow-y-auto p-6">
				<div>
					<h3
						class="mb-1 text-xs font-bold uppercase tracking-widest text-blue-400"
					>
						Tienda
					</h3>
					<p class="text-lg font-bold">[Nombre]</p>
				</div>
				<div>
					<h3
						class="mb-1 text-xs font-bold uppercase tracking-widest text-blue-400"
					>
						Ubicación
					</h3>
					<p class="text-sm text-slate-300">[Dirección]</p>
				</div>
			</div>
		</div>
	</aside>

	<!-- CART DRAWER -->
	<aside
		class="fixed right-0 top-0 z-[70] h-full w-full max-w-md transform border-l border-slate-700 bg-[#1e293b] shadow-2xl transition-transform duration-300 ease-in-out {isCartOpen
			? 'translate-x-0'
			: 'translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<div
				class="flex items-center justify-between border-b border-slate-700 bg-[#161e2e] p-6"
			>
				<h2 class="flex items-center gap-2 text-xl font-bold">
					Carrito
				</h2>
				<button
					class="text-2xl text-slate-400 hover:text-white"
					on:click={() => (isCartOpen = false)}>&times;</button
				>
			</div>
			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				{#if cart.length === 0}
					<div class="py-20 text-center opacity-40"><p>Vacío</p></div>
				{:else}
					{#each cart as item, index (`${item.code}-${index}`)}
						<div
							class="flex items-center gap-4 rounded-xl border border-slate-700 bg-[#0f172a] p-3"
						>
							<img
								src="https://www.truper.com/admin/images/ch/{item.code}.jpg"
								alt=""
								class="h-14 w-14 rounded-lg bg-white p-1 object-contain"
							/>
							<div class="min-w-0 flex-1">
								<h4
									class="truncate text-xs font-bold text-orange-400"
								>
									{item.code}
								</h4>
								<p
									class="line-clamp-2 text-[11px] leading-tight text-slate-400"
								>
									{item.description}
								</p>
								<div
									class="mt-1 flex items-center justify-between"
								>
									<span
										class="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
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
			<div class="border-t border-slate-700 bg-[#161e2e] p-6">
				<div class="mb-4 flex justify-between text-lg font-bold">
					<span>Total:</span>
					<span class="text-green-400"
						>{formatCurrency(cartTotal, '$')}</span
					>
				</div>
				<button
					class="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-orange-500"
					>Finalizar</button
				>
			</div>
		</div>
	</aside>

	<main class="mx-auto max-w-7xl px-4 py-8">
		<header
			class="sticky top-0 z-40 mb-8 border-b border-slate-700 bg-[#0f172a]/95 py-2 backdrop-blur"
		>
			<div
				class="mx-auto flex max-w-4xl flex-col items-center gap-4 md:flex-row"
			>
				<div class="relative w-full flex-1">
					<input
						type="text"
						placeholder="Buscar productos..."
						class="w-full rounded-lg border border-slate-700 bg-[#1e293b] px-6 py-2 text-sm outline-none transition-all focus:border-orange-500"
						bind:value={searchTerm}
					/>
					{#if searchTerm !== debouncedSearch}
						<div class="absolute right-4 top-1/2 -translate-y-1/2">
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
							></div>
						</div>
					{/if}
				</div>

				<button
					on:click={() => (isFiltersVisible = !isFiltersVisible)}
					class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-slate-700"
				>
					{isFiltersVisible ? 'Cerrar Familias' : 'Filtros'}
				</button>
			</div>

			{#if isFiltersVisible}
				<div
					class="no-scrollbar mt-4 flex flex-nowrap justify-start gap-1.5 overflow-x-auto pb-2 md:flex-wrap md:justify-center"
				>
					<button
						on:click={() => toggleFamily('Todas')}
						class="rounded-md border px-2.5 py-1 text-[10px] font-bold transition-all {selectedFamilies.includes(
							'Todas',
						)
							? 'border-orange-500 bg-orange-600 text-white'
							: 'border-slate-700 bg-slate-800 text-slate-400'}"
					>
						TODAS
					</button>
					{#each families as family}
						<button
							on:click={() => toggleFamily(family)}
							class="whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] font-bold transition-all {selectedFamilies.includes(
								family,
							)
								? 'border-orange-500 bg-orange-600 text-white'
								: 'border-slate-700 bg-slate-800 text-slate-400'}"
						>
							{family}
						</button>
					{/each}
				</div>
			{/if}

			<div
				class="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500"
			>
				{filteredResults.length} resultados
			</div>
		</header>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each displayItems as item, index (`${item?.code}-${index}`)}
				<div
					class="group flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#1e293b] transition-all hover:border-orange-500/50"
				>
					<div
						class="relative flex h-48 items-center justify-center bg-white p-6"
					>
						<img
							src="https://www.truper.com/admin/images/ch/{item.code}.jpg"
							alt={item.description}
							class="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
						/>
						<div
							class="absolute left-2 top-2 rounded bg-[#0f172a] px-2 py-1 text-[10px] font-bold uppercase text-slate-400"
						>
							{item.family}
						</div>
					</div>

					<div class="flex flex-1 flex-col p-5">
						<div
							class="-mt-2 mb-2 flex items-start justify-between"
						>
							<div class="-mt-1 flex items-center gap-1">
								<span
									class="text-[9px] font-bold uppercase text-slate-500"
									>Code:</span
								>
								<span
									class="font-mono text-base font-bold text-orange-500"
									>{item.code}</span
								>
							</div>
							<div class="flex items-center gap-1">
								<span
									class="text-[9px] font-bold uppercase text-slate-500"
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
							class="mb-4 h-16 text-sm font-medium leading-tight italic"
						>
							{item.description}
						</h3>

						<div class="mt-auto space-y-3">
							<div class="flex gap-2">
								<div
									class="flex-1 rounded-lg border border-green-700/30 bg-green-900/20 p-2 text-center"
								>
									<div
										class="text-[9px] font-bold uppercase text-green-500"
									>
										USD
									</div>
									<div class="font-bold text-green-400">
										{formatCurrency(item.usd, '$')}
									</div>
								</div>
								<div
									class="flex-1 rounded-lg border border-blue-700/30 bg-blue-900/20 p-2 text-center"
								>
									<div
										class="text-[9px] font-bold uppercase text-blue-500"
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
								class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 py-2.5 font-bold text-white transition-all hover:bg-orange-600 disabled:opacity-30 disabled:hover:bg-slate-700"
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
								class="flex w-full items-center justify-center gap-2 rounded py-1 text-[11px] text-slate-400 transition-colors hover:text-red-400"
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
				class="animate-pulse py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-500"
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
