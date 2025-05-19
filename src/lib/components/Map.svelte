<script lang="ts">
	import { Deck, type Layer } from '@deck.gl/core';
	import { TileLayer } from '@deck.gl/geo-layers';
	import { browser } from '$app/environment';
	// import { Map as MapLibreMap } from 'maplibre-gl'; // Uncomment if using MapLibre for base map & controls

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
			minZoom: 0,
			maxZoom: 19,
			tileSize: 256,
			visible: currentMapStyle === 'street',
		}),
		new TileLayer({
			id: 'mapbox-satellite-layer',
			data: mapboxSatelliteTileUrl,
			minZoom: 0,
			maxZoom: 22,
			tileSize: 256,
			visible: currentMapStyle === 'satellite',
			// Consider Mapbox attribution requirements
		}),
	]);

	$effect(() => {
		// canvasContainer is the div, actualCanvasElement is the <canvas> inside it
		if (browser && actualCanvasElement) {
			deckInstance = new Deck({
				canvas: actualCanvasElement, // Pass the actual canvas element
				initialViewState: currentViewState,
				controller: controller,
				layers: layers, // Initial layers
				onViewStateChange: ({ viewState: newViewStateParams }) => {
					currentViewState = {
						longitude: newViewStateParams.longitude,
						latitude: newViewStateParams.latitude,
						zoom: newViewStateParams.zoom,
						pitch: newViewStateParams.pitch ?? 0,
						bearing: newViewStateParams.bearing ?? 0,
					};
				},
				onLoad: () => {
					console.log('Deck.gl Map component initialized');
				},
			});

			return () => {
				deckInstance?.finalize();
				deckInstance = null;
				console.log('Deck.gl Map component finalized');
			};
		}
	});

	// Reactive updates to layers
	$effect(() => {
		if (deckInstance) {
			deckInstance.setProps({ layers });
		}
	});

	// If initialViewState prop changes externally after mount, update Deck
	$effect(() => {
		if (deckInstance && initialViewState !== currentViewState) {
			// This effect might be too simplistic for "flying" to a new initialViewState.
			// Typically, you'd update `currentViewState` which Deck uses.
			// If `initialViewState` is meant to be a "reset" or "goto" point,
			// you might directly set `currentViewState = initialViewState;` here,
			// or use `deckInstance.setProps({ viewState: initialViewState })` if you want Deck to animate.
			// For now, let's assume Deck's internal state + onViewStateChange is primary.
		}
	});


	function toggleMapStyle() {
		currentMapStyle = currentMapStyle === 'street' ? 'satellite' : 'street';
	}
</script>

<!-- This outer div is now just for layout and applying the style prop -->
<div {style} class="map-container relative"> {/* Ensure relative positioning for the absolute toggle button */}
	<!-- Deck.gl will render its canvas into this explicit canvas element -->
	<canvas bind:this={actualCanvasElement} style="width: 100%; height: 100%; display: block;"></canvas>
</div>

<div class="map-style-toggle absolute top-2 right-2 z-10">
	<button
		class="bg-background/80 text-foreground hover:bg-muted focus:ring-ring rounded-md px-3 py-1 text-sm shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
		onclick={toggleMapStyle}
	>
		Switch to {currentMapStyle === 'street' ? 'Satellite' : 'Street'}
	</button>
</div>