Of course. Here is the full plan in a single markdown code block.

```markdown
# Consolidated Plan: Implementing Interleaved Map Storytelling

This document provides a comprehensive plan for implementing an LLM-powered feature that interleaves narrative text with interactive map commands. It covers the high-level strategy, the specific data structures, the AI prompting logic, a detailed implementation task list, and an estimated development timeline.

---

## 1. High-Level Vision & Strategy

The core objective is to move beyond a simple chat interface and create a "storytelling with maps" experience. Users will ask about historical events, geographical phenomena, or travel routes, and the application will respond with a rich, sequential narrative that combines textual explanations with corresponding map visualizations.

**Example User Journey:**

1.  **User:** "Tell me about the Lewis and Clark Expedition."
2.  **Application:**
    * Displays text: "The Lewis and Clark Expedition, also known as the Corps of Discovery Expedition, was the first American expedition to cross the western portion of the United States. It began in 1804 near St. Louis. Let's start there."
    * Map Action: Pans and zooms the map to St. Louis (`setView`).
    * Displays text: "Their primary objective was to explore and map the newly acquired territory..."
    * Map Action: Draws a polyline showing the general route of the expedition (`drawShape`).
    * Displays text: "...they reached the Pacific Ocean in late 1805."
    * Map Action: Adds a marker at their final destination (`addMarker`).

This approach creates a dynamic and engaging way for users to learn and explore.

---

## 2. Proposed System Architecture & Data Flow

### 2.1. Action Sequence Structure

The fundamental change is that Gemini will no longer return a single command but an **array of action objects**. The application will process this array sequentially.

**General JSON Action Array Structure:**
```json
[
  {
    "type": "actionType1",
    "payload": { /* data for actionType1 */ }
  },
  {
    "type": "actionType2",
    "payload": { /* data for actionType2 */ }
  }
]
```

### 2.2. Defined Action Types

* **`displayText`**: Provides text for the chat UI.
    * `payload`: `{ "text": "Your information here..." }`
* **`mapCommand`**: Issues a command to the map.
    * `payload`: An object with `command` and `parameters` fields.
* **`clarify`**: Asks the user for more information.
    * `payload`: `{ "message": "Your clarification question..." }`
* **`error`**: Reports an inability to process the request.
    * `payload`: `{ "message": "Error message..." }`

### 2.3. Defined Map Commands (`mapCommand` Payload)

* **`setView`**: Moves/zooms the map.
    * Params: `locationName` (string), `coordinates` ({lat, lng}), `zoom` (number), `boundingBox` ({n,e,s,w}).
* **`zoom`**: Adjusts zoom.
    * Params: `direction` ("in" or "out"), `level` (number).
* **`addMarker`**: Adds a pin.
    * Params: `locationName` (string), `coordinates` ({lat, lng}), `label` (string), `useCurrentLocation` (boolean).
* **`drawShape`**: Draws a shape.
    * Params: `shapeType` ("circle", "polygon", "polyline"), `points` (array of {lat,lng}), `center` ({lat,lng}), `radius` (number), `label` (string).
* **`searchPlace`**: Finds places.
    * Params: `query` (string), `contextLocation` (string or {lat, lng} or "currentView").
* **`clearMap`**: Removes elements from the map.
    * Params: `elements` (array of strings), `all` (boolean).
* **`getEventsInRange`**: Fetches data for a given time/area (from `orpc.txt`).
    * Params: `timeRange` ({start, end}), `boundingBox` ({n,e,s,w}), `useCurrentView` (boolean).

---

## 3. Gemini Prompting Strategy

The prompt is the most critical piece of the backend logic. It must instruct Gemini to act as a "storyteller" and produce the structured JSON array.

**System Prompt for Gemini:**
```
You are a specialized AI assistant called 'TerraScript Storyteller'. Your purpose is to respond to user queries by providing a sequence of actions, including informational text and commands to control a map.

You MUST respond with a single JSON array. Each object in the array represents an action and MUST have a `type` field and a `payload` field.

