<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { type ChatMessage as RpcChatMessage } from '$lib/rpcDefinition'; // Keep for ChatMessage structure
  import { io, type Socket } from 'socket.io-client'; // Import Socket.IO client
  import { v4 as uuidv4 } from 'uuid';
  import { writable, type Writable } from 'svelte/store';
  import { liveQuery, type Observable } from 'dexie';
  import { dxDb, type ClientMessage } from '$lib/client/db';

  // Svelte stores for reactive state
  const currentInput: Writable<string> = writable('');
  const connectionStatus: Writable<string> = writable('Disconnected');
  const conversationId: Writable<string> = writable('');

  // Observable store for messages from Dexie
  let messages$: Observable<ClientMessage[] | undefined> | undefined;
  let actualMessages: ClientMessage[] | undefined;
  let unsubscribeMsgs: () => void;

  $: {
    unsubscribeMsgs?.();
    if (messages$) {
      const sub = messages$.subscribe(v => (actualMessages = v));
      unsubscribeMsgs = () => sub.unsubscribe();
    } else {
      actualMessages = undefined;
    }
  }
  onDestroy(() => unsubscribeMsgs?.());

  let socket: Socket | null = null;
  const SOCKET_IO_PORT = 5174;
  let currentAiMessageId: number | null = null; // Added declaration
  let currentAiAccumulatedText: string = ""; // Added declaration

  // Keep RpcChatMessage for mapping if server sends compatible structure
  function mapServerToClientMessage(serverMsg: RpcChatMessage, convId: string, messageTimestamp: Date, internalId?: string): Omit<ClientMessage, 'id'> {
    return {
      internalId: internalId || uuidv4(),
      conversationId: convId,
      role: serverMsg.role,
      text: serverMsg.parts[0]?.text || '',
      timestamp: messageTimestamp,
    };
  }

  async function requestHistoryAndStoreInDexie(convId: string) {
    if (!socket) return;
    connectionStatus.set('Loading history...');
    socket.emit('getHistory', convId, (historyResult: RpcChatMessage[]) => {
      (async () => {
        try {
          const baseTimestamp = Date.now();
          const clientMessagesToStore: ClientMessage[] = historyResult.map((rpcMsg, index) => ({
            ...mapServerToClientMessage(rpcMsg, convId, new Date(baseTimestamp + index)),
            status: 'sent'
          }));
          await dxDb.messages.where('conversationId').equals(convId).delete();
          await dxDb.messages.bulkAdd(clientMessagesToStore);
          connectionStatus.set('Connected (History Loaded)');
        } catch (e) {
          console.error("Failed to process history and store in Dexie:", e);
          connectionStatus.set('Error processing history');
        }
      })();
    });
  }

  $: if ($conversationId && socket?.connected) { // Request history if conversationId changes and socket is connected
      requestHistoryAndStoreInDexie($conversationId);
  }
  
  $: if ($conversationId) {
      messages$ = liveQuery(
        () => dxDb.messages.where('conversationId').equals($conversationId).sortBy('timestamp')
      );
    } else {
      messages$ = undefined;
    }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let existingConvId = urlParams.get('convId') || localStorage.getItem('conversationId');
    if (!existingConvId) { existingConvId = uuidv4(); }
    conversationId.set(existingConvId);
    localStorage.setItem('conversationId', $conversationId);
    if (!urlParams.has('convId')) {
        const newUrl = `${window.location.pathname}?convId=${$conversationId}${window.location.hash}`;
        window.history.replaceState({ path: newUrl }, '', newUrl); // SvelteKit warning will persist, address later if needed
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketIoUrl = `${wsProtocol}//localhost:${SOCKET_IO_PORT}`;
    
    connectionStatus.set('Connecting...');
    socket = io(socketIoUrl, {
      // Socket.IO options if needed, e.g., path: '/socket.io' if server is configured with a specific path
      // By default, Socket.IO server listens on '/'
    });

    socket.on('connect', async () => {
      console.log('Socket.IO connected:', socket?.id);
      connectionStatus.set('Connected');
      if ($conversationId) {
        await requestHistoryAndStoreInDexie($conversationId);
      }
    });

    socket.on('chatChunk', (data: { conversationId: string; type: 'chunk'; data: string }) => {
      console.log('Client received chatChunk data:', data.data); // Log incoming chunk data
      if (data.conversationId === $conversationId && currentAiMessageId !== null) {
        currentAiAccumulatedText += data.data;
        dxDb.messages.update(currentAiMessageId, { text: currentAiAccumulatedText + '...' , timestamp: new Date() });
      }
    });

    socket.on('streamEnd', (data: { conversationId: string; type: 'end'; data: string }) => {
      console.log('[ChatInterface] Received streamEnd event. Data:', data, 'Current AI Msg ID:', currentAiMessageId, 'Current Conv ID:', $conversationId);
      // console.log('Client received streamEnd:', data); // Keep for now or remove once confirmed
      if (data.conversationId === $conversationId && currentAiMessageId !== null) {
        dxDb.messages.update(currentAiMessageId, { text: currentAiAccumulatedText, status: 'sent', timestamp: new Date() });
        console.log('Socket.IO Stream ended:', data.data); // Keep this log
        currentAiMessageId = null;
        currentAiAccumulatedText = "";
      }
    });

    socket.on('streamError', (data: { conversationId: string; type: 'error'; data: string }) => {
      if (data.conversationId === $conversationId && currentAiMessageId !== null) {
        console.error('Socket.IO Stream error:', data.data);
        dxDb.messages.update(currentAiMessageId, { text: `Server-side error: ${data.data}`, status: 'error', role: 'system' });
        currentAiMessageId = null;
        currentAiAccumulatedText = "";
      } else {
        console.error('Socket.IO Stream error (unknown message context):', data.data);
      }
    });

    socket.on('disconnect', (reason: Socket.DisconnectReason) => {
      console.log('Socket.IO disconnected. Reason:', reason);
      connectionStatus.set(`Disconnected (Reason: ${reason})`);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error);
      connectionStatus.set(`Error connecting Socket.IO: ${error.message}`);
    });
  });

  onDestroy(() => {
    socket?.disconnect();
  });

  async function sendMessage() {
    if (!$currentInput.trim() || !socket || !$conversationId || !socket.connected) return;

    const userMessageText = $currentInput;
    const userInternalId = uuidv4();

    const userMessageForDexie: ClientMessage = {
      internalId: userInternalId,
      conversationId: $conversationId,
      role: 'user',
      text: userMessageText,
      timestamp: new Date(),
      status: 'pending'
    };
    await dxDb.messages.add(userMessageForDexie);
    currentInput.set('');

    // Prepare placeholder for AI response
    const aiInternalId = uuidv4();
    const aiPlaceholderMessageForDexie: ClientMessage = {
        internalId: aiInternalId,
        conversationId: $conversationId,
        role: 'model',
        text: '...',
        timestamp: new Date(),
        status: 'pending'
    };
    currentAiMessageId = await dxDb.messages.add(aiPlaceholderMessageForDexie);
    currentAiAccumulatedText = "";

    socket.emit('sendMessage', { conversationId: $conversationId, message: userMessageText });
    await dxDb.messages.update(userMessageForDexie.internalId, { status: 'sent' });
  }

  async function clearClientDB() {
    const currentConvId = $conversationId; // Capture current value
    if (!socket || !socket.connected || !currentConvId) {
      console.warn('Socket not connected or no conversation ID. Proceeding with local clear only.');
      try {
        await dxDb.delete(); // This deletes the entire DB, not just one conversation
        console.log('Entire Client DB cleared successfully (remote not cleared as socket was not ready or no convId).');
        // To clear only specific conversation: await dxDb.messages.where('conversationId').equals(currentConvId).delete();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear client DB:', error);
      }
      return;
    }

    console.log(`Requesting remote history clear for convId: ${currentConvId}`);
    socket.emit('clearRemoteConversation', currentConvId, async (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log(`Remote conversation ${currentConvId} cleared successfully.`);
      } else {
        console.error(`Failed to clear remote conversation ${currentConvId}:`, response.error);
      }
      
      // Now clear the local Dexie database
      try {
        console.log('Attempting to delete entire local Dexie DB...');
        await dxDb.delete(); // This deletes the entire DB
        // If you only want to clear messages for the specific conversation:
        // await dxDb.messages.where('conversationId').equals(currentConvId).delete();
        // console.log(`Local messages for conversation ${currentConvId} cleared.`);
        console.log('Entire Client DB cleared successfully after remote attempt.');
        window.location.reload();
      } catch (dbError) {
        console.error('Failed to clear client DB after remote attempt:', dbError);
        // Still attempt reload if DB clear fails, to refresh state
        window.location.reload();
      }
    });
  }

  function autoResizeTextarea(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset height to shrink if text is deleted
    // Consider a slight delay or next tick if scrollHeight isn't updated immediately
    requestAnimationFrame(() => {
      textarea.style.height = `${textarea.scrollHeight}px`;
      // Optional: Add a max-height
      const maxHeight = 120; // e.g., 120px max height
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden'; // Hide scrollbar when not needed
      }
    });
  }
</script>

<!-- Basic UI structure from the guide, to be adapted for sidebar -->
<div class="chat-interface-container grid grid-rows-[auto_auto_1fr_auto] h-full p-2 gap-2">
  <button on:click={clearClientDB} class="btn btn-warning btn-xs self-start">Clear Client DB</button>
  <div class="status-bar text-xs text-muted-foreground">
    Status: {$connectionStatus} | Conv ID: {$conversationId ? $conversationId.substring(0,8) : 'N/A'}...
  </div>
  <div class="messages-area space-y-2 overflow-y-auto">
    {#if $conversationId && messages$ === undefined}
      <!-- messages$ is not yet initialized but we have a conversationId -->
      <p class="text-muted-foreground text-sm text-center">Initializing message stream...</p>
    {:else if $conversationId && actualMessages === undefined && messages$ !== undefined}
      <!-- messages$ is initialized (liveQuery is running) but actualMessages hasn't received a value yet -->
      <p class="text-muted-foreground text-sm">Loading messages...</p>
    {:else if actualMessages && actualMessages.length > 0}
      {#each actualMessages as message (message.internalId)}
        <div class="message p-2 rounded-md text-sm {message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted mr-auto'} {message.status === 'error' ? 'border-destructive border' : ''}"
             style="max-width: 80%; word-wrap: break-word;"
        >
          <strong class="font-semibold block capitalize">{message.role}</strong>
          <div class="whitespace-pre-wrap">{@html message.text}</div>
          {#if message.status === 'pending'}<span class="text-xs text-muted-foreground/70"> (Sending...)</span>{/if}
          {#if message.status === 'error' && message.role !== 'system'}<span class="text-xs text-destructive/80"> (Failed)</span>{/if}
        </div>
      {/each}
    {:else if !$conversationId}
      <p class="text-muted-foreground text-sm text-center">No conversation selected.</p>
    {:else}
      <!-- actualMessages is an empty array or messages$ is undefined without a conversationId -->
      <p class="text-muted-foreground text-sm text-center">No messages yet. Send one to start!</p>
    {/if}
  </div>
  <div class="input-area flex gap-2">
    <textarea
      rows="1"
      bind:value={$currentInput}
      placeholder="Type your message..."
      class="flex-grow textarea textarea-bordered textarea-sm resize-none overflow-hidden"
      on:input={autoResizeTextarea}
      on:keydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
      disabled={!socket?.connected || ($connectionStatus !== 'Connected' && $connectionStatus !== 'Connected (History Loaded)') || !$conversationId}
    ></textarea>
    <button
      class="btn btn-primary btn-sm"
      on:click={sendMessage}
      disabled={!socket?.connected || !$currentInput.trim() || ($connectionStatus !== 'Connected' && $connectionStatus !== 'Connected (History Loaded)') || !$conversationId}
    >
      Send
    </button>
  </div>
</div>
