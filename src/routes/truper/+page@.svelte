<script>
	import inventory from './inventory_april_3.json';

	let searchTerm = '';

	function normalizeText(text) {
		return (
			text
				?.toString()
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '') || ''
		);
	}

	$: filteredItems = inventory.filter((item) => {
		if (!searchTerm.trim()) return true;
		const keywords = normalizeText(searchTerm).split(/\s+/);
		const itemContent = normalizeText(
			`${item?.code} ${item?.family} ${item?.description}`,
		);
		return keywords.every((word) => itemContent.includes(word));
	});

	function formatCurrency(value, symbol) {
		return `${symbol}${value?.toFixed(2)}`;
	}

	// Manejador para cuando la imagen no existe en el servidor de Truper
	function handleImageError(e) {
		e.target.style.display = 'none';
	}
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</svelte:head>

<div class="app-wrapper">
	<div class="search-container">
		<header>
			<div class="">
				<input
					type="text"
					placeholder="Buscar por código, familia o descripción..."
					bind:value={searchTerm}
				/>
				{#if searchTerm}
					<button class="clear-btn" on:click={() => (searchTerm = '')}
						>×</button
					>
				{/if}
			</div>

			<div class="flex justify-between gap-2">
				<div class="stats">
					Encontrados: <strong>{filteredItems.length}</strong> productos
				</div>
				<div class="stats">April 3</div>
			</div>
		</header>

		<div class="grid">
			{#each filteredItems as item}
				<div class="card">
					<div class="image-box">
						<img
							src="https://www.truper.com/admin/images/ch/{item.code}.jpg"
							alt={item.description}
							on:error={handleImageError}
						/>
					</div>

					<div class="content">
						<div class="card-header">
							<span class="code">{item.code}</span>
							<span class="family">{item.family}</span>
						</div>
						<h3 class="description">{item.description}</h3>
					</div>

					<div class="card-footer">
						<div class="stock-info">
							<span class="label">Stock disponible</span>
							<span class="amount">{item.amount} {item.UM}</span>
						</div>
						<div class="prices">
							<div class="price-tag usd">
								<small>USD</small>
								<span>{formatCurrency(item.usd, '$')}</span>
							</div>
							<div class="price-tag euro">
								<small>EUR</small>
								<span>{formatCurrency(item.euro, '€')}</span>
							</div>
						</div>
						<a
							class="flex items-center justify-center w-full h-10 gap-2 px-2 mt-5 text-white border border-gray-700 rounded-lg hover:bg-gray-800"
							href={`https://www.truper.com/ficha_tecnica/controllers/index.php?codigo=${item.code}&origen=nal`}
							><svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								><path
									fill="#ef5350"
									d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m4.93 10.44c.41.9.93 1.64 1.53 2.15l.41.32c-.87.16-2.07.44-3.34.93l-.11.04l.5-1.04c.45-.87.78-1.66 1.01-2.4m6.48 3.81c.18-.18.27-.41.28-.66c.03-.2-.02-.39-.12-.55c-.29-.47-1.04-.69-2.28-.69l-1.29.07l-.87-.58c-.63-.52-1.2-1.43-1.6-2.56l.04-.14c.33-1.33.64-2.94-.02-3.6a.85.85 0 0 0-.61-.24h-.24c-.37 0-.7.39-.79.77c-.37 1.33-.15 2.06.22 3.27v.01c-.25.88-.57 1.9-1.08 2.93l-.96 1.8l-.89.49c-1.2.75-1.77 1.59-1.88 2.12c-.04.19-.02.36.05.54l.03.05l.48.31l.44.11c.81 0 1.73-.95 2.97-3.07l.18-.07c1.03-.33 2.31-.56 4.03-.75c1.03.51 2.24.74 3 .74c.44 0 .74-.11.91-.3m-.41-.71l.09.11c-.01.1-.04.11-.09.13h-.04l-.19.02c-.46 0-1.17-.19-1.9-.51c.09-.1.13-.1.23-.1c1.4 0 1.8.25 1.9.35M7.83 17c-.65 1.19-1.24 1.85-1.69 2c.05-.38.5-1.04 1.21-1.69zm3.02-6.91c-.23-.9-.24-1.63-.07-2.05l.07-.12l.15.05c.17.24.19.56.09 1.1l-.03.16l-.16.82z"
								/></svg
							>
							Ficha tecnica</a
						>
					</div>
					<div></div>
				</div>
			{:else}
				<div class="empty-state">
					<p>
						No se encontraron coincidencias para <strong
							>"{searchTerm}"</strong
						>
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background-color: #0f172a;
		font-family: 'Segoe UI', system-ui, sans-serif;
	}

	.app-wrapper {
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.search-container {
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		position: sticky;
		top: 0;
		z-index: 10;
		padding-bottom: 2rem;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		color: #64748b;
	}

	input {
		width: 100%;
		padding: 1rem 3rem;
		background: #1e293b;
		border: 2px solid #334155;
		border-radius: 50px;
		color: white;
		font-size: 1.1rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	input:focus {
		outline: none;
		border-color: #f97316; /* Truper Orange */
		box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
	}

	.clear-btn {
		position: absolute;
		right: 1rem;
		background: #334155;
		border: none;
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.stats {
		text-align: center;
		margin-top: 1rem;
		font-size: 0.9rem;
		color: #94a3b8;
	}

	.grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	}

	.card {
		background: #1e293b;
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease;
		border: 1px solid #334155;
	}

	.card:hover {
		transform: translateY(-5px);
		border-color: #475569;
	}

	.image-box {
		width: 100%;
		height: 200px;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.image-box img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.content {
		padding: 1.25rem;
		flex-grow: 1;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.code {
		color: #f97316;
		font-weight: 800;
		font-family: monospace;
		font-size: 1.1rem;
	}

	.family {
		font-size: 0.7rem;
		font-weight: bold;
		text-transform: uppercase;
		background: #0f172a;
		color: #94a3b8;
		padding: 4px 8px;
		border-radius: 6px;
	}

	.description {
		color: #f1f5f9;
		font-size: 0.95rem;
		margin: 0;
		line-height: 1.5;
		font-weight: 500;
	}

	.card-footer {
		background: #161e2e;
		padding: 1.25rem;
		border-top: 1px solid #334155;
	}

	.stock-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.label {
		color: #64748b;
		font-size: 0.75rem;
		text-transform: uppercase;
	}

	.amount {
		color: #e2e8f0;
		font-weight: bold;
		font-size: 0.85rem;
	}

	.prices {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.price-tag {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		border-radius: 8px;
		text-align: center;
	}

	.price-tag small {
		font-size: 0.6rem;
		margin-bottom: 2px;
		opacity: 0.8;
	}

	.price-tag span {
		font-weight: bold;
		font-size: 1.1rem;
	}

	.usd {
		background: #065f46;
		color: #34d399;
	}
	.euro {
		background: #1e3a8a;
		color: #93c5fd;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 4rem 2rem;
		background: #1e293b;
		border-radius: 16px;
		color: #64748b;
		border: 2px dashed #334155;
	}
</style>