Available Action Types:
1.  `displayText`: Use this to provide narrative. Payload: `{"text": "Your information here..."}`
2.  `mapCommand`: Use this to control the map. Payload must contain `command` and `parameters`.
3.  `clarify`: If the user's query is ambiguous. Payload: `{"message": "Your clarification question..."}`
4.  `error`: If the query is out of scope. Payload: `{"message": "Error message..."}`

Available Map Commands (for the `payload` of `mapCommand`):
* `setView`: Params: `locationName`, `coordinates`, `zoom`, `boundingBox`.
* `addMarker`: Params: `locationName`, `coordinates`, `label`, `useCurrentLocation`.
* `drawShape`: Params: `shapeType`, `points`, `center`, `radius`, `label`.
* ... (and all other defined map commands)

**Example Interaction:**
User: "Tell me about the Trail of Tears."
Your JSON Response:
[
  {
    "type": "displayText",
    "payload": {
      "text": "The Trail of Tears involved the forced displacement of several Native American nations... Let's look at the general area."
    }
  },
  {
    "type": "mapCommand",
    "payload": {
      "command": "setView",
      "parameters": {
        "boundingBox": {"north": 39, "south": 30, "east": -80, "west": -98},
        "zoom": 5
      }
    }
  },
  {
    "type": "mapCommand",
    "payload": {
      "command": "drawShape",
      "parameters": {
        "shapeType": "polyline",
        "points": [ {"lat": 36.1627, "lng": -86.7816}, /* ... more points */ ],
        "label": "General Trail of Tears Route"
      }
    }
  },
  {
    "type": "displayText",
    "payload": {
      "text": "This was not a single route but a series of paths. Thousands perished due to harsh conditions."
    }
  }
]

Break down complex information into multiple `displayText` and `mapCommand` steps for a better user experience. For relative terms like "here", use parameters like `useCurrentLocation: true`.
```

---

## 4. Implementation Plan & Task List

### I. Backend/Server-Side
1.  **Define RPC Endpoint:** Update `rpcDefinition.ts` with a new endpoint like `getInterleavedMapStory` that takes a user query and optional map state, and returns a promise for an array of action objects.
2.  **Implement Gemini Prompting Logic:** Create the server-side function that constructs the detailed system prompt shown above and sends it with the user query to the Gemini API.
3.  **Process Gemini Response:** Implement robust JSON parsing and validation on the response from Gemini to ensure it matches the expected array structure before sending it back to the client.

### II. Client-Side
1.  **Call RPC Endpoint:** On user submission, call the new server-side RPC.
2.  **Implement Action Sequencer:** Create a core client-side function that receives the array of actions and processes them one by one. This is key for UX and should handle the timing between text display and map animations.
3.  **Handle Action Types:**
    * For `displayText`, append the text to the chat UI.
    * For `clarify`/`error`, display the message in the chat UI.
    * For `mapCommand`, create a dispatcher (e.g., a switch statement) that calls the appropriate map-handling function based on the `command` field.
4.  **Implement Map Command Handlers:** For each command (`setView`, `addMarker`, etc.), write the function that interacts with your map library (e.g., Leaflet, Mapbox GL JS) using the parameters from the payload.

### III. Geocoding Service
1.  **Choose & Integrate a Service:** Select and implement a geocoding service (e.g., Nominatim, Mapbox) to convert location names from Gemini into latitude/longitude coordinates. This can be a client-side or server-side utility.

### IV. Testing and Refinement
1.  **Test End-to-End Flow:** Verify that a user query correctly generates an action array that is then processed sequentially on the client.
2.  **Iterate on Prompting:** The majority of refinement will be here. Test with diverse queries and tweak the system prompt and its examples to improve the quality, accuracy, and narrative flow of Gemini's responses.

---

## 5. Staging & PR Estimate

This feature can be developed in 4-6 major stages, translating to roughly 7-15+ PRs.

* **Stage 1: Backend Foundation & Basic Flow (1-2 PRs)**
    * PR1 (Backend): RPC setup, initial prompting logic.
    * PR2 (Client): Basic action sequencer, handler for `displayText` and one simple `mapCommand` (e.g., `setView` with hardcoded coordinates).
* **Stage 2: Core Map Commands & Geocoding (2-4 PRs)**
    * PR3: Geocoding service integration.
    * PR4: Handlers for `setView` (with geocoding), `zoom`, `addMarker`.
    * PR5: Handlers for `clearMap`, `searchPlace`.
* **Stage 3: Advanced Storytelling & Commands (2-4 PRs)**
    * PR6: Handler for `drawShape` (e.g., polylines for routes).
    * PR7: Heavy prompt engineering and refinement of the client-side sequencer for better UX timing.
* **Stage 4: Robustness & Iteration (2-5+ PRs)**
    * Series of PRs for error handling, loading indicators, bug fixes, and continuous prompt tuning based on extensive testing.

---

## 6. Component Communication Architecture

Based on the current codebase analysis, the Map and ChatInterface components are siblings under the page layout. Here's the recommended communication approach:

### 6.1 Map-Exposed Store Pattern

The Map component will expose its own store that other components can import and use directly:

```typescript
// In Map.svelte or a separate map.store.ts
import { writable, derived, get } from 'svelte/store';
import type { Deck } from '@deck.gl/core';

