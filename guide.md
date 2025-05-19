# Using deck.gl with Svelte 5 and SvelteKit: A Detailed Guide

This guide will walk you through integrating the powerful, WebGL-accelerated data visualization library deck.gl into your Svelte 5 and SvelteKit applications. We'll cover setup, creating a reusable Svelte component for deck.gl, managing its lifecycle, and leveraging Svelte 5's reactivity with runes.

**Current Date:** May 18, 2025

## Table of Contents

1.  [Introduction to deck.gl](#1-introduction-to-deckgl)
2.  [Prerequisites](#2-prerequisites)
3.  [Setting up a SvelteKit Project](#3-setting-up-a-sveltekit-project)
4.  [Installing deck.gl](#4-installing-deckgl)
5.  [Creating a Svelte 5 deck.gl Component](#5-creating-a-svelte-5-deckgl-component)
    * [Component Structure](#component-structure)
    * [Initializing deck.gl](#initializing-deckgl)
    * [Managing Props and Reactivity with Runes](#managing-props-and-reactivity-with-runes)
    * [Cleaning Up](#cleaning-up)
6.  [Using Layers in deck.gl](#6-using-layers-in-deckgl)
7.  [Integrating with a Base Map (Optional)](#7-integrating-with-a-base-map-optional)
8.  [SvelteKit Specifics](#8-sveltekit-specifics)
    * [Client-Side Rendering](#client-side-rendering)
    * [Using the Component in a Route](#using-the-component-in-a-route)
9.  [Full Example: ScatterplotLayer in SvelteKit](#9-full-example-scatterplotlayer-in-sveltekit)
10. [Conclusion](#10-conclusion)
11. [Further Resources](#11-further-resources)

## 1. Introduction to deck.gl

[deck.gl](https://deck.gl/) is an open-source, WebGL-powered framework for visual exploratory data analysis of large datasets. It provides a collection of highly performant and customizable data visualization layers that can be composed to create stunning 2D and 3D visualizations. It can be used standalone or integrated with base map providers like Mapbox GL JS, Google Maps, or MapLibre GL JS.

## 2. Prerequisites

* **Node.js:** Make sure you have a recent version of Node.js installed (LTS recommended).
* **npm/yarn/pnpm:** A package manager of your choice.
* **Basic Svelte and SvelteKit knowledge:** Familiarity with Svelte components, SvelteKit project structure, and Svelte 5 runes (`$state`, `$props`, `$effect`) is assumed.
* **Basic WebGL understanding (optional but helpful):** While not strictly necessary for basic usage, some familiarity can help with advanced customization.

## 3. Setting up a SvelteKit Project

If you don't have a SvelteKit project, create one:

```bash
# Using npm
npm create svelte@latest my-deckgl-app

# Using yarn
yarn create svelte@latest my-deckgl-app

# Using pnpm
pnpm create svelte@latest my-deckgl-app


Follow the prompts. You can choose a skeleton project or a demo app. TypeScript is recommended for larger projects and better type safety with deck.gl.
Navigate into your project directory:
cd my-deckgl-app


Install dependencies:
npm install # or yarn install, pnpm install


4. Installing deck.gl
deck.gl is modular. You can install the umbrella deck.gl package, which includes all core modules, or install specific modules as needed. For this guide, we'll install the core and layers modules.
npm install @deck.gl/core @deck.gl/layers

# Or using yarn
yarn add @deck.gl/core @deck.gl/layers

# Or using pnpm
pnpm add @deck.gl/core @deck.gl/layers


If you plan to use deck.gl with a base map like Mapbox, you'll also need to install the Mapbox module and Mapbox GL JS itself:
npm install @deck.gl/mapbox mapbox-gl
# or
yarn add @deck.gl/mapbox mapbox-gl
# or
pnpm add @deck.gl/mapbox mapbox-gl


(This guide will primarily focus on standalone deck.gl, but will mention base map integration.)
5. Creating a Svelte 5 deck.gl Component
Let's create a reusable Svelte component to encapsulate deck.gl functionality. Create a new file, for example, src/lib/components/DeckGL.svelte.
Component Structure
A typical Svelte component for deck.gl will:
Import necessary deck.gl classes and Svelte 5 runes/lifecycle functions.
Define props for initial view state, layers, and other configurations.
Create a div element to serve as the container for the deck.gl canvas.
Initialize the Deck instance when the component mounts.
Update deck.gl when props (like layers or view state) change.
Clean up the Deck instance when the component is destroyed.
Initializing deck.gl
deck.gl needs a canvas element to render into. We'll use Svelte's bind:this to get a reference to a div container, and then tell deck.gl to use it. Since deck.gl interacts with the DOM, its initialization and manipulation must happen on the client-side.
Svelte 5 uses runes for lifecycle management. The $effect rune is suitable for initialization and cleanup.
<script lang="ts">
	import { Deck, type DeckProps, type Layer } from '@deck.gl/core';
	import { onMount } from 'svelte'; // Still useful for one-time mount logic if preferred
	import { browser } from '$app/environment'; // To ensure code runs only in browser

	// Props using Svelte 5 $props rune
	// We'll define types for these later for better clarity
	let {
		initialViewState,
		layers = [],
		controller = true,
		style = 'width: 100%; height: 100%; position: relative;', // Default style
		onLoad, // Callback when deck.gl is initialized
		onViewStateChange, // Callback for view state changes
		// ... other deck.gl props you want to expose
	} = $props<{
		initialViewState: Record<string, any>; // e.g., { longitude, latitude, zoom, pitch, bearing }
		layers?: Layer<any>[];
		controller?: boolean;
		style?: string;
		onLoad?: (deck: Deck) => void;
		onViewStateChange?: (params: { viewId: string | null, viewState: Record<string, any> }) => void;
	}>();

	let canvasContainer: HTMLDivElement;
	let deckInstance: Deck | null = null;

	// Svelte 5 $effect for initialization and cleanup
	$effect(() => {
		if (browser && canvasContainer) {
			// Ensure this runs only in the browser and the container is available
			deckInstance = new Deck({
				canvas: canvasContainer, // This will create a canvas inside the container
				// Or, if you create a <canvas> element directly:
				// canvas: specificCanvasElement,
				initialViewState: initialViewState,
				controller: controller,
				layers: layers, // Initial layers
				onLoad: () => {
					if (onLoad && deckInstance) {
						onLoad(deckInstance);
					}
					console.log('Deck.gl initialized');
				},
				onViewStateChange: onViewStateChange,
				// You can pass through other deck.gl props here
				// For example, getTooltip, onHover, onClick
			});

			// Cleanup function for when the component is destroyed or dependencies change
			return () => {
				deckInstance?.finalize();
				deckInstance = null;
				console.log('Deck.gl finalized');
			};
		}
	});

	// Reactive updates to layers
	$effect(() => {
		if (deckInstance && layers) {
			deckInstance.setProps({ layers });
		}
	});

	// Reactive updates to view state (if controlled from outside)
	// This example uses initialViewState. For fully controlled viewState,
	// you would pass a `viewState` prop and update it like layers.
	$effect(() => {
		if (deckInstance && initialViewState) {
			// If you want to dynamically update the view state after initialization
			// deckInstance.setProps({ viewState: initialViewState });
			// Note: DeckGL manages its own internal view state after initialization
			// unless you explicitly provide a `viewState` prop and update it.
			// For flying to a new viewState, you would typically update the viewState prop
			// passed to Deck.
		}
	});

</script>

<div bind:this={canvasContainer} {style}>
	</div>

<style>
	/* Add any additional styling for the container if needed */
	div {
		overflow: hidden; /* Prevent scrollbars if canvas is slightly larger */
	}
</style>


Explanation:
$props Rune: We use $props() to define the component's reactive properties like initialViewState, layers, and controller.
canvasContainer: A div element that will host the deck.gl canvas. We get a reference to it using bind:this={canvasContainer}.
$effect for Initialization & Cleanup:
The first $effect runs when canvasContainer is available and browser is true. It creates a new Deck instance.
deckInstance.finalize(): This is crucial for cleaning up WebGL resources and event listeners when the component is unmounted or the effect re-runs due to dependency changes (though in this setup, it's primarily for unmounting).
The return () => {...} part of the $effect is the cleanup function.
$effect for Reactive Updates:
Separate $effect calls are used to react to changes in specific props like layers. When the layers prop passed to the DeckGL.svelte component changes, deckInstance.setProps({ layers }) is called to update the visualization.
browser from $app/environment: This ensures that DOM-manipulating code and WebGL initialization only run in the browser environment, preventing errors during server-side rendering (SSR) in SvelteKit.
Managing Props and Reactivity with Runes
Svelte 5's runes make managing reactive state and props straightforward.
$props(): Used to declare the properties your DeckGL.svelte component accepts. These are reactive.
$state(): If your component needs to manage internal state that affects deck.gl (e.g., a dynamically changing view state controlled within the component), you would use $state().
$derived(): For values computed from other state or props (e.g., transforming input data before passing it to layers).
$effect(): As shown, used for side effects like initializing/destroying the Deck instance and updating it when props change.
Example: Controlling View State from Parent
If you want the parent component to fully control the viewState:
<script lang="ts">
	import { Deck, type DeckProps, type Layer } from '@deck.gl/core';
	import { browser } from '$app/environment';

	let {
		// Instead of initialViewState, use viewState for full control
		viewState,
		layers = [],
		controller = true,
		style = 'width: 100%; height: 100%; position: relative;',
		onLoad,
		onViewStateChange, // Crucial for two-way binding or parent updates
	} = $props<{
		viewState: Record<string, any>; // This is now the source of truth
		layers?: Layer<any>[];
		controller?: boolean;
		style?: string;
		onLoad?: (deck: Deck) => void;
		onViewStateChange?: (params: { viewId: string | null, viewState: Record<string, any> }) => void;
	}>();

	let canvasContainer: HTMLDivElement;
	let deckInstance: Deck | null = null;

	$effect(() => {
		if (browser && canvasContainer) {
			deckInstance = new Deck({
				canvas: canvasContainer,
				viewState: viewState, // Use the viewState prop
				controller: controller,
				layers: layers,
				onLoad: () => {
					if (onLoad && deckInstance) onLoad(deckInstance);
				},
				onViewStateChange: onViewStateChange, // Parent needs to handle this to update its viewState prop
			});
			return () => {
				deckInstance?.finalize();
				deckInstance = null;
			};
		}
	});

	$effect(() => {
		if (deckInstance) {
			deckInstance.setProps({ layers, viewState }); // Update both
		}
	});
</script>

<div bind:this={canvasContainer} {style}></div>


In the parent component, you would manage viewState using $state and pass it down. The onViewStateChange callback from deck.gl would be used to update this state in the parent.
Cleaning Up
As shown in the $effect rune, the cleanup function is essential:
return () => {
	deckInstance?.finalize();
	deckInstance = null;
};
```deck.finalize()` releases WebGL resources and removes event listeners attached by deck.gl, preventing memory leaks.

## 6. Using Layers in deck.gl

deck.gl's power comes from its layers. You import layer classes from `@deck.gl/layers` (or other modules like `@deck.gl/geo-layers`, `@deck.gl/aggregation-layers`).

Example: A `ScatterplotLayer`

```typescript
import { ScatterplotLayer } from '@deck.gl/layers';

const myData = [
	{ position: [-122.4, 37.8], size: 1000, color: [255, 0, 0] },
	{ position: [-122.45, 37.75], size: 2000, color: [0, 255, 0] },
];

const scatterplot = new ScatterplotLayer({
	id: 'my-scatterplot',
	data: myData,
	getPosition: d => d.position,
	getRadius: d => d.size,
	getFillColor: d => d.color,
	pickable: true, // Important for interactivity like tooltips
	autoHighlight: true,
});

// This layer instance would be passed to the `layers` prop of your DeckGL.svelte component


You would construct your layers array in the parent component (or within DeckGL.svelte if the layers are static) and pass it as the layers prop. $effect in DeckGL.svelte will ensure deckInstance.setProps({ layers }) is called when this array changes.
7. Integrating with a Base Map (Optional)
deck.gl can render on top of map libraries like Mapbox GL JS or MapLibre GL JS. This usually involves:
Initializing the base map library: Similar to deck.gl, it needs a container and initialization in onMount or $effect.
Using @deck.gl/mapbox: This module provides a MapboxOverlay class (or you can use the Deck instance with controller: true and synchronize view states manually or use Deck's mapStyle prop if using the Mapbox basemap directly with Deck).
Synchronizing View States: The deck.gl view state and the base map's view state need to be kept in sync. deck.gl's onViewStateChange and the map library's view change events are used for this.
The Deck class itself can take a mapStyle and mapboxApiAccessToken (if using Mapbox) and render a Mapbox map underneath. This is often the simplest way for Mapbox.
// Inside DeckGL.svelte's $effect for initialization, if using Mapbox directly with Deck
if (browser && canvasContainer) {
    deckInstance = new Deck({
        canvas: canvasContainer,
        initialViewState,
        controller: true,
        layers,
        mapboxApiAccessToken: 'YOUR_MAPBOX_ACCESS_TOKEN', // Store securely, perhaps via environment variables
        mapStyle: 'mapbox://styles/mapbox/light-v9', // Or any other Mapbox style
        onLoad: () => { /* ... */ },
        onViewStateChange: (params) => {
            // If you need to react to view state changes
            if (onViewStateChange) onViewStateChange(params);
        },
    });
    // ... cleanup
}


Refer to the official deck.gl documentation for specific integration guides with different map providers. The pattern for Mapbox GL JS in Svelte (as seen in Mapbox's own documentation) is a good reference: initialize the map in onMount/$effect, get a ref to the container, and destroy it in the cleanup.
8. SvelteKit Specifics
Client-Side Rendering
deck.gl is a client-side library. It interacts with the browser's DOM and WebGL context. To prevent errors during SvelteKit's server-side rendering (SSR):
if (browser): Wrap any deck.gl initialization or DOM manipulation code with a check for import { browser } from '$app/environment';.
Dynamic Imports: For components that are purely client-side, you can consider dynamically importing them:
<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    let DeckGLComponent: ConstructorOfATypedSvelteComponent | null = null;

    onMount(async () => {
        if (browser) {
            const module = await import('$lib/components/DeckGL.svelte');
            DeckGLComponent = module.default;
        }
    });
</script>

{#if DeckGLComponent}
    <svelte:component this={DeckGLComponent} {...propsForDeckGL} />
{/if}

However, for deck.gl, using if (browser) inside the component's $effect or onMount is usually sufficient and simpler.
Using the Component in a Route
Create a page in your src/routes directory, for example, src/routes/map/+page.svelte.
<script lang="ts">
	import DeckGL from '$lib/components/DeckGL.svelte'; // Adjust path if needed
	import { ScatterplotLayer } from '@deck.gl/layers';
	import { $state } from 'svelte'; // For Svelte 5 state management

	// Svelte 5: Use $state for reactive variables
	let initialViewState = $state({
		longitude: -122.41669,
		latitude: 37.7853,
		zoom: 13,
		pitch: 0,
		bearing: 0
	});

	// Example data for the scatterplot layer
	const data = $state([
		{ position: [-122.41669, 37.7853], color: [255, 140, 0], size: 100 },
		{ position: [-122.42669, 37.7953], color: [0, 128, 255], size: 150 },
		{ position: [-122.40669, 37.7753], color: [200, 0, 80], size: 120 }
	]);

	// Reactive layers definition
	// This will be an array of layer instances
	let layers = $derived([
		new ScatterplotLayer({
			id: 'scatterplot-layer',
			data: data, // Use the reactive data
			getPosition: (d: any) => d.position,
			getFillColor: (d: any) => d.color,
			getRadius: (d: any) => d.size,
			radiusMinPixels: 2,
			radiusMaxPixels: 30,
			pickable: true,
			onHover: (info: any) => {
				if (info.object) {
					console.log('Hovered:', info.object);
					// You could display a tooltip here
				}
			}
		})
	]);

	function handleDeckLoad(deck: any) {
		console.log('Deck instance loaded in parent:', deck);
		// You can interact with the deck instance here if needed
	}

	function handleViewStateChange({ viewState: newViewState }: { viewState: Record<string, any>}) {
		// If you want the parent to control/be aware of view state changes
		// This is for one-way data flow down. For DeckGL to update its own viewState based
		// on interaction, `controller:true` is sufficient.
		// If you want to lift the state up (e.g., for URL sync or sharing with other components):
		// initialViewState = { ...initialViewState, ...newViewState };
		console.log('View state changed:', newViewState);
	}

</script>

<div style="width: 100vw; height: 100vh;">
	<DeckGL
		{initialViewState}
		{layers}
		controller={true}
		onLoad={handleDeckLoad}
		onViewStateChange={handleViewStateChange}
	/>
</div>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		overflow: hidden; /* Prevent scrollbars from page if map is fullscreen */
	}
</style>


This page imports the DeckGL.svelte component and passes an initialViewState and a ScatterplotLayer instance to it. Svelte 5's $state and $derived ensure that if data or initialViewState changes, the layers array and the DeckGL component's props are updated reactively.
9. Full Example: ScatterplotLayer in SvelteKit
This brings together the component and its usage in a page.
1. src/lib/components/DeckGL.svelte
(Use the component code from Section 5)
2. src/routes/map/+page.svelte
(Use the page code from Section 8.2)
3. (Optional) Add Mapbox CSS if using Mapbox base map
If you were to integrate Mapbox, you'd typically add its CSS. For standalone deck.gl as shown, this is not needed.
In your src/app.html:
<head>
    ...
    %sveltekit.head%
</head>


And install mapbox-gl.
Run your development server:
npm run dev


Navigate to /map in your browser. You should see a deck.gl visualization with a scatterplot layer.
10. Conclusion
Integrating deck.gl with Svelte 5 and SvelteKit allows you to build powerful, interactive data visualizations within your modern web applications. By creating a reusable Svelte component and leveraging Svelte 5's reactivity model with runes, you can manage deck.gl instances efficiently. Remember to handle client-side rendering carefully within SvelteKit and always clean up deck.gl resources to prevent memory leaks.
11. Further Resources
deck.gl Documentation: https://deck.gl/docs
Layer Catalog: Explore available layers.
Using deck.gl Standalone: Relevant for Svelte integration.
Developer Guide (Interactivity, Performance)
Svelte 5 Documentation: https://svelte.dev/docs/svelte/v5 (refer to the latest v5 docs when available, currently focusing on the migration guide and runes)
Runes (Or official Svelte 5 docs on reactivity)
SvelteKit Documentation: https://kit.svelte.dev/docs
Mapbox GL JS (if integrating): https://docs.mapbox.com/mapbox-gl-js/api/
MapLibre GL JS (if integrating):
