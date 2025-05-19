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
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
			<Sidebar.Trigger class="-mr-1 ml-auto rotate-180" />
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			<div class="grid auto-rows-min gap-4 md:grid-cols-3">
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
			</div>
			<!-- 2. Replace the placeholder div with the Map component -->
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