interface MapState {
    instance: Deck | null;
    viewState: {
        longitude: number;
        latitude: number;
        zoom: number;
        pitch: number;
        bearing: number;
    };
    isAnimating: boolean;
    markers: Map<string, MarkerData>;
    shapes: Map<string, ShapeData>;
}

interface MapCommand {
    id: string;
    command: 'setView' | 'addMarker' | 'drawShape' | 'clearMap' | 'zoom';
    parameters: any;
}

// Core map state
export const mapState = writable<MapState>({
    instance: null,
    viewState: { longitude: 0, latitude: 0, zoom: 1, pitch: 0, bearing: 0 },
    isAnimating: false,
    markers: new Map(),
    shapes: new Map()
});

// Command queue for processing map actions
export const mapCommandQueue = writable<MapCommand[]>([]);

// Derived store for current view bounds
export const mapBounds = derived(mapState, $state => {
    if (!$state.instance) return null;
    const viewport = $state.instance.getViewports()[0];
    return viewport?.getBounds();
});

// Map API functions
export const mapAPI = {
    async executeCommand(command: MapCommand): Promise<void> {
        const state = get(mapState);
        if (!state.instance) throw new Error('Map not initialized');
        
        mapState.update(s => ({ ...s, isAnimating: true }));
        
        try {
            switch (command.command) {
                case 'setView':
                    await this.setView(command.parameters);
                    break;
                case 'addMarker':
                    await this.addMarker(command.parameters);
                    break;
                // ... other commands
            }
        } finally {
            mapState.update(s => ({ ...s, isAnimating: false }));
        }
    },
    
    async setView(params: ViewParameters): Promise<void> {
        const state = get(mapState);
        const deck = state.instance;
        if (!deck) return;
        
        return new Promise((resolve) => {
            deck.setProps({
                viewState: {
                    ...params,
                    transitionDuration: 2000,
                    transitionInterpolator: new FlyToInterpolator(),
                    onTransitionEnd: () => resolve()
                }
            });
        });
    },
    
    async addMarker(params: MarkerParameters): Promise<void> {
        // Implementation for adding markers
    },
    
    // ... other command implementations
};
```

### 6.2 Map Component Modifications

The Map.svelte component needs to:
1. **Initialize and expose the store** on mount
2. **Process commands from the queue** automatically
3. **Update the store** when user interacts with the map

Key implementation in Map.svelte:
```svelte
<script lang="ts">
    import { mapState, mapCommandQueue, mapAPI } from './map.store';
    import { onMount } from 'svelte';
    
    // ... existing props and state
    
    // Initialize store with deck instance
    $effect(() => {
        if (deckInstance) {
            mapState.update(state => ({ ...state, instance: deckInstance }));
        }
    });
    
    // Process command queue
    $effect(() => {
        if ($mapCommandQueue.length > 0 && !$mapState.isAnimating) {
            const [command, ...rest] = $mapCommandQueue;
            mapCommandQueue.set(rest);
            mapAPI.executeCommand(command);
        }
    });
    
    // Update store when map view changes
    $effect(() => {
        mapState.update(state => ({ 
            ...state, 
            viewState: currentViewState 
        }));
    });
