<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Map from '$lib/components/Map.svelte'; // 1. Import the new Map component

	const mapboxApiKey = import.meta.env.VITE_MAPBOX_API_KEY;

	// Optional: Define a specific initial view state for this page
	const pageInitialViewState = {
		longitude: -73.985130, // New York City
		latitude: 40.758896,
		zoom: 12,
		pitch: 0,
		bearing: 0,
	};
</script>

<Sidebar.Provider side="right">
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			
			<div class="gap-4">			
				<h1 class="text-3xl">Terrascript <span class="text-sm text-stone-400">Talk to your maps</span></h1>
			</div>
			<Sidebar.Trigger class="-mr-1 ml-auto rotate-180" />
		</header>
		<div class="flex flex-1 flex-col p-4">
			<!-- The placeholder grid that was here has been removed. -->
			<!-- The div below now becomes the sole direct child and will take all available space due to flex-1. -->
			<div class="flex-1 rounded-xl overflow-hidden bg-muted/10">
				{#if mapboxApiKey}
					<Map {mapboxApiKey} initialViewState={pageInitialViewState} />
				{:else}
					<div class="flex h-full w-full items-center justify-center rounded-xl bg-muted/50">
						<p>Mapbox API Key not configured. Please set VITE_MAPBOX_API_KEY in your .env file.</p>
					</div>
				{/if}
			</div>
		</div>
	</Sidebar.Inset>
	<AppSidebar side="right" />
</Sidebar.Provider>
