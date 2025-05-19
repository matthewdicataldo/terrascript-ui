import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
import { getContext, setContext } from "svelte";
import {
	SIDEBAR_KEYBOARD_SHORTCUT,
	SIDEBAR_WIDTH,
	SIDEBAR_MIN_WIDTH,
	SIDEBAR_MAX_WIDTH,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_COOKIE_MAX_AGE,
} from "./constants.js";

type Getter<T> = () => T;
type Side = "left" | "right";

export type SidebarStateProps = {
	/**
	 * A getter function that returns the current open state of the sidebar.
	 * We use a getter function here to support `bind:open` on the `Sidebar.Provider`
	 * component.
	 */
	open: Getter<boolean>;

	/**
	 * A function that sets the open state of the sidebar. To support `bind:open`, we need
	 * a source of truth for changing the open state to ensure it will be synced throughout
	 * the sub-components and any `bind:` references.
	 */
	setOpen: (open: boolean) => void;

	/** The initial width of the sidebar. Defaults to `SIDEBAR_WIDTH`. */
	initialWidth?: string;

	/** The side of the viewport the sidebar is on. Defaults to 'left'. */
	side?: Side;
};

// Helper to parse rem/px string to pixels
function parseWidthToPx(widthStr: string, rootFontSize = 16): number {
	if (typeof window === "undefined") {
		// Fallback for SSR or non-browser environments if vw/vh units are used
		// For rem/px, it's fine. For vw/vh, this might return an inaccurate 0 if not handled.
		// However, this function is primarily used during client-side drag, so window should be available.
		if (widthStr.endsWith("vw") || widthStr.endsWith("vh")) return 0;
	}

	if (widthStr.endsWith("rem")) {
		return parseFloat(widthStr) * rootFontSize;
	}
	if (widthStr.endsWith("px")) {
		return parseFloat(widthStr);
	}
	if (widthStr.endsWith("vw")) {
		return (parseFloat(widthStr) / 100) * window.innerWidth;
	}
	// Fallback for unitless numbers, assuming px
	const num = parseFloat(widthStr);
	return isNaN(num) ? 0 : num;
}

// Helper to convert pixels to rem string
function pxToRemStr(px: number, rootFontSize = 16): string {
	return `${px / rootFontSize}rem`;
}

class SidebarState {
	readonly props: SidebarStateProps;
	open = $derived.by(() => this.props.open());
	openMobile = $state(false);
	setOpen: SidebarStateProps["setOpen"];
	#isMobile: IsMobile;
	state = $derived.by(() => (this.open ? "expanded" : "collapsed"));

	// Resizing state
	width = $state(SIDEBAR_WIDTH); // Declare as $state, default to SIDEBAR_WIDTH
	isResizing = $state(false);
	#initialX = $state(0);
	#initialWidthPx = $state(0);
	#side: Side;
	#rafId = 0; // requestAnimationFrame ID
	#pendingWidth = ""; // Stores the latest width calculated in handleResize

