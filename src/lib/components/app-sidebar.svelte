<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	// Textarea import no longer needed here as ChatInterface handles its own input
	// import { Textarea } from '$lib/components/ui/textarea/index.js';
	import ChatInterface from '$lib/components/ChatInterface.svelte'; // Import the new component

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Content class="flex h-full flex-col">
		<Sidebar.Group class="flex flex-1 flex-col">
			<Sidebar.GroupLabel>Chat</Sidebar.GroupLabel>
			<Sidebar.GroupContent class="flex flex-1 flex-col p-0">
				<ChatInterface />
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
