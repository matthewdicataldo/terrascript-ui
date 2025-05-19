<script lang="ts">
	import { Deck, type Layer } from '@deck.gl/core';
	import { TileLayer } from '@deck.gl/geo-layers';
	import { BitmapLayer } from '@deck.gl/layers';
	import { browser } from '$app/environment';
	import { Globe, SatelliteDish } from '@lucide/svelte';
	// import { Map as MapLibreMap } from 'maplibre-gl';

	// Props
	type ViewState = {
		longitude: number;
		latitude: number;
		zoom: number;
		pitch?: number;
		bearing?: number;
	};

	let {
		initialViewState = {
			longitude: -122.41669, // Default to San Francisco
			latitude: 37.7853,
			zoom: 13,
			pitch: 0,
			bearing: 0,
		},
		mapboxApiKey,
		controller = true, // Make controller a prop as well
		style = 'width: 100%; height: 100%; position: relative;', // Default style for the container
	}: {
		initialViewState?: ViewState;
		mapboxApiKey: string;
		controller?: boolean;
		style?: string;
	} = $props();

	// Internal reactive state
	let currentViewState = $state(initialViewState); // Renamed to avoid conflict with Deck's viewState prop
	let currentMapStyle = $state<'street' | 'satellite'>('street');

	let canvasContainer: HTMLDivElement;
	let deckInstance: Deck | null = null;
	let actualCanvasElement: HTMLCanvasElement; // To hold the reference to the canvas

	// Tile URLs
	const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const mapboxSatelliteTileUrl = $derived(`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${mapboxApiKey}`);

	// Derived layers based on currentMapStyle
	let layers = $derived([
		new TileLayer({
			id: 'osm-street-layer',
			data: osmTileUrl,
			visible: currentMapStyle === 'street', // Restore visibility logic
			tileSize: 256,
			maxCacheSize: 400, // Increase tile cache
			renderSubLayers: props => {
				const { tile } = props;
				if (tile && tile.boundingBox &&
					Array.isArray(tile.boundingBox) && tile.boundingBox.length === 2 &&
					Array.isArray(tile.boundingBox[0]) && tile.boundingBox[0].length >= 2 &&
					Array.isArray(tile.boundingBox[1]) && tile.boundingBox[1].length >= 2) {

					const minCoords = tile.boundingBox[0];
					const maxCoords = tile.boundingBox[1];
					
					const west = minCoords[0];
					const south = minCoords[1];
					const east = maxCoords[0];
					const north = maxCoords[1];
						
					return new BitmapLayer(props, {
						data: undefined,
						image: props.data,
						bounds: [west, south, east, north]
					});
				}
				console.warn('OSM Tile or tile.boundingBox structure is invalid:', JSON.stringify(tile));
				return null;
			}
		}),
		new TileLayer({ // Restore satellite layer
			id: 'mapbox-satellite-layer',
			data: mapboxSatelliteTileUrl,
			minZoom: 0,
			maxZoom: 22,
			tileSize: 256,
			maxCacheSize: 400, // Increase tile cache
			visible: currentMapStyle === 'satellite',
			renderSubLayers: props => {
				const { tile } = props;
				if (tile && tile.boundingBox &&
					Array.isArray(tile.boundingBox) && tile.boundingBox.length === 2 &&
					Array.isArray(tile.boundingBox[0]) && tile.boundingBox[0].length >= 2 &&
					Array.isArray(tile.boundingBox[1]) && tile.boundingBox[1].length >= 2) {

					const minCoords = tile.boundingBox[0];
					const maxCoords = tile.boundingBox[1];
					
					const west = minCoords[0];
					const south = minCoords[1];
					const east = maxCoords[0];
					const north = maxCoords[1];
						
					return new BitmapLayer(props, {
						data: undefined,
						image: props.data,
						bounds: [west, south, east, north]
					});
				}
				console.warn('Mapbox Tile or tile.boundingBox structure is invalid:', JSON.stringify(tile));
				return null;
			}
		}),
	]);

	$effect(() => {
		// canvasContainer is the div, actualCanvasElement is the <canvas> inside it
		if (browser && actualCanvasElement) {
			console.log('Map.svelte: $effect for Deck initialization entered. actualCanvasElement is available.');
			
			deckInstance = new Deck({
				canvas: actualCanvasElement,
				initialViewState: initialViewState, // Use the initialViewState prop for the Deck constructor
				controller: controller,
				layers: [], // Pass empty layers array for now
				onViewStateChange: ({ viewState: newViewStateParams }) => {
					// Update our Svelte state when Deck's internal view state changes
					// This does NOT feed back into this effect's dependencies for Deck re-creation
					currentViewState = {
						longitude: newViewStateParams.longitude,
						latitude: newViewStateParams.latitude,
						zoom: newViewStateParams.zoom,
						pitch: newViewStateParams.pitch ?? 0,
						bearing: newViewStateParams.bearing ?? 0,
					};
				},
				onLoad: () => {
					console.log('Deck.gl Map component initialized with NO layers, using prop initialViewState.');
				},
			});

			return () => {
				deckInstance?.finalize();
				deckInstance = null;
				console.log('Deck.gl Map component finalized');
			};
			
		} else {
			console.log('Map.svelte: $effect for Deck initialization skipped (browser:', browser, 'actualCanvasElement:', !!actualCanvasElement, ')');
		}
	});

	// Reactive updates to layers
	$effect(() => {
		if (deckInstance) {
			console.log('Map.svelte: $effect for layer updates RUNNING setProps with layers:', layers);
			deckInstance.setProps({ layers });
		} else {
			console.log('Map.svelte: $effect for layer updates SKIPPED (no deckInstance). Layers value:', layers);
		}
	});

	// The $effect block below was causing the 'state_proxy_equality_mismatch' warning
	// and its logic for reacting to initialViewState prop changes post-mount was not fully robust.
	// For now, view state is initialized, and then updated via user interaction & onViewStateChange.
	// If programmatic "flyTo" based on prop changes is needed later, a more specific effect
	// focusing on changes to the `initialViewState` prop itself would be required,
	// likely calling `deckInstance.setProps({ viewState: newInitialPropValue })`.
	/*
	$effect(() => {
		if (deckInstance && initialViewState !== currentViewState) {
			// console.log('initialViewState prop may have changed externally.');
		}
	});
	*/

	function toggleMapStyle() {
		currentMapStyle = currentMapStyle === 'street' ? 'satellite' : 'street';
		console.log("Map style switched to:", currentMapStyle);
	}
</script>

<!-- This outer div is now just for layout and applying the style prop -->
<div {style} class="map-container relative">
	<!-- Deck.gl will render its canvas into this explicit canvas element -->
	<canvas bind:this={actualCanvasElement} style="width: 100%; height: 100%; display: block;"></canvas>
</div>

<div class="map-style-toggle absolute bottom-6 left-6 z-10">
	<button
		class="bg-background/80 text-foreground hover:bg-muted focus:ring-ring flex px-4 py-2 items-center justify-between gap-3 rounded-full p-2 shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
		onclick={toggleMapStyle}
		title={currentMapStyle === 'street' ? 'Switch to Satellite View' : 'Switch to Street View'}
	>
		{#if currentMapStyle === 'street'}
			<SatelliteDish class="h-5 w-5" /> Satellite
		{:else}
			<Globe class="h-5 w-5" /> Map
		{/if}
	</button>
</div>