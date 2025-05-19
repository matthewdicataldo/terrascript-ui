<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Content class="flex h-full flex-col">
		<Sidebar.Group class="flex flex-1 flex-col">
			<Sidebar.GroupLabel>Chat</Sidebar.GroupLabel>
			<Sidebar.GroupContent class="flex flex-1 flex-col p-2">
				<div class="mt-auto w-full">
					<Textarea placeholder="Type your message here." />
				</div>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