</script>
```

### 6.3 ChatInterface Modifications

The ChatInterface.svelte component can now:
1. **Import the map store directly**
2. **Queue map commands** as actions arrive
3. **Check animation state** before proceeding

Key implementation in ChatInterface.svelte:
```svelte
<script lang="ts">
    import { mapState, mapCommandQueue, mapAPI } from '$lib/components/Map.svelte';
    import { storySequencer } from '$lib/stores/storySequencer';
    
    // Process structured response from Gemini
    async function processActionArray(actions: Action[]) {
        for (const action of actions) {
            if (action.type === 'displayText') {
                // Add to chat
                await displayText(action.payload.text);
            } else if (action.type === 'mapCommand') {
                // Queue map command
                mapCommandQueue.update(queue => [...queue, {
                    id: crypto.randomUUID(),
                    command: action.payload.command,
                    parameters: action.payload.parameters
                }]);
                
                // Wait for animation to complete
                await waitForMapAnimation();
            }
            
            // Respect timing between actions
            await delay(getTimingForAction(action));
        }
    }
    
    async function waitForMapAnimation() {
        return new Promise(resolve => {
            const unsubscribe = mapState.subscribe(state => {
                if (!state.isAnimating) {
                    unsubscribe();
                    resolve(undefined);
                }
            });
        });
    }
</script>
```

### 6.4 Story Sequencer Store

For managing the storytelling flow, create a separate lightweight store:

```typescript
// /src/lib/stores/storySequencer.ts
import { writable, derived } from 'svelte/store';

interface StoryState {
    actions: Action[];
    currentIndex: number;
    isPlaying: boolean;
    isPaused: boolean;
    speed: number;
}

export const storyState = writable<StoryState>({
    actions: [],
    currentIndex: 0,
    isPlaying: false,
    isPaused: false,
    speed: 1.0
});

export const storyProgress = derived(storyState, 
    $state => $state.actions.length > 0 
        ? ($state.currentIndex / $state.actions.length) * 100 
        : 0
);
```

---

## 7. Timing and Sequencing Strategy

### 7.1 Default Timing Configuration

```typescript
interface TimingConfig {
    // Base delays between actions
    textToTextDelay: 1000;        // 1s between consecutive text displays
    textToMapDelay: 1500;         // 1.5s after text before map action
    mapToTextDelay: 500;          // 0.5s after map completes before next text
    
    // Animation durations
    mapPanDuration: 2000;         // 2s for map panning
    mapZoomDuration: 1500;        // 1.5s for zoom changes
    markerAddDuration: 500;       // 0.5s for marker appearance
    shapeDrawDuration: 2000;      // 2s for drawing shapes
    
    // User preferences
    speedMultiplier: 1.0;         // User can speed up/slow down
    autoAdvance: true;            // Auto-advance through story
}
```

### 7.2 Action Sequencer Implementation

The sequencer should:

1. **Queue Management**:
   - Process actions sequentially from the array
   - Support pause/resume at any point
   - Allow skipping to next action

2. **Animation Awareness**:
   - Wait for map animations to complete before proceeding
   - Use Deck.gl's animation callbacks or promises
   - Handle interrupted animations gracefully

3. **Smart Timing**:
   - Adjust delays based on content length
   - Reduce delays for rapid sequences
   - Respect user's reading speed preferences

### 7.3 Example Sequencing Flow

```typescript
async function processAction(action: Action) {
    switch (action.type) {
        case 'displayText':
            await displayTextInChat(action.payload.text);
            await delay(getDelayForNextAction(action));
            break;
            
        case 'mapCommand':
            showMapIndicatorInChat(action.payload.command);
            await executeMapCommand(action.payload);
            await waitForMapAnimation();
            await delay(timingConfig.mapToTextDelay);
            break;
    }
}