	constructor(props: SidebarStateProps) {
		this.setOpen = props.setOpen;
		this.#isMobile = new IsMobile();
		this.props = props; // Assign props first
		this.#side = props.side ?? "left";

		// Determine and set the initial width for the $state signal
		let effectiveInitialWidth = props.initialWidth ?? SIDEBAR_WIDTH;

		if (typeof document !== "undefined") {
			const cookies = document.cookie.split("; ");
			const widthCookie = cookies.find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}_width=`));
			if (widthCookie) {
				const savedWidth = widthCookie.split("=")[1];
				// Basic validation: ensure savedWidth is a string with 'rem' or 'px'
				if (savedWidth && (savedWidth.endsWith('rem') || savedWidth.endsWith('px'))) {
					// Further validation (e.g., against min/max) could be added here
					effectiveInitialWidth = savedWidth;
				}
			}
		}
		this.width = effectiveInitialWidth; // Assign to the $state signal
		console.log("SidebarState constructor: initial width set to:", this.width);
	}

	// Convenience getter for checking if the sidebar is mobile
	// without this, we would need to use `sidebar.isMobile.current` everywhere
	get isMobile() {
		return this.#isMobile.current;
	}

	// Event handler to apply to the `<svelte:window>`
	handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			this.toggle();
		}
	};

	setOpenMobile = (value: boolean) => {
		this.openMobile = value;
	};

	toggle = () => {
		return this.#isMobile.current
			? (this.openMobile = !this.openMobile)
			: this.setOpen(!this.open);
	};

	startResize = (event: MouseEvent) => {
		console.log("Sidebar: startResize triggered");
		// if (this.isMobile) return; // Temporarily remove for testing
		this.isResizing = true;
		this.#initialX = event.clientX;
		this.#initialWidthPx = parseWidthToPx(this.width);
		console.log("Sidebar: initialX:", this.#initialX, "initialWidthPx:", this.#initialWidthPx, "current width:", this.width);
		// Add global listeners for mousemove and mouseup
		window.addEventListener("mousemove", this.handleResize);
		window.addEventListener("mouseup", this.endResize);
	};

	handleResize = (event: MouseEvent) => {
		if (!this.isResizing) return;
		// console.log("Sidebar: handleResize triggered"); // Comment out for performance

		const deltaX = event.clientX - this.#initialX;
		let newWidthPx: number;

		if (this.#side === "right") {
			newWidthPx = this.#initialWidthPx - deltaX;
		} else {
			newWidthPx = this.#initialWidthPx + deltaX;
		}

		const minWidthPx = parseWidthToPx(SIDEBAR_MIN_WIDTH);
		const maxWidthPx = parseWidthToPx(SIDEBAR_MAX_WIDTH);

		newWidthPx = Math.max(minWidthPx, Math.min(newWidthPx, maxWidthPx));
		this.#pendingWidth = pxToRemStr(newWidthPx);
		// console.log("Sidebar: deltaX:", deltaX, "newWidthPx:", newWidthPx, "pendingWidth:", this.#pendingWidth);

		if (this.#rafId === 0) {
			this.#rafId = requestAnimationFrame(() => {
				this.width = this.#pendingWidth;
				// console.log("Sidebar: this.width set via rAF to:", this.width);
				this.#rafId = 0;
			});
		}
	};

	endResize = () => {
		console.log("Sidebar: endResize triggered");
		if (this.#rafId !== 0) {
			cancelAnimationFrame(this.#rafId);
			this.#rafId = 0;
			// Apply the very last pending width if rAF didn't get to it,
			// ensuring the final position is accurate.
			if (this.#pendingWidth && this.width !== this.#pendingWidth) {
				this.width = this.#pendingWidth;
				console.log("Sidebar: final width set in endResize to:", this.width);
			}
		}

		if (!this.isResizing || this.isMobile) { // isMobile check can be restored later if needed
			console.log("Sidebar: endResize skipped or partially skipped, isResizing:", this.isResizing, "isMobile:", this.isMobile);
			// Still remove listeners if isResizing was true but now we are stopping
			if(this.isResizing) {
				this.isResizing = false;
				window.removeEventListener("mousemove", this.handleResize);
				window.removeEventListener("mouseup", this.endResize);
			}
			return;
		}
		this.isResizing = false;
		console.log("Sidebar: isResizing set to false");
		// Remove global listeners
		window.removeEventListener("mousemove", this.handleResize);
		window.removeEventListener("mouseup", this.endResize);

		// Save width to cookie
		if (typeof document !== "undefined") {
			document.cookie = `${SIDEBAR_COOKIE_NAME}_width=${this.width}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		}
	};
}

const SYMBOL_KEY = "scn-sidebar";

/**
 * Instantiates a new `SidebarState` instance and sets it in the context.
 *
 * @param props The constructor props for the `SidebarState` class.
 * @returns  The `SidebarState` instance.
 */
export function setSidebar(props: SidebarStateProps): SidebarState {
	return setContext(Symbol.for(SYMBOL_KEY), new SidebarState(props));
}

/**
 * Retrieves the `SidebarState` instance from the context. This is a class instance,
 * so you cannot destructure it.
 * @returns The `SidebarState` instance.
 */
export function useSidebar(): SidebarState {
	return getContext(Symbol.for(SYMBOL_KEY));
}
