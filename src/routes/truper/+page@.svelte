<script>
	import { onDestroy, onMount } from 'svelte';
	import catalog from './inventario_july_25.json';

	// ─── Constants ──────────────────────────────────────────────────────────
	const PAGE_SIZE = 48;
	const DEBOUNCE_MS = 800;
	const MIN_QUERY_LENGTH = 3;
	const STORAGE_KEY = 'basket.v2';
	const IMAGE_BASE = 'https://www.truper.com/admin/images/ch';
	const DATASHEET_URL =
		'https://www.truper.com/ficha_tecnica/controllers/index.php';
	const ALL_FAMILIES = 'Todas';

	// ─── Family normalization ───────────────────────────────────────────────
	const looksLikeDescription = (text) =>
		/\d/.test(text) ||
		/\b(mm|cm|kg|hp|w|kw|v|a|pulg|pulgadas|lb|oz|ml|l)\b/i.test(text);

	const buildFamilyAlias = (products) => {
		const families = [
			...new Set(
				products.map(({ family }) => family).filter((f) => f && f.trim())
			),
		];
		const alias = new Map(families.map((f) => [f, f]));
		const byLengthDesc = [...families].sort((a, b) => b.length - a.length);

		for (const family of families) {
			for (const candidate of byLengthDesc) {
				if (candidate === family) continue;
				if (candidate.length >= family.length) continue;
				if (family.length - candidate.length < 10) continue;
				if (!family.startsWith(candidate)) continue;

				const boundary = family[candidate.length];
				const suffix = family.slice(candidate.length);

				if (boundary === ' ' && !looksLikeDescription(suffix)) continue;

				alias.set(family, candidate);
				break;
			}
		}
		return alias;
	};

	// ─── Static derivations ─────────────────────────────────────────────────
	const familyAlias = buildFamilyAlias(catalog);

	const products = catalog.map((product) => ({
		...product,
		_family: familyAlias.get(product.family) ?? product.family,
	}));

	const familyOptions = [
		...new Set(products.map(({ _family }) => _family)),
	].sort((a, b) => a.localeCompare(b, 'es'));

	const productByCode = new Map(products.map((p) => [p.code, p]));

	// ─── State ──────────────────────────────────────────────────────────────
	let rawQuery = '';
	let activeQuery = '';
	let activeFamilies = [ALL_FAMILIES];
	let showFilters = false;
	let showInfo = false;
	let showBasket = false;
	let visibleCount = PAGE_SIZE;
	let basket = [];
	let hydrated = false;
	let debounceHandle = null;
	let shareFeedback = '';

	// ─── Pure helpers ───────────────────────────────────────────────────────
	const normalize = (value) =>
		String(value ?? '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

	const formatMoney = (value, symbol = '$') => {
		const amount = Number(value);
		return `${symbol}${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
	};

	const productImage = (code) => `${IMAGE_BASE}/${code}.jpg`;
	const datasheetUrl = (code) => `${DATASHEET_URL}?codigo=${code}&origen=nal`;
	const lineTotal = (line) => line.usd * line.quantity;

	// ─── Derived ────────────────────────────────────────────────────────────
	$: matchedProducts = products.filter((product) => {
		const familyMatches =
			activeFamilies.includes(ALL_FAMILIES) ||
			activeFamilies.includes(product._family);
		if (!familyMatches) return false;

		const query = activeQuery.trim();
		if (query.length < MIN_QUERY_LENGTH) return true;

		const tokens = normalize(query).split(/\s+/);
		const haystack = normalize(
			`${product.code} ${product._family} ${product.description}`
		);
		return tokens.every((token) => haystack.includes(token));
	});

	$: visibleProducts = matchedProducts.slice(0, visibleCount);
	$: hasMore = visibleCount < matchedProducts.length;
	$: isSearching = rawQuery !== activeQuery;
	$: isFiltered = !activeFamilies.includes(ALL_FAMILIES);

	$: basketSubtotal = basket.reduce(
		(sum, line) => sum + line.usd * line.quantity,
		0
	);
	$: basketCount = basket.reduce((sum, line) => sum + line.quantity, 0);

	// ─── Persistence ────────────────────────────────────────────────────────
	const persistBasket = () => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
		} catch (error) {
			console.warn('No se pudo guardar el carrito', error);
		}
	};

	// ─── URL sync ───────────────────────────────────────────────────────────
	/** `?b=CODE:QTY,CODE:QTY` — compacto y legible al compartir. */
	const serializeBasket = (lines) =>
		lines.map((line) => `${line.code}:${line.quantity}`).join(',');

	const parseBasketParam = (value) => {
		if (!value) return [];
		const pairs = [];
		for (const part of value.split(',')) {
			const [code, qtyRaw] = part.split(':');
			const quantity = Number.parseInt(qtyRaw, 10);
			if (code && Number.isFinite(quantity) && quantity > 0) {
				pairs.push({ code, quantity });
			}
		}
		return pairs;
	};

	/** Reconstruye las líneas a partir de {code, quantity} usando el catálogo
	 *  actual (precios/stock frescos) y descarta lo que ya no exista. */
	const rehydrateLines = (lines) =>
		lines.flatMap((line) => {
			if (!line || typeof line.code !== 'string') return [];
			const quantity = Number(line.quantity);
			if (!Number.isFinite(quantity) || quantity <= 0) return [];
			const product = productByCode.get(line.code);
			if (!product || product.amount <= 0) return [];
			return [
				{
					...product,
					quantity: Math.min(quantity, product.amount),
				},
			];
		});

	const buildUrl = (query, families, lines) => {
		const params = new URLSearchParams();
		const q = query.trim();
		if (q) params.set('q', q);
		if (!families.includes(ALL_FAMILIES)) {
			[...families].sort().forEach((f) => params.append('fam', f));
		}
		if (lines.length) params.set('b', serializeBasket(lines));
		const search = params.toString();
		return `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
	};

	/** Escribe el estado en la URL. `push` añade entrada al historial. */
	const syncUrl = (push = false) => {
		if (typeof window === 'undefined') return;
		const url = buildUrl(activeQuery, activeFamilies, basket);
		const current = `${location.pathname}${location.search}${location.hash}`;
		if (url === current) return;

		const state = {
			q: activeQuery,
			fam: activeFamilies,
			b: serializeBasket(basket),
		};
		if (push) history.pushState(state, '', url);
		else history.replaceState(state, '', url);
	};

	/** Lee el estado desde la URL. `lines = null` significa "no hay info". */
	const readUrl = () => {
		const params = new URLSearchParams(location.search);
		const q = params.get('q') ?? '';
		const fam = params.getAll('fam').filter((f) => familyOptions.includes(f));
		const lines = params.has('b')
			? rehydrateLines(parseBasketParam(params.get('b')))
			: null;
		return { q, fam: fam.length ? fam : [ALL_FAMILIES], lines };
	};

	const onPopState = () => {
		const { q, fam, lines } = readUrl();
		clearTimeout(debounceHandle);
		rawQuery = q;
		activeQuery = q;
		activeFamilies = fam;
		if (lines !== null) {
			basket = lines;
			persistBasket();
		}
		visibleCount = PAGE_SIZE;
	};

	// ─── Share ──────────────────────────────────────────────────────────────
	const shareBasket = async () => {
		const url = `${location.origin}${buildUrl(
			activeQuery,
			activeFamilies,
			basket
		)}`;
		try {
			await navigator.clipboard.writeText(url);
			shareFeedback = '¡Enlace copiado!';
		} catch (error) {
			shareFeedback = 'No se pudo copiar';
		}
		setTimeout(() => (shareFeedback = ''), 2000);
	};

	// ─── Basket mutations ───────────────────────────────────────────────────
	const addToBasket = (product) => {
		if (!product || product.amount <= 0) return;

		const existing = basket.find((line) => line.code === product.code);
		if (existing) {
			if (existing.quantity >= product.amount) return;
			basket = basket.map((line) =>
				line.code === product.code
					? { ...line, quantity: line.quantity + 1 }
					: line
			);
		} else {
			basket = [...basket, { ...product, quantity: 1 }];
		}
		persistBasket();
		syncUrl();
	};

	const incrementLine = (line) => {
		if (line.quantity >= line.amount) return;
		basket = basket.map((entry) =>
			entry.code === line.code
				? { ...entry, quantity: entry.quantity + 1 }
				: entry
		);
		persistBasket();
		syncUrl();
	};

	const decrementLine = (code) => {
		basket = basket.flatMap((line) => {
			if (line.code !== code) return [line];
			const next = line.quantity - 1;
			return next > 0 ? [{ ...line, quantity: next }] : [];
		});
		persistBasket();
		syncUrl();
	};

	const removeFromBasket = (code) => {
		basket = basket.filter((line) => line.code !== code);
		persistBasket();
		syncUrl();
	};

	const clearBasket = () => {
		basket = [];
		persistBasket();
		syncUrl();
	};

	// ─── Filters & search ───────────────────────────────────────────────────
	const toggleFamily = (family) => {
		if (family === ALL_FAMILIES) {
			activeFamilies = [ALL_FAMILIES];
		} else {
			const withoutAll = activeFamilies.filter((f) => f !== ALL_FAMILIES);
			const next = withoutAll.includes(family)
				? withoutAll.filter((f) => f !== family)
				: [...withoutAll, family];
			activeFamilies = next.length ? next : [ALL_FAMILIES];
		}
		visibleCount = PAGE_SIZE;
		syncUrl(true);
	};

	const resetAll = () => {
		rawQuery = '';
		activeQuery = '';
		activeFamilies = [ALL_FAMILIES];
		visibleCount = PAGE_SIZE;
		syncUrl(true);
	};

	const onQueryInput = (event) => {
		rawQuery = event.currentTarget.value;
		clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => {
			activeQuery = rawQuery;
			visibleCount = PAGE_SIZE;
			syncUrl();
		}, DEBOUNCE_MS);
	};

	// ─── Window handlers ────────────────────────────────────────────────────
	const onWindowScroll = () => {
		if (!hasMore) return;
		const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
		if (scrollTop + clientHeight >= scrollHeight - 240) {
			visibleCount = Math.min(
				visibleCount + PAGE_SIZE,
				matchedProducts.length
			);
		}
	};

	const closeAll = () => {
		showBasket = false;
		showInfo = false;
		showFilters = false;
	};

	const onWindowKeydown = (event) => {
		if (event.key === 'Escape') closeAll();
	};

	// ─── Lifecycle ──────────────────────────────────────────────────────────
	onMount(() => {
		const { q, fam, lines } = readUrl();

		if (lines !== null) {
			// La URL trae carrito (link compartido) → tiene prioridad
			basket = lines;
		} else {
			// Sin carrito en URL → restauramos de localStorage
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					const parsed = JSON.parse(stored);
					if (Array.isArray(parsed)) basket = rehydrateLines(parsed);
				}
			} catch (error) {
				console.warn('No se pudo restaurar el carrito', error);
			}
		}

		rawQuery = q;
		activeQuery = q;
		activeFamilies = fam;

		// Normaliza la URL desde el primer render (refleja el carrito local)
		persistBasket();
		history.replaceState(
			{ q, fam, b: serializeBasket(basket) },
			'',
			buildUrl(q, fam, basket)
		);

		hydrated = true;
	});

	onDestroy(() => clearTimeout(debounceHandle));