function getDelayForNextAction(currentAction: Action): number {
    const nextAction = actions[currentIndex + 1];
    if (!nextAction) return 0;
    
    if (currentAction.type === 'displayText' && nextAction.type === 'displayText') {
        // Calculate based on text length
        const words = currentAction.payload.text.split(' ').length;
        const readingTime = words * 200; // 200ms per word average
        return Math.max(timingConfig.textToTextDelay, readingTime);
    }
    
    if (currentAction.type === 'displayText' && nextAction.type === 'mapCommand') {
        return timingConfig.textToMapDelay;
    }
    
    return 500; // Default minimal delay
}
```

### 7.4 User Controls

Provide intuitive controls for:
- **Play/Pause**: Pause at current action
- **Skip Forward**: Jump to next action immediately
- **Skip Backward**: Replay previous action
- **Speed Control**: 0.5x, 1x, 1.5x, 2x playback speed
- **Progress Bar**: Visual timeline with action markers

---

## 8. Interactive Timeline & Command Cards

### 8.1 Command Card System

Each map command will have its own interactive card showing:

```typescript
interface CommandCard {
    id: string;
    type: 'setView' | 'addMarker' | 'drawShape' | etc;
    title: string;
    timestamp: Date;
    preview: {
        thumbnail: string;  // Base64 32x32 preview
        snapshot: string;   // Full resolution snapshot
    };
    viewState: ViewState;
    status: 'pending' | 'completed' | 'active';
}
```

**Card Features:**
- **Click to jump**: Clicking a card navigates to that point in the story
- **Preview on hover**: Shows larger preview of the map state
- **Visual indicators**: Icons for command type, status badges
- **Grouped by type**: Optional filtering/grouping of cards

### 8.2 Timeline Scrubber

A horizontal timeline at the bottom of the page providing:

```svelte
<!-- Timeline.svelte structure -->
<div class="timeline-container fixed bottom-0 left-0 right-0 h-24 bg-background/95 backdrop-blur border-t">
    <div class="timeline-controls flex items-center gap-4 p-2">
        <PlayPauseButton {isPlaying} />
        <SpeedControl {speed} />
        <div class="timeline-track flex-1 relative">
            <TimelineTrack {commands} {currentIndex} />
            <TimelineScrubber bind:currentIndex />
            <TimelineMarkers {commands} on:markerClick />
        </div>
        <TimeDisplay {currentTime} {totalTime} />
    </div>
    <div class="timeline-preview-strip">
        <!-- Thumbnail previews of commands -->
    </div>
</div>
```

### 8.3 Map Snapshot System

Implement automatic map state capture:

```typescript
// In map.store.ts
export const mapSnapshots = {
    async capture(): Promise<string> {
        const state = get(mapState);
        if (!state.instance?.canvas) return '';
        
        // Capture current map view
        const canvas = state.instance.canvas;
        // Convert to blob for AVIF encoding
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/avif', 0.8);
        });
        return URL.createObjectURL(blob);
    },
    
    async generateThumbnail(snapshot: string): Promise<string> {
        // Create 64x64 thumbnail for timeline
        const img = new Image();
        img.src = snapshot;
        await img.decode();
        
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 64;
        thumbCanvas.height = 64;
        
        const ctx = thumbCanvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, 64, 64);
        
        // Use AVIF for thumbnails too
        const blob = await new Promise<Blob>((resolve) => {
            thumbCanvas.toBlob((blob) => resolve(blob!), 'image/avif', 0.6);
        });
        return URL.createObjectURL(blob);
    }
};
```

### 8.4 Storage Strategy

**Client-side storage using Dexie:**

```typescript
// Extend db schema
export const dxDb = new Dexie('terrascriptDB');

dxDb.version(2).stores({
    messages: '++id, internalId, conversationId, timestamp',
    snapshots: '++id, messageId, conversationId, timestamp, [conversationId+timestamp]',
    commands: '++id, messageId, type, timestamp, [conversationId+timestamp]'
});

interface Snapshot {
    id?: number;
    messageId: number;
    conversationId: string;
    thumbnail: string;
    fullSnapshot: string;
    viewState: ViewState;
    timestamp: Date;
}
```

### 8.5 Layout Modifications

Update the main page layout to accommodate the timeline:

```svelte
<!-- +page.svelte modifications -->
<div class="h-screen flex flex-col">
    <Sidebar.Provider side="right">
        <Sidebar.Inset class="flex-1">
            <header class="h-16">...</header>
            <div class="flex-1 flex flex-col">
                <div class="flex-1 relative">
                    <Map />
                </div>
            </div>
        </Sidebar.Inset>
        <AppSidebar />
    </Sidebar.Provider>
    
    <!-- Timeline at bottom -->
    <Timeline 
        class="h-24 border-t" 
        bind:currentIndex={$storyState.currentIndex}
        commands={$storyState.actions}
        on:seek={handleTimelineSeek}
    />
</div>
```

### 8.6 Performance Optimizations

1. **Snapshot Debouncing**: Only capture after animations complete
2. **Compression**: Use AVIF format for better compression than WebP
3. **Lazy Loading**: Load full snapshots only when needed
4. **Cache Management**: Limit in-memory snapshots to last 50
5. **Virtual Scrolling**: For long command lists in timeline
6. **Blob URL Cleanup**: Release blob URLs when no longer needed to prevent memory leaks

### 8.7 Mobile Considerations

```css
/* Responsive timeline */
@media (max-width: 768px) {
    .timeline-container {
        height: 4rem;
        /* Collapsible drawer pattern */
    }
    
    .timeline-preview-strip {
        display: none; /* Hide previews on mobile */
    }
    
    .command-cards {
        /* Horizontal scroll instead of grid */
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
    }
}
```

### 8.8 Smart Design Decisions

**Key Benefits of the Interactive Timeline:**
1. **Non-linear exploration** - Users can jump to any point in the story
2. **Visual memory** - Preview thumbnails help users remember where they've been
3. **Better navigation** - Scrubber gives overview of story length and progress
4. **Replayability** - Easy to revisit interesting parts

**Architecture Decisions:**

1. **Dual Preview System**: 
   - Small thumbnails (64x64) for timeline efficiency
   - Full snapshots for hover/click interactions
   - AVIF format for superior compression (30-50% better than WebP)

2. **Command Cards as Navigation**:
   - Each card becomes a bookmark in the story
   - Visual previews make it easy to find specific moments
   - Type indicators (icons) help users understand what each command does
   - Cards can be filtered/grouped by type for better organization

3. **Timeline Positioning**:
   - Bottom placement doesn't interfere with map/chat interaction
   - Always accessible but not intrusive
   - Familiar pattern from video players
   - Collapsible on mobile to save screen space

4. **Performance-First Design**:
   - Debounced captures prevent excessive snapshots
   - Lazy loading keeps initial load fast
   - Virtual scrolling handles long timelines
   - Blob URL management prevents memory leaks

**Additional Features to Consider:**

1. **Chapter Markers**: Group related commands into named chapters
2. **Favorites System**: Let users bookmark favorite moments
3. **Deep Linking**: Share links to specific timeline positions
4. **Thumbnail Animations**: Subtle preview animations on hover
5. **Command Filtering**: Toggle visibility of different command types
6. **Export/Import**: Save and share entire story sequences
7. **Collaborative Features**: Multiple users can follow along together

---

## 9. Message Editing & Branching System

### 9.1 Edit-and-Branch Feature

Allow users to edit any past message and automatically regenerate all subsequent responses, creating alternate story branches:

```typescript
interface MessageBranch {
    id: string;
    parentMessageId: string;
    branchPoint: number; // Index in the timeline
    originalMessage: string;
    editedMessage: string;
    branchName?: string;
    createdAt: Date;
}

