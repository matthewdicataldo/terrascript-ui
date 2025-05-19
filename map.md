# Interactive Map Component with deck.gl and Svelte 5

## 1. Introduction & Goals

This document outlines the architecture and implementation steps for creating an interactive map component using Svelte 5, deck.gl, OpenStreetMap (OSM) data, and Mapbox Satellite imagery. The component will feature a toggle to switch between a standard street map style and satellite imagery.

**Goals:**

*   Display an interactive map within the main content area of the `+page.svelte`.
*   Utilize deck.gl for high-performance rendering of map layers.
*   Source base map tiles from OpenStreetMap for the street view.
*   Source satellite imagery from Mapbox.
*   Implement a toggle button to switch between street and satellite views.
*   Ensure the component is well-structured and maintainable.

## 2. Prerequisites & Setup

### 2.1. Install Necessary Libraries

You'll need to install `deck.gl`, its Svelte wrapper, and `maplibre-gl` (often a peer dependency or useful for base map handling with deck.gl).

```bash
npm install deck.gl @deck.gl/svelte maplibre-gl
# or
pnpm install deck.gl @deck.gl/svelte maplibre-gl
# or
yarn add deck.gl @deck.gl/svelte maplibre-gl
```

### 2.2. Mapbox API Access Token

1.  Go to [Mapbox](https://www.mapbox.com/) and sign up for an account if you don't have one.
2.  Navigate to your account's **Access Tokens** page.
3.  Create a new token or use your default public token. Ensure it has the necessary scopes for accessing tiles (usually default tokens do).
4.  **Securely store this token.** The recommended way for SvelteKit applications is to use environment variables:
    *   Create a `.env` file in your project root (if it doesn't exist and is not in `.gitignore`).
    *   Add your token: `VITE_MAPBOX_API_KEY=your_mapbox_api_key_here`
    *   Access it in your Svelte components using `import.meta.env.VITE_MAPBOX_API_KEY`.
    *   Ensure `.env` is listed in your `.gitignore` file to prevent committing secrets.

## 3. Component Architecture (`src/lib/components/Map.svelte`)

The core of our map will be a Svelte component, let's call it `Map.svelte`.

### 3.1. Props

```typescript
// src/lib/components/Map.svelte (script lang="ts")
type ViewState = {
	longitude: number;
	latitude: number;
	zoom: number;
	pitch?: number; // Optional, 0 for 2D map
	bearing?: number; // Optional, 0 for North-up
};

export let initialViewState: ViewState = {
	longitude: -122.41669, // Default to San Francisco
	latitude: 37.7853,
	zoom: 13,
	pitch: 0,
	bearing: 0,
};

export let mapboxApiKey: string;
```

### 3.2. Internal State (Svelte Runes)

```typescript
// src/lib/components/Map.svelte (script lang="ts)
import { DeckGL } from '@deck.gl/svelte';
import { TileLayer } from '@deck.gl/geo-layers';
import { Map as MapLibreMap } from 'maplibre-gl'; // For base map context & controls

// Internal reactive state
let viewState = $state(initialViewState); // deck.gl will update this
let currentMapStyle = $state<'street' | 'satellite'>('street'); // Default to street

// Tile URLs
const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const mapboxSatelliteTileUrl = $derived(`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${mapboxApiKey}`);

// Derived layers based on currentMapStyle
let layers = $derived([
	new TileLayer({
		id: 'osm-street-layer',
		data: osmTileUrl,
		minZoom: 0,
		maxZoom: 19,
		tileSize: 256,
		visible: currentMapStyle === 'street',
	}),
	new TileLayer({
		id: 'mapbox-satellite-layer',
		data: mapboxSatelliteTileUrl,
		minZoom: 0,
		maxZoom: 22, // Mapbox satellite often supports higher zoom
		tileSize: 256,
		visible: currentMapStyle === 'satellite',
		// Optional: Add attribution for Mapbox
		// onViewportLoad: (tiles) => {
		//   if (tiles) {
		//     // Check if Mapbox attribution is already present by other means
		//     // If not, add it programmatically or ensure it's displayed elsewhere
		//   }
		// }
	}),
]);

function handleViewStateChange({ viewState: newViewState }: { viewState: ViewState }) {
	viewState = newViewState;
}

function toggleMapStyle() {
	currentMapStyle = currentMapStyle === 'street' ? 'satellite' : 'street';
}
```

### 3.3. DeckGL Svelte Component & MapLibre Integration

It's often beneficial to use `maplibre-gl` (or `mapbox-gl`) as the "base" map provider for deck.gl. This gives you familiar map controls and a map instance that deck.gl can synchronize with. Deck.gl layers will then render on top.

```html
<!-- src/lib/components/Map.svelte (template) -->
<div class="map-container relative h-full w-full">
	<DeckGL
		{layers}
		initialViewState={viewState}
		onViewStateChange={handleViewStateChange}
		controller={true}
		style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
	>
		<!--
		  Using MapLibre for the base map context.
		  Deck.gl will sync with this map's view state if a maplibre map instance is provided.
		  However, for simple tile layers as defined above, deck.gl can manage its own view
		  without an explicit base map library if preferred, simplifying setup.

		  If using MapLibre as a base for controls and a "street" style:
		  You might have one MapLibre style for streets and then overlay deck.gl TileLayer for satellite.
		  For this plan, we'll keep it simpler: two deck.gl TileLayers and let deck.gl handle the view.
		  MapLibre controls can be added separately if needed or by integrating more deeply.
		-->
	</DeckGL>

	<div class="map-style-toggle absolute top-2 right-2 z-10">
		<button
			class="bg-background/80 text-foreground hover:bg-muted focus:ring-ring rounded-md px-3 py-1 text-sm shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
			onclick={toggleMapStyle}
		>
			Switch to {currentMapStyle === 'street' ? 'Satellite' : 'Street'}
		</button>
	</div>
</div>
```
**Note on MapLibre Integration:** The example above uses deck.gl's `TileLayer` for both styles directly. If you wanted MapLibre to render the street style using its own styling capabilities (e.g., from a MapTiler or Stadia Maps style JSON), you would initialize `MapLibreMap` within the `<DeckGL>` component or pass a `map` instance to it, and then only use a deck.gl `TileLayer` for the satellite view, toggling the MapLibre style vs. the deck.gl satellite layer. For simplicity, this plan uses two deck.gl `TileLayer`s.

### 3.4. Map Style Toggle

The button in the template above handles toggling the `currentMapStyle` state.

## 4. Styling

*   **`Map.svelte` Container:** The `div.map-container` should be styled to fill its allocated space in the parent component (e.g., `h-full w-full`).
*   **Toggle Button:** Basic styling is provided in the example above. Adjust as needed to fit the application's theme.
*   **Mapbox Attribution:** Ensure Mapbox attribution is displayed if using their tiles. This can be done by adding a small, fixed overlay div with the required text and links, or by checking if deck.gl/MapLibre handles it automatically with certain configurations. The `TileLayer` itself doesn't automatically add attribution UI.

## 5. Integration into `src/routes/+page.svelte`

### 5.1. Identify Target Area

As identified, the map will replace the `div` on line 29 of the current `src/routes/+page.svelte`:
`<div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"></div>`

### 5.2. Modify `+page.svelte`

```html
<!-- src/routes/+page.svelte -->
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
			<!-- ... breadcrumb and trigger ... -->
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			<div class="grid auto-rows-min gap-4 md:grid-cols-3">
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
			</div>
			<!-- 2. Replace the placeholder div with the Map component -->
			<div class="flex-1 rounded-xl overflow-hidden"> {/* Container for the map, ensure overflow is hidden if map has rounded corners */}
				{#if mapboxApiKey}
					<Map {mapboxApiKey} initialViewState={pageInitialViewState} />
				{:else}
					<div class="flex h-full w-full items-center justify-center rounded-xl bg-muted/50">
						<p>Mapbox API Key not configured.</p>
					</div>
				{/if}
			</div>
		</div>
	</Sidebar.Inset>
	<AppSidebar side="right" />
</Sidebar.Provider>
```
**Note on Styling the Map Container in `+page.svelte`:**
The placeholder `div` had `flex-1 rounded-xl md:min-h-min`. We've kept `flex-1 rounded-xl` for the new map container `div` and added `overflow-hidden` which is good practice if the map itself or its parent has rounded corners to prevent content spill. The `min-h-[100vh]` and `md:min-h-min` were removed as the map should ideally take the height dictated by `flex-1` within its flex parent. If specific minimum height is still desired, it can be added to this new container `div`.

## 6. Step-by-Step Implementation Guide

1.  **Create Files:**
    *   `src/lib/components/Map.svelte`
    *   Update/create `.env` with `VITE_MAPBOX_API_KEY`.
2.  **Install Dependencies:** Run `npm install deck.gl @deck.gl/svelte maplibre-gl`.
3.  **Implement `Map.svelte`:**
    *   Add the `<script lang="ts">` section with props, internal state (`viewState`, `currentMapStyle`), derived tile URLs, and handler functions (`handleViewStateChange`, `toggleMapStyle`).
    *   Add the HTML template with `<DeckGL>` component and the style toggle button.
    *   Add basic CSS for `div.map-container` if needed (e.g., in a `<style>` block or global CSS).
4.  **Update `src/routes/+page.svelte`:**
    *   Import the `Map` component.
    *   Retrieve the Mapbox API key from environment variables.
    *   Replace the placeholder `div` with the `<Map>` component, passing the necessary props.
    *   Adjust the container `div` styling as needed.
5.  **Testing:**
    *   Run the SvelteKit development server.
    *   Verify the map loads with the default street style.
    *   Test the toggle button to switch to satellite view and back.
    *   Test panning and zooming.
    *   Check browser console for any errors.
    *   Ensure Mapbox attribution is visible when their satellite layer is active.

## 7. Performance Considerations

*   **deck.gl Efficiency:** deck.gl is designed for rendering large datasets and is generally very performant.
*   **Tile Layers:** `TileLayer` is efficient for displaying raster map tiles.
*   **Zoom Levels:** Ensure `minZoom` and `maxZoom` are appropriate for your tile sources to avoid requesting non-existent tiles.
*   **Mapbox API Key:** Keep your API key secure and monitor usage on your Mapbox dashboard.
*   **Bundle Size:** Be mindful of the bundle size increase from adding deck.gl and maplibre-gl. Consider code splitting or dynamic imports if the map is not always visible or critical on initial load (though for this page, it seems to be a primary feature).

## 8. Next Steps & Future Enhancements

*   **Data Overlays:** Add other deck.gl layers (e.g., `GeoJsonLayer`, `ScatterplotLayer`) to display data on the map.
*   **Map Interactions:** Implement `onClick` or `onHover` handlers on layers to show popups or tooltips with information about map features.
*   **Custom Map Controls:** Add custom UI elements for zooming, recentering, etc.
*   **More Sophisticated Base Map:** Integrate more deeply with MapLibre GL for custom base map styles (e.g., from MapTiler, Stadia Maps) and utilize its UI controls.
*   **State Management:** If map state becomes complex or needs to be shared globally, consider Svelte stores.

## 9. Mermaid Diagram (Conceptual Flow)

```mermaid
graph TD
    A[+page.svelte] -- Mounts & Passes Props --> B(Map.svelte Component)
    B -- Uses --> C{DeckGL Svelte Wrapper}
    C -- Manages --> D[deck.gl Instance]

    subgraph Map.svelte Internal State
        E[$state: currentMapStyle ('satellite'/'street')]
        F[$state: viewState (longitude, latitude, zoom, etc.)]
        G[$derived: tileLayerUrls (based on currentMapStyle & APIKey)]
    end

    H[Map Style Toggle Button] -- onClick updates --> E
    E -- Triggers update of --> G
    G -- Provides data to --> I[TileLayer - Satellite]
    G -- Provides data to --> J[TileLayer - Street]

    D -- Renders Layers --> K[Visual Map Output on Screen]
    I -- Visibility controlled by currentMapStyle --> D
    J -- Visibility controlled by currentMapStyle --> D

    L[Mapbox API Key (from .env)] -- Passed as prop to Map.svelte, used by --> I
    M[User Interaction (Pan/Zoom on Map)] -- deck.gl controller updates --> F
    F -- Feeds updated viewState back to --> C

    C -- onViewStateChange callback updates --> F
```

This plan should provide a solid foundation for building your interactive map component.