</script>

<svelte:window
	on:scroll={onWindowScroll}
	on:keydown={onWindowKeydown}
	on:popstate={onPopState}
/>

<svelte:head>
	<title>Catálogo de productos</title>
	<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-200 antialiased">
	<!-- ── Header ───────────────────────────────────────────────────────── -->
	<header
		class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md"
	>
		<div class="mx-auto max-w-7xl px-4 py-3">
			<div class="flex items-center gap-3">
				<div class="hidden shrink-0 sm:block text-center">
					<p
						class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
					>
						Catálogo
					</p>
					<p class="text-sm font-bold leading-tight text-orange-500">
						TRUPER
					</p>
				</div>

				<!-- Search -->
				<div class="relative flex-1  h-10">
					<svg
						class="pointer-events-none absolute left-2 top-7 h-4 w-4 -translate-y-1/2 text-slate-500"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="7" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>

					<input
						type="text"
						value={rawQuery}
						on:input={onQueryInput}
						placeholder="Buscar por código, familia o descripción…"
						class="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-8 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-orange-500/60 focus:bg-slate-900"
					/>

					{#if isSearching}
						<div class="absolute right-3 top-7 -translate-y-1/2">
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
							></div>
						</div>
					{:else if rawQuery}
						<button
							type="button"
							aria-label="Limpiar búsqueda"
							on:click={resetAll}
							class="absolute right-2 top-8 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					{/if}
				</div>

				<!-- Info -->
				<button
					type="button"
					aria-label="Información de la tienda"
					on:click={() => (showInfo = true)}
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-slate-700 hover:text-slate-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="16" x2="12" y2="12" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
					</svg>
				</button>

				<!-- Basket -->
				<button
					type="button"
					aria-label="Abrir carrito"
					on:click={() => (showBasket = true)}
					class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-slate-700 hover:text-slate-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="8" cy="21" r="1" />
						<circle cx="19" cy="21" r="1" />
						<path
							d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
						/>
					</svg>
					{#if basketCount > 0}
						<span
							class="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-slate-950"
						>
							{basketCount}
						</span>
					{/if}
				</button>
			</div>

			<!-- Filter row -->
			<div class="mt-3 flex items-center gap-2">
				<button
					type="button"
					on:click={() => (showFilters = !showFilters)}
					class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
					</svg>
					Familias
					{#if isFiltered}
						<span
							class="rounded-full bg-orange-500/20 px-1.5 text-[10px] font-bold text-orange-400"
						>
							{activeFamilies.length}
						</span>
					{/if}
				</button>

				<p
					class="ml-auto text-[10px] font-semibold uppercase tracking-widest text-slate-500"
				>
					{matchedProducts.length}
					{matchedProducts.length === 1 ? 'producto' : 'productos'}
				</p>
			</div>

			{#if showFilters}
				<div class="mt-3 flex flex-wrap gap-1.5">
					<button
						type="button"
						on:click={() => toggleFamily(ALL_FAMILIES)}
						class="rounded-full border px-3 py-1 text-[11px] font-semibold transition {activeFamilies.includes(
							ALL_FAMILIES
						)
							? 'border-orange-500 bg-orange-500 text-slate-950'
							: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'}"
					>
						Todas
					</button>
					{#each familyOptions as family (family)}
						<button
							type="button"
							on:click={() => toggleFamily(family)}
							title={family}
							class="max-w-[200px] truncate rounded-full border px-3 py-1 text-[11px] font-semibold transition {activeFamilies.includes(
								family
							)
								? 'border-orange-500 bg-orange-500 text-slate-950'
								: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'}"
						>
							{family}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<!-- ── Catalog ──────────────────────────────────────────────────────── -->
	<main class="mx-auto max-w-7xl px-4 py-6">
		{#if !hydrated}
			<div
				class="py-24 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-600"
			>
				Cargando catálogo…
			</div>
		{:else if visibleProducts.length === 0}
			<div
				class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 py-24 text-center"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-slate-700"
				>
					<circle cx="11" cy="11" r="7" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<p class="text-sm font-medium text-slate-400">
					No se encontraron productos
				</p>
				<button
					type="button"
					on:click={resetAll}
					class="text-xs font-semibold text-orange-400 underline-offset-4 hover:underline"
				>
					Limpiar filtros
				</button>
			</div>
		{:else}
			<div
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each visibleProducts as product (product.code)}
					<article
						class="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-slate-700 hover:bg-slate-900"
					>
						<div class="relative aspect-[4/3] bg-white p-6">
							<img
								src={productImage(product.code)}
								alt={product.description}
								loading="lazy"
								class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
							/>
							<span
								class="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-slate-950/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur"
								title={product._family}
							>
								{product._family}
							</span>
						</div>

						<div class="flex flex-1 flex-col gap-3 p-4">
							<div class="flex items-start justify-between gap-2">
								<span
									class="font-mono text-sm font-bold text-orange-400"
								>
									{product.code}
								</span>
								<span
									class="shrink-0 text-[10px] font-semibold uppercase tracking-wider {product.amount >
									0
										? 'text-slate-500'
										: 'text-rose-500'}"
								>
									{product.amount > 0
										? `${product.amount} ${product.UM ?? ''}`.trim()
										: 'Sin stock'}
								</span>
							</div>

							<h3
								class="line-clamp-2 text-sm leading-snug text-slate-300"
								title={product.description}
							>
								{product.description}
							</h3>

							<div class="mt-auto space-y-3">
								<div
									class="flex items-baseline justify-between rounded-lg bg-slate-950/50 px-3 py-2"
								>
									<span class="font-bold text-emerald-400">
										{formatMoney(product.usd, '$')}
									</span>
									<span class="text-xs text-sky-400">
										{formatMoney(product.euro, '€')}
									</span>
								</div>

								<button
									type="button"
									on:click={() => addToBasket(product)}
									disabled={product.amount <= 0}
									class="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
									>
										<line x1="12" y1="5" x2="12" y2="19" />
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
									{product.amount > 0 ? 'Añadir' : 'Sin stock'}
								</button>

								<a
									href={datasheetUrl(product.code)}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 transition hover:text-orange-400"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path
											d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
										/>
										<polyline points="14 2 14 8 20 8" />
									</svg>
									Ficha técnica
								</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}

		{#if hasMore}
			<div
				class="py-10 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-600"
			>
				Cargando más…
			</div>
		{/if}
	</main>

	<!-- ── Backdrop ─────────────────────────────────────────────────────── -->
	{#if showBasket || showInfo}
		<button
			type="button"
			aria-label="Cerrar panel"
			on:click={closeAll}
			class="fixed inset-0 z-50 cursor-default bg-slate-950/70 backdrop-blur-sm"
		></button>
	{/if}

	<!-- ── Info drawer ──────────────────────────────────────────────────── -->
	<aside
		aria-hidden={!showInfo}
		class="fixed left-0 top-0 z-[60] flex h-full w-full max-w-md flex-col border-r border-slate-800 bg-slate-900 shadow-2xl transition-transform duration-300 ease-out {showInfo
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<header
			class="flex items-center justify-between border-b border-slate-800 px-5 py-4"
		>
			<h2 class="text-base font-bold text-slate-100">Información</h2>
			<button
				type="button"
				aria-label="Cerrar"
				on:click={() => (showInfo = false)}
				class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</header>

		<div class="flex-1 space-y-6 overflow-y-auto p-6">
			<div>
				<p
					class="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400"
				>
					Tienda
				</p>
				<p class="text-lg font-bold text-slate-100">[Nombre]</p>
			</div>
			<div>
				<p
					class="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400"
				>
					Ubicación
				</p>
				<p class="text-sm text-slate-400">[Dirección]</p>
			</div>
			<div>
				<p
					class="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400"
				>
					Contacto
				</p>
				<p class="text-sm text-slate-400">[Teléfono / Correo]</p>
			</div>
		</div>
	</aside>

	<!-- ── Basket drawer ────────────────────────────────────────────────── -->
	<aside
		aria-hidden={!showBasket}
		class="fixed right-0 top-0 z-[60] flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 shadow-2xl transition-transform duration-300 ease-out {showBasket
			? 'translate-x-0'
			: 'translate-x-full'}"
	>
		<header
			class="flex items-center justify-between border-b border-slate-800 px-5 py-4"
		>
			<div>
				<h2 class="text-base font-bold text-slate-100">Carrito</h2>
				<p class="text-xs text-slate-500">
					{basketCount}
					{basketCount === 1 ? 'artículo' : 'artículos'}
				</p>
			</div>
			<div class="flex items-center gap-1">
				{#if basket.length > 0}
					<button
						type="button"
						on:click={shareBasket}
						class="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-800 hover:text-orange-400"
					>
						{shareFeedback || 'Compartir'}
					</button>
					<button
						type="button"
						on:click={clearBasket}
						class="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-800 hover:text-rose-400"
					>
						Vaciar
					</button>
				{/if}
				<button
					type="button"
					aria-label="Cerrar"
					on:click={() => (showBasket = false)}
					class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		</header>

		<div class="flex-1 overflow-y-auto px-5 py-4">
			{#if basket.length === 0}
				<div
					class="flex h-full flex-col items-center justify-center gap-3 text-slate-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="8" cy="21" r="1" />
						<circle cx="19" cy="21" r="1" />
						<path
							d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
						/>
					</svg>
					<p class="text-sm">Tu carrito está vacío</p>
				</div>
			{:else}
				<ul class="space-y-3">
					{#each basket as line (line.code)}
						<li
							class="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
						>
							<img
								src={productImage(line.code)}
								alt=""
								class="h-16 w-16 shrink-0 rounded-lg bg-white p-1 object-contain"
							/>

							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between gap-2">
									<span
										class="font-mono text-xs font-bold text-orange-400"
									>
										{line.code}
									</span>
									<button
										type="button"
										aria-label="Eliminar"
										on:click={() => removeFromBasket(line.code)}
										class="rounded-md p-1 text-slate-600 transition hover:bg-slate-800 hover:text-rose-400"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path
												d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
											/>
										</svg>
									</button>
								</div>

								<p class="line-clamp-2 text-[11px] leading-snug text-slate-400">
									{line.description}
								</p>

								<div class="mt-2 flex items-center justify-between">
									<div class="flex items-center gap-1">
										<button
											type="button"
											aria-label="Quitar uno"
											on:click={() => decrementLine(line.code)}
											class="flex h-6 w-6 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-slate-100"
										>
											−
										</button>
										<span
											class="w-7 text-center text-xs font-semibold text-slate-200"
										>
											{line.quantity}
										</span>
										<button
											type="button"
											aria-label="Añadir uno"
											disabled={line.quantity >= line.amount}
											on:click={() => incrementLine(line)}
											class="flex h-6 w-6 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
										>
											+
										</button>
									</div>
									<span class="text-sm font-bold text-emerald-400">
										{formatMoney(lineTotal(line), '$')}
									</span>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<footer class="border-t border-slate-800 bg-slate-950/50 px-5 py-4">
			<div class="mb-3 flex items-center justify-between">
				<span class="text-sm text-slate-400">Total</span>
				<span class="text-xl font-bold text-emerald-400">
					{formatMoney(basketSubtotal, '$')}
				</span>
			</div>
			<button
				type="button"
				disabled={basket.length === 0}
				class="w-full rounded-xl bg-orange-500 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
			>
				Finalizar compra
			</button>
		</footer>
	</aside>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>