interface BranchingState {
    currentBranch: string;
    branches: Map<string, MessageBranch>;
    branchHistory: Action[][]; // Stores action arrays for each branch
}
```

### 9.2 Implementation Strategy

**UI Components:**
1. **Edit Button**: Appears on hover for each user message
2. **Branch Indicator**: Visual marker showing where branches diverge
3. **Branch Selector**: Dropdown to switch between different story versions
4. **Diff View**: Option to compare different branches side-by-side

**Technical Flow:**
```typescript
async function editMessage(messageId: string, newContent: string) {
    // 1. Find the message index in the timeline
    const messageIndex = findMessageIndex(messageId);
    
    // 2. Create a new branch
    const branch = {
        id: crypto.randomUUID(),
        parentMessageId: messageId,
        branchPoint: messageIndex,
        originalMessage: messages[messageIndex].text,
        editedMessage: newContent,
        createdAt: new Date()
    };
    
    // 3. Store current timeline as a branch
    saveBranch(currentBranch, actions.slice());
    
    // 4. Truncate actions after branch point
    const preservedActions = actions.slice(0, messageIndex);
    
    // 5. Re-run from the edited message
    const newActions = await generateStoryFrom(newContent, preservedActions);
    
    // 6. Update timeline with new branch
    updateTimeline(preservedActions.concat(newActions));
}
```

### 9.3 Visual Design

**Branch Visualization:**
```svelte
<div class="timeline-branches">
    {#each branches as branch}
        <div class="branch-marker" style="left: {branch.position}%">
            <div class="branch-line" />
            <button class="branch-node" on:click={() => switchToBranch(branch.id)}>
                {branch.name || `Branch ${branch.id.slice(0, 4)}`}
            </button>
        </div>
    {/each}
</div>
```

**Edit Interface:**
```svelte
<!-- In ChatInterface.svelte -->
{#if message.role === 'user'}
    <div class="message-container" on:mouseenter={() => showEditButton = true}>
        <div class="message-content">{message.text}</div>
        {#if showEditButton}
            <button class="edit-button" on:click={() => startEdit(message.id)}>
                <EditIcon size={16} />
            </button>
        {/if}
    </div>
{/if}

{#if editingMessageId === message.id}
    <div class="edit-interface">
        <textarea bind:value={editedText} />
        <div class="edit-actions">
            <button on:click={saveEdit}>Create Branch</button>
            <button on:click={cancelEdit}>Cancel</button>
        </div>
        <p class="edit-warning">
            This will create a new branch and regenerate all following responses
        </p>
    </div>
{/if}
```

### 9.4 Storage Extension

```typescript
// Extend Dexie schema for branches
dxDb.version(3).stores({
    messages: '++id, internalId, conversationId, timestamp, branchId',
    snapshots: '++id, messageId, conversationId, timestamp, branchId',
    commands: '++id, messageId, type, timestamp, branchId',
    branches: '++id, conversationId, parentMessageId, createdAt'
});
```

### 9.5 Smart Features

1. **Branch Naming**: Auto-generate descriptive names based on the edit
2. **Branch Merging**: Allow users to cherry-pick elements from different branches
3. **Branch Comparison**: Side-by-side view of different story paths
4. **Favorite Branches**: Star and quickly access preferred storylines
5. **Branch Sharing**: Share specific branches with unique URLs

### 9.6 Performance Considerations

1. **Lazy Branch Loading**: Only load branch data when selected
2. **Incremental Regeneration**: Only regenerate from the edit point forward
3. **Branch Pruning**: Option to delete old/unused branches
4. **Diff Caching**: Cache differences between branches for quick comparison

---

## 10. Implementation Checklist

### Phase 1: Foundation & Architecture (Prerequisites)
- [ ] Create TypeScript interfaces for the action array structure
- [ ] Implement a shared store for map-chat communication (e.g., using Svelte stores)
- [ ] Set up validation schemas for Gemini responses (using existing arktype dependency)
- [ ] Create base classes/interfaces for map commands
- [ ] Add error boundary components for graceful failure handling

### Phase 2: Backend Implementation
- [ ] Update chatInterfaces.ts with new action types and payloads
- [ ] Modify webSocketHandler.ts to support structured responses (not just text)
- [ ] Implement the Gemini prompt engineering logic with the storyteller system prompt
- [ ] Add response validation and sanitization layer
- [ ] Create server-side error handling for malformed AI responses
- [ ] Add rate limiting for Gemini API calls

### Phase 3: Map Component Enhancement
- [ ] Extend Map.svelte to expose a command API
- [ ] Implement `setView` with smooth transitions
- [ ] Implement `addMarker` with custom icons and labels
- [ ] Implement `drawShape` for polylines, polygons, and circles
- [ ] Implement `clearMap` with selective element removal
- [ ] Add layer management for organizing map elements
- [ ] Create map state persistence mechanism

### Phase 4: Action Processing Engine
- [ ] Build the action sequencer/queue system
- [ ] Implement timing controls between actions
- [ ] Add pause/resume/skip functionality
- [ ] Create progress indicators for long sequences
- [ ] Implement interrupt handling for user interactions
- [ ] Add animation easing for smooth transitions

### Phase 5: Geocoding Integration
- [ ] Select and integrate geocoding service (Nominatim/Mapbox)
- [ ] Implement location name to coordinate conversion
- [ ] Add caching layer for geocoding results
- [ ] Create fallback mechanisms for failed geocoding
- [ ] Implement fuzzy matching for location names

### Phase 6: Chat Interface Updates
- [ ] Modify ChatInterface.svelte to handle action arrays
- [ ] Implement text display with typing animations
- [ ] Add visual indicators for map actions in chat
- [ ] Create clarification/error message handling
- [ ] Add user controls (pause, skip, replay)
- [ ] Implement chat history with action replay capability

### Phase 7: Timeline & Command Cards Implementation
- [ ] Create Timeline.svelte component with scrubber controls
- [ ] Implement CommandCard.svelte with preview thumbnails
- [ ] Build map snapshot system with AVIF compression
- [ ] Add timeline preview strip with virtual scrolling
- [ ] Implement click-to-jump navigation
- [ ] Create hover previews with larger snapshots
- [ ] Add playback speed controls
- [ ] Implement progress indicators and time display
- [ ] Create mobile-responsive timeline design
- [ ] Add command type filtering/grouping

### Phase 8: Integration & Testing
- [ ] Create end-to-end integration between all components
- [ ] Write unit tests for action processors
- [ ] Write integration tests for the full flow
- [ ] Test with diverse geographical queries
- [ ] Performance testing with long sequences
- [ ] Memory leak testing for extended sessions

### Phase 9: User Experience Polish
- [ ] Add loading states and skeleton screens
- [ ] Implement smooth transitions between actions
- [ ] Create visual feedback for map changes
- [ ] Add sound effects (optional)
- [ ] Implement accessibility features
- [ ] Create help/tutorial system

### Phase 10: Message Editing & Branching
- [ ] Add edit buttons to user messages in chat
- [ ] Implement branch creation on message edit
- [ ] Create branch storage in Dexie
- [ ] Build branch visualization on timeline
- [ ] Add branch switching functionality
- [ ] Implement incremental story regeneration
- [ ] Create branch comparison view
- [ ] Add branch naming and management UI
- [ ] Implement branch pruning/cleanup
- [ ] Add branch sharing with unique URLs

### Phase 11: Advanced Features
- [ ] Implement `searchPlace` functionality
- [ ] Implement `getEventsInRange` for historical data
- [ ] Add support for relative directions ("zoom in", "pan left")
- [ ] Create preset story templates
- [ ] Add sharing functionality for story sequences
- [ ] Implement collaborative storytelling features

### Phase 12: Production Readiness
- [ ] Add comprehensive error logging
- [ ] Implement analytics for usage patterns
- [ ] Create admin dashboard for monitoring
- [ ] Add content moderation capabilities
- [ ] Performance optimization and caching
- [ ] Security audit and penetration testing
- [ ] Documentation and API reference
- [ ] Create example stories and demos

### Estimated Timeline
- **Phase 1-2**: 1-2 weeks (Foundation)
- **Phase 3-4**: 2-3 weeks (Core functionality)
- **Phase 5-6**: 1-2 weeks (Integration)
- **Phase 7**: 1-2 weeks (Timeline & Command Cards)
- **Phase 8-9**: 2-3 weeks (Testing & Polish)
- **Phase 10**: 1 week (Message Editing & Branching)
- **Phase 11-12**: 2-4 weeks (Advanced features & Production)

**Total estimated time**: 10-17 weeks for full implementation

### Critical Success Factors
1. **Prompt Engineering**: Getting consistent, well-structured responses from Gemini
2. **Performance**: Smooth animations and quick response times
3. **Error Handling**: Graceful degradation when things go wrong
4. **User Experience**: Intuitive controls and engaging storytelling
5. **Testing**: Comprehensive test coverage to ensure reliability
```