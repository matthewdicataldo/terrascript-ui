<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { type ChatProcedures, type ChatMessage as RpcChatMessage } from '$lib/rpcDefinition'; // chatOrpc removed
  import { createORPCClient } from '@orpc/client'; // Import createORPCClient
  import { experimental_RPCLink as WebSocketLink } from '@orpc/client/websocket'; // Updated import
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

  let client: ChatProcedures | null = null; // Use ChatProcedures interface for client type
  let nativeWs: WebSocket | null = null;

  function mapRpcToClientMessage(rpcMsg: RpcChatMessage, convId: string, internalId?: string): Omit<ClientMessage, 'id' | 'timestamp'> {
    return {
      internalId: internalId || uuidv4(),
      conversationId: convId,
      role: rpcMsg.role,
      text: rpcMsg.parts[0]?.text || '',
    };
  }

  async function loadHistoryFromRpcAndStoreInDexie(convId: string) {
    if (!client) return;
    connectionStatus.set('Loading history...');
    try {
      const historyResult = await client.getHistory(convId);
      const clientMessagesToStore: ClientMessage[] = historyResult.map(rpcMsg => ({
        ...mapRpcToClientMessage(rpcMsg, convId),
        timestamp: new Date(),
        status: 'sent'
      }));
      await dxDb.messages.bulkPut(clientMessagesToStore);
      connectionStatus.set('Connected (History Loaded)');
    } catch (e) {
      console.error("Failed to load history from RPC:", e);
      connectionStatus.set('Error loading history');
    }
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
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/api/chat_orpc`;
    
    connectionStatus.set('Connecting...');
    nativeWs = new WebSocket(wsUrl);

    nativeWs.onopen = async () => {
      console.log('Native WebSocket connected');
      connectionStatus.set('Connected');
      const wsLink = new WebSocketLink({ websocket: nativeWs! }); // Create WebSocketLink
      client = createORPCClient(wsLink) as unknown as ChatProcedures; // Force cast
      await loadHistoryFromRpcAndStoreInDexie($conversationId);
    };

    nativeWs.onclose = (event: CloseEvent) => {
      console.log('Native WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      connectionStatus.set(`Disconnected (Code: ${event.code})`);
      client = null;
    };

    nativeWs.onerror = (error: Event) => {
      console.error('Native WebSocket error:', error);
      connectionStatus.set(`Error connecting WebSocket`);
      client = null;
    };
    // nativeWs.onmessage is handled by the oRPC adapter
  });

  onDestroy(() => {
    if (nativeWs) {
      nativeWs.close();
    }
  });

  async function sendMessage() {
    if (!$currentInput.trim() || !client || !$conversationId || ($connectionStatus !== 'Connected' && $connectionStatus !== 'Connected (History Loaded)')) return;

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

    let aiResponseText = '';
    const aiInternalId = uuidv4();
    const aiPlaceholderMessageForDexie: ClientMessage = {
        internalId: aiInternalId,
        conversationId: $conversationId,
        role: 'model',
        text: '...',
        timestamp: new Date(),
        status: 'pending'
    };
    const aiMessageDexieId = await dxDb.messages.add(aiPlaceholderMessageForDexie);

    try {
      const stream = client.chatStream({ conversationId: $conversationId, message: userMessageText });
      await dxDb.messages.update(userMessageForDexie.internalId, { status: 'sent' });

      for await (const response of stream) {
        if (response.type === 'chunk') {
          aiResponseText += response.data as string;
          await dxDb.messages.update(aiMessageDexieId, { text: aiResponseText + '...', timestamp: new Date() });
        } else if (response.type === 'error') {
          await dxDb.messages.update(aiMessageDexieId, { text: `Error: ${response.data}`, status: 'error', role: 'system' });
          break;
        } else if (response.type === 'end') {
          await dxDb.messages.update(aiMessageDexieId, { text: aiResponseText, status: 'sent', timestamp: new Date() });
          break;
        }
      }
    } catch (error) {
      console.error('Failed to send message/process stream:', error);
      const errorText = error instanceof Error ? error.message : String(error);
      await dxDb.messages.update(aiMessageDexieId, { text: `Client-side error: ${errorText}`, status: 'error', role: 'system' });
      await dxDb.messages.where({ internalId: userInternalId }).modify({ status: 'error' });
    }
  }
</script>

<!-- Basic UI structure from the guide, to be adapted for sidebar -->
<div class="chat-interface-container flex flex-col h-full p-2">
  <div class="status-bar text-xs text-muted-foreground mb-2">
    Status: {$connectionStatus} | Conv ID: {$conversationId ? $conversationId.substring(0,8) : 'N/A'}...
  </div>
  <div class="messages-area flex-grow overflow-y-auto mb-2 space-y-2">
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
          <div class="whitespace-pre-wrap">{@html message.text.replace(/\n/g, '<br>')}</div>
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
    <input 
      type="text" 
      bind:value={$currentInput} 
      placeholder="Type your message..." 
      class="flex-grow input input-bordered input-sm" 
      on:keypress={(e) => e.key === 'Enter' && sendMessage()}
      disabled={!client || ($connectionStatus !== 'Connected' && $connectionStatus !== 'Connected (History Loaded)') || !$conversationId}
    />
    <button 
      class="btn btn-primary btn-sm" 
      on:click={sendMessage} 
      disabled={!client || !$currentInput.trim() || ($connectionStatus !== 'Connected' && $connectionStatus !== 'Connected (History Loaded)') || !$conversationId}
    >
      Send
    </button>
  </div>
</div>
