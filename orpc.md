---
url: "https://orpc.unnoq.com/docs"
title: "404 - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs#VPContent)

404

# PAGE NOT FOUND

> But if you don't change your direction, and if you keep looking, you may end up where you are heading.

[Take me home](https://orpc.unnoq.com/)---
url: "https://orpc.unnoq.com/docs/adapters/http"
title: "HTTP - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/adapters/http#VPContent)

On this page

# HTTP [​](https://orpc.unnoq.com/docs/adapters/http\#http)

oRPC includes built-in HTTP support, making it easy to expose RPC endpoints in any environment that speaks HTTP.

## Server Adapters [​](https://orpc.unnoq.com/docs/adapters/http\#server-adapters)

| Adapter | Target |
| --- | --- |
| `fetch` | [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (Browser, Bun, Deno, Cloudflare Workers, etc.) |
| `node` | Node.js built-in [`http`](https://nodejs.org/api/http.html)/ [`http2`](https://nodejs.org/api/http2.html) |

nodebuncloudflaredeno

ts

```
import { createServer } from 'node:http' // or 'node:http2'
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin()\
  ]
})

const server = createServer(async (req, res) => {
  const { matched } = await handler.handle(req, res, {
    prefix: '/rpc',
    context: {} // Provide initial context if needed
  })

  if (matched) {
    return
  }

  res.statusCode = 404
  res.end('Not found')
})

server.listen(3000, '127.0.0.1', () => console.log('Listening on 127.0.0.1:3000'))
```

ts

```
import { RPCHandler } from '@orpc/server/fetch'
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin()\
  ]
})

Bun.serve({
  async fetch(request: Request) {
    const { matched, response } = await handler.handle(request, {
      prefix: '/rpc',
      context: {} // Provide initial context if needed
    })

    if (matched) {
      return response
    }

    return new Response('Not found', { status: 404 })
  }
})
```

ts

```
import { RPCHandler } from '@orpc/server/fetch'
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin()\
  ]
})

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const { matched, response } = await handler.handle(request, {
      prefix: '/rpc',
      context: {} // Provide initial context if needed
    })

    if (matched) {
      return response
    }

    return new Response('Not found', { status: 404 })
  }
}
```

ts

```
import { RPCHandler } from '@orpc/server/fetch'
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin()\
  ]
})

Deno.serve(async (request) => {
  const { matched, response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {} // Provide initial context if needed
  })

  if (matched) {
    return response
  }

  return new Response('Not found', { status: 404 })
})
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.

## Client Adapters [​](https://orpc.unnoq.com/docs/adapters/http\#client-adapters)

| Adapter | Target |
| --- | --- |
| `fetch` | [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (Browser, Node, Bun, Deno, Cloudflare Workers, etc.) |

ts

```
import { RPCLink } from '@orpc/client/fetch'

const link = new RPCLink({
  url: 'http://localhost:3000/rpc',
  headers: () => ({
    'x-api-key': 'my-api-key'
  }),
  // fetch: <-- polyfill fetch if needed
})
```

INFO

The `link` can be any supported oRPC link, such as [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link), [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), or another custom handler.

INFO

This only shows how to configure the http link. For full client examples, see [Client-Side Clients](https://orpc.unnoq.com/docs/client/client-side).---
url: "https://orpc.unnoq.com/docs/adapters/websocket"
title: "Websocket - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/adapters/websocket#VPContent)

On this page

# Websocket [​](https://orpc.unnoq.com/docs/adapters/websocket\#websocket)

oRPC provides built-in WebSocket support for low-latency, bidirectional RPC.

## Server Adapters [​](https://orpc.unnoq.com/docs/adapters/websocket\#server-adapters)

| Adapter | Target |
| --- | --- |
| `websocket` | [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) (Browser, Deno, Cloudflare, etc.) |
| `crossws` | [Crossws](https://github.com/h3js/crossws) library (Node, Bun, Deno, SSE, etc.) |
| `ws` | [ws](https://github.com/websockets/ws) library (Node.js) |
| `bun-ws` | [Bun Websocket Server](https://bun.sh/docs/api/websockets) |

websocketcrosswswsbun-ws

ts

```
import { experimental_RPCHandler as RPCHandler } from '@orpc/server/websocket'

const handler = new RPCHandler(router)

Deno.serve((req) => {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response(null, { status: 501 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)

  handler.upgrade(socket, {
    context: {}, // Provide initial context if needed
  })

  return response
})
```

ts

```
import { createServer } from 'node:http'
import { experimental_RPCHandler as RPCHandler } from '@orpc/server/crossws'

// any crossws adapter is supported
import crossws from 'crossws/adapters/node'

const handler = new RPCHandler(router)

const ws = crossws({
  hooks: {
    message: (peer, message) => {
      handler.message(peer, message, {
        context: {}, // Provide initial context if needed
      })
    },
    close: (peer) => {
      handler.close(peer)
    },
  },
})

const server = createServer((req, res) => {
  res.end(`Hello World`)
}).listen(3000)

server.on('upgrade', (req, socket, head) => {
  if (req.headers.upgrade === 'websocket') {
    ws.handleUpgrade(req, socket, head)
  }
})
```

ts

```
import { WebSocketServer } from 'ws'
import { experimental_RPCHandler as RPCHandler } from '@orpc/server/ws'

const handler = new RPCHandler(router)

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  handler.upgrade(ws, {
    context: {}, // Provide initial context if needed
  })
})
```

ts

```
import { experimental_RPCHandler as RPCHandler } from '@orpc/server/bun-ws'

const handler = new RPCHandler(router)

Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) {
      return
    }

    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    message(ws, message) {
      handler.message(ws, message, {
        context: {}, // Provide initial context if needed
      })
    },
    close(ws) {
      handler.close(ws)
    },
  },
})
```

## Client Adapters [​](https://orpc.unnoq.com/docs/adapters/websocket\#client-adapters)

| Adapter | Target |
| --- | --- |
| `websocket` | [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) (Browser, Node, Bun, Deno, etc.) |

ts

```
import { experimental_RPCLink as RPCLink } from '@orpc/client/websocket'

const websocket = new WebSocket('ws://localhost:3000')

const link = new RPCLink({
  websocket
})
```

TIP

Use [partysocket](https://www.npmjs.com/package/partysocket) library for manually/automatically reconnect logic.

INFO

This only shows how to configure the WebSocket link. For full client examples, see [Client-Side Clients](https://orpc.unnoq.com/docs/client/client-side).---
url: "https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem"
title: "Exceeds the Maximum Length Problem - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem#VPContent)

On this page

# Exceeds the Maximum Length Problem [​](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem\#exceeds-the-maximum-length-problem)

ts

```
export const
router = {
The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.  // many procedures here
}
```

Are you seeing this error? If so, congratulations! your project is now complex enough to encounter it!

## Why It Happens [​](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem\#why-it-happens)

This error is expected, not a bug. Typescript enforces this to keep your IDE suggestions fast. It appears when all three of these conditions are met:

1. Your project uses `"declaration": true` in `tsconfig.json`.
2. Your project is large or your types are very complex.
3. You export your router as a single, large object.

## How to Fix It [​](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem\#how-to-fix-it)

### 1\. Disable `"declaration": true` in `tsconfig.json` [​](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem\#_1-disable-declaration-true-in-tsconfig-json)

This is the simplest option, though it may not be ideal for your project.

### 2\. Define the `.output` Type for Your Procedures [​](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem\#_2-define-the-output-type-for-your-procedures)

By explicitly specifying the `.output` or your `handler's return type`, you enable TypeScript to infer the output without parsing the handler's code. This approach can dramatically enhance both type-checking and IDE-suggestion speed.

TIP

Use the [type](https://orpc.unnoq.com/docs/procedure#type-utility) utility if you just want to specify the output type without validating the output.

### 3\. Export the Router in Parts [​](https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem\#_3-export-the-router-in-parts)

Instead of exporting one large object on the server (with `"declaration": true`), export each router segment individually and merge them on the client (where `"declaration": false`):

ts

```
export const userRouter = { /** ... */ }
export const planetRouter = { /** ... */ }
export const publicRouter = { /** ... */ }
```

Then, on the client side:

ts

```
interface Router {
  user: typeof userRouter
  planet: typeof planetRouter
  public: typeof publicRouter
}

export const client: RouterClient<Router> = createORPCClient(link)
```---
url: "https://orpc.unnoq.com/docs/advanced/mocking"
title: "Mocking - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/advanced/mocking#VPContent)

On this page

# Mocking [​](https://orpc.unnoq.com/docs/advanced/mocking\#mocking)

Mock your oRPC handlers with ease.

WARNING

This page is incomplete and may be missing important information.

## Using the Implementer [​](https://orpc.unnoq.com/docs/advanced/mocking\#using-the-implementer)

The [Implementer](https://orpc.unnoq.com/docs/contract-first/implement-contract#the-implementer) is designed for contract-first development. However, it can also be used to create alternative versions of your [router](https://orpc.unnoq.com/docs/router) or [procedure](https://orpc.unnoq.com/docs/procedure) for testing purposes.

ts

```
import {
implement,
unlazyRouter } from '@orpc/server'

const
fakeListPlanet =
implement(
router.
planet.
list).
handler(() => [])
```

You can now use `fakeListPlanet` to replace `listPlanet`. Additionally, the `implement` function can be used to create a fake server for front-end testing.

WARNING

The `implement` function does not support the [lazy router](https://orpc.unnoq.com/docs/router#lazy-router) yet. Please use the `unlazyRouter` utility to convert your lazy router before implementing.---
url: "https://orpc.unnoq.com/docs/advanced/rpc-json-serializer"
title: "RPC JSON Serializer - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer#VPContent)

On this page

# RPC JSON Serializer [​](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer\#rpc-json-serializer)

This serializer handles JSON payloads for the [RPC Protocol](https://orpc.unnoq.com/docs/advanced/rpc-protocol) and supports [native data types](https://orpc.unnoq.com/docs/rpc-handler#supported-data-types).

## Extending Native Data Types [​](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer\#extending-native-data-types)

Extend native types by creating your own `StandardRPCCustomJsonSerializer` and adding it to the `customJsonSerializers` option.

1. **Define Your Custom Serializer**

ts

```
import type { StandardRPCCustomJsonSerializer } from '@orpc/client/standard'

export class
User {
     constructor(
       public readonly
id: string,
       public readonly
name: string,
       public readonly
email: string,
       public readonly
age: number,
     ) {}


toJSON() {
       return {

id: this.
id,

name: this.
name,

email: this.
email,

age: this.
age,
       }
     }
}

export const
userSerializer: StandardRPCCustomJsonSerializer = {

type: 21,

condition:
data =>
data instanceof
User,

serialize:
data =>
data.toJSON(),

deserialize:
data => new
User(
data.id,
data.name,
data.email,
data.age),
}
```





WARNING



Ensure the `type` is unique and greater than `20` to avoid conflicts with [built-in types](https://orpc.unnoq.com/docs/advanced/rpc-protocol#supported-types) in the future.

2. **Use Your Custom Serializer**

ts

```
const
handler = new
RPCHandler(
router, {

customJsonSerializers: [\
userSerializer],
})

const
link = new
RPCLink({

url: 'https://example.com/rpc',

customJsonSerializers: [\
userSerializer],
})
```


## Overriding Built-in Types [​](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer\#overriding-built-in-types)

You can override built-in types by matching their `type` with the [built-in types](https://orpc.unnoq.com/docs/advanced/rpc-protocol#supported-types).

For example, oRPC represents `undefined` only in array items and ignores it in objects. To override this behavior:

ts

```
import { StandardRPCCustomJsonSerializer } from '@orpc/client/standard'

export const
undefinedSerializer: StandardRPCCustomJsonSerializer = {

type: 3, // Match the built-in undefined type.

condition:
data =>
data ===
undefined,

serialize:
data => null, // JSON cannot represent undefined, so use null.

deserialize:
data =>
undefined,
}
```---
url: "https://orpc.unnoq.com/docs/advanced/rpc-protocol"
title: "RPC Protocol - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/advanced/rpc-protocol#VPContent)

On this page

# RPC Protocol [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#rpc-protocol)

The RPC protocol enables remote procedure calls over HTTP using JSON, supporting native data types. It is used by [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler).

## Routing [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#routing)

The procedure to call is determined by the `pathname`.

bash

```
curl https://example.com/rpc/planet/create
```

This example calls the `planet.create` procedure, with `/rpc` as the prefix.

ts

```
const router = {
  planet: {
    create: os.handler(() => {})
  }
}
```

## Input [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#input)

Any HTTP method can be used. Input can be provided via URL query parameters or the request body.

INFO

You can use any method, but by default, [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) enabled [StrictGetMethodPlugin](https://orpc.unnoq.com/docs/rpc-handler#default-plugins) which blocks GET requests except for procedures explicitly allowed.

### Input in URL Query [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#input-in-url-query)

ts

```
const url = new URL('https://example.com/rpc/planet/create')

url.searchParams.append('data', JSON.stringify({
  json: {
    name: 'Earth',
    detached_at: '2022-01-01T00:00:00.000Z'
  },
  meta: [[1, 'detached_at']]
}))

const response = await fetch(url)
```

### Input in Request Body [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#input-in-request-body)

bash

```
curl -X POST https://example.com/rpc/planet/create \
  -H 'Content-Type: application/json' \
  -d '{
    "json": {
      "name": "Earth",
      "detached_at": "2022-01-01T00:00:00.000Z"
    },
    "meta": [[1, "detached_at"]]
  }'
```

### Input with File [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#input-with-file)

ts

```
const form = new FormData()

form.set('data', JSON.stringify({
  json: {
    name: 'Earth',
    thumbnail: {},
    images: [{}, {}]
  },
  meta: [[1, 'detached_at']],
  maps: [['images', 0], ['images', 1]]
}))

form.set('0', new Blob([''], { type: 'image/png' }))
form.set('1', new Blob([''], { type: 'image/png' }))

const response = await fetch('https://example.com/rpc/planet/create', {
  method: 'POST',
  body: form
})
```

## Success Response [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#success-response)

http

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "json": {
    "id": "1",
    "name": "Earth",
    "detached_at": "2022-01-01T00:00:00.000Z"
  },
  "meta": [[0, "id"], [1, "detached_at"]]
}
```

A success response has an HTTP status code between `200-299` and returns the procedure's output.

## Error Response [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#error-response)

http

```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "json": {
    "defined": false,
    "code": "INTERNAL_SERVER_ERROR",
    "status": 500,
    "message": "Internal server error",
    "data": {}
  },
  "meta": []
}
```

An error response has an HTTP status code between `400-599` and returns an `ORPCError` object.

## Meta [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#meta)

The `meta` field describes native data in the format `[type: number, ...path: (string | number)[]]`.

- **type**: Data type (see [Supported Types](https://orpc.unnoq.com/docs/advanced/rpc-protocol#supported-types)).
- **path**: Path to the data inside `json`.

### Supported Types [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#supported-types)

| Type | Description |
| --- | --- |
| 0 | bigint |
| 1 | date |
| 2 | nan |
| 3 | undefined |
| 4 | url |
| 5 | regexp |
| 6 | set |
| 7 | map |

## Maps [​](https://orpc.unnoq.com/docs/advanced/rpc-protocol\#maps)

The `maps` field is used with `FormData` to map a file or blob to a specific path in `json`.---
url: "https://orpc.unnoq.com/docs/advanced/superjson"
title: "SuperJson - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/advanced/superjson#VPContent)

On this page

# SuperJson [​](https://orpc.unnoq.com/docs/advanced/superjson\#superjson)

This guide explains how to replace the default oRPC RPC serializer with [SuperJson](https://github.com/blitz-js/superjson).

INFO

While the default oRPC serializer is faster and more efficient, SuperJson is widely adopted and may be preferred for compatibility.

## SuperJson Serializer [​](https://orpc.unnoq.com/docs/advanced/superjson\#superjson-serializer)

WARNING

The `SuperJsonSerializer` supports only the data types that SuperJson handles, plus `AsyncIteratorObject` at the root level for [Event Iterator](https://orpc.unnoq.com/docs/event-iterator). It does not support all [RPC supported types](https://orpc.unnoq.com/docs/rpc-handler#supported-data-types).

ts

```
import {
createORPCErrorFromJson,
ErrorEvent,
isORPCErrorJson,
mapEventIterator,
toORPCError } from '@orpc/client'
import type {
StandardRPCSerializer } from '@orpc/client/standard'
import {
isAsyncIteratorObject } from '@orpc/shared'
import
SuperJSON from 'superjson'

export class
SuperJSONSerializer implements
Pick<
StandardRPCSerializer, keyof
StandardRPCSerializer> {

serialize(
data: unknown): object {
    if (
isAsyncIteratorObject(
data)) {
      return
mapEventIterator(
data, {

value: async (
value: unknown) =>
SuperJSON.
serialize(
value),

error: async (
e) => {
          return new
ErrorEvent({

data:
SuperJSON.
serialize(
toORPCError(
e).
toJSON()),

cause:
e,
          })
        },
      })
    }

    return
SuperJSON.
serialize(
data)
  }


deserialize(
data: any): unknown {
    if (
isAsyncIteratorObject(
data)) {
      return
mapEventIterator(
data, {

value: async
value =>
SuperJSON.
deserialize(
value),

error: async (
e) => {
          if (!(
e instanceof
ErrorEvent))
            return
e

          const
deserialized =
SuperJSON.
deserialize(
e.
data as any)

          if (
isORPCErrorJson(
deserialized)) {
            return
createORPCErrorFromJson(
deserialized, {
cause:
e })
          }

          return new
ErrorEvent({

data:
deserialized,

cause:
e,
          })
        },
      })
    }

    return
SuperJSON.
deserialize(
data)
  }
}
```

## SuperJson Handler [​](https://orpc.unnoq.com/docs/advanced/superjson\#superjson-handler)

ts

```
import type {
StandardRPCSerializer } from '@orpc/client/standard'
import type {
Context,
Router } from '@orpc/server'
import type {
FetchHandlerOptions } from '@orpc/server/fetch'
import {
FetchHandler } from '@orpc/server/fetch'
import {
StrictGetMethodPlugin } from '@orpc/server/plugins'
import type {
StandardHandlerOptions } from '@orpc/server/standard'
import {
StandardHandler,
StandardRPCCodec,
StandardRPCMatcher } from '@orpc/server/standard'

export interface
SuperJSONHandlerOptions<
T extends
Context> extends
StandardHandlerOptions<
T> {
  /**
   * Enable or disable the StrictGetMethodPlugin.
   *
   * @default true
   */

strictGetMethodPluginEnabled?: boolean
}

export class
SuperJSONHandler<
T extends
Context> extends
FetchHandler<
T> {
  constructor(
router:
Router<any,
T>,
options:
NoInfer<
FetchHandlerOptions<
T> &
SuperJSONHandlerOptions<
T>> = {}) {

options.
plugins ??= []

    const
strictGetMethodPluginEnabled =
options.
strictGetMethodPluginEnabled ?? true

    if (
strictGetMethodPluginEnabled) {

options.
plugins.
push(new
StrictGetMethodPlugin())
    }

    const
serializer = new
SuperJSONSerializer()
    const
matcher = new
StandardRPCMatcher()
    const
codec = new
StandardRPCCodec(
serializer as any)

    super(new
StandardHandler(
router,
matcher,
codec,
options),
options)
  }
}
```

## SuperJson Link [​](https://orpc.unnoq.com/docs/advanced/superjson\#superjson-link)

ts

```
import type {
ClientContext } from '@orpc/client'
import {
StandardLink,
StandardRPCLinkCodec } from '@orpc/client/standard'
import type {
StandardLinkOptions,
StandardRPCLinkCodecOptions,
StandardRPCSerializer } from '@orpc/client/standard'
import type {
LinkFetchClientOptions } from '@orpc/client/fetch'
import {
LinkFetchClient } from '@orpc/client/fetch'

export interface
SuperJSONLinkOptions<
T extends
ClientContext>
  extends
StandardLinkOptions<
T>,
StandardRPCLinkCodecOptions<
T>,
LinkFetchClientOptions<
T> { }

export class
SuperJSONLink<
T extends
ClientContext> extends
StandardLink<
T> {
  constructor(
options:
SuperJSONLinkOptions<
T>) {
    const
linkClient = new
LinkFetchClient(
options)
    const
serializer = new
SuperJSONSerializer()
    const
linkCodec = new
StandardRPCLinkCodec(
serializer as any,
options)

    super(
linkCodec,
linkClient,
options)
  }
}
```---
url: "https://orpc.unnoq.com/docs/advanced/validation-errors"
title: "Validation Errors - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/advanced/validation-errors#VPContent)

On this page

# Validation Errors [​](https://orpc.unnoq.com/docs/advanced/validation-errors\#validation-errors)

oRPC provides built-in validation errors that work well by default. However, you might sometimes want to customize them.

## Customizing with Client Interceptors [​](https://orpc.unnoq.com/docs/advanced/validation-errors\#customizing-with-client-interceptors)

[Client Interceptors](https://orpc.unnoq.com/docs/lifecycle) are preferred because they run before error validation, ensuring that your custom errors are properly validated.

ts

```
import {
onError,
ORPCError,
ValidationError } from '@orpc/server'
import {
ZodError } from 'zod'
import type {
ZodIssue } from 'zod'

const
handler = new
RPCHandler(
router, {

clientInterceptors: [\
\
onError((\
error) => {\
      if (\
\
error instanceof\
ORPCError\
        &&\
error.\
code === 'BAD_REQUEST'\
        &&\
error.\
cause instanceof\
ValidationError\
      ) {\
        // If you only use Zod you can safely cast to ZodIssue[]\
        const\
zodError = new\
ZodError(\
error.\
cause.\
issues as\
ZodIssue[])\
\
        throw new\
ORPCError('INPUT_VALIDATION_FAILED', {\
\
status: 422,\
\
data:\
zodError.\
flatten(),\
\
cause:\
error.\
cause,\
        })\
      }\
\
      if (\
\
error instanceof\
ORPCError\
        &&\
error.\
code === 'INTERNAL_SERVER_ERROR'\
        &&\
error.\
cause instanceof\
ValidationError\
      ) {\
        throw new\
ORPCError('OUTPUT_VALIDATION_FAILED', {\
\
cause:\
error.\
cause,\
        })\
      }\
    }),\
  ],
})
```

## Customizing with Middleware [​](https://orpc.unnoq.com/docs/advanced/validation-errors\#customizing-with-middleware)

ts

```
import {
z,
ZodError } from 'zod'
import type {
ZodIssue } from 'zod'
import {
onError,
ORPCError,
os,
ValidationError } from '@orpc/server'

const
base =
os.
use(
onError((
error) => {
  if (

error instanceof
ORPCError
    &&
error.
code === 'BAD_REQUEST'
    &&
error.
cause instanceof
ValidationError
  ) {
    // If you only use Zod you can safely cast to ZodIssue[]
    const
zodError = new
ZodError(
error.
cause.
issues as
ZodIssue[])

    throw new
ORPCError('INPUT_VALIDATION_FAILED', {

status: 422,

data:
zodError.
flatten(),

cause:
error.
cause,
    })
  }

  if (

error instanceof
ORPCError
    &&
error.
code === 'INTERNAL_SERVER_ERROR'
    &&
error.
cause instanceof
ValidationError
  ) {
    throw new
ORPCError('OUTPUT_VALIDATION_FAILED', {

cause:
error.
cause,
    })
  }
}))

const
getting =
base
  .
input(
z.
object({
id:
z.
string().
uuid() }))
  .
output(
z.
object({
id:
z.
string().
uuid(),
name:
z.
string() }))
  .
handler(async ({
input,
context }) => {
    return {
id:
input.
id,
name: 'name' }
  })
```

Every [procedure](https://orpc.unnoq.com/docs/procedure) built from `base` now uses these customized validation errors.

WARNING

Middleware applied before `.input`/ `.output` catches validation errors by default, but this behavior can be configured.

## Type‑Safe Validation Errors [​](https://orpc.unnoq.com/docs/advanced/validation-errors\#type%E2%80%90safe-validation-errors)

As explained in the [error handling guide](https://orpc.unnoq.com/docs/error-handling#combining-both-approaches), when you throw an `ORPCError` instance, if the `code` and `data` match with the errors defined in the `.errors` method, oRPC will treat it exactly as if you had thrown `errors.[code]` using the type‑safe approach.

ts

```
import {
onError,
ORPCError,
os,
ValidationError } from '@orpc/server'
import {
z,
ZodError } from 'zod'
import type {
ZodIssue } from 'zod'

const
base =
os.
errors({

INPUT_VALIDATION_FAILED: {

data:
z.
object({

formErrors:
z.
array(
z.
string()),

fieldErrors:
z.
record(
z.
string(),
z.
array(
z.
string()).
optional()),
    }),
  },
})

const
example =
base
  .
input(
z.
object({
id:
z.
string().
uuid() }))
  .
handler(() => { /** do something */ })

const
handler = new
RPCHandler({
example }, {

clientInterceptors: [\
\
onError((\
error) => {\
      if (\
\
error instanceof\
ORPCError\
        &&\
error.\
code === 'BAD_REQUEST'\
        &&\
error.\
cause instanceof\
ValidationError\
      ) {\
        // If you only use Zod you can safely cast to ZodIssue[]\
        const\
zodError = new\
ZodError(\
error.\
cause.\
issues as\
ZodIssue[])\
\
        throw new\
ORPCError('INPUT_VALIDATION_FAILED', {\
\
status: 422,\
\
data:\
zodError.\
flatten(),\
\
cause:\
error.\
cause,\
        })\
      }\
    }),\
  ],
})
```---
url: "https://orpc.unnoq.com/docs/best-practices/dedupe-middleware"
title: "Dedupe Middleware - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware#VPContent)

On this page

# Dedupe Middleware [​](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware\#dedupe-middleware)

This guide explains how to optimize your [middleware](https://orpc.unnoq.com/docs/middleware) for fast and efficient repeated execution.

## Problem [​](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware\#problem)

When a procedure [calls](https://orpc.unnoq.com/docs/client/server-side#using-the-call-utility) another procedure, overlapping middleware might be applied in both.

Similarly, when using `.use(auth).router(router)`, some procedures inside `router` might already include the `auth` middleware.

WARNING

Redundant middleware execution can hurt performance, especially if the middleware is resource-intensive.

## Solution [​](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware\#solution)

Use the `context` to track middleware execution and prevent duplication. For example:

ts

```
const
dbProvider =
os
  .
$context<{
db?:
Awaited<
ReturnType<typeof
connectDb>> }>()
  .
middleware(async ({
context,
next }) => {
    /**
     * If db already exists, skip the connection.
     */
    const
db =
context.
db ?? await
connectDb()

    return
next({
context: {
db } })
  })
```

Now `dbProvider` middleware can be safely applied multiple times without duplicating the database connection:

ts

```
const
foo =
os.
use(
dbProvider).
handler(({
context }) => 'Hello World')

const
bar =
os.
use(
dbProvider).
handler(({
context }) => {
  /**
   * Now when you call foo, the dbProvider middleware no need to connect to the database again.
   */
  const
result =
call(
foo, 'input', {
context })

  return 'Hello World'
})

/**
 * Now even when `dbProvider` is applied multiple times, it still only connects to the database once.
 */
const
router =
os
  .
use(
dbProvider)
  .
use(({
next }) => {
    // Additional middleware logic
    return
next()
  })
  .
router({

foo,

bar,
  })
```

## Built-in Dedupe Middleware [​](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware\#built-in-dedupe-middleware)

oRPC can automatically dedupe some middleware under specific conditions.

INFO

Deduplication occurs only if the router middlewares is a **subset** of the **leading** procedure middlewares and appears in the **same order**.

ts

```
const router = os.use(logging).use(dbProvider).router({
  // ✅ Deduplication occurs:
  ping: os.use(logging).use(dbProvider).use(auth).handler(({ context }) => 'ping'),
  pong: os.use(logging).use(dbProvider).handler(({ context }) => 'pong'),

  // ⛔ Deduplication does not occur:
  diff_subset: os.use(logging).handler(({ context }) => 'ping'),
  diff_order: os.use(dbProvider).use(logging).handler(({ context }) => 'pong'),
  diff_leading: os.use(monitor).use(logging).use(dbProvider).handler(({ context }) => 'bar'),
})

// --- equivalent to ---

const router = {
  // ✅ Deduplication occurs:
  ping: os.use(logging).use(dbProvider).use(auth).handler(({ context }) => 'ping'),
  pong: os.use(logging).use(dbProvider).handler(({ context }) => 'pong'),

  // ⛔ Deduplication does not occur:
  diff_subset: os.use(logging).use(dbProvider).use(logging).handler(({ context }) => 'ping'),
  diff_order: os.use(logging).use(dbProvider).use(dbProvider).use(logging).handler(({ context }) => 'pong'),
  diff_leading: os.use(logging).use(dbProvider).use(monitor).use(logging).use(dbProvider).handler(({ context }) => 'bar'),
}
```

### Configuration [​](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware\#configuration)

Disable middleware deduplication by setting `dedupeLeadingMiddlewares` to `false` in `.$config`:

ts

```
const base = os.$config({ dedupeLeadingMiddlewares: false })
```

WARNING

The deduplication behavior is safe unless you want to apply middleware multiple times.---
url: "https://orpc.unnoq.com/docs/best-practices/no-throw-literal"
title: "No Throw Literal - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/best-practices/no-throw-literal#VPContent)

On this page

# No Throw Literal [​](https://orpc.unnoq.com/docs/best-practices/no-throw-literal\#no-throw-literal)

In JavaScript, you can throw any value, but it's best to throw only `Error` instances.

ts

```
// eslint-disable-next-line no-throw-literal
throw 'error' // ✗ avoid
throw new Error('error') // ✓ recommended
```

INFO

oRPC treats thrown `Error` instances as best practice by default, as recommended by the [JavaScript Standard Style](https://standardjs.com/rules.html#throw-new-error-old-style).

## Configuration [​](https://orpc.unnoq.com/docs/best-practices/no-throw-literal\#configuration)

Customize oRPC's behavior by setting `throwableError` in the `Registry`:

ts

```
declare module '@orpc/server' { // or '@orpc/contract', or '@orpc/client'
  interface Registry {
    throwableError: Error
  }
}
```

INFO

Avoid using `any` or `unknown` for `throwableError` because doing so prevents the client from inferring [type-safe errors](https://orpc.unnoq.com/docs/client/error-handling#using-safe-and-isdefinederror). Instead, use `null | undefined | {}` (equivalent to `unknown`) for stricter error type inference.

TIP

If you configure `throwableError` as `null | undefined | {}`, adjust your code to check the `isSuccess` property instead of `error`:

ts

```
const { error, data, isSuccess } = await safe(client('input'))

if (!isSuccess) {
  if (isDefinedError(error)) {
    // handle type-safe error
  }
  // handle other errors
}
else {
  // handle success
}
```

## Bonus [​](https://orpc.unnoq.com/docs/best-practices/no-throw-literal\#bonus)

If you use ESLint, enable the [no-throw-literal](https://eslint.org/docs/rules/no-throw-literal) rule to enforce throwing only `Error` instances.---
url: "https://orpc.unnoq.com/docs/best-practices/optimize-ssr"
title: "Optimize Server-Side Rendering (SSR) for Fullstack Frameworks - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/best-practices/optimize-ssr#VPContent)

On this page

# Optimize Server-Side Rendering (SSR) for Fullstack Frameworks [​](https://orpc.unnoq.com/docs/best-practices/optimize-ssr\#optimize-server-side-rendering-ssr-for-fullstack-frameworks)

This guide demonstrates an optimized approach for setting up Server-Side Rendering (SSR) with oRPC in fullstack frameworks like Next.js, Nuxt, and SvelteKit. This method enhances performance by eliminating redundant network calls during the server rendering process.

## The Problem with Standard SSR Data Fetching [​](https://orpc.unnoq.com/docs/best-practices/optimize-ssr\#the-problem-with-standard-ssr-data-fetching)

In a typical SSR setup within fullstack frameworks, data fetching often involves the server making an HTTP request back to its own API endpoints.

![Standard SSR: Server calls its own API via HTTP.](https://orpc.unnoq.com/images/standard-ssr-diagram.svg)

This pattern works, but it introduces unnecessary overhead: the server needs to make an HTTP request to itself to fetch the data, which can add extra latency and consume resources.

Ideally, during SSR, the server should fetch data by directly invoking the relevant API logic within the same process.

![Optimized SSR: Server calls API logic directly.](https://orpc.unnoq.com/images/optimized-ssr-diagram.svg)

Fortunately, oRPC provides both a [server-side client](https://orpc.unnoq.com/docs/client/server-side) and [client-side client](https://orpc.unnoq.com/docs/client/client-side), so you can leverage the former during SSR and automatically fall back to the latter in the browser.

## Conceptual approach [​](https://orpc.unnoq.com/docs/best-practices/optimize-ssr\#conceptual-approach)

ts

```
// Use this for server-side calls
const orpc = createRouterClient(router)

// Fallback to this for client-side calls
const orpc: RouterClient<typeof router> = createORPCClient(someLink)
```

But how? A naive `typeof window === 'undefined'` check works, but exposes your router logic to the client. We need a hack that ensures server‑only code never reaches the browser.

## Implementation [​](https://orpc.unnoq.com/docs/best-practices/optimize-ssr\#implementation)

We’ll use `globalThis` to share the server client without bundling it into client code.

lib/orpc.tslib/orpc.server.ts

ts

```
import type { RouterClient } from '@orpc/server'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCClient } from '@orpc/client'

declare global {
  var $client: RouterClient<typeof router> | undefined
}

const link = new RPCLink({
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('RPCLink is not allowed on the server side.')
    }

    return new URL('/rpc', window.location.href)
  },
})

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const client: RouterClient<typeof router> = globalThis.$client ?? createORPCClient(link)
```

ts

```
'server only'

import { createRouterClient } from '@orpc/server'

globalThis.$client = createRouterClient(router, {
  /**
   * Provide initial context if needed.
   *
   * Because this client instance is shared across all requests,
   * only include context that's safe to reuse globally.
   * For per-request context, use middleware context or pass a function as the initial context.
   */
  context: async () => ({
    headers: await headers(),
  }),
})
```

`OpenAPILink` support?

When you use [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), its `JsonifiedClient` turns native values (like Date or URL) into plain JSON, so your client types no longer match the output of `createRouterClient`. To fix this, oRPC offers `createJsonifiedRouterClient`, which builds a router client that matches the output of OpenAPILink.

lib/orpc.tslib/orpc.server.ts

ts

```
import type { RouterClient } from '@orpc/server'
import type { JsonifiedClient } from '@orpc/openapi-client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { createORPCClient } from '@orpc/client'

declare global {
  var $client: JsonifiedClient<RouterClient<typeof router>> | undefined
}

const link = new OpenAPILink({
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('OpenAPILink is not allowed on the server side.')
    }

    return new URL('/api', window.location.href)
  },
})

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const client: JsonifiedClient<RouterClient<typeof router>> = globalThis.$client ?? createORPCClient(link)
```

ts

```
'server only'

import { createJsonifiedRouterClient } from '@orpc/openapi-client'

globalThis.$client = createJsonifiedRouterClient(router, {
  /**
   * Provide initial context if needed.
   *
   * Because this client instance is shared across all requests,
   * only include context that's safe to reuse globally.
   * For per-request context, use middleware context or pass a function as the initial context.
   */
  context: async () => ({
    headers: await headers(),
  }),
})
```

Finally, import `lib/orpc.server.ts` before anything else and on the **server only**. For example, in Next.js add it to `app/layout.tsx`:

ts

```
import '@/lib/orpc.server'
// Rest of the code
```

Now, importing `client` from `lib/orpc.ts` gives you a server-side client during SSR and a client-side client on the client without leaking your router logic.

## Using the client [​](https://orpc.unnoq.com/docs/best-practices/optimize-ssr\#using-the-client)

The `client` requires no special handling, just use it like regular clients.

tsx

```
export default async function PlanetListPage() {
  const planets = await client.planet.list({ limit: 10 })

  return (
    <div>
      {planets.map(planet => (
        <div key={planet.id}>{planet.name}</div>
      ))}
    </div>
  )
}
```

INFO

This example uses Next.js, but you can apply the same pattern in SvelteKit, Nuxt, or any framework.

## TanStack Query [​](https://orpc.unnoq.com/docs/best-practices/optimize-ssr\#tanstack-query)

Combining this oRPC setup with TanStack Query (React Query, Solid Query, etc.) provides a powerful pattern for data fetching, and state management, especially with Suspense hooks. Refer to these details in [Tanstack Query Integration Guide](https://orpc.unnoq.com/docs/tanstack-query/basic) and [Tanstack Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr).

tsx

```
export default function PlanetListPage() {
  const { data: planets } = useSuspenseQuery(
    orpc.planet.list.queryOptions({
      input: { limit: 10 },
    }),
  )

  return (
    <div>
      {planets.map(planet => (
        <div key={planet.id}>{planet.name}</div>
      ))}
    </div>
  )
}
```

WARNING

Above example uses suspense hooks, you might need to wrap your app within `<Suspense />` (or corresponding APIs) to make it work. In Next.js, maybe you need create `loading.tsx`.---
url: "https://orpc.unnoq.com/docs/client/client-side"
title: "Client-Side Clients - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/client/client-side#VPContent)

On this page

# Client-Side Clients [​](https://orpc.unnoq.com/docs/client/client-side\#client-side-clients)

Call your [procedures](https://orpc.unnoq.com/docs/procedure) remotely as if they were local functions.

## Installation [​](https://orpc.unnoq.com/docs/client/client-side\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/client@latest
```

sh

```
yarn add @orpc/client@latest
```

sh

```
pnpm add @orpc/client@latest
```

sh

```
bun add @orpc/client@latest
```

sh

```
deno install npm:@orpc/client@latest
```

## Creating a Client [​](https://orpc.unnoq.com/docs/client/client-side\#creating-a-client)

This guide uses [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link), so make sure your server is set up with [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) or any API that follows the [RPC Protocol](https://orpc.unnoq.com/docs/advanced/rpc-protocol).

ts

```
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { RouterClient } from '@orpc/server'
import { ContractRouterClient } from '@orpc/contract'

const link = new RPCLink({
  url: 'http://localhost:3000/rpc',
  headers: () => ({
    authorization: 'Bearer token',
  }),
  // fetch: <-- provide fetch polyfill fetch if needed
})

// Create a client for your router
const client: RouterClient<typeof router> = createORPCClient(link)
// Or, create a client using a contract
const client: ContractRouterClient<typeof contract> = createORPCClient(link)
```

TIP

You can export `RouterClient<typeof router>` and `ContractRouterClient<typeof contract>` from server instead.

## Calling Procedures [​](https://orpc.unnoq.com/docs/client/client-side\#calling-procedures)

Once your client is set up, you can call your [procedures](https://orpc.unnoq.com/docs/procedure) as if they were local functions.

ts

```
const
planet = await
client.
planet.
find({
id: 1 })

client.
planet.

create

```

## Merge Clients [​](https://orpc.unnoq.com/docs/client/client-side\#merge-clients)

In oRPC, a client is a simple object-like structure. To merge multiple clients, you simply assign each client to a property in a new object:

ts

```
const clientA: RouterClient<typeof routerA> = createORPCClient(linkA)
const clientB: RouterClient<typeof routerB> = createORPCClient(linkB)
const clientC: RouterClient<typeof routerC> = createORPCClient(linkC)

export const orpc = {
  a: clientA,
  b: clientB,
  c: clientC,
}
```

- create
- find
- list---
url: "https://orpc.unnoq.com/docs/client/dynamic-link"
title: "DynamicLink - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/client/dynamic-link#VPContent)

On this page

# DynamicLink [​](https://orpc.unnoq.com/docs/client/dynamic-link\#dynamiclink)

`DynamicLink` lets you dynamically choose between different oRPC's links based on your client context. This capability enables flexible routing of RPC requests.

## Example [​](https://orpc.unnoq.com/docs/client/dynamic-link\#example)

This example shows how the client dynamically selects between two [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link) instances based on the client context: one dedicated to cached requests and another for non-cached requests.

ts

```
import {
createORPCClient,
DynamicLink } from '@orpc/client'

interface ClientContext {

cache?: boolean
}

const
cacheLink = new
RPCLink({

url: 'https://cache.example.com/rpc',
})

const
noCacheLink = new
RPCLink({

url: 'https://example.com/rpc',
})

const
link = new
DynamicLink<ClientContext>((
options,
path,
input) => {
  if (
options.
context?.
cache) {
    return
cacheLink
  }

  return
noCacheLink
})

const
client:
RouterClient<typeof
router, ClientContext> =
createORPCClient(
link)
```

INFO

Any oRPC's link is supported, not strictly limited to `RPCLink`.---
url: "https://orpc.unnoq.com/docs/client/error-handling"
title: "Error Handling in oRPC Clients - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/client/error-handling#VPContent)

On this page

# Error Handling in oRPC Clients [​](https://orpc.unnoq.com/docs/client/error-handling\#error-handling-in-orpc-clients)

This guide explains how to handle type-safe errors in oRPC clients using [type-safe error handling](https://orpc.unnoq.com/docs/error-handling#type%E2%80%90safe-error-handling). Both [server-side](https://orpc.unnoq.com/docs/client/server-side) and [client-side](https://orpc.unnoq.com/docs/client/client-side) clients are supported.

## Using `safe` and `isDefinedError` [​](https://orpc.unnoq.com/docs/client/error-handling\#using-safe-and-isdefinederror)

ts

```
import {
isDefinedError,
safe } from '@orpc/client'

const
doSomething =
os
  .
input(
z.
object({
id:
z.
string() }))
  .
errors({

RATE_LIMIT_EXCEEDED: {

data:
z.
object({
retryAfter:
z.
number() })
    }
  })
  .
handler(async ({
input,
errors }) => {
    throw
errors.
RATE_LIMIT_EXCEEDED({
data: {
retryAfter: 1000 } })

    return {
id:
input.
id }
  })
  .
callable()

const [\
error,\
data,\
isDefined] = await
safe(
doSomething({
id: '123' }))
// or const { error, data, isDefined } = await safe(doSomething({ id: '123' }))

if (
isDefinedError(
error)) { // or isDefined
  // handle known error

console.
log(
error.
data.
retryAfter)
}
else if (
error) {
  // handle unknown error
}
else {
  // handle success

console.
log(
data)
}
```

INFO

- `safe` works like `try/catch`, but can infer error types.
- `safe` supports both tuple `[error, data, isDefined]` and object `{ error, data, isDefined }` styles.
- `isDefinedError` checks if an error originates from `.errors`.
- `isDefined` can replace `isDefinedError`---
url: "https://orpc.unnoq.com/docs/client/event-iterator"
title: "Event Iterator in oRPC Clients - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/client/event-iterator#VPContent)

On this page

# Event Iterator in oRPC Clients [​](https://orpc.unnoq.com/docs/client/event-iterator\#event-iterator-in-orpc-clients)

An [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) in oRPC behaves like an [AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator). Simply iterate over it and await each event.

## Basic Usage [​](https://orpc.unnoq.com/docs/client/event-iterator\#basic-usage)

ts

```
const
iterator = await
client.
streaming()

for await (const
event of
iterator) {

console.
log(
event.
message)
}
```

## Stopping the Stream Manually [​](https://orpc.unnoq.com/docs/client/event-iterator\#stopping-the-stream-manually)

Call `.return()` on the iterator to gracefully end the stream.

ts

```
const iterator = await client.streaming()

for await (const event of iterator) {
  if (wantToStop) {
    await iterator.return()
    break
  }

  console.log(event.message)
}
```

## Error Handling [​](https://orpc.unnoq.com/docs/client/event-iterator\#error-handling)

INFO

Unlike traditional SSE, the Event Iterator does not automatically retry on error. To enable automatic retries, refer to the [Client Retry Plugin](https://orpc.unnoq.com/docs/plugins/client-retry).

ts

```
const iterator = await client.streaming()

try {
  for await (const event of iterator) {
    console.log(event.message)
  }
}
catch (error) {
  if (error instanceof ORPCError) {
    // Handle the error here
  }
}
```

INFO

Errors thrown by the server can be instances of `ORPCError`.---
url: "https://orpc.unnoq.com/docs/client/rpc-link"
title: "RPCLink - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/client/rpc-link#VPContent)

On this page

# RPCLink [​](https://orpc.unnoq.com/docs/client/rpc-link\#rpclink)

RPCLink enables communication with an [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) or any API that follows the [RPC Protocol](https://orpc.unnoq.com/docs/advanced/rpc-protocol) using HTTP/Fetch.

WARNING

This documentation is focused on the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http). Other adapters may remove or change options to keep things simple.

## Overview [​](https://orpc.unnoq.com/docs/client/rpc-link\#overview)

Before using RPCLink, make sure your server is set up with [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) or any API that follows the [RPC Protocol](https://orpc.unnoq.com/docs/advanced/rpc-protocol).

ts

```
import { RPCLink } from '@orpc/client/fetch'

const link = new RPCLink({
  url: 'http://localhost:3000/rpc',
  headers: () => ({
    'x-api-key': 'my-api-key'
  }),
  // fetch: <-- polyfill fetch if needed
})

export const client: RouterClient<typeof router> = createORPCClient(link)
```

## Using Client Context [​](https://orpc.unnoq.com/docs/client/rpc-link\#using-client-context)

Client context lets you pass extra information when calling procedures and dynamically modify RPCLink’s behavior.

ts

```
import {
router } from './shared/planet'
import {
RouterClient } from '@orpc/server'
import {
createORPCClient } from '@orpc/client'
import {
RPCLink } from '@orpc/client/fetch'

interface ClientContext {

something?: string
}

const
link = new
RPCLink<ClientContext>({

url: 'http://localhost:3000/rpc',

headers: async ({
context }) => ({
    'x-api-key':
context?.
something ?? ''
  })
})

const
client:
RouterClient<typeof
router, ClientContext> =
createORPCClient(
link)

const
result = await
client.
planet.
list(
  {
limit: 10 },
  {
context: {
something: 'value' } }
)
```

INFO

If a property in `ClientContext` is required, oRPC enforces its inclusion when calling procedures.

## Custom Request Method [​](https://orpc.unnoq.com/docs/client/rpc-link\#custom-request-method)

By default, RPCLink sends requests via `POST`. You can override this to use methods like `GET` (for browser or CDN caching) based on your requirements.

WARNING

By default, [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) enabled [StrictGetMethodPlugin](https://orpc.unnoq.com/docs/rpc-handler#default-plugins) which blocks GET requests except for procedures explicitly allowed. please refer to [StrictGetMethodPlugin](https://orpc.unnoq.com/docs/plugins/strict-get-method) for more details.

ts

```
import {
RPCLink } from '@orpc/client/fetch'

interface ClientContext {

cache?:
RequestCache
}

const
link = new
RPCLink<ClientContext>({

url: 'http://localhost:3000/rpc',

method: ({
context },
path) => {
    if (
context?.
cache) {
      return 'GET'
    }

    const
lastSegment =
path.
at(-1)
    if (
lastSegment && /get|find|list|search/i.
test(
lastSegment)) {
      return 'GET'
    }

    return 'POST'
  },

fetch: (
request,
init, {
context }) =>
globalThis.
fetch(
request, {
    ...
init,

cache:
context?.
cache,
  }),
})
```

## Lazy URL [​](https://orpc.unnoq.com/docs/client/rpc-link\#lazy-url)

You can define `url` as a function, ensuring compatibility with environments that may lack certain runtime APIs.

ts

```
const link = new RPCLink({
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('RPCLink is not allowed on the server side.')
    }

    return new URL('/rpc', window.location.href)
  },
})
```

## SSE Like Behavior [​](https://orpc.unnoq.com/docs/client/rpc-link\#sse-like-behavior)

Unlike traditional SSE, the [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) does not automatically retry on error. To enable automatic retries, refer to the [Client Retry Plugin](https://orpc.unnoq.com/docs/plugins/client-retry).

## Event Iterator Keep Alive [​](https://orpc.unnoq.com/docs/client/rpc-link\#event-iterator-keep-alive)

WARNING

These options for sending [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) from **client to the server**, not from **the server to client** as used in [RPCHandler Event Iterator Keep Alive](https://orpc.unnoq.com/docs/rpc-handler#event-iterator-keep-alive) or [OpenAPIHandler Event Iterator Keep Alive](https://orpc.unnoq.com/docs/openapi/openapi-handler#event-iterator-keep-alive).

**In 99% of cases, you don't need to configure these options.**

To keep [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) connections alive, `RPCLink` periodically sends a ping comment to the server. You can configure this behavior using the following options:

- `eventIteratorKeepAliveEnabled` (default: `true`) – Enables or disables pings.
- `eventIteratorKeepAliveInterval` (default: `5000`) – Time between pings (in milliseconds).
- `eventIteratorKeepAliveComment` (default: `''`) – Custom content for ping messages.

ts

```
const link = new RPCLink({
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000, // 5 seconds
  eventIteratorKeepAliveComment: '',
})
```---
url: "https://orpc.unnoq.com/docs/client/server-side"
title: "Server-Side Clients - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/client/server-side#VPContent)

On this page

# Server-Side Clients [​](https://orpc.unnoq.com/docs/client/server-side\#server-side-clients)

Call your [procedures](https://orpc.unnoq.com/docs/procedure) in the same environment as your server—no proxies required like native functions.

## Calling Procedures [​](https://orpc.unnoq.com/docs/client/server-side\#calling-procedures)

oRPC offers multiple methods to invoke a [procedure](https://orpc.unnoq.com/docs/procedure).

### Using `.callable` [​](https://orpc.unnoq.com/docs/client/server-side\#using-callable)

Define your procedure and turn it into a callable procedure:

ts

```
import {
os } from '@orpc/server'
import {
z } from 'zod'

const
getProcedure =
os
  .
input(
z.
object({
id:
z.
string() }))
  .
handler(async ({
input }) => ({
id:
input.
id }))
  .
callable({

context: {} // Provide initial context if needed
  })

const
result = await
getProcedure({
id: '123' })
```

### Using the `call` Utility [​](https://orpc.unnoq.com/docs/client/server-side\#using-the-call-utility)

Alternatively, call your procedure using the `call` helper:

ts

```
import {
z } from 'zod'
import {
call,
os } from '@orpc/server'

const
getProcedure =
os
  .
input(
z.
object({
id:
z.
string() }))
  .
handler(async ({
input }) => ({
id:
input.
id }))

const
result = await
call(
getProcedure, {
id: '123' }, {

context: {} // Provide initial context if needed
})
```

## Router Client [​](https://orpc.unnoq.com/docs/client/server-side\#router-client)

Create a [router](https://orpc.unnoq.com/docs/router) based client to access multiple procedures:

ts

```
import {
createRouterClient,
os } from '@orpc/server'

const
ping =
os.
handler(() => 'pong')
const
pong =
os.
handler(() => 'ping')

const
client =
createRouterClient({
ping,
pong }, {

context: {} // Provide initial context if needed
})

const
result = await
client.
ping()
```

### Client Context [​](https://orpc.unnoq.com/docs/client/server-side\#client-context)

You can define a client context to pass additional information when calling procedures. This is useful for modifying procedure behavior dynamically.

ts

```
interface ClientContext {

cache?: boolean
}

const
ping =
os.
handler(() => 'pong')
const
pong =
os.
handler(() => 'ping')

const
client =
createRouterClient({
ping,
pong }, {

context: ({
cache }: ClientContext) => {
    if (
cache) {
      return {} // <-- context when cache enabled
    }

    return {} // <-- context when cache disabled
  }
})

const
result = await
client.
ping(
undefined, {
context: {
cache: true } })
```

INFO

If `ClientContext` contains a required property, oRPC enforces that the client provides it when calling a procedure.---
url: "https://orpc.unnoq.com/docs/comparison"
title: "Comparison - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/comparison#VPContent)

Return to top

# Comparison [​](https://orpc.unnoq.com/docs/comparison\#comparison)

This comparison table helps you understand how oRPC differs from other popular TypeScript RPC and REST solutions.

- ✅ First-class, built-in support
- 🟡 Lacks features, or requires third-party integrations
- 🛑 Not supported or not documented

| Feature | oRPC docs | oRPC | tRPC | ts-rest |
| --- | --- | --- | --- | --- |
| End-to-end Typesafe Input/Output |  | ✅ | ✅ | ✅ |
| End-to-end Typesafe Errors | [1](https://orpc.unnoq.com/docs/client/error-handling), [2](https://orpc.unnoq.com/docs/error-handling#type%E2%80%90safe-error-handling) | ✅ | 🟡 | ✅ |
| End-to-end Typesafe File/Blob | [1](https://orpc.unnoq.com/docs/file-upload-download) | ✅ | 🟡 | 🛑 |
| End-to-end Typesafe Streaming | [1](https://orpc.unnoq.com/docs/event-iterator) | ✅ | ✅ | 🛑 |
| Tanstack Query Integration (React) | [1](https://orpc.unnoq.com/docs/tanstack-query/react) | ✅ | ✅ | 🟡 |
| Tanstack Query Integration (Vue) | [1](https://orpc.unnoq.com/docs/tanstack-query/vue) | ✅ | 🛑 | 🟡 |
| Tanstack Query Integration (Solid) | [1](https://orpc.unnoq.com/docs/tanstack-query/solid) | ✅ | 🛑 | 🟡 |
| Tanstack Query Integration (Svelte) | [1](https://orpc.unnoq.com/docs/tanstack-query/svelte) | ✅ | 🛑 | 🛑 |
| Vue Pinia Colada Integration | [1](https://orpc.unnoq.com/docs/pinia-colada) | ✅ | 🛑 | 🛑 |
| With Contract-First Approach | [1](https://orpc.unnoq.com/docs/contract-first/define-contract) | ✅ | 🛑 | ✅ |
| Without Contract-First Approach |  | ✅ | ✅ | 🛑 |
| OpenAPI Support | [1](https://orpc.unnoq.com/docs/openapi/openapi-handler) | ✅ | 🟡 | 🟡 |
| OpenAPI Support for multiple schema | [1](https://orpc.unnoq.com/docs/openapi/openapi-handler) | ✅ | 🛑 | 🛑 |
| OpenAPI Bracket Notation Support | [1](https://orpc.unnoq.com/docs/openapi/bracket-notation) | ✅ | 🛑 | 🛑 |
| Server Actions Support | [1](https://orpc.unnoq.com/docs/server-action) | ✅ | ✅ | 🛑 |
| Lazy Router | [1](https://orpc.unnoq.com/docs/router#lazy-router) | ✅ | ✅ | 🛑 |
| Native Types (Date, URL, Set, Maps, ...) | [1](https://orpc.unnoq.com/docs/rpc-handler#supported-data-types) | ✅ | 🟡 | 🛑 |
| Streaming response (SSE) | [1](https://orpc.unnoq.com/docs/event-iterator) | ✅ | ✅ | 🛑 |
| Standard Schema (Zod, Valibot, ArkType, ...) |  | ✅ | ✅ | 🛑 |
| Built-in Plugins (CORS, CSRF, Retry, ...) |  | ✅ | 🛑 | 🛑 |
| Batch Request/Response | [1](https://orpc.unnoq.com/docs/plugins/batch-request-response) | ✅ | ✅ | 🛑 |
| WebSockets | [1](https://orpc.unnoq.com/docs/adapters/websocket) | ✅ | ✅ | 🛑 |
| Nest.js integration | [1](https://orpc.unnoq.com/docs/openapi/nest/implement-contract) | ✅ | 🟡 | ✅ |---
url: "https://orpc.unnoq.com/docs/context"
title: "Context - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/context#VPContent)

On this page

# Context in oRPC [​](https://orpc.unnoq.com/docs/context\#context-in-orpc)

oRPC’s context mechanism provides a type-safe dependency injection pattern. It lets you supply required dependencies either explicitly or dynamically through middleware. There are two types:

- **Initial Context:** Provided explicitly when invoking a procedure.
- **Execution Context:** Generated during procedure execution, typically by middleware.

## Initial Context [​](https://orpc.unnoq.com/docs/context\#initial-context)

Initial context is used to define required dependencies (usually environment-specific) that must be passed when calling a procedure.

ts

```
const
base =
os.
$context<{
headers: Headers,
env: {
DB_URL: string } }>()

const
getting =
base
  .
handler(async ({
context }) => {

console.
log(
context.
env)
  })

export const
router = {
getting }
```

When calling that requires initial context, pass it explicitly:

ts

```
import {
RPCHandler } from '@orpc/server/fetch'

const
handler = new
RPCHandler(
router)

export default function
fetch(
request: Request) {

handler.
handle(
request, {

context: { // <-- you must pass initial context here

headers:
request.
headers,

env: {

DB_URL: '***'
      }
    }
  })
}
```

## Execution context [​](https://orpc.unnoq.com/docs/context\#execution-context)

Execution context is computed during the process lifecycle—usually via [middleware](https://orpc.unnoq.com/docs/middleware). It can be used independently or combined with initial context.

ts

```
import {
cookies,
headers } from 'next/headers'

const
base =
os.
use(async ({
next }) =>
next({

context: {

headers: await
headers(),

cookies: await
cookies(),
  },
}))

const
getting =
base.
handler(async ({
context }) => {

context.
cookies.
set('key', 'value')
})

export const
router = {
getting }
```

When using execution context, you don’t need to pass any context manually:

ts

```
import {
RPCHandler } from '@orpc/server/fetch'

const
handler = new
RPCHandler(
router)

export default function
fetch(
request: Request) {

handler.
handle(
request) // <-- no need to pass anything more
}
```

## Combining Initial and Execution Context [​](https://orpc.unnoq.com/docs/context\#combining-initial-and-execution-context)

Often you need both static and dynamic dependencies. Use initial context for environment-specific values (e.g., database URLs) and middleware (execution context) for runtime data (e.g., user authentication).

ts

```
const
base =
os.
$context<{
headers: Headers,
env: {
DB_URL: string } }>()

const
requireAuth =
base.
middleware(async ({
context,
next }) => {
  const
user =
parseJWT(
context.
headers.
get('authorization')?.
split(' ')[1])

  if (
user) {
    return
next({
context: {
user } })
  }

  throw new
ORPCError('UNAUTHORIZED')
})

const
dbProvider =
base.
middleware(async ({
context,
next }) => {
  const
client = new
Client(
context.
env.
DB_URL)

  try {
    await
client.
connect()
    return
next({
context: {
db:
client } })
  }
  finally {
    await
client.
disconnect()
  }
})

const
getting =
base
  .
use(
dbProvider)
  .
use(
requireAuth)
  .
handler(async ({
context }) => {

console.
log(
context.
db)

console.
log(
context.
user)
  })

```---
url: "https://orpc.unnoq.com/docs/contract-first/define-contract"
title: "Define Contract - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/contract-first/define-contract#VPContent)

On this page

# Define Contract [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#define-contract)

**Contract-first development** is a design pattern where you define the API contract before writing any implementation code. This methodology promotes a well-structured codebase that adheres to best practices and facilitates easier maintenance and evolution over time.

In oRPC, a **contract** specifies the rules and expectations for a procedure. It details the input, output, errors,... types and can include constraints or validations to ensure that both client and server share a clear, consistent interface.

## Installation [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/contract@latest
```

sh

```
yarn add @orpc/contract@latest
```

sh

```
pnpm add @orpc/contract@latest
```

sh

```
bun add @orpc/contract@latest
```

sh

```
deno install npm:@orpc/contract@latest
```

## Procedure Contract [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#procedure-contract)

A procedure contract in oRPC is similar to a standard [procedure](https://orpc.unnoq.com/docs/procedure) definition, but with extraneous APIs removed to better support contract-first development.

ts

```
import {
oc } from '@orpc/contract'

export const
exampleContract =
oc
  .
input(

z.
object({

name:
z.
string(),

age:
z.
number().
int().
min(0),
    }),
  )
  .
output(

z.
object({

id:
z.
number().
int().
min(0),

name:
z.
string(),

age:
z.
number().
int().
min(0),
    }),
  )
```

## Contract Router [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#contract-router)

Similar to the standard [router](https://orpc.unnoq.com/docs/router) in oRPC, the contract router organizes your defined contracts into a structured hierarchy. The contract router is streamlined by removing APIs that are not essential for contract-first development.

ts

```
export const routerContract = {
  example: exampleContract,
  nested: {
    example: exampleContract,
  },
}
```

## Full Example [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#full-example)

Below is a complete example demonstrating how to define a contract for a simple "Planet" service. This example extracted from our [Getting Started](https://orpc.unnoq.com/docs/getting-started) guide.

ts

```
export const
PlanetSchema =
z.
object({

id:
z.
number().
int().
min(1),

name:
z.
string(),

description:
z.
string().
optional(),
})

export const
listPlanetContract =
oc
  .
input(

z.
object({

limit:
z.
number().
int().
min(1).
max(100).
optional(),

cursor:
z.
number().
int().
min(0).
default(0),
    }),
  )
  .
output(
z.
array(
PlanetSchema))

export const
findPlanetContract =
oc
  .
input(
PlanetSchema.
pick({
id: true }))
  .
output(
PlanetSchema)

export const
createPlanetContract =
oc
  .
input(
PlanetSchema.
omit({
id: true }))
  .
output(
PlanetSchema)

export const
contract = {

planet: {

list:
listPlanetContract,

find:
findPlanetContract,

create:
createPlanetContract,
  },
}
```

## Utilities [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#utilities)

### Infer Contract Router Input [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#infer-contract-router-input)

ts

```
import type {
InferContractRouterInputs } from '@orpc/contract'

export type
Inputs =
InferContractRouterInputs<typeof
contract>

type
FindPlanetInput =
Inputs['planet']['find']
```

This snippet automatically extracts the expected input types for each procedure in the router.

### Infer Contract Router Output [​](https://orpc.unnoq.com/docs/contract-first/define-contract\#infer-contract-router-output)

ts

```
import type {
InferContractRouterOutputs } from '@orpc/contract'

export type
Outputs =
InferContractRouterOutputs<typeof
contract>

type
FindPlanetOutput =
Outputs['planet']['find']
```

Similarly, this utility infers the output types, ensuring that your application correctly handles the results from each procedure.---
url: "https://orpc.unnoq.com/docs/contract-first/implement-contract"
title: "Implement Contract - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/contract-first/implement-contract#VPContent)

On this page

# Implement Contract [​](https://orpc.unnoq.com/docs/contract-first/implement-contract\#implement-contract)

After defining your contract, the next step is to implement it in your server code. oRPC enforces your contract at runtime, ensuring that your API consistently adheres to its specifications.

## Installation [​](https://orpc.unnoq.com/docs/contract-first/implement-contract\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/server@latest
```

sh

```
yarn add @orpc/server@latest
```

sh

```
pnpm add @orpc/server@latest
```

sh

```
bun add @orpc/server@latest
```

sh

```
deno install npm:@orpc/server@latest
```

## The Implementer [​](https://orpc.unnoq.com/docs/contract-first/implement-contract\#the-implementer)

The `implement` function converts your contract into an implementer instance. This instance compatible with the original `os` from `@orpc/server` provides a type-safe interface to define your procedures and supports features like [Middleware](https://orpc.unnoq.com/docs/middleware) and [Context](https://orpc.unnoq.com/docs/context).

ts

```
import {
implement } from '@orpc/server'

const
os =
implement(
contract) // fully replaces the os from @orpc/server
```

## Implementing Procedures [​](https://orpc.unnoq.com/docs/contract-first/implement-contract\#implementing-procedures)

Define a procedure by attaching a `.handler` to its corresponding contract, ensuring it adheres to the contract’s specifications.

ts

```
export const
listPlanet =
os.
planet.
list
  .
handler(({
input }) => {
    // Your logic for listing planets
    return []
  })
```

## Building the Router [​](https://orpc.unnoq.com/docs/contract-first/implement-contract\#building-the-router)

To assemble your API, create a router at the root level using `.router`. This ensures that the entire router is type-checked and enforces the contract at runtime.

ts

```
const router = os.router({ // <-- Essential for full contract enforcement
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
})
```

## Full Implementation Example [​](https://orpc.unnoq.com/docs/contract-first/implement-contract\#full-implementation-example)

Below is a complete implementation of the contract defined in the [previous section](https://orpc.unnoq.com/docs/contract-first/define-contract).

ts

```
const
os =
implement(
contract)

export const
listPlanet =
os.
planet.
list
  .
handler(({
input }) => {
    return []
  })

export const
findPlanet =
os.
planet.
find
  .
handler(({
input }) => {
    return {
id: 123,
name: 'Planet X' }
  })

export const
createPlanet =
os.
planet.
create
  .
handler(({
input }) => {
    return {
id: 123,
name: 'Planet X' }
  })

export const
router =
os.
router({

planet: {

list:
listPlanet,

find:
findPlanet,

create:
createPlanet,
  },
})
```---
url: "https://orpc.unnoq.com/docs/ecosystem"
title: "Ecosystem - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/ecosystem#VPContent)

On this page

# Ecosystem [​](https://orpc.unnoq.com/docs/ecosystem\#ecosystem)

INFO

If your project is missing here, please [open a PR](https://github.com/unnoq/orpc/edit/main/apps/content/docs/ecosystem.md) to add it.

## Starter Kits [​](https://orpc.unnoq.com/docs/ecosystem\#starter-kits)

| Name | Stars | Description |
| --- | --- | --- |
| [Zap.ts](https://zap-ts.alexandretrotel.org/) | [![Stars](https://img.shields.io/github/stars/alexandretrotel/zap.ts?style=flat)](https://github.com/alexandretrotel/zap.ts) | Next.js boilerplate designed to help you build applications faster using a modern set of tools. |
| [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) | [![Stars](https://img.shields.io/github/stars/AmanVarshney01/create-better-t-stack?style=flat)](https://github.com/AmanVarshney01/create-better-t-stack) | A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations |

## Tools [​](https://orpc.unnoq.com/docs/ecosystem\#tools)

| Name | Stars | Description |
| --- | --- | --- |
| [orpc-file-based-router](https://github.com/zeeeeby/orpc-file-based-router) | [![Stars](https://img.shields.io/github/stars/zeeeeby/orpc-file-based-router?style=flat)](https://github.com/zeeeeby/orpc-file-based-router) | Automatically creates an oRPC router configuration based on your file structure, similar to Next.js, express-file-routing |
| [Vertrag](https://github.com/Quatton/vertrag) | [![Stars](https://img.shields.io/github/stars/Quatton/vertrag?style=flat)](https://github.com/Quatton/vertrag) | A spec-first API development tool (oRPC contract + any backend language) |

## Libraries [​](https://orpc.unnoq.com/docs/ecosystem\#libraries)

| Name | Stars | Description |
| --- | --- | --- |
| [Permix](https://permix.letstri.dev/) | [![Stars](https://img.shields.io/github/stars/letstri/permix?style=flat)](https://github.com/letstri/permix) | lightweight, framework-agnostic, type-safe permissions management library |---
url: "https://orpc.unnoq.com/docs/error-handling"
title: "Error Handling - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/error-handling#VPContent)

On this page

# Error Handling in oRPC [​](https://orpc.unnoq.com/docs/error-handling\#error-handling-in-orpc)

oRPC offers a robust error handling system. You can either throw standard JavaScript errors or, preferably, use the specialized `ORPCError` class to utilize oRPC features.

There are two primary approaches:

- **Normal Approach:** Throw errors directly (using `ORPCError` is recommended for clarity).
- **Type‑Safe Approach:** Predefine error types so that clients can infer and handle errors in a type‑safe manner.

WARNING

The `ORPCError.data` property is sent to the client. Avoid including sensitive information.

## Normal Approach [​](https://orpc.unnoq.com/docs/error-handling\#normal-approach)

In the traditional approach you may throw any JavaScript error. However, using the `ORPCError` class improves consistency and ensures that error codes and optional data are handled appropriately.

**Key Points:**

- The first argument is the error code.
- You may optionally include a message, additional error data, or any standard error options.

ts

```
const rateLimit = os.middleware(async ({ next }) => {
  throw new ORPCError('RATE_LIMITED', {
    message: 'You are being rate limited',
    data: { retryAfter: 60 }
  })
  return next()
})

const example = os
  .use(rateLimit)
  .handler(async ({ input }) => {
    throw new ORPCError('NOT_FOUND')
    throw new Error('Something went wrong') // <-- will be converted to INTERNAL_SERVER_ERROR
  })
```

DANGER

Do not pass sensitive data in the `ORPCError.data` field.

## Type‑Safe Error Handling [​](https://orpc.unnoq.com/docs/error-handling\#type%E2%80%90safe-error-handling)

For a fully type‑safe error management experience, define your error types using the `.errors` method. This lets the client infer the error’s structure and handle it accordingly. You can use any [Standard Schema](https://github.com/standard-schema/standard-schema?tab=readme-ov-file#what-schema-libraries-implement-the-spec) library to validate error data.

ts

```
const
base =
os.
errors({ // <-- common errors

RATE_LIMITED: {

data:
z.
object({

retryAfter:
z.
number(),
    }),
  },

UNAUTHORIZED: {},
})

const
rateLimit =
base.
middleware(async ({
next,
errors }) => {
  throw
errors.
RATE_LIMITED({

message: 'You are being rate limited',

data: {
retryAfter: 60 }
  })
  return
next()
})

const
example =
base
  .
use(
rateLimit)
  .
errors({

NOT_FOUND: {

message: 'The resource was not found', // <-- default message
    },
  })
  .
handler(async ({
input,
errors }) => {
    throw
errors.
NOT_FOUND()
  })
```

DANGER

Again, avoid including any sensitive data in the error data since it will be exposed to the client.

Learn more about [Client Error Handling](https://orpc.unnoq.com/docs/client/error-handling).

## Combining Both Approaches [​](https://orpc.unnoq.com/docs/error-handling\#combining-both-approaches)

You can combine both strategies seamlessly. When you throw an `ORPCError` instance, if the `code` and `data` match with the errors defined in the `.errors` method, oRPC will treat it exactly as if you had thrown `errors.[code]` using the type‑safe approach.

ts

```
const base = os.errors({ // <-- common errors
  RATE_LIMITED: {
    data: z.object({
      retryAfter: z.number().int().min(1).default(1),
    }),
  },
  UNAUTHORIZED: {},
})

const rateLimit = base.middleware(async ({ next, errors }) => {
  throw errors.RATE_LIMITED({
    message: 'You are being rate limited',
    data: { retryAfter: 60 }
  })
  // OR --- both are equivalent
  throw new ORPCError('RATE_LIMITED', {
    message: 'You are being rate limited',
    data: { retryAfter: 60 }
  })
  return next()
})

const example = base
  .use(rateLimit)
  .handler(async ({ input }) => {
    throw new ORPCError('BAD_REQUEST') // <-- unknown error
  })
```

DANGER

Remember: Since `ORPCError.data` is transmitted to the client, do not include any sensitive information.---
url: "https://orpc.unnoq.com/docs/event-iterator"
title: "Event Iterator (SSE) - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/event-iterator#VPContent)

On this page

# Event Iterator (SSE) [​](https://orpc.unnoq.com/docs/event-iterator\#event-iterator-sse)

oRPC provides built‑in support for streaming responses, real‑time updates, and server-sent events (SSE) without any extra configuration. This functionality is ideal for applications that require live updates—such as AI chat responses, live sports scores, or stock market data.

## Overview [​](https://orpc.unnoq.com/docs/event-iterator\#overview)

The event iterator is defined by an asynchronous generator function. In the example below, the handler continuously yields a new event every second:

ts

```
const example = os
  .handler(async function* ({ input, lastEventId }) {
    while (true) {
      yield { message: 'Hello, world!' }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  })
```

Learn how to consume the event iterator on the client [here](https://orpc.unnoq.com/docs/client/event-iterator)

## Validate Event Iterator [​](https://orpc.unnoq.com/docs/event-iterator\#validate-event-iterator)

oRPC includes a built‑in `eventIterator` helper that works with any [Standard Schema](https://github.com/standard-schema/standard-schema?tab=readme-ov-file#what-schema-libraries-implement-the-spec) library to validate events.

ts

```
import { eventIterator } from '@orpc/server'

const example = os
  .output(eventIterator(z.object({ message: z.string() })))
  .handler(async function* ({ input, lastEventId }) {
    while (true) {
      yield { message: 'Hello, world!' }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  })
```

## Last Event ID & Event Metadata [​](https://orpc.unnoq.com/docs/event-iterator\#last-event-id-event-metadata)

Using the `withEventMeta` helper, you can attach [additional event meta](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format) (such as an event ID or a retry interval) to each event.

INFO

When used with [Client Retry Plugin](https://orpc.unnoq.com/docs/plugins/client-retry) or [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource), the client will reconnect with the last event ID. This value is made available to your handler as `lastEventId`, allowing you to resume the stream seamlessly.

ts

```
import { withEventMeta } from '@orpc/server'

const example = os
  .handler(async function* ({ input, lastEventId }) {
    if (lastEventId) {
      // Resume streaming from lastEventId
    }
    else {
      while (true) {
        yield withEventMeta({ message: 'Hello, world!' }, { id: 'some-id', retry: 10_000 })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  })
```

## Stop Event Iterator [​](https://orpc.unnoq.com/docs/event-iterator\#stop-event-iterator)

To signal the end of the stream, simply use a `return` statement. When the handler returns, oRPC marks the stream as successfully completed.

WARNING

This behavior is exclusive to oRPC. Standard [SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) clients, such as those using [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) will automatically reconnect when the connection closes.

ts

```
const example = os
  .handler(async function* ({ input, lastEventId }) {
    while (true) {
      if (done) {
        return
      }

      yield { message: 'Hello, world!' }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  })
```

## Cleanup Side-Effects [​](https://orpc.unnoq.com/docs/event-iterator\#cleanup-side-effects)

If the client closes the connection or an unexpected error occurs, you can use a `finally` block to clean up any side effects (for example, closing database connections or stopping background tasks):

ts

```
const example = os
  .handler(async function* ({ input, lastEventId }) {
    try {
      while (true) {
        yield { message: 'Hello, world!' }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    finally {
      console.log('Cleanup logic here')
    }
  })
```---
url: "https://orpc.unnoq.com/docs/file-upload-download"
title: "File Upload and Download - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/file-upload-download#VPContent)

On this page

# File Operations in oRPC [​](https://orpc.unnoq.com/docs/file-upload-download\#file-operations-in-orpc)

oRPC natively supports file uploads and downloads using standard [File](https://developer.mozilla.org/en-US/docs/Web/API/File) and [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects, requiring no additional configuration.

TIP

For files larger than 100MB, we recommend using a dedicated upload solution for better performance and reliability, since oRPC does not support chunked or resumable uploads.

## Validation [​](https://orpc.unnoq.com/docs/file-upload-download\#validation)

oRPC uses the standard [File](https://developer.mozilla.org/en-US/docs/Web/API/File) and [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects to handle file operations. To validate file uploads and downloads, you can use the `z.instanceof(File)` and `z.instanceof(Blob)` validators, or equivalent schemas in libraries like Valibot or Arktype.

ts

```
const
example =
os
  .
input(
z.
object({
file:
z.
instanceof(
File) }))
  .
output(
z.
object({
file:
z.
instanceof(
File) }))
  .
handler(async ({
input }) => {

console.
log(
input.
file.
name)
    return {
file:
input.
file }
  })
```

INFO

If you are using Node.js 18, you can import the `File` class from the `buffer` module.---
url: "https://orpc.unnoq.com/docs/getting-started"
title: "Getting Started - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/getting-started#VPContent)

On this page

# Getting Started [​](https://orpc.unnoq.com/docs/getting-started\#getting-started)

oRPC (OpenAPI Remote Procedure Call) combines RPC (Remote Procedure Call) with OpenAPI, allowing you to define and call remote (or local) procedures through a type-safe API while adhering to the OpenAPI specification.

oRPC simplifies RPC service definition, making it easy to build scalable applications—from simple scripts to complex microservices.

This guide covers the basics: defining procedures, handling errors, and integrating with popular frameworks.

## Prerequisites [​](https://orpc.unnoq.com/docs/getting-started\#prerequisites)

- Node.js 18+ (20+ recommended) \| Bun \| Deno \| Cloudflare Workers
- A package manager: npm \| pnpm \| yarn \| bun \| deno
- A TypeScript project (strict mode recommended)

## Installation [​](https://orpc.unnoq.com/docs/getting-started\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/server@latest @orpc/client@latest
```

sh

```
yarn add @orpc/server@latest @orpc/client@latest
```

sh

```
pnpm add @orpc/server@latest @orpc/client@latest
```

sh

```
bun add @orpc/server@latest @orpc/client@latest
```

sh

```
deno install npm:@orpc/server@latest npm:@orpc/client@latest
```

## Define App Router [​](https://orpc.unnoq.com/docs/getting-started\#define-app-router)

We'll use [Zod](https://github.com/colinhacks/zod) for schema validation (optional, any [standard schema](https://github.com/standard-schema/standard-schema) is supported).

ts

```
import type { IncomingHttpHeaders } from 'node:http'
import {
ORPCError,
os } from '@orpc/server'
import {
z } from 'zod'

const
PlanetSchema =
z.
object({

id:
z.
number().
int().
min(1),

name:
z.
string(),

description:
z.
string().
optional(),
})

export const
listPlanet =
os
  .
input(

z.
object({

limit:
z.
number().
int().
min(1).
max(100).
optional(),

cursor:
z.
number().
int().
min(0).
default(0),
    }),
  )
  .
handler(async ({
input }) => {
    // your list code here
    return [{\
id: 1,\
name: 'name' }]
  })

export const
findPlanet =
os
  .
input(
PlanetSchema.
pick({
id: true }))
  .
handler(async ({
input }) => {
    // your find code here
    return {
id: 1,
name: 'name' }
  })

export const
createPlanet =
os
  .
$context<{
headers: IncomingHttpHeaders }>()
  .
use(({
context,
next }) => {
    const
user =
parseJWT(
context.
headers.
authorization?.
split(' ')[1])

    if (
user) {
      return
next({
context: {
user } })
    }

    throw new
ORPCError('UNAUTHORIZED')
  })
  .
input(
PlanetSchema.
omit({
id: true }))
  .
handler(async ({
input,
context }) => {
    // your create code here
    return {
id: 1,
name: 'name' }
  })

export const
router = {

planet: {

list:
listPlanet,

find:
findPlanet,

create:
createPlanet
  }
}

```

## Create Server [​](https://orpc.unnoq.com/docs/getting-started\#create-server)

Using [Node.js](https://orpc.unnoq.com/docs/adapters/http) as the server runtime, but oRPC also supports other runtimes like Bun, Deno, Cloudflare Workers, etc.

ts

```
import {
createServer } from 'node:http'
import {
RPCHandler } from '@orpc/server/node'
import {
CORSPlugin } from '@orpc/server/plugins'

const
handler = new
RPCHandler(
router, {

plugins: [new\
CORSPlugin()]
})

const
server =
createServer(async (
req,
res) => {
  const
result = await
handler.
handle(
req,
res, {

context: {
headers:
req.
headers }
  })

  if (!
result.
matched) {

res.
statusCode = 404

res.
end('No procedure matched')
  }
})

server.
listen(
  3000,
  '127.0.0.1',
  () =>
console.
log('Listening on 127.0.0.1:3000')
)
```

Learn more about [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler).

## Create Client [​](https://orpc.unnoq.com/docs/getting-started\#create-client)

ts

```
import type {
RouterClient } from '@orpc/server'
import {
createORPCClient } from '@orpc/client'
import {
RPCLink } from '@orpc/client/fetch'

const
link = new
RPCLink({

url: 'http://127.0.0.1:3000',

headers: {
Authorization: 'Bearer token' },
})

export const
orpc:
RouterClient<typeof
router> =
createORPCClient(
link)
```

Supports both [client-side clients](https://orpc.unnoq.com/docs/client/client-side) and [server-side clients](https://orpc.unnoq.com/docs/client/server-side).

## Call Procedure [​](https://orpc.unnoq.com/docs/getting-started\#call-procedure)

End-to-end type-safety and auto-completion out of the box.

ts

```
const
planet = await
orpc.
planet.
find({
id: 1 })

orpc.
planet.

create

```

## Next Steps [​](https://orpc.unnoq.com/docs/getting-started\#next-steps)

This guide introduced the RPC aspects of oRPC. To explore OpenAPI integration, visit the [OpenAPI Guide](https://orpc.unnoq.com/docs/openapi/getting-started).

- create
- find
- list---
url: "https://orpc.unnoq.com/docs/integrations/astro"
title: "Astro Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/astro#VPContent)

On this page

# Astro Integration [​](https://orpc.unnoq.com/docs/integrations/astro\#astro-integration)

[Astro](https://astro.build/) is a JavaScript web framework optimized for building fast, content-driven websites. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/astro\#basic)

pages/rpc/\[...rest\
\
ts\
\
```\
import { RPCHandler } from '@orpc/server/fetch'\
\
const handler = new RPCHandler(router)\
\
export const prerender = false\
\
export const ALL: APIRoute = async ({ request }) => {\
  const { response } = await handler.handle(request, {\
    prefix: '/rpc',\
    context: {},\
  })\
\
  return response ?? new Response('Not found', { status: 404 })\
}\
```\
\
INFO\
\
The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/elysia"
title: "Elysia Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/elysia#VPContent)

On this page

# Elysia Integration [​](https://orpc.unnoq.com/docs/integrations/elysia\#elysia-integration)

[Elysia](https://elysiajs.com/) is a high-performance web framework for [Bun](https://bun.sh/) that adheres to the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/elysia\#basic)

ts

```
import { Elysia } from 'elysia'
import { OpenAPIHandler } from '@orpc/openapi/fetch'

const handler = new OpenAPIHandler(router)

const app = new Elysia()
  .all('/rpc*', async ({ request }: { request: Request }) => {
    const { response } = await handler.handle(request, {
      prefix: '/rpc',
    })

    return response ?? new Response('Not Found', { status: 404 })
  })
  .listen(3000)

console.log(
  `🦊 Elysia is running at http://localhost:3000`
)
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/express"
title: "Express.js Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/express#VPContent)

On this page

# Express.js Integration [​](https://orpc.unnoq.com/docs/integrations/express\#express-js-integration)

[Express.js](https://expressjs.com/) is a popular Node.js framework for building web applications. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

WARNING

oRPC uses its own request parser. To avoid conflicts, register any body-parsing middleware **after** your oRPC middleware or only on routes that don't use oRPC.

## Basic [​](https://orpc.unnoq.com/docs/integrations/express\#basic)

ts

```
import express from 'express'
import cors from 'cors'
import { RPCHandler } from '@orpc/server/node'

const app = express()

app.use(cors())

const handler = new RPCHandler(router)

app.use('/rpc*', async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    prefix: '/rpc',
    context: {},
  })

  if (matched) {
    return
  }

  next()
})

app.listen(3000, () => console.log('Server listening on port 3000'))
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/fastify"
title: "Fastify Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/fastify#VPContent)

On this page

# Fastify Integration [​](https://orpc.unnoq.com/docs/integrations/fastify\#fastify-integration)

[Fastify](https://fastify.dev/) is a web framework highly focused on providing the best developer experience with the least overhead and a powerful plugin architecture. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

WARNING

Fastify automatically parses the request payload which interferes with oRPC, that apply its own parser. To avoid errors, it's necessary to create a node http server and pass the requests to oRPC first, and if there's no match, pass it to Fastify.

## Basic [​](https://orpc.unnoq.com/docs/integrations/fastify\#basic)

ts

```
import { createServer } from 'node:http'
import Fastify from 'fastify'
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin()\
  ]
})

const fastify = Fastify({
  logger: true,
  serverFactory: (fastifyHandler) => {
    const server = createServer(async (req, res) => {
      const { matched } = await handler.handle(req, res, {
        context: {},
        prefix: '/rpc',
      })

      if (matched) {
        return
      }

      fastifyHandler(req, res)
    })

    return server
  },
})

try {
  await fastify.listen({ port: 3000 })
}
catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/hono"
title: "Hono Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/hono#VPContent)

On this page

# Hono Integration [​](https://orpc.unnoq.com/docs/integrations/hono\#hono-integration)

[Hono](https://honojs.dev/) is a high-performance web framework built on top of [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/hono\#basic)

ts

```
import { Hono } from 'hono'
import { RPCHandler } from '@orpc/server/fetch'

const app = new Hono()

const handler = new RPCHandler(router)

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/rpc',
    context: {} // Provide initial context if needed
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

export default app
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/next"
title: "Next.js Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/next#VPContent)

On this page

# Next.js Integration [​](https://orpc.unnoq.com/docs/integrations/next\#next-js-integration)

[Next.js](https://nextjs.org/) is a leading React framework for server-rendered apps. oRPC works with both the [App Router](https://nextjs.org/docs/app/getting-started/installation) and [Pages Router](https://nextjs.org/docs/pages/getting-started/installation). For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

INFO

oRPC also provides out-of-the-box support for [Server Action](https://orpc.unnoq.com/docs/server-action) with no additional configuration required.

## Server [​](https://orpc.unnoq.com/docs/integrations/next\#server)

You can integrate oRPC with Next.js using its [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).

app/rpc/\[\[...rest\]\]/route.ts

ts

```
import { RPCHandler } from '@orpc/server/fetch'

const handler = new RPCHandler(router)

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {}, // Provide initial context if needed
  })

  return response ?? new Response('Not found', { status: 404 })
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.

Pages Router Support?

pages/rpc/\[\[...rest\
\
ts\
\
```\
import { RPCHandler } from '@orpc/server/node'\
\
const handler = new RPCHandler(router)\
\
export const config = {\
  api: {\
    bodyParser: false,\
  },\
}\
\
export default async (req, res) => {\
  const { matched } = await handler.handle(req, res, {\
    prefix: '/rpc',\
    context: {}, // Provide initial context if needed\
  })\
\
  if (matched) {\
    return\
  }\
\
  res.statusCode = 404\
  res.end('Not found')\
}\
```\
\
WARNING\
\
Next.js default [body parser](https://nextjs.org/docs/pages/building-your-application/routing/api-routes#custom-config) blocks oRPC raw‑request handling. Ensure `bodyParser` is disabled in your API route:\
\
ts\
\
```\
export const config = {\
  api: {\
    bodyParser: false,\
  },\
}\
```\
\
## Client [​](https://orpc.unnoq.com/docs/integrations/next\#client)\
\
Next.js doesn’t natively support isomorphic functions, so you need a workaround to make client-side code compatible with SSR. This example uses `globalThis.$headers` as that workaround. Alternatively, you can use React Context like the approach mentioned in [discussions#330](https://github.com/unnoq/orpc/discussions/330#discussioncomment-12727779).\
\
lib/orpc.tslib/orpc.server.tsapp/layout.tsx\
\
ts\
\
```\
import type { headers } from 'next/headers'\
\
declare global {\
  var $headers: typeof headers\
}\
\
const link = new RPCLink({\
  url: new URL('/rpc', typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000'),\
  headers: async () => {\
    return globalThis.$headers\
      ? Object.fromEntries(await globalThis.$headers()) // use this on ssr\
      : {} // use this on browser\
  },\
})\
```\
\
ts\
\
```\
'server only'\
\
import { headers } from 'next/headers'\
\
globalThis.$headers = headers\
```\
\
ts\
\
```\
import '../lib/orpc.server'\
\
// Rest of the code\
```\
\
INFO\
\
This only shows how to configure the link. For full client examples, see [Client-Side Clients](https://orpc.unnoq.com/docs/client/client-side).\
\
## Optimize SSR [​](https://orpc.unnoq.com/docs/integrations/next\#optimize-ssr)\
\
To reduce HTTP requests and improve latency during SSR, you can utilize a [Server-Side Client](https://orpc.unnoq.com/docs/client/server-side) during SSR. Below is a quick setup, see [Optimize SSR](https://orpc.unnoq.com/docs/best-practices/optimize-ssr) for a more details.\
\
lib/orpc.tslib/orpc.server.tsapp/layout.tsx\
\
ts\
\
```\
import type { RouterClient } from '@orpc/server'\
import { RPCLink } from '@orpc/client/fetch'\
import { createORPCClient } from '@orpc/client'\
\
declare global {\
  var $client: RouterClient<typeof router> | undefined\
}\
\
const link = new RPCLink({\
  url: () => {\
    if (typeof window === 'undefined') {\
      throw new Error('RPCLink is not allowed on the server side.')\
    }\
\
    return new URL('/rpc', window.location.href)\
  },\
})\
\
/**\
 * Fallback to client-side client if server-side client is not available.\
 */\
export const client: RouterClient<typeof router> = globalThis.$client ?? createORPCClient(link)\
```\
\
ts\
\
```\
'server only'\
\
import { headers } from 'next/headers'\
import { createRouterClient } from '@orpc/server'\
\
globalThis.$client = createRouterClient(router, {\
  /**\
   * Provide initial context if needed.\
   *\
   * Because this client instance is shared across all requests,\
   * only include context that's safe to reuse globally.\
   * For per-request context, use middleware context or pass a function as the initial context.\
   */\
  context: async () => ({\
    headers: await headers(),\
  }),\
})\
```\
\
ts\
\
```\
import '../lib/orpc.server'\
\
// Rest of the code\
```---
url: "https://orpc.unnoq.com/docs/integrations/nuxt"
title: "Nuxt.js Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/nuxt#VPContent)

On this page

# Nuxt.js Integration [​](https://orpc.unnoq.com/docs/integrations/nuxt\#nuxt-js-integration)

[Nuxt.js](https://nuxtjs.org/) is a popular Vue.js framework for building server-side applications. It built on top of [Nitro](https://nitro.build/) server a lightweight, high-performance Node.js runtime. For more details, see the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/nuxt\#basic)

server/routes/rpc/\[...\].tsserver/routes/rpc/index.ts

ts

```
import { RPCHandler } from '@orpc/server/node'

const handler = new RPCHandler(router)

export default defineEventHandler(async (event) => {
  const { matched } = await handler.handle(
    event.node.req,
    event.node.res,
    {
      prefix: '/rpc',
      context: {}, // Provide initial context if needed
    }
  )

  if (matched) {
    return
  }

  setResponseStatus(event, 404, 'Not Found')
  return 'Not found'
})
```

ts

```
export { default } from './[...]'
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/react-native"
title: "React Native Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/react-native#VPContent)

On this page

# React Native Integration [​](https://orpc.unnoq.com/docs/integrations/react-native\#react-native-integration)

[React Native](https://reactnative.dev/) is a framework for building native apps using React. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Fetch Link [​](https://orpc.unnoq.com/docs/integrations/react-native\#fetch-link)

React Native includes a [Fetch API](https://reactnative.dev/docs/network), so you can use oRPC out of the box.

WARNING

However, the Fetch API in React Native has limitations. oRPC features like `File`, `Blob`, and `AsyncIteratorObject` aren't supported. Follow [Support Stream #27741](https://github.com/facebook/react-native/issues/27741) for updates.

TIP

If you're using `RPCHandler/Link`, you can temporarily add support for `File` and `Blob` by extending the [RPC JSON Serializer](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer#extending-native-data-types) to encode these types as Base64.

ts

```
import { RPCLink } from '@orpc/client/fetch'

const link = new RPCLink({
  url: 'http://localhost:3000/rpc',
  headers: async ({ context }) => ({
    'x-api-key': context?.something ?? ''
  })
  // fetch: <-- polyfill fetch if needed
})
```

INFO

The `link` can be any supported oRPC link, such as [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link), [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), or another custom link.---
url: "https://orpc.unnoq.com/docs/integrations/remix"
title: "Remix Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/remix#VPContent)

On this page

# Remix Integration [​](https://orpc.unnoq.com/docs/integrations/remix\#remix-integration)

[Remix](https://remix.run/) is a full stack JavaScript framework for building web applications with React. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/remix\#basic)

app/routes/rpc.$.ts

ts

```
import { RPCHandler } from '@orpc/server/fetch'

const handler = new RPCHandler(router)

export async function loader({ request }: LoaderFunctionArgs) {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {} // Provide initial context if needed
  })

  return response ?? new Response('Not Found', { status: 404 })
}
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/solid-start"
title: "SolidStart Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/solid-start#VPContent)

On this page

# SolidStart Integration [​](https://orpc.unnoq.com/docs/integrations/solid-start\#solidstart-integration)

[SolidStart](https://start.solidjs.com/) is a full stack JavaScript framework for building web applications with SolidJS. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/solid-start\#basic)

src/routes/rpc/\[...rest\].tssrc/routes/rpc/index.ts

ts

```
import type { APIEvent } from '@solidjs/start/server'
import { RPCHandler } from '@orpc/server/fetch'

const handler = new RPCHandler(router)

async function handle({ request }: APIEvent) {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {} // Provide initial context if needed
  })

  return response ?? new Response('Not Found', { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
```

ts

```
export * from './[...rest]'
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/svelte-kit"
title: "SvelteKit Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/svelte-kit#VPContent)

On this page

# SvelteKit Integration [​](https://orpc.unnoq.com/docs/integrations/svelte-kit\#sveltekit-integration)

[SvelteKit](https://svelte.dev/docs/kit/introduction) is a framework for rapidly developing robust, performant web applications using Svelte. For additional context, refer to the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Basic [​](https://orpc.unnoq.com/docs/integrations/svelte-kit\#basic)

src/routes/rpc/\[...rest\]/+server.ts

ts

```
import { error } from '@sveltejs/kit'
import { RPCHandler } from '@orpc/server/fetch'

const handler = new RPCHandler(router)

const handle: RequestHandler = async ({ request }) => {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {} // Provide initial context if needed
  })

  return response ?? new Response('Not Found', { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/integrations/tanstack-start"
title: "TanStack Start Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/integrations/tanstack-start#VPContent)

On this page

# TanStack Start Integration [​](https://orpc.unnoq.com/docs/integrations/tanstack-start\#tanstack-start-integration)

[TanStack Start](https://tanstack.com/start) is a full-stack React framework built on [Nitro](https://nitro.build/) and the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). For additional context, see the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) guide.

## Server [​](https://orpc.unnoq.com/docs/integrations/tanstack-start\#server)

You can integrate oRPC with TanStack Start using its [API Routes](https://tanstack.com/start/latest/docs/framework/react/api-routes).

app/routes/api/rpc.$.tsapp/routes/api/rpc.ts

ts

```
import { RPCHandler } from '@orpc/server/fetch'
import { createAPIFileRoute } from '@tanstack/react-start/api'

const handler = new RPCHandler(router)

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {}, // Provide initial context if needed
  })

  return response ?? new Response('Not Found', { status: 404 })
}

export const APIRoute = createAPIFileRoute('/api/rpc/$')({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
})
```

ts

```
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { APIRoute as BaseAPIRoute } from './rpc.$'

export const APIRoute = createAPIFileRoute('/api/rpc')(BaseAPIRoute.methods)
```

INFO

The `handler` can be any supported oRPC handler, including [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or a custom handler.

## Client [​](https://orpc.unnoq.com/docs/integrations/tanstack-start\#client)

On the client, use `createIsomorphicFn` to provide a headers function that works seamlessly with SSR. This enables usage in both server and browser environments.

ts

```
import { getHeaders } from '@tanstack/react-start/server'
import { createIsomorphicFn } from '@tanstack/react-start'

const link = new RPCLink({
  url: new URL('/api/rpc', typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000'),
  headers: createIsomorphicFn()
    .client(() => ({}))
    .server(() => getHeaders())
})
```

INFO

This only shows how to configure the link. For full client examples, see [Client-Side Clients](https://orpc.unnoq.com/docs/client/client-side).

## Optimize SSR [​](https://orpc.unnoq.com/docs/integrations/tanstack-start\#optimize-ssr)

To reduce HTTP requests and improve latency during SSR, you can utilize a [Server-Side Client](https://orpc.unnoq.com/docs/client/server-side) during SSR. Below is a quick setup, see [Optimize SSR](https://orpc.unnoq.com/docs/best-practices/optimize-ssr) for a more details.

app/lib/orpc.ts

ts

```
import { createRouterClient } from '@orpc/server'
import type { RouterClient } from '@orpc/server'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import { getHeaders } from '@tanstack/react-start/server'
import { createIsomorphicFn } from '@tanstack/react-start'

const getORPCClient = createIsomorphicFn()
  .server(() => createRouterClient(router, {
    /**
     * Provide initial context if needed.
     *
     * Because this client instance is shared across all requests,
     * only include context that's safe to reuse globally.
     * For per-request context, use middleware context or pass a function as the initial context.
     */
    context: async () => ({
      headers: getHeaders(),
    }),
  }))
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: new URL('/api/rpc', window.location.href),
    })

    return createORPCClient(link)
  })

export const client: RouterClient<typeof router> = getORPCClient()

export const orpc = createORPCReactQueryUtils(client)
```---
url: "https://orpc.unnoq.com/docs/lifecycle"
title: "Lifecycle - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/lifecycle#VPContent)

On this page

# Lifecycle [​](https://orpc.unnoq.com/docs/lifecycle\#lifecycle)

Master the oRPC lifecycle to confidently implement and customize your procedures.

## Overview [​](https://orpc.unnoq.com/docs/lifecycle\#overview)

![oRPC Lifecycle](https://orpc.unnoq.com/orpc-lifecycle.svg)

| Name | Description | Customizable |
| --- | --- | --- |
| **Handler** | Procedures defined with `.handler`. | ✅ |
| **Middlewares** | Procedures added via `.use`. | ✅ |
| **Input Validation** | Validates input data against the schema specified in `.input`. | 🟡 |
| **Output Validation** | Ensures output data conforms to the schema defined in `.output`. | 🟡 |
| **Client Interceptors** | Interceptors executed before Error Validation. | ✅ |
| **Error Validation** | Flags errors as defined and validate error data if they match the schema in `.errors`. | 🟡 |
| **Routing** | Determines which procedure to execute based on the incoming request. | ✅ |
| **Interceptors** | Interceptors executed before the Error Handler. | ✅ |
| **Error Handler** | Catches errors and converts them into a response. | 🟡 |
| **Root Interceptors** | Modify the request or response as needed. | ✅ |

> **Note:** The components _Routing_, _Interceptors_, _Error Handler_, and _Root Interceptors_ are not available when using the [server-side client](https://orpc.unnoq.com/docs/client/server-side).

## Middlewares Order [​](https://orpc.unnoq.com/docs/lifecycle\#middlewares-order)

To ensure that all middlewares run after input validation and before output validation apply the following configuration:

ts

```
const base = os.$config({
  initialInputValidationIndex: Number.NEGATIVE_INFINITY,
  initialOutputValidationIndex: Number.NEGATIVE_INFINITY,
})
```

INFO

By default, oRPC executes middlewares based on their registration order relative to validation steps. Middlewares registered before `.input` run before input validation, and those registered after `.output` run before output validation.---
url: "https://orpc.unnoq.com/docs/metadata"
title: "Metadata - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/metadata#VPContent)

On this page

# Metadata [​](https://orpc.unnoq.com/docs/metadata\#metadata)

oRPC procedures support metadata, simple key-value pairs that provide extra information to customize behavior.

## Basic Example [​](https://orpc.unnoq.com/docs/metadata\#basic-example)

ts

```
interface ORPCMetadata {

cache?: boolean
}

const
base =
os
  .
$meta<ORPCMetadata>({}) // require define initial context
  .
use(async ({
procedure,
next,
path },
input,
output) => {
    if (!
procedure['~orpc'].
meta.
cache) {
      return await
next()
    }

    const
cacheKey =
path.
join('/') +
JSON.
stringify(
input)

    if (
db.
has(
cacheKey)) {
      return
output(
db.
get(
cacheKey))
    }

    const
result = await
next()


db.
set(
cacheKey,
result.
output)

    return
result
  })

const
example =
base
  .
meta({
cache: true })
  .
handler(() => {
    // Implement your procedure logic here
  })
```

INFO

The `.meta` can be called multiple times; each call [spread merges](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) the new metadata with the existing metadata or the initial metadata.---
url: "https://orpc.unnoq.com/docs/middleware"
title: "Middleware - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/middleware#VPContent)

On this page

# Middleware in oRPC [​](https://orpc.unnoq.com/docs/middleware\#middleware-in-orpc)

Middleware is a powerful feature in oRPC that enables reusable and extensible procedures. It allows you to:

- Intercept, hook into, or listen to a handler's execution.
- Inject or guard the execution context.

## Overview [​](https://orpc.unnoq.com/docs/middleware\#overview)

Middleware is a function that takes a `next` function as a parameter and either returns the result of `next` or modifies the result before returning it.

ts

```
const
authMiddleware =
os
  .
$context<{
something?: string }>() // <-- define dependent-context
  .
middleware(async ({
context,
next }) => {
    // Execute logic before the handler

    const
result = await
next({

context: { // Pass additional context

user: {
id: 1,
name: 'John' }
      }
    })

    // Execute logic after the handler

    return
result
  })

const
example =
os
  .
use(
authMiddleware)
  .
handler(async ({
context }) => {
    const
user =
context.
user
  })
```

## Dependent context [​](https://orpc.unnoq.com/docs/middleware\#dependent-context)

Before `.middleware`, you can `.$context` to specify the dependent context, which must be satisfied when the middleware is used.

## Inline Middleware [​](https://orpc.unnoq.com/docs/middleware\#inline-middleware)

Middleware can be defined inline within `.use`, which is useful for simple middleware functions.

ts

```
const example = os
  .use(async ({ context, next }) => {
    // Execute logic before the handler
    return next()
  })
  .handler(async ({ context }) => {
    // Handler logic
  })
```

## Middleware Context [​](https://orpc.unnoq.com/docs/middleware\#middleware-context)

Middleware can use to inject or guard the [context](https://orpc.unnoq.com/docs/context).

ts

```
const
setting =
os
  .
use(async ({
context,
next }) => {
    return
next({

context: {

auth: await
auth() // <-- inject auth payload
      }
    })
  })
  .
use(async ({
context,
next }) => {
    if (!
context.
auth) { // <-- guard auth
      throw new
ORPCError('UNAUTHORIZED')
    }

    return
next({

context: {

auth:
context.
auth // <-- override auth
      }
    })
  })
  .
handler(async ({
context }) => {

console.
log(
context.
auth) // <-- access auth
  })

```

> When you pass additional context to `next`, it will be merged with the existing context.

## Middleware Input [​](https://orpc.unnoq.com/docs/middleware\#middleware-input)

Middleware can access input, enabling use cases like permission checks.

ts

```
const canUpdate = os.middleware(async ({ context, next }, input: number) => {
  // Perform permission check
  return next()
})

const ping = os
  .input(z.number())
  .use(canUpdate)
  .handler(async ({ input }) => {
    // Handler logic
  })

// Mapping input if necessary
const pong = os
  .input(z.object({ id: z.number() }))
  .use(canUpdate, input => input.id)
  .handler(async ({ input }) => {
    // Handler logic
  })
```

INFO

You can adapt a middleware to accept a different input shape by using `.mapInput`.

ts

```
const canUpdate = os.middleware(async ({ context, next }, input: number) => {
  return next()
})

// Transform middleware to accept a new input shape
const mappedCanUpdate = canUpdate.mapInput((input: { id: number }) => input.id)
```

## Middleware Output [​](https://orpc.unnoq.com/docs/middleware\#middleware-output)

Middleware can also modify the output of a handler, such as implementing caching mechanisms.

ts

```
const cacheMid = os.middleware(async ({ context, next, path }, input, output) => {
  const cacheKey = path.join('/') + JSON.stringify(input)

  if (db.has(cacheKey)) {
    return output(db.get(cacheKey))
  }

  const result = await next({})

  db.set(cacheKey, result.output)

  return result
})
```

## Concatenation [​](https://orpc.unnoq.com/docs/middleware\#concatenation)

Multiple middleware functions can be combined using `.concat`.

ts

```
const concatMiddleware = aMiddleware
  .concat(os.middleware(async ({ next }) => next()))
  .concat(anotherMiddleware)
```

INFO

If you want to concatenate two middlewares with different input types, you can use `.mapInput` to align their input types before concatenation.

## Built-in Middlewares [​](https://orpc.unnoq.com/docs/middleware\#built-in-middlewares)

oRPC provides some built-in middlewares that can be used to simplify common use cases.

ts

```
import { onError, onFinish, onStart, onSuccess } from '@orpc/server'

const ping = os
  .use(onStart(() => {
    // Execute logic before the handler
  }))
  .use(onSuccess(() => {
    // Execute when the handler succeeds
  }))
  .use(onError(() => {
    // Execute when the handler fails
  }))
  .use(onFinish(() => {
    // Execute logic after the handler
  }))
  .handler(async ({ context }) => {
    // Handler logic
  })
```---
url: "https://orpc.unnoq.com/docs/openapi/advanced/openapi-json-serializer"
title: "OpenAPI JSON Serializer - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/advanced/openapi-json-serializer#VPContent)

On this page

# OpenAPI JSON Serializer [​](https://orpc.unnoq.com/docs/openapi/advanced/openapi-json-serializer\#openapi-json-serializer)

This serializer processes JSON payloads for the [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler) and supports [native data types](https://orpc.unnoq.com/docs/openapi/openapi-handler#supported-data-types).

## Extending Native Data Types [​](https://orpc.unnoq.com/docs/openapi/advanced/openapi-json-serializer\#extending-native-data-types)

Customize serialization by creating your own `StandardOpenAPICustomJsonSerializer` and adding it to the `customJsonSerializers` option.

1. **Define Your Custom Serializer**

ts

```
import type { StandardOpenAPICustomJsonSerializer } from '@orpc/openapi-client/standard'

export class
User {
     constructor(
       public readonly
id: string,
       public readonly
name: string,
       public readonly
email: string,
       public readonly
age: number,
     ) {}


toJSON() {
       return {

id: this.
id,

name: this.
name,

email: this.
email,

age: this.
age,
       }
     }
}

export const
userSerializer: StandardOpenAPICustomJsonSerializer = {

condition:
data =>
data instanceof
User,

serialize:
data =>
data.toJSON(),
}
```

2. **Use Your Custom Serializer**

ts

```
const
handler = new
OpenAPIHandler(
router, {

customJsonSerializers: [\
userSerializer],
})

const
generator = new
OpenAPIGenerator({

customJsonSerializers: [\
userSerializer],
})
```





INFO



It is recommended to add custom serializers to the `OpenAPIGenerator` for consistent serialization in the OpenAPI document.---
url: "https://orpc.unnoq.com/docs/openapi/advanced/redirect-response"
title: "Redirect Response - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/advanced/redirect-response#VPContent)

On this page

# Redirect Response [​](https://orpc.unnoq.com/docs/openapi/advanced/redirect-response\#redirect-response)

Easily return a standard HTTP redirect response in oRPC OpenAPI.

## Basic Usage [​](https://orpc.unnoq.com/docs/openapi/advanced/redirect-response\#basic-usage)

By combining the `successStatus` and `outputStructure` options, you can return a standard HTTP redirect response.

ts

```
const redirect = os
  .route({
    method: 'GET',
    path: '/redirect',
    successStatus: 307,
    outputStructure: 'detailed'
  })
  .handler(async () => {
    return {
      headers: {
        location: 'https://orpc.unnoq.com',
      },
    }
  })
```

## Limitations [​](https://orpc.unnoq.com/docs/openapi/advanced/redirect-response\#limitations)

When invoking a redirect procedure with [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), oRPC treats the redirect as a normal response rather than following it. Some environments, such as browsers, may restrict access to the redirect response, **potentially causing errors**. In contrast, server environments like Node.js handle this without issue.---
url: "https://orpc.unnoq.com/docs/openapi/bracket-notation"
title: "Bracket Notation - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/bracket-notation#VPContent)

On this page

# Bracket Notation [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#bracket-notation)

Bracket Notation encodes structured data in formats with limited syntax, like URL queries and form data. It is used by [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler) and [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link).

## Usage [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#usage)

- Append `[]` **at the end** to denote an array.
- Append `[number]` to specify an array index (missing indexes create sparse arrays).
- Append `[key]` to denote an object property.

## Limitations [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#limitations)

- **Empty Arrays:** Cannot be represented; arrays must have at least one element.
- **Empty Objects:** Cannot be represented. Objects with empty or numeric keys may be interpreted as arrays, so ensure objects include at least one non-empty, non-numeric key.

## Examples [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#examples)

### URL Query [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#url-query)

bash

```
curl http://example.com/api/example?name[first]=John&name[last]=Doe
```

This query is parsed as:

json

```
{
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```

### Form Data [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#form-data)

bash

```
curl -X POST http://example.com/api/example \
  -F 'name[first]=John' \
  -F 'name[last]=Doe'
```

This form data is parsed as:

json

```
{
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```

### Complex Example [​](https://orpc.unnoq.com/docs/openapi/bracket-notation\#complex-example)

bash

```
curl -X POST http://example.com/api/example \
  -F 'data[names][0][first]=John1' \
  -F 'data[names][0][last]=Doe1' \
  -F 'data[names][1][first]=John2' \
  -F 'data[names][1][last]=Doe2' \
  -F 'data[ages][0]=18' \
  -F 'data[ages][2]=25' \
  -F 'data[files][]=@/path/to/file1' \
  -F 'data[files][]=@/path/to/file2'
```

This form data is parsed as:

json

```
{
  "data": {
    "names": [\
      { "first": "John1", "last": "Doe1" },\
      { "first": "John2", "last": "Doe2" }\
    ],
    "ages": ["18", "<empty>", "25"],
    "files": ["<binary data>", "<binary data>"]
  }
}
```---
url: "https://orpc.unnoq.com/docs/openapi/client/openapi-link"
title: "OpenAPILink - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/client/openapi-link#VPContent)

On this page

# OpenAPILink [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#openapilink)

OpenAPILink enables communication with an [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler) or any API that follows the [OpenAPI Specification](https://swagger.io/specification/) using HTTP/Fetch.

## Installation [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/openapi-client@latest
```

sh

```
yarn add @orpc/openapi-client@latest
```

sh

```
pnpm add @orpc/openapi-client@latest
```

sh

```
bun add @orpc/openapi-client@latest
```

sh

```
deno install npm:@orpc/openapi-client@latest
```

## Setup [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#setup)

To use `OpenAPILink`, ensure you have a [contract router](https://orpc.unnoq.com/docs/contract-first/define-contract#contract-router) and that your server is set up with [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler) or any API that follows the [OpenAPI Specification](https://swagger.io/specification/).

INFO

A normal [router](https://orpc.unnoq.com/docs/router) works as a contract router as long as it does not include a [lazy router](https://orpc.unnoq.com/docs/router#lazy-router). You can also unlazy a router using the [unlazyRouter](https://orpc.unnoq.com/docs/advanced/mocking#using-the-implementer) utility.

ts

```
import type {
JsonifiedClient } from '@orpc/openapi-client'
import type {
ContractRouterClient } from '@orpc/contract'
import {
createORPCClient } from '@orpc/client'
import {
OpenAPILink } from '@orpc/openapi-client/fetch'

const
link = new
OpenAPILink(
contract, {

url: 'http://localhost:3000/api',

headers: () => ({
    'x-api-key': 'my-api-key',
  }),
  // fetch: <-- polyfill fetch if needed
})

const
client:
JsonifiedClient<
ContractRouterClient<typeof
contract>> =
createORPCClient(
link)
```

WARNING

Wrap your client with `JsonifiedClient` to ensure it accurately reflects the server responses.

## Limitations [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#limitations)

Unlike [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link), `OpenAPILink` has some constraints:

- Payloads containing a `Blob` or `File` (outside the root level) must use `multipart/form-data` and serialized using [Bracket Notation](https://orpc.unnoq.com/docs/openapi/bracket-notation).
- For `GET` requests, the payload must be sent as `URLSearchParams` and serialized using [Bracket Notation](https://orpc.unnoq.com/docs/openapi/bracket-notation).

WARNING

In these cases, both the request and response are subject to the limitations of [Bracket Notation Limitations](https://orpc.unnoq.com/docs/openapi/bracket-notation#limitations). Additionally, oRPC converts data to strings (exclude `null` and `undefined` will not be represented).

## CORS policy [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#cors-policy)

`OpenAPILink` requires access to the `Content-Disposition` to distinguish file responses from other responses whe file has a common MIME type like `application/json`, `plain/text`, etc. To enable this, include `Content-Disposition` in your CORS policy's `Access-Control-Expose-Headers`:

ts

```
const handler = new OpenAPIHandler(router, {
  plugins: [\
    new CORSPlugin({\
      exposeHeaders: ['Content-Disposition'],\
    }),\
  ],
})
```

## Using Client Context [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#using-client-context)

Client context lets you pass extra information when calling procedures and dynamically modify OpenAPILink's behavior.

ts

```
import type {
JsonifiedClient } from '@orpc/openapi-client'
import type {
ContractRouterClient } from '@orpc/contract'
import {
createORPCClient } from '@orpc/client'
import {
OpenAPILink } from '@orpc/openapi-client/fetch'

interface ClientContext {

something?: string
}

const
link = new
OpenAPILink<ClientContext>(
contract, {

url: 'http://localhost:3000/api',

headers: async ({
context }) => ({
    'x-api-key':
context?.
something ?? ''
  })
})

const
client:
JsonifiedClient<
ContractRouterClient<typeof
contract, ClientContext>> =
createORPCClient(
link)

const
result = await
client.
planet.
list(
  {
limit: 10 },
  {
context: {
something: 'value' } }
)
```

INFO

If a property in `ClientContext` is required, oRPC enforces its inclusion when calling procedures.

## Lazy URL [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#lazy-url)

You can define `url` as a function, ensuring compatibility with environments that may lack certain runtime APIs.

ts

```
const link = new OpenAPILink({
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('OpenAPILink is not allowed on the server side.')
    }

    return new URL('/api', window.location.href)
  },
})
```

## SSE Like Behavior [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#sse-like-behavior)

Unlike traditional SSE, the [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) does not automatically retry on error. To enable automatic retries, refer to the [Client Retry Plugin](https://orpc.unnoq.com/docs/plugins/client-retry).

## Event Iterator Keep Alive [​](https://orpc.unnoq.com/docs/openapi/client/openapi-link\#event-iterator-keep-alive)

WARNING

These options for sending [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) from **client to the server**, not from **the server to client** as used in [RPCHandler Event Iterator Keep Alive](https://orpc.unnoq.com/docs/rpc-handler#event-iterator-keep-alive) or [OpenAPIHandler Event Iterator Keep Alive](https://orpc.unnoq.com/docs/openapi/openapi-handler#event-iterator-keep-alive).

**In 99% of cases, you don't need to configure these options.**

To keep [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) connections alive, `OpenAPILink` periodically sends a ping comment to the server. You can configure this behavior using the following options:

- `eventIteratorKeepAliveEnabled` (default: `true`) – Enables or disables pings.
- `eventIteratorKeepAliveInterval` (default: `5000`) – Time between pings (in milliseconds).
- `eventIteratorKeepAliveComment` (default: `''`) – Custom content for ping messages.

ts

```
const link = new OpenAPILink({
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000, // 5 seconds
  eventIteratorKeepAliveComment: '',
})
```---
url: "https://orpc.unnoq.com/docs/openapi/error-handling"
title: "OpenAPI Error Handling - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/error-handling#VPContent)

On this page

# OpenAPI Error Handling [​](https://orpc.unnoq.com/docs/openapi/error-handling\#openapi-error-handling)

Before you begin, please review our [Error Handling](https://orpc.unnoq.com/docs/error-handling) guide. This document shows you how to align your error responses with OpenAPI standards.

## Default Error Mappings [​](https://orpc.unnoq.com/docs/openapi/error-handling\#default-error-mappings)

By default, oRPC maps common error codes to standard HTTP status codes:

| Error Code | HTTP Status Code | Message |
| --- | --- | --- |
| BAD\_REQUEST | 400 | Bad Request |
| UNAUTHORIZED | 401 | Unauthorized |
| FORBIDDEN | 403 | Forbidden |
| NOT\_FOUND | 404 | Not Found |
| METHOD\_NOT\_SUPPORTED | 405 | Method Not Supported |
| NOT\_ACCEPTABLE | 406 | Not Acceptable |
| TIMEOUT | 408 | Request Timeout |
| CONFLICT | 409 | Conflict |
| PRECONDITION\_FAILED | 412 | Precondition Failed |
| PAYLOAD\_TOO\_LARGE | 413 | Payload Too Large |
| UNSUPPORTED\_MEDIA\_TYPE | 415 | Unsupported Media Type |
| UNPROCESSABLE\_CONTENT | 422 | Unprocessable Content |
| TOO\_MANY\_REQUESTS | 429 | Too Many Requests |
| CLIENT\_CLOSED\_REQUEST | 499 | Client Closed Request |
| INTERNAL\_SERVER\_ERROR | 500 | Internal Server Error |
| NOT\_IMPLEMENTED | 501 | Not Implemented |
| BAD\_GATEWAY | 502 | Bad Gateway |
| SERVICE\_UNAVAILABLE | 503 | Service Unavailable |
| GATEWAY\_TIMEOUT | 504 | Gateway Timeout |

Any error not defined above defaults to HTTP status `500` with the error code used as the message.

## Customizing Errors [​](https://orpc.unnoq.com/docs/openapi/error-handling\#customizing-errors)

You can override the default mappings by specifying a custom `status` and `message` when creating an error:

ts

```
const example = os
  .errors({
    RANDOM_ERROR: {
      status: 503, // <-- override default status
      message: 'Default error message', // <-- override default message
    },
  })
  .handler(() => {
    throw new ORPCError('ANOTHER_RANDOM_ERROR', {
      status: 502, // <-- override default status
      message: 'Custom error message', // <-- override default message
    })
  })
```---
url: "https://orpc.unnoq.com/docs/openapi/getting-started"
title: "Getting Started with OpenAPI - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/getting-started#VPContent)

On this page

# Getting Started [​](https://orpc.unnoq.com/docs/openapi/getting-started\#getting-started)

OpenAPI is a widely adopted standard for describing RESTful APIs. With oRPC, you can easily publish OpenAPI-compliant APIs with minimal effort.

oRPC is inherently compatible with OpenAPI, but you may need additional configurations such as path prefixes, custom routing, or including headers, parameters, and queries in inputs and outputs. This guide explains how to make your oRPC setup fully OpenAPI-compatible. It assumes basic knowledge of oRPC or familiarity with the [Getting Started](https://orpc.unnoq.com/docs/getting-started) guide.

## Prerequisites [​](https://orpc.unnoq.com/docs/openapi/getting-started\#prerequisites)

- Node.js 18+ (20+ recommended) \| Bun \| Deno \| Cloudflare Workers
- A package manager: npm \| pnpm \| yarn \| bun \| deno
- A TypeScript project (strict mode recommended)

## Installation [​](https://orpc.unnoq.com/docs/openapi/getting-started\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/server@latest @orpc/client@latest @orpc/openapi@latest
```

sh

```
yarn add @orpc/server@latest @orpc/client@latest @orpc/openapi@latest
```

sh

```
pnpm add @orpc/server@latest @orpc/client@latest @orpc/openapi@latest
```

sh

```
bun add @orpc/server@latest @orpc/client@latest @orpc/openapi@latest
```

sh

```
deno install npm:@orpc/server@latest npm:@orpc/client@latest @orpc/openapi@latest
```

## Defining Routes [​](https://orpc.unnoq.com/docs/openapi/getting-started\#defining-routes)

This snippet is based on the [Getting Started](https://orpc.unnoq.com/docs/getting-started) guide. Please read it first.

ts

```
import type { IncomingHttpHeaders } from 'node:http'
import {
ORPCError,
os } from '@orpc/server'
import {
z } from 'zod'

const
PlanetSchema =
z.
object({

id:
z.
number().
int().
min(1),

name:
z.
string(),

description:
z.
string().
optional(),
})

export const
listPlanet =
os
  .
route({
method: 'GET',
path: '/planets' })
  .
input(
z.
object({

limit:
z.
number().
int().
min(1).
max(100).
optional(),

cursor:
z.
number().
int().
min(0).
default(0),
  }))
  .
output(
z.
array(
PlanetSchema))
  .
handler(async ({
input }) => {
    // your list code here
    return [{\
id: 1,\
name: 'name' }]
  })

export const
findPlanet =
os
  .
route({
method: 'GET',
path: '/planets/{id}' })
  .
input(
z.
object({
id:
z.
coerce.
number().
int().
min(1) }))
  .
output(
PlanetSchema)
  .
handler(async ({
input }) => {
    // your find code here
    return {
id: 1,
name: 'name' }
  })

export const
createPlanet =
os
  .
$context<{
headers: IncomingHttpHeaders }>()
  .
use(({
context,
next }) => {
    const
user =
parseJWT(
context.
headers.
authorization?.
split(' ')[1])

    if (
user) {
      return
next({
context: {
user } })
    }

    throw new
ORPCError('UNAUTHORIZED')
  })
  .
route({
method: 'POST',
path: '/planets' })
  .
input(
PlanetSchema.
omit({
id: true }))
  .
output(
PlanetSchema)
  .
handler(async ({
input,
context }) => {
    // your create code here
    return {
id: 1,
name: 'name' }
  })

export const
router = {

planet: {

list:
listPlanet,

find:
findPlanet,

create:
createPlanet
  }
}

```

### Key Enhancements: [​](https://orpc.unnoq.com/docs/openapi/getting-started\#key-enhancements)

- `.route` defines HTTP methods and paths.
- `.output` enables automatic OpenAPI spec generation.
- `z.coerce` ensures correct parameter parsing.

For handling headers, queries, etc., see [Input/Output Structure](https://orpc.unnoq.com/docs/openapi/input-output-structure). For auto-coercion, see [Zod Smart Coercion Plugin](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion). For more `.route` options, see [Routing](https://orpc.unnoq.com/docs/openapi/routing).

## Creating a Server [​](https://orpc.unnoq.com/docs/openapi/getting-started\#creating-a-server)

ts

```
import {
createServer } from 'node:http'
import {
OpenAPIHandler } from '@orpc/openapi/node'
import {
CORSPlugin } from '@orpc/server/plugins'

const
handler = new
OpenAPIHandler(
router, {

plugins: [new\
CORSPlugin()]
})

const
server =
createServer(async (
req,
res) => {
  const
result = await
handler.
handle(
req,
res, {

context: {
headers:
req.
headers }
  })

  if (!
result.
matched) {

res.
statusCode = 404

res.
end('No procedure matched')
  }
})

server.
listen(
  3000,
  '127.0.0.1',
  () =>
console.
log('Listening on 127.0.0.1:3000')
)
```

### Important Changes: [​](https://orpc.unnoq.com/docs/openapi/getting-started\#important-changes)

- Use `OpenAPIHandler` instead of `RPCHandler`.
- Learn more in [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler).

## Accessing APIs [​](https://orpc.unnoq.com/docs/openapi/getting-started\#accessing-apis)

bash

```
curl -X GET http://127.0.0.1:3000/planets
curl -X GET http://127.0.0.1:3000/planets/1
curl -X POST http://127.0.0.1:3000/planets \
  -H 'Authorization: Bearer token' \
  -H 'Content-Type: application/json' \
  -d '{"name": "name"}'
```

Just a small tweak makes your oRPC API OpenAPI-compliant!

## Generating OpenAPI Spec [​](https://orpc.unnoq.com/docs/openapi/getting-started\#generating-openapi-spec)

ts

```
import {
OpenAPIGenerator } from '@orpc/openapi'
import {
ZodToJsonSchemaConverter } from '@orpc/zod'
import {
router } from './shared/planet'

const
generator = new
OpenAPIGenerator({

schemaConverters: [\
    new\
ZodToJsonSchemaConverter()\
  ]
})

const
spec = await
generator.
generate(
router, {

info: {

title: 'Planet API',

version: '1.0.0'
  }
})

console.
log(
JSON.
stringify(
spec, null, 2))
```

Run the script above to generate your OpenAPI spec.

INFO

oRPC supports a wide range of [Standard Schema](https://github.com/standard-schema/standard-schema) for OpenAPI generation. See the full list [here](https://orpc.unnoq.com/docs/openapi/openapi-specification#generating-specifications)---
url: "https://orpc.unnoq.com/docs/openapi/input-output-structure"
title: "Input/Output Structure - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/input-output-structure#VPContent)

On this page

# Input/Output Structure [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#input-output-structure)

oRPC allows you to control the organization of request inputs and response outputs using the `inputStructure` and `outputStructure` options. This is especially useful when you need to handle parameters, query strings, headers, and body data separately.

## Input Structure [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#input-structure)

The `inputStructure` option defines how the incoming request data is structured. You can choose between two modes:

- **compact** (default): Merges path parameters with either the query or body data (depending on the HTTP method) into a single object.
- **detailed**: Separates the request into distinct objects for `params`, `query`, `headers`, and `body`.

### Compact Mode [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#compact-mode)

ts

```
const compactMode = os.route({
  path: '/ping/{name}',
  method: 'POST',
})
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
  }))
```

### Detailed Mode [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#detailed-mode)

ts

```
const detailedMode = os.route({
  path: '/ping/{name}',
  method: 'POST',
  inputStructure: 'detailed',
})
  .input(z.object({
    params: z.object({ name: z.string() }),
    query: z.object({ search: z.string() }),
    body: z.object({ description: z.string() }).optional(),
    headers: z.object({ 'x-custom-header': z.string() }),
  }))
```

When using **detailed** mode, the input object adheres to the following structure:

ts

```
export type DetailedInput = {
  params: Record<string, string> | undefined
  query: any
  body: any
  headers: Record<string, string | string[] | undefined>
}
```

Ensure your input schema matches this structure when detailed mode is enabled.

## Output Structure [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#output-structure)

The `outputStructure` option determines the format of the response data. There are two modes:

- **compact** (default): Returns only the body data directly.
- **detailed**: Returns an object with separate `headers` and `body` fields. The headers you provide are merged into the final HTTP response headers.

### Compact Mode [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#compact-mode-1)

ts

```
const compactMode = os
  .handler(async ({ input }) => {
    return { message: 'Hello, world!' }
  })
```

### Detailed Mode [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#detailed-mode-1)

ts

```
const detailedMode = os
  .route({ outputStructure: 'detailed' })
  .handler(async ({ input }) => {
    return {
      headers: { 'x-custom-header': 'value' },
      body: { message: 'Hello, world!' },
    }
  })
```

When using **detailed** mode, the output object follows this structure:

ts

```
export type DetailedOutput = {
  headers: Record<string, string | string[] | undefined>
  body: any
}
```

Make sure your handler’s return value matches this structure when using detailed mode.

## Initial Configuration [​](https://orpc.unnoq.com/docs/openapi/input-output-structure\#initial-configuration)

Customize the initial oRPC input/output structure settings using `.$route`:

ts

```
const base = os.$route({ inputStructure: 'detailed' })
```---
url: "https://orpc.unnoq.com/docs/openapi/nest/implement-contract"
title: "Implement Contract in NestJS - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/nest/implement-contract#VPContent)

On this page

# Implement Contract in NestJS [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#implement-contract-in-nestjs)

This guide explains how to easily implement [oRPC contract](https://orpc.unnoq.com/docs/contract-first/define-contract) within your [NestJS](https://nestjs.com/) application using `@orpc/nest`.

WARNING

This feature is currently experimental and may be subject to breaking changes.

## Installation [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/nest@latest
```

sh

```
yarn add @orpc/nest@latest
```

sh

```
pnpm add @orpc/nest@latest
```

sh

```
bun add @orpc/nest@latest
```

sh

```
deno install npm:@orpc/nest@latest
```

## Requirements [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#requirements)

oRPC is an ESM-only library. Therefore, your NestJS application must be configured to support ESM modules.

1. **Configure `tsconfig.json`**: with `"module": "NodeNext"` or a similar ESM-compatible option.

json

```
{
     "compilerOptions": {
       "module": "NodeNext", // <-- this is recommended
       "strict": true // <-- this is recommended
       // ... other options,
     }
}
```

2. **Node.js Environment**:


   - **Node.js 22+**: Recommended, as it allows `require()` of ESM modules natively.
   - **Older Node.js versions**: Alternatively, use a bundler to compile ESM modules (including `@orpc/nest`) to CommonJS.

WARNING

By default, NestJS bundler ( [Webpack](https://webpack.js.org/) or [SWC](https://swc.rs/)) might not compile `node_modules`. You may need to adjust your bundler configs to include `@orpc/nest` for compilation.

## Define Your Contract [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#define-your-contract)

Before implementation, define your oRPC contract. This process is consistent with the standard oRPC methodology. For detailed guidance, refer to the main [Contract-First guide](https://orpc.unnoq.com/docs/contract-first/define-contract).

Example Contract

ts

```
import { populateContractRouterPaths } from '@orpc/nest'
import { oc } from '@orpc/contract'
import { z } from 'zod'

export const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
})

export const listPlanetContract = oc
  .route({
    method: 'GET',
    path: '/planets' // Path is required for NestJS implementation
  })
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).default(0),
    }),
  )
  .output(z.array(PlanetSchema))

export const findPlanetContract = oc
  .route({
    method: 'GET',
    path: '/planets/{id}' // Path is required
  })
  .input(PlanetSchema.pick({ id: true }))
  .output(PlanetSchema)

export const createPlanetContract = oc
  .route({
    method: 'POST',
    path: '/planets' // Path is required
  })
  .input(PlanetSchema.omit({ id: true }))
  .output(PlanetSchema)

/**
 * populateContractRouterPaths is completely optional,
 * because the procedure's path is required for NestJS implementation.
 * This utility automatically populates any missing paths
 * Using the router's keys + `/`.
 */
export const contract = populateContractRouterPaths({
  planet: {
    list: listPlanetContract,
    find: findPlanetContract,
    create: createPlanetContract,
  },
})
```

WARNING

For a contract to be implementable in NestJS using `@orpc/nest`, each contract **must** define a `path` in its `.route`. Omitting it will cause a build‑time error. You can avoid this by using the `populateContractRouterPaths` utility to automatically fill in any missing paths.

## Path Parameters [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#path-parameters)

Aside from [oRPC Path Parameters](https://orpc.unnoq.com/docs/openapi/routing#path-parameters), regular NestJS route patterns still work out of the box. However, they are not standard in OpenAPI, so we recommend using oRPC Path Parameters exclusively.

WARNING

[oRPC Path Parameter matching with slashes (/)](https://orpc.unnoq.com/docs/openapi/routing#path-parameters) does not work on the NestJS Fastify platform, because Fastify does not allow wildcard ( `*`) aliasing in path parameters.

## Implement Your Contract [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#implement-your-contract)

ts

```
import { Implement, implement, ORPCError } from '@orpc/nest'

@Controller()
export class PlanetController {
  /**
   * Implement a standalone procedure
   */
  @Implement(contract.planet.list)
  list() {
    return implement(contract.planet.list).handler(({ input }) => {
      // Implement logic here

      return []
    })
  }

  /**
   * Implement entire a contract
   */
  @Implement(contract.planet)
  planet() {
    return {
      list: implement(contract.planet.list).handler(({ input }) => {
        // Implement logic here
        return []
      }),
      find: implement(contract.planet.find).handler(({ input }) => {
        // Implement logic here
        return {
          id: 1,
          name: 'Earth',
          description: 'The planet Earth',
        }
      }),
      create: implement(contract.planet.create).handler(({ input }) => {
        // Implement logic here
        return {
          id: 1,
          name: 'Earth',
          description: 'The planet Earth',
        }
      }),
    }
  }

  // other handlers...
}
```

INFO

The `@Implement` decorator functions similarly to NestJS built-in HTTP method decorators (e.g., `@Get`, `@Post`). Handlers decorated with `@Implement` are standard NestJS controller handlers and can leverage all NestJS features.

## Body Parser [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#body-parser)

By default, NestJS parses request bodies for `application/json` and `application/x-www-form-urlencoded` content types. However:

- NestJS `urlencoded` parser does not support [Bracket Notation](https://orpc.unnoq.com/docs/openapi/bracket-notation) like in standard oRPC parsers.
- In some edge cases like uploading a file with `application/json` content type, the NestJS parser does not treat it as a file, instead it parses the body as a JSON string.

Therefore, we **recommend** disabling the NestJS body parser:

ts

```
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  })

  await app.listen(process.env.PORT ?? 3000)
}
```

INFO

oRPC will use NestJS parsed body when it's available, and only use the oRPC parser if the body is not parsed by NestJS.

## Create a Type-Safe Client [​](https://orpc.unnoq.com/docs/openapi/nest/implement-contract\#create-a-type-safe-client)

When you implement oRPC contracts in NestJS using `@orpc/nest`, the resulting API endpoints are OpenAPI compatible. This allows you to use an OpenAPI-compatible client link, such as [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), to interact with your API in a type-safe way.

typescript

```
import type { JsonifiedClient } from '@orpc/openapi-client'
import type { ContractRouterClient } from '@orpc/contract'
import { createORPCClient } from '@orpc/client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'

const link = new OpenAPILink(contract, {
  url: 'http://localhost:3000',
  headers: () => ({
    'x-api-key': 'my-api-key',
  }),
  // fetch: <-- polyfill fetch if needed
})

const client: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link)
```

INFO

Please refer to the [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link) documentation for more information on client setup and options.---
url: "https://orpc.unnoq.com/docs/openapi/openapi-handler"
title: "OpenAPI Handler - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/openapi-handler#VPContent)

On this page

# OpenAPI Handler [​](https://orpc.unnoq.com/docs/openapi/openapi-handler\#openapi-handler)

The `OpenAPIHandler` enables communication with clients over RESTful APIs, adhering to the OpenAPI specification. It is fully compatible with [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link) and the [OpenAPI Specification](https://orpc.unnoq.com/docs/openapi/openapi-specification).

## Supported Data Types [​](https://orpc.unnoq.com/docs/openapi/openapi-handler\#supported-data-types)

`OpenAPIHandler` serializes and deserializes the following JavaScript types:

- **string**
- **number** ( `NaN` → `null`)
- **boolean**
- **null**
- **undefined** ( `undefined` in arrays → `null`)
- **Date** ( `Invalid Date` → `null`)
- **BigInt** ( `BigInt` → `string`)
- **RegExp** ( `RegExp` → `string`)
- **URL** ( `URL` → `string`)
- **Record (object)**
- **Array**
- **Set** ( `Set` → `array`)
- **Map** ( `Map` → `array`)
- **Blob** (unsupported in `AsyncIteratorObject`)
- **File** (unsupported in `AsyncIteratorObject`)
- **AsyncIteratorObject** (only at the root level; powers the [Event Iterator](https://orpc.unnoq.com/docs/event-iterator))

WARNING

If a payload contains `Blob` or `File` outside the root level, it must use `multipart/form-data`. In such cases, oRPC applies [Bracket Notation](https://orpc.unnoq.com/docs/openapi/bracket-notation) and converts other types to strings (exclude `null` and `undefined` will not be represented).

TIP

You can extend the list of supported types by [creating a custom serializer](https://orpc.unnoq.com/docs/openapi/advanced/openapi-json-serializer#extending-native-data-types).

## Installation [​](https://orpc.unnoq.com/docs/openapi/openapi-handler\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/openapi@latest
```

sh

```
yarn add @orpc/openapi@latest
```

sh

```
pnpm add @orpc/openapi@latest
```

sh

```
bun add @orpc/openapi@latest
```

sh

```
deno install npm:@orpc/openapi@latest
```

## Setup and Integration [​](https://orpc.unnoq.com/docs/openapi/openapi-handler\#setup-and-integration)

ts

```
import { OpenAPIHandler } from '@orpc/openapi/fetch' // or '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError } from '@orpc/server'

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [\
    onError(error => console.error(error))\
  ],
})

export default async function fetch(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: '/api',
    context: {} // Add initial context if needed
  })

  if (matched) {
    response
  }

  return new Response('Not Found', { status: 404 })
}
```

## Event Iterator Keep Alive [​](https://orpc.unnoq.com/docs/openapi/openapi-handler\#event-iterator-keep-alive)

To keep [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) connections alive, `OpenAPIHandler` periodically sends a ping comment to the client. You can configure this behavior using the following options:

- `eventIteratorKeepAliveEnabled` (default: `true`) – Enables or disables pings.
- `eventIteratorKeepAliveInterval` (default: `5000`) – Time between pings (in milliseconds).
- `eventIteratorKeepAliveComment` (default: `''`) – Custom content for ping comments.

ts

```
const handler = new OpenAPIHandler(router, {
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000, // 5 seconds
  eventIteratorKeepAliveComment: '',
})
```---
url: "https://orpc.unnoq.com/docs/openapi/openapi-specification"
title: "OpenAPI Specification - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/openapi-specification#VPContent)

On this page

# OpenAPI Specification [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#openapi-specification)

oRPC uses the [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0) to define APIs. It is fully compatible with [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link) and [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler).

## Installation [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/openapi@latest
```

sh

```
yarn add @orpc/openapi@latest
```

sh

```
pnpm add @orpc/openapi@latest
```

sh

```
bun add @orpc/openapi@latest
```

sh

```
deno install npm:@orpc/openapi@latest
```

## Generating Specifications [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#generating-specifications)

oRPC supports OpenAPI 3.1.1 and integrates seamlessly with popular schema libraries like [Zod](https://zod.dev/), [Valibot](https://valibot.dev/), and [ArkType](https://arktype.io/). You can generate specifications from either a [Router](https://orpc.unnoq.com/docs/router) or a [Contract](https://orpc.unnoq.com/docs/contract-first/define-contract):

INFO

Interested in support for additional schema libraries? [Let us know](https://github.com/unnoq/orpc/discussions/categories/ideas)!

Want to create your own JSON schema converter?

You can use any existing `X to JSON Schema` converter to add support for additional schema libraries. For example, if you want to use [Valibot](https://valibot.dev/) with oRPC (if not supported), you can create a custom converter to convert Valibot schemas into JSON Schema.

ts

```
import type { AnySchema } from '@orpc/contract'
import type { ConditionalSchemaConverter, JSONSchema, SchemaConvertOptions } from '@orpc/openapi'
import type { ConversionConfig } from '@valibot/to-json-schema'
import { toJsonSchema } from '@valibot/to-json-schema'

export class ValibotToJsonSchemaConverter implements ConditionalSchemaConverter {
  condition(schema: AnySchema | undefined): boolean {
    return schema !== undefined && schema['~standard'].vendor === 'valibot'
  }

  convert(schema: AnySchema | undefined, _options: SchemaConvertOptions): [required: boolean, jsonSchema: Exclude<JSONSchema, boolean>] {
    // Most JSON schema converters do not convert the `required` property separately, so returning `true` is acceptable here.
    return [true, toJsonSchema(schema as any)]
  }
}
```

INFO

It's recommended to use the built-in converters because the oRPC implementations handle many edge cases and supports every type that oRPC offers.

ts

```
import { OpenAPIGenerator } from '@orpc/openapi'
import {
  ZodToJsonSchemaConverter
} from '@orpc/zod' // <-- zod v3
import {
  experimental_ZodToJsonSchemaConverter as ZodToJsonSchemaConverter
} from '@orpc/zod/zod4' // <-- zod v4
import {
  experimental_ValibotToJsonSchemaConverter as ValibotToJsonSchemaConverter
} from '@orpc/valibot'
import {
  experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter
} from '@orpc/arktype'

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [\
    new ZodToJsonSchemaConverter(), // <-- if you use Zod\
    new ValibotToJsonSchemaConverter(), // <-- if you use Valibot\
    new ArkTypeToJsonSchemaConverter(), // <-- if you use ArkType\
  ],
})

const specFromContract = await openAPIGenerator.generate(contract, {
  info: {
    title: 'My App',
    version: '0.0.0',
  },
})

const specFromRouter = await openAPIGenerator.generate(router, {
  info: {
    title: 'My App',
    version: '0.0.0',
  },
})
```

WARNING

Features prefixed with `experimental_` are unstable and may lack some functionality.

## Operation Metadata [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#operation-metadata)

You can enrich your API documentation by specifying operation metadata using the `.route` or `.tag`:

ts

```
const ping = os
  .route({
    summary: 'the summary',
    description: 'the description',
    deprecated: false,
    tags: ['tag'],
    successDescription: 'the success description',
  })
  .handler(() => {})

// or append tag for entire router

const router = os.tag('planets').router({
  // ...
})
```

### Customizing Operation Objects [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#customizing-operation-objects)

You can also extend the operation object using the `.spec` helper for an `error` or `middleware`:

ts

```
import { oo } from '@orpc/openapi'

const base = os.errors({
  UNAUTHORIZED: oo.spec({
    data: z.any(),
  }, {
    security: [{ 'api-key': [] }],
  })
})

// OR in middleware

const requireAuth = oo.spec(
  os.middleware(async ({ next, errors }) => {
    throw new ORPCError('UNAUTHORIZED')
    return next()
  }),
  {
    security: [{ 'api-key': [] }]
  }
)
```

Any [procedure](https://orpc.unnoq.com/docs/procedure) that includes the use above `errors` or `middleware` will automatically have the defined `security` property applied

INFO

The `.spec` helper accepts a callback as its second argument, allowing you to override the entire operation object.

## `@orpc/zod` [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#orpc-zod)

### Zod v4 [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#zod-v4)

#### File Schema [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#file-schema)

Zod v4 includes a native `File` schema. oRPC will detect it automatically - no extra setup needed:

ts

```
import * as z from 'zod'

const InputSchema = z.object({
  file: oz.file(),
  image: oz.file().mine(['image/png', 'image/jpeg']),
})
```

#### JSON Schema Customization [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#json-schema-customization)

`description` and `examples` metadata are supported out of the box:

ts

```
import * as z from 'zod'

const InputSchema = z.object({
  name: z.string(),
}).meta({
  description: 'User schema',
  examples: [{ name: 'John' }],
})
```

For further customization, you can use the `JSON_SCHEMA_REGISTRY`, `JSON_SCHEMA_INPUT_REGISTRY`, and `JSON_SCHEMA_OUTPUT_REGISTRY`:

ts

```
import * as z from 'zod'
import {
  experimental_JSON_SCHEMA_REGISTRY as JSON_SCHEMA_REGISTRY,
} from '@orpc/zod/zod4'

export const InputSchema = z.object({
  name: z.string(),
})

JSON_SCHEMA_REGISTRY.add(InputSchema, {
  description: 'User schema',
  examples: [{ name: 'John' }],
  // other options...
})

JSON_SCHEMA_INPUT_REGISTRY.add(InputSchema, {
  // only for .input
})

JSON_SCHEMA_OUTPUT_REGISTRY.add(InputSchema, {
  // only for .output
})
```

### Zod v3 [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#zod-v3)

#### File Schema [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#file-schema-1)

In the [File Upload/Download](https://orpc.unnoq.com/docs/file-upload-download) guide, `z.instanceof` is used to describe file/blob schemas. However, this method prevents oRPC from recognizing file/blob schema. Instead, use the enhanced file schema approach:

ts

```
import {
z } from 'zod'
import {
oz } from '@orpc/zod'

const
InputSchema =
z.
object({

file:
oz.
file(),

image:
oz.
file().
type('image/*'),

blob:
oz.
blob()
})
```

#### JSON Schema Customization [​](https://orpc.unnoq.com/docs/openapi/openapi-specification\#json-schema-customization-1)

If Zod alone does not cover your JSON Schema requirements, you can extend or override the generated schema:

ts

```
import {
z } from 'zod'
import {
oz } from '@orpc/zod'

const
InputSchema =
oz.
openapi(

z.
object({

name:
z.
string(),
  }),
  {

examples: [\
      {\
name: 'Earth' },\
      {\
name: 'Mars' },\
    ],
    // additional options...
  }
)
```---
url: "https://orpc.unnoq.com/docs/openapi/plugins/openapi-reference"
title: "OpenAPI Reference Plugin (Swagger/Scalar) - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/plugins/openapi-reference#VPContent)

On this page

# OpenAPI Reference Plugin (Swagger/Scalar) [​](https://orpc.unnoq.com/docs/openapi/plugins/openapi-reference\#openapi-reference-plugin-swagger-scalar)

This plugin provides API reference documentation powered by [Scalar](https://github.com/scalar/scalar), along with the OpenAPI specification in JSON format.

INFO

This plugin relies on the [OpenAPI Generator](https://orpc.unnoq.com/docs/openapi/openapi-specification). Please review its documentation before using this plugin.

## Setup [​](https://orpc.unnoq.com/docs/openapi/plugins/openapi-reference\#setup)

ts

```
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'

const handler = new OpenAPIHandler(router, {
  plugins: [\
    new OpenAPIReferencePlugin({\
      schemaConverters: [\
        new ZodToJsonSchemaConverter(),\
      ],\
      specGenerateOptions: {\
        info: {\
          title: 'ORPC Playground',\
          version: '1.0.0',\
        },\
      },\
    }),\
  ]
})
```

INFO

By default, the API reference client is served at the root path ( `/`), and the OpenAPI specification is available at `/spec.json`. You can customize these paths by providing the `docsPath` and `specPath` options.---
url: "https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion"
title: "Zod Smart Coercion - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion#VPContent)

On this page

# Zod Smart Coercion [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#zod-smart-coercion)

A Plugin refined alternative to `z.coerce` that automatically converts inputs to the expected type without modifying the input schema.

WARNING

In Zod v4, this plugin only supports **discriminated unions**. Regular (non-discriminated) unions are **not** coerced automatically.

## Installation [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/zod@latest
```

sh

```
yarn add @orpc/zod@latest
```

sh

```
pnpm add @orpc/zod@latest
```

sh

```
bun add @orpc/zod@latest
```

sh

```
deno install npm:@orpc/zod@latest
```

## Setup [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#setup)

ts

```
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { ZodSmartCoercionPlugin } from '@orpc/zod' // <-- zod v3
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin
} from '@orpc/zod/zod4' // <-- zod v4

const handler = new OpenAPIHandler(router, {
  plugins: [new ZodSmartCoercionPlugin()]
})
```

WARNING

Do not use this plugin with [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) as it may negatively impact performance.

## Safe and Predictable Conversion [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#safe-and-predictable-conversion)

Zod Smart Coercion converts data only when:

1. The schema expects a specific type and the input can be converted.
2. The input does not already match the schema.

For example:

- If the input is `'true'` but the schema does not expect a boolean, no conversion occurs.
- If the schema accepts both boolean and string, `'true'` will not be coerced to a boolean.

### Conversion Rules [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#conversion-rules)

#### Boolean [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#boolean)

Converts string representations of boolean values:

ts

```
const raw = 'true' // Input
const coerced = true // Output
```

Supported values:

- `'true'`, `'on'`, `'t'` → `true`
- `'false'`, `'off'`, `'f'` → `false`

#### Number [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#number)

Converts numeric strings:

ts

```
const raw = '42' // Input
const coerced = 42 // Output
```

#### BigInt [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#bigint)

Converts strings representing valid BigInt values:

ts

```
const raw = '12345678901234567890' // Input
const coerced = 12345678901234567890n // Output
```

#### Date [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#date)

Converts valid date strings into Date objects:

ts

```
const raw = '2024-11-27T00:00:00.000Z' // Input
const coerced = new Date('2024-11-27T00:00:00.000Z') // Output
```

Supported formats:

- Full ISO date-time (e.g., `2024-11-27T00:00:00.000Z`)
- Date only (e.g., `2024-11-27`)

#### RegExp [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#regexp)

Converts strings representing regular expressions:

ts

```
const raw = '/^abc$/i' // Input
const coerced = /^abc$/i // Output
```

#### URL [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#url)

Converts valid URL strings into URL objects:

ts

```
const raw = 'https://example.com' // Input
const coerced = new URL('https://example.com') // Output
```

#### Set [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#set)

Converts arrays into Set objects, removing duplicates:

ts

```
const raw = ['apple', 'banana', 'apple'] // Input
const coerced = new Set(['apple', 'banana']) // Output
```

#### Map [​](https://orpc.unnoq.com/docs/openapi/plugins/zod-smart-coercion\#map)

Converts arrays of key-value pairs into Map objects:

ts

```
const raw = [\
  ['key1', 'value1'],\
  ['key2', 'value2']\
] // Input

const coerced = new Map([\
  ['key1', 'value1'],\
  ['key2', 'value2']\
]) // Output
```---
url: "https://orpc.unnoq.com/docs/openapi/routing"
title: "OpenAPI Routing - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/routing#VPContent)

On this page

# Routing [​](https://orpc.unnoq.com/docs/openapi/routing\#routing)

Define how procedures map to HTTP methods, paths, and response statuses.

WARNING

This feature applies only when using [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler).

## Basic Routing [​](https://orpc.unnoq.com/docs/openapi/routing\#basic-routing)

By default, oRPC uses the `POST` method, constructs paths from router keys with `/`, and returns a 200 status on success. Override these defaults with `.route`:

ts

```
os.route({ method: 'GET', path: '/example', successStatus: 200 })
os.route({ method: 'POST', path: '/example', successStatus: 201 })
```

INFO

The `.route` can be called multiple times; each call [spread merges](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) the new route with the existing route.

## Path Parameters [​](https://orpc.unnoq.com/docs/openapi/routing\#path-parameters)

By default, path parameters merge with query/body into a single input object. You can modify this behavior as described in the [Input/Output structure docs](https://orpc.unnoq.com/docs/openapi/input-output-structure).

ts

```
os.route({ path: '/example/{id}' })
  .input(z.object({ id: z.string() }))

os.route({ path: '/example/{+path}' }) // Matches slashes (/)
  .input(z.object({ path: z.string() }))
```

## Route Prefixes [​](https://orpc.unnoq.com/docs/openapi/routing\#route-prefixes)

Use `.prefix` to prepend a common path to all procedures in a router that have an explicitly defined `path`:

ts

```
const router = os.prefix('/planets').router({
  list: listPlanet,
  find: findPlanet,
  create: createPlanet,
})
```

WARNING

The prefix only applies to procedures that specify a `path`.

## Lazy Router [​](https://orpc.unnoq.com/docs/openapi/routing\#lazy-router)

When combining a [Lazy Router](https://orpc.unnoq.com/docs/router#lazy-router) with [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), a prefix is required for lazy loading. Without it, the router behaves like a regular router.

INFO

If you follow the [contract-first approach](https://orpc.unnoq.com/docs/contract-first/define-contract), you can ignore this requirement—oRPC knows the full contract and loads the router lazily properly.

ts

```
const router = {
  planet: os.prefix('/planets').lazy(() => import('./planet'))
}
```

## Initial Configuration [​](https://orpc.unnoq.com/docs/openapi/routing\#initial-configuration)

Customize the initial oRPC routing settings using `.$route`:

ts

```
const base = os.$route({ method: 'GET' })
```---
url: "https://orpc.unnoq.com/docs/openapi/scalar"
title: "Scalar (Swagger) - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/openapi/scalar#VPContent)

On this page

# Scalar (Swagger) [​](https://orpc.unnoq.com/docs/openapi/scalar\#scalar-swagger)

Leverage the [OpenAPI Specification](https://orpc.unnoq.com/docs/openapi/openapi-specification) to generate a stunning API client for your oRPC using [Scalar](https://github.com/scalar/scalar).

INFO

This guide covers the basics. For a simpler setup, consider using the [OpenAPI Reference Plugin](https://orpc.unnoq.com/docs/openapi/plugins/openapi-reference), which serves both the API reference UI and the OpenAPI specification.

## Basic Example [​](https://orpc.unnoq.com/docs/openapi/scalar\#basic-example)

ts

```
import { createServer } from 'node:http'
import { OpenAPIGenerator } from '@orpc/openapi'
import { OpenAPIHandler } from '@orpc/openapi/node'
import { CORSPlugin } from '@orpc/server/plugins'
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from '@orpc/zod'

const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [\
    new CORSPlugin(),\
    new ZodSmartCoercionPlugin(),\
  ],
})

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [\
    new ZodToJsonSchemaConverter(),\
  ],
})

const server = createServer(async (req, res) => {
  const { matched } = await openAPIHandler.handle(req, res, {
    prefix: '/api',
  })

  if (matched) {
    return
  }

  if (req.url === '/spec.json') {
    const spec = await openAPIGenerator.generate(router, {
      info: {
        title: 'My Playground',
        version: '1.0.0',
      },
      servers: [\
        { url: '/api' }, /** Should use absolute URLs in production */\
      ],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
    })

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(spec))
    return
  }

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>My Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(html)
})

server.listen(3000, () => {
  console.log('Playground is available at http://localhost:3000')
})
```

Access the playground at `http://localhost:3000` to view your API client.---
url: "https://orpc.unnoq.com/docs/pinia-colada"
title: "Pinia Colada Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/pinia-colada#VPContent)

On this page

# Pinia Colada Integration [​](https://orpc.unnoq.com/docs/pinia-colada\#pinia-colada-integration)

[Pinia Colada](https://pinia-colada.esm.dev/) is the data fetching layer for Pinia and Vue. oRPC’s integration with Pinia Colada is lightweight and straightforward - there’s no extra overhead.

WARNING

This documentation assumes you are already familiar with [Pinia Colada](https://pinia-colada.esm.dev/). If you need a refresher, please review the official Pinia Colada documentation before proceeding.

## Installation [​](https://orpc.unnoq.com/docs/pinia-colada\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/vue-colada@latest @pinia/colada@latest
```

sh

```
yarn add @orpc/vue-colada@latest @pinia/colada@latest
```

sh

```
pnpm add @orpc/vue-colada@latest @pinia/colada@latest
```

sh

```
bun add @orpc/vue-colada@latest @pinia/colada@latest
```

sh

```
deno install npm:@orpc/vue-colada@latest npm:@pinia/colada@latest
```

## Setup [​](https://orpc.unnoq.com/docs/pinia-colada\#setup)

Before you begin, ensure you have already configured a [server-side client](https://orpc.unnoq.com/docs/client/server-side) or a [client-side client](https://orpc.unnoq.com/docs/client/client-side).

ts

```
import {
createORPCVueColadaUtils } from '@orpc/vue-colada'

export const
orpc =
createORPCVueColadaUtils(
client)

orpc.
planet.
find.

queryOptions({
input: {
id: 123 } })

//
```

## Avoiding Query/Mutation Key Conflicts [​](https://orpc.unnoq.com/docs/pinia-colada\#avoiding-query-mutation-key-conflicts)

Prevent key conflicts by passing a unique base key when creating your utils:

ts

```
const userORPC = createORPCVueColadaUtils(userClient, {
  path: ['user']
})
const postORPC = createORPCVueColadaUtils(postClient, {
  path: ['post']
})
```

## Query Options Utility [​](https://orpc.unnoq.com/docs/pinia-colada\#query-options-utility)

Use `.queryOptions` to configure queries. Use it with hooks like `useQuery`, `useSuspenseQuery`, or `prefetchQuery`.

ts

```
const
query =
useQuery(
orpc.
planet.
find.
queryOptions({

input: {
id: 123 }, // Specify input if needed

context: {
cache: true }, // Provide client context if needed
  // additional options...
}))
```

## Mutation Options [​](https://orpc.unnoq.com/docs/pinia-colada\#mutation-options)

Use `.mutationOptions` to create options for mutations. Use it with hooks like `useMutation`.

ts

```
const
mutation =
useMutation(
orpc.
planet.
create.
mutationOptions({

context: {
cache: true }, // Provide client context if needed
  // additional options...
}))

mutation.
mutate({
name: 'Earth' })
```

## Query/Mutation Key [​](https://orpc.unnoq.com/docs/pinia-colada\#query-mutation-key)

Use `.key` to generate a `QueryKey` or `MutationKey`. This is useful for tasks such as revalidating queries, checking mutation status, etc.

ts

```
const
queryCache =
useQueryCache()

// Invalidate all planet queries

queryCache.
invalidateQueries({

key:
orpc.
planet.
key(),
})

// Invalidate the planet find query with id 123

queryCache.
invalidateQueries({

key:
orpc.
planet.
find.
key({
input: {
id: 123 } })
})
```

## Calling Procedure Clients [​](https://orpc.unnoq.com/docs/pinia-colada\#calling-procedure-clients)

Use `.call` to call a procedure client directly. It's an alias for corresponding procedure client.

ts

```
const result = orpc.planet.find.call({ id: 123 })
```

## Error Handling [​](https://orpc.unnoq.com/docs/pinia-colada\#error-handling)

Easily manage type-safe errors using our built-in `isDefinedError` helper.

ts

```
import { isDefinedError } from '@orpc/client'

const mutation = useMutation(orpc.planet.create.mutationOptions({
  onError: (error) => {
    if (isDefinedError(error)) {
      // Handle the error here
    }
  },
}))

mutation.mutate({ name: 'Earth' })

if (mutation.error.value && isDefinedError(mutation.error.value)) {
  // Handle the error here
}
```

For more details, see our [type-safe error handling guide](https://orpc.unnoq.com/docs/error-handling#type%E2%80%90safe-error-handling).

- call
- key
- mutationOptions
- queryOptions---
url: "https://orpc.unnoq.com/docs/playgrounds"
title: "Playgrounds - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/playgrounds#VPContent)

On this page

# Playgrounds [​](https://orpc.unnoq.com/docs/playgrounds\#playgrounds)

Explore oRPC implementations through our interactive playgrounds, featuring pre-configured examples accessible instantly via StackBlitz or local setup.

## Available Playgrounds [​](https://orpc.unnoq.com/docs/playgrounds\#available-playgrounds)

| Environment | StackBlitz | GitHub Source |
| --- | --- | --- |
| Next.js Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/next) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/next) |
| TanStack Start Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/tanstack-start) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/tanstack-start) |
| Nuxt.js Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/nuxt) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/nuxt) |
| Solid Start Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/solid-start) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/solid-start) |
| Svelte Kit Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/svelte-kit) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/svelte-kit) |
| Astro Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/astro) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/astro) |
| Contract-First Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/contract-first) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/contract-first) |
| NestJS Playground | [Open in StackBlitz](https://stackblitz.com/github/unnoq/orpc/tree/main/playgrounds/nest) | [View Source](https://github.com/unnoq/orpc/tree/main/playgrounds/nest) |

WARNING

StackBlitz has own limitations, so some features may not work as expected.

## Local Development [​](https://orpc.unnoq.com/docs/playgrounds\#local-development)

If you prefer working locally, you can clone any playground using the following commands:

bash

```
npx degit unnoq/orpc/playgrounds/next orpc-next-playground
npx degit unnoq/orpc/playgrounds/tanstack-start orpc-tanstack-start-playground
npx degit unnoq/orpc/playgrounds/nuxt orpc-nuxt-playground
npx degit unnoq/orpc/playgrounds/solid-start orpc-solid-start-playground
npx degit unnoq/orpc/playgrounds/svelte-kit orpc-svelte-kit-playground
npx degit unnoq/orpc/playgrounds/astro orpc-astro-playground
npx degit unnoq/orpc/playgrounds/contract-first orpc-contract-first-playground
npx degit unnoq/orpc/playgrounds/nest orpc-nest-playground
```

For each project, set up the development environment:

bash

```
# Install dependencies
npm install

# Start the development server
npm run dev
```

That's it! You can now access the playground at `http://localhost:3000`.---
url: "https://orpc.unnoq.com/docs/plugins/batch-request-response"
title: "Batch Request/Response Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/batch-request-response#VPContent)

On this page

# Batch Request/Response Plugin [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#batch-request-response-plugin)

The **Batch Request/Response Plugin** allows you to combine multiple requests and responses into a single batch, reducing the overhead of sending each one separately.

INFO

The **Batch Plugin** streams responses asynchronously so that no individual request blocks another, ensuring all responses are handled independently for faster, more efficient batching.

## Setup [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#setup)

This plugin requires configuration on both the server and client sides.

### Server [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#server)

ts

```
import {
BatchHandlerPlugin } from '@orpc/server/plugins'

const
handler = new
RPCHandler(
router, {

plugins: [new\
BatchHandlerPlugin()],
})
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler) or custom implementations. Note that this plugin uses its own protocol for batching requests and responses, which is different from the handler’s native protocol.

### Client [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#client)

To use the `BatchLinkPlugin`, define at least one group. Requests within the same group will be considered for batching together, and each group requires a `context` as described in [client context](https://orpc.unnoq.com/docs/client/rpc-link#using-client-context).

ts

```
import {
BatchLinkPlugin } from '@orpc/client/plugins'

const
link = new
RPCLink({

url: 'https://api.example.com/rpc',

plugins: [\
    new\
BatchLinkPlugin({\
\
groups: [\
        {\
\
condition:\
options => true,\
\
context: {} // This context will represent the batch request and persist throughout the request lifecycle\
        }\
      ]\
    }),\
  ],
})
```

INFO

The `link` can be any supported oRPC link, such as [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link), [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), or custom implementations.

## Limitations [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#limitations)

The plugin does not support [AsyncIteratorObject](https://orpc.unnoq.com/docs/rpc-handler#supported-data-types) or [File/Blob](https://orpc.unnoq.com/docs/rpc-handler#supported-data-types) in responses (requests will auto fall back to the default behavior). To exclude unsupported procedures, use the `exclude` option:

ts

```
const
link = new
RPCLink({

url: 'https://api.example.com/rpc',

plugins: [\
    new\
BatchLinkPlugin({\
\
groups: [\
        {\
\
condition:\
options => true,\
\
context: {}\
        }\
      ],\
\
exclude: ({\
path }) => {\
        return ['planets/getImage', 'planets/subscribe'].\
includes(\
path.\
join('/'))\
      }\
    }),\
  ],
})
```

## Request Headers [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#request-headers)

By default, oRPC uses the headers appear in all requests in the batch. To customize headers, use the `headers` option:

ts

```
const
link = new
RPCLink({

url: 'https://api.example.com/rpc',

plugins: [\
    new\
BatchLinkPlugin({\
\
groups: [\
        {\
\
condition:\
options => true,\
\
context: {}\
        }\
      ],\
\
headers: () => ({\
\
authorization: 'Bearer 1234567890',\
      })\
    }),\
  ],
})
```

## Response Headers [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#response-headers)

By default, the response headers are empty. To customize headers, use the `headers` option:

ts

```
import {
BatchHandlerPlugin } from '@orpc/server/plugins'

const
handler = new
RPCHandler(
router, {

plugins: [new\
BatchHandlerPlugin({\
\
headers:\
responses => ({\
      'some-header': 'some-value',\
    })\
  })],
})
```

## Groups [​](https://orpc.unnoq.com/docs/plugins/batch-request-response\#groups)

Requests within the same group will be considered for batching together, and each group requires a `context` as described in [client context](https://orpc.unnoq.com/docs/client/rpc-link#using-client-context).

In the example below, I used a group and `context` to batch requests based on the `cache` control:

ts

```
import {
RPCLink } from '@orpc/client/fetch'
import {
BatchLinkPlugin } from '@orpc/client/plugins'

interface ClientContext {

cache?:
RequestCache
}

const
link = new
RPCLink<ClientContext>({

url: 'http://localhost:3000/rpc',

method: ({
context }) => {
    if (
context?.
cache) {
      return 'GET'
    }

    return 'POST'
  },

plugins: [\
    new\
BatchLinkPlugin({\
\
groups: [\
        {\
\
condition: ({\
context }) =>\
context?.\
cache === 'force-cache',\
\
context: { // This context will be passed to the fetch method\
\
cache: 'force-cache',\
          },\
        },\
        { // Fallback for all other requests - need put it at the end of list\
\
condition: () => true,\
\
context: {},\
        },\
      ],\
    }),\
  ],

fetch: (
request,
init, {
context }) =>
globalThis.
fetch(
request, {
    ...
init,

cache:
context?.
cache,
  }),
})
```

Now, calls with `cache=force-cache` will be sent with `cache=force-cache`, whether they're batched or executed individually.---
url: "https://orpc.unnoq.com/docs/plugins/body-limit"
title: "Body Limit Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/body-limit#VPContent)

On this page

# Body Limit Plugin [​](https://orpc.unnoq.com/docs/plugins/body-limit\#body-limit-plugin)

The **Body Limit Plugin** restricts the size of the request body.

## Import [​](https://orpc.unnoq.com/docs/plugins/body-limit\#import)

Depending on your adapter, import the corresponding plugin:

ts

```
import { BodyLimitPlugin } from '@orpc/server/fetch'
import { BodyLimitPlugin } from '@orpc/server/node'
```

## Setup [​](https://orpc.unnoq.com/docs/plugins/body-limit\#setup)

Configure the plugin with your desired maximum body size:

ts

```
const handler = new RPCHandler(router, {
  plugins: [\
    new BodyLimitPlugin({\
      maxBodySize: 1024 * 1024, // 1MB\
    }),\
  ],
})
```---
url: "https://orpc.unnoq.com/docs/plugins/client-retry"
title: "Client Retry Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/client-retry#VPContent)

On this page

# Client Retry Plugin [​](https://orpc.unnoq.com/docs/plugins/client-retry\#client-retry-plugin)

The `Client Retry Plugin` enables retrying client calls when errors occur.

## Setup [​](https://orpc.unnoq.com/docs/plugins/client-retry\#setup)

Before you begin, please review the [Client Context](https://orpc.unnoq.com/docs/client/rpc-link#using-client-context) documentation.

ts

```
import {
RPCLink } from '@orpc/client/fetch'
import {
ClientRetryPlugin, ClientRetryPluginContext } from '@orpc/client/plugins'

interface ORPCClientContext extends ClientRetryPluginContext {}

const
link = new
RPCLink<ORPCClientContext>({

url: 'http://localhost:3000/rpc',

plugins: [\
    new\
ClientRetryPlugin({\
\
default: { // Optional override for default options\
\
retry: ({\
path }) => {\
          if (\
path.\
join('.') === 'planet.list') {\
            return 2\
          }\
\
          return 0\
        }\
      },\
    }),\
  ],
})

const
client:
RouterClient<typeof
router, ORPCClientContext> =
createORPCClient(
link)
```

## Usage [​](https://orpc.unnoq.com/docs/plugins/client-retry\#usage)

ts

```
const
planets = await
client.
planet.
list({
limit: 10 }, {

context: {

retry: 3, // Maximum retry attempts

retryDelay: 2000, // Delay between retries in ms

shouldRetry:
options => true, // Determines whether to retry based on the error

onRetry: (
options) => {
      // Hook executed on each retry

      return (
isSuccess) => {
        // Execute after the retry is complete
      }
    },
  }
})
```

INFO

By default, retries are disabled unless a `retry` count is explicitly set.

- **retry:** Maximum retry attempts before throwing an error (default: `0`).
- **retryDelay:** Delay between retries (default: `(o) => o.lastEventRetry ?? 2000`).
- **shouldRetry:** Function that determines whether to retry (default: `true`).

## Event Iterator (SSE) [​](https://orpc.unnoq.com/docs/plugins/client-retry\#event-iterator-sse)

To replicate the behavior of [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) for [Event Iterator](https://orpc.unnoq.com/docs/event-iterator), use the following configuration:

ts

```
const streaming = await client.streaming('the input', {
  context: {
    retry: Number.POSITIVE_INFINITY,
  }
})

for await (const message of streaming) {
  console.log(message)
}
```---
url: "https://orpc.unnoq.com/docs/plugins/cors"
title: "CORS Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/cors#VPContent)

On this page

# CORS Plugin [​](https://orpc.unnoq.com/docs/plugins/cors\#cors-plugin)

`CORSPlugin` is a plugin for oRPC that allows you to configure CORS for your API.

## Basic [​](https://orpc.unnoq.com/docs/plugins/cors\#basic)

ts

```
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin({\
      origin: (origin, options) => origin,\
      allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],\
      // ...\
    }),\
  ],
})
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/plugins/response-headers"
title: "Response Headers Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/response-headers#VPContent)

On this page

# Response Headers Plugin [​](https://orpc.unnoq.com/docs/plugins/response-headers\#response-headers-plugin)

The Response Headers Plugin allows you to set response headers in oRPC. It injects a `resHeaders` instance into the `context`, enabling you to modify response headers easily.

## Context Setup [​](https://orpc.unnoq.com/docs/plugins/response-headers\#context-setup)

ts

```
import { ResponseHeadersPluginContext } from '@orpc/server/plugins'

interface ORPCContext extends ResponseHeadersPluginContext {}

const
base =
os.
$context<ORPCContext>()

const
example =
base
  .
use(({
context,
next }) => {

context.
resHeaders?.
set('x-custom-header', 'value')
    return
next()
  })
  .
handler(({
context }) => {

context.
resHeaders?.
set('x-custom-header', 'value')
  })
```

INFO

**Why can `resHeaders` be `undefined`?** This allows procedures to run safely even when `ResponseHeadersPlugin` is not used, such as in direct calls.

## Handler Setup [​](https://orpc.unnoq.com/docs/plugins/response-headers\#handler-setup)

ts

```
import { ResponseHeadersPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [\
    new ResponseHeadersPlugin()\
  ],
})
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or another custom handler.---
url: "https://orpc.unnoq.com/docs/plugins/simple-csrf-protection"
title: "Simple CSRF Protection Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/simple-csrf-protection#VPContent)

On this page

# Simple CSRF Protection Plugin [​](https://orpc.unnoq.com/docs/plugins/simple-csrf-protection\#simple-csrf-protection-plugin)

This plugin adds basic [Cross-Site Request Forgery (CSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSRF_prevention) protection to your oRPC application. It helps ensure that requests to your procedures originate from JavaScript code, not from other sources like standard HTML forms or direct browser navigation.

## When to Use [​](https://orpc.unnoq.com/docs/plugins/simple-csrf-protection\#when-to-use)

This plugin is beneficial if your application stores sensitive data (like session or auth tokens) in Cookie storage using `SameSite=Lax` (the default) or `SameSite=None`.

## Setup [​](https://orpc.unnoq.com/docs/plugins/simple-csrf-protection\#setup)

This plugin requires configuration on both the server and client sides.

### Server [​](https://orpc.unnoq.com/docs/plugins/simple-csrf-protection\#server)

ts

```
import {
SimpleCsrfProtectionHandlerPlugin } from '@orpc/server/plugins'

const
handler = new
RPCHandler(
router, {

plugins: [\
    new\
SimpleCsrfProtectionHandlerPlugin()\
  ],
})
```

INFO

The `handler` can be any supported oRPC handler, such as [RPCHandler](https://orpc.unnoq.com/docs/rpc-handler), [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler), or custom implementations.

### Client [​](https://orpc.unnoq.com/docs/plugins/simple-csrf-protection\#client)

ts

```
import {
SimpleCsrfProtectionLinkPlugin } from '@orpc/client/plugins'

const
link = new
RPCLink({

url: 'https://api.example.com/rpc',

plugins: [\
    new\
SimpleCsrfProtectionLinkPlugin(),\
  ],
})
```

INFO

The `link` can be any supported oRPC link, such as [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link), [OpenAPILink](https://orpc.unnoq.com/docs/openapi/client/openapi-link), or custom implementations.---
url: "https://orpc.unnoq.com/docs/plugins/strict-get-method"
title: "Strict GET Method Plugin - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/plugins/strict-get-method#VPContent)

On this page

# Strict GET Method Plugin [​](https://orpc.unnoq.com/docs/plugins/strict-get-method\#strict-get-method-plugin)

This plugin enhances security by ensuring only procedures explicitly marked to accept `GET` requests can be called using the HTTP `GET` method for [RPC Protocol](https://orpc.unnoq.com/docs/advanced/rpc-protocol). This helps prevent certain types of [Cross-Site Request Forgery (CSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSRF_prevention) attacks.

INFO

[RPCHandler](https://orpc.unnoq.com/docs/rpc-handler) enabled this plugin by default for [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http).

## When to Use [​](https://orpc.unnoq.com/docs/plugins/strict-get-method\#when-to-use)

This plugin is beneficial if your application stores sensitive data (like session or auth tokens) in Cookie storage using `SameSite=Lax` (the default) or `SameSite=None`.

## How it works [​](https://orpc.unnoq.com/docs/plugins/strict-get-method\#how-it-works)

The plugin enforces a simple rule: only procedures explicitly configured with `method: 'GET'` can be invoked via a `GET` request. All other procedures will reject `GET` requests.

ts

```
import { os } from '@orpc/server'

const ping = os
  .route({ method: 'GET' })
  .handler(() => 'pong')
```

## Setup [​](https://orpc.unnoq.com/docs/plugins/strict-get-method\#setup)

ts

```
import {
StrictGetMethodPlugin } from '@orpc/server/plugins'

const
handler = new
RPCHandler(
router, {

plugins: [\
    new\
StrictGetMethodPlugin()\
  ],
})
```---
url: "https://orpc.unnoq.com/docs/procedure"
title: "Procedure - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/procedure#VPContent)

On this page

# Procedure in oRPC [​](https://orpc.unnoq.com/docs/procedure\#procedure-in-orpc)

In oRPC, a procedure like a standard function but comes with built-in support for:

- Input/output validation
- Middleware
- Dependency injection
- Other extensibility features

## Overview [​](https://orpc.unnoq.com/docs/procedure\#overview)

Here’s an example of defining a procedure in oRPC:

ts

```
import { os } from '@orpc/server'

const example = os
  .use(aMiddleware) // Apply middleware
  .input(z.object({ name: z.string() })) // Define input validation
  .use(aMiddlewareWithInput, input => input.name) // Use middleware with typed input
  .output(z.object({ id: z.number() })) // Define output validation
  .handler(async ({ input, context }) => { // Define execution logic
    return { id: 1 }
  })
  .callable() // Make the procedure callable like a regular function
  .actionable() // Server Action compatibility
```

INFO

The `.handler` method is the only required step. All other chains are optional.

## Input/Output Validation [​](https://orpc.unnoq.com/docs/procedure\#input-output-validation)

oRPC supports [Zod](https://github.com/colinhacks/zod), [Valibot](https://github.com/fabian-hiller/valibot), [Arktype](https://github.com/arktypeio/arktype), and any other [Standard Schema](https://github.com/standard-schema/standard-schema?tab=readme-ov-file#what-schema-libraries-implement-the-spec) library for input and output validation.

TIP

By explicitly specifying the `.output` or your `handler's return type`, you enable TypeScript to infer the output without parsing the handler's code. This approach can dramatically enhance both type-checking and IDE-suggestion speed.

### `type` Utility [​](https://orpc.unnoq.com/docs/procedure\#type-utility)

For simple use-case without external libraries, use oRPC’s built-in `type` utility. It takes a mapping function as its first argument:

ts

```
import {
os,
type } from '@orpc/server'

const
example =
os
  .
input(
type<{
value: number }>())
  .
output(
type<{
value: number }, number>(({
value }) =>
value))
  .
handler(async ({
input }) =>
input)
```

## Using Middleware [​](https://orpc.unnoq.com/docs/procedure\#using-middleware)

The `.use` method allows you to pass [middleware](https://orpc.unnoq.com/docs/middleware), which must call `next` to continue execution.

ts

```
const aMiddleware = os.middleware(async ({ context, next }) => next())

const example = os
  .use(aMiddleware) // Apply middleware
  .use(async ({ context, next }) => next()) // Inline middleware
  .handler(async ({ context }) => { /* logic */ })
```

INFO

[Middleware](https://orpc.unnoq.com/docs/middleware) can be applied if the [current context](https://orpc.unnoq.com/docs/context#combining-initial-and-execution-context) meets the [middleware dependent context](https://orpc.unnoq.com/docs/middleware#dependent-context) requirements and does not conflict with the [current context](https://orpc.unnoq.com/docs/context#combining-initial-and-execution-context).

## Initial Configuration [​](https://orpc.unnoq.com/docs/procedure\#initial-configuration)

Customize the initial input schema using `.$input`:

ts

```
const base = os.$input(z.void())
const base = os.$input<Schema<void, unknown>>()
```

Unlike `.input`, the `.$input` method lets you redefine the input schema after its initial configuration. This is useful when you need to enforce a `void` input when no `.input` is specified.

## Reusability [​](https://orpc.unnoq.com/docs/procedure\#reusability)

Each modification to a builder creates a completely new instance, avoiding reference issues. This makes it easy to reuse and extend procedures efficiently.

ts

```
const pub = os.use(logMiddleware) // Base setup for procedures that publish
const authed = pub.use(authMiddleware) // Extends 'pub' with authentication

const pubExample = pub.handler(async ({ context }) => { /* logic */ })

const authedExample = pubExample.use(authMiddleware)
```

This pattern helps prevent duplication while maintaining flexibility.---
url: "https://orpc.unnoq.com/docs/router"
title: "Router - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/router#VPContent)

On this page

# Router in oRPC [​](https://orpc.unnoq.com/docs/router\#router-in-orpc)

Routers in oRPC are simple, nestable objects composed of procedures. They can also modify their own procedures, offering flexibility and modularity when designing your API.

## Overview [​](https://orpc.unnoq.com/docs/router\#overview)

Routers are defined as plain JavaScript objects where each key corresponds to a procedure. For example:

ts

```
import { os } from '@orpc/server'

const ping = os.handler(async () => 'ping')
const pong = os.handler(async () => 'pong')

const router = {
  ping,
  pong,
  nested: { ping, pong }
}
```

## Extending Router [​](https://orpc.unnoq.com/docs/router\#extending-router)

Routers can be modified to include additional features. For example, to require authentication on all procedures:

ts

```
const router = os.use(requiredAuth).router({
  ping,
  pong,
  nested: {
    ping,
    pong,
  }
})
```

WARNING

If you apply middleware using `.use` at both the router and procedure levels, it may execute multiple times. This duplication can lead to performance issues. For guidance on avoiding redundant middleware execution, please see our [best practices for middleware deduplication](https://orpc.unnoq.com/docs/best-practices/dedupe-middleware).

## Lazy Router [​](https://orpc.unnoq.com/docs/router\#lazy-router)

In oRPC, routers can be lazy-loaded, making them ideal for code splitting and enhancing cold start performance. Lazy loading allows you to defer the initialization of routes until they are actually needed, which reduces the initial load time and improves resource management.

router.tsplanet.ts

ts

```
const router = {
  ping,
  pong,
  planet: os.lazy(() => import('./planet'))
}
```

ts

```
const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
})

export const listPlanet = os
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ input }) => {
    // your list code here
    return [{ id: 1, name: 'name' }]
  })

export default {
  list: listPlanet,
  // ...
}
```

## Utilities [​](https://orpc.unnoq.com/docs/router\#utilities)

INFO

Every [procedure](https://orpc.unnoq.com/docs/procedure) is also a router, so you can apply these utilities to procedures as well.

### Infer Router Inputs [​](https://orpc.unnoq.com/docs/router\#infer-router-inputs)

ts

```
import type {
InferRouterInputs } from '@orpc/server'

export type
Inputs =
InferRouterInputs<typeof
router>

type
FindPlanetInput =
Inputs['planet']['find']
```

Infers the expected input types for each procedure in the router.

### Infer Router Outputs [​](https://orpc.unnoq.com/docs/router\#infer-router-outputs)

ts

```
import type {
InferRouterOutputs } from '@orpc/server'

export type
Outputs =
InferRouterOutputs<typeof
router>

type
FindPlanetOutput =
Outputs['planet']['find']
```

Infers the expected output types for each procedure in the router.

### Infer Router Initial Contexts [​](https://orpc.unnoq.com/docs/router\#infer-router-initial-contexts)

ts

```
import type {
InferRouterInitialContexts } from '@orpc/server'

export type
InitialContexts =
InferRouterInitialContexts<typeof
router>

type
FindPlanetInitialContext =
InitialContexts['planet']['find']
```

Infers the [initial context](https://orpc.unnoq.com/docs/context#initial-context) types defined for each procedure.

### Infer Router Current Contexts [​](https://orpc.unnoq.com/docs/router\#infer-router-current-contexts)

ts

```
import type {
InferRouterCurrentContexts } from '@orpc/server'

export type
CurrentContexts =
InferRouterCurrentContexts<typeof
router>

type
FindPlanetCurrentContext =
CurrentContexts['planet']['find']
```

Infers the [current context](https://orpc.unnoq.com/docs/context#combining-initial-and-execution-context) types, which combine the initial context with the execution context and pass it to the handler.---
url: "https://orpc.unnoq.com/docs/rpc-handler"
title: "RPC Handler - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/rpc-handler#VPContent)

On this page

# RPC Handler [​](https://orpc.unnoq.com/docs/rpc-handler\#rpc-handler)

The `RPCHandler` enables communication with clients over oRPC's proprietary [RPC protocol](https://orpc.unnoq.com/docs/advanced/rpc-protocol), built on top of HTTP. While it efficiently transfers native types, the protocol is neither human-readable nor OpenAPI-compatible. For OpenAPI support, use the [OpenAPIHandler](https://orpc.unnoq.com/docs/openapi/openapi-handler).

WARNING

`RPCHandler` is designed exclusively for [RPCLink](https://orpc.unnoq.com/docs/client/rpc-link) and **does not** support OpenAPI. Avoid sending requests to it manually.

WARNING

This documentation is focused on the [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http). Other adapters may remove or change options to keep things simple.

## Supported Data Types [​](https://orpc.unnoq.com/docs/rpc-handler\#supported-data-types)

`RPCHandler` natively serializes and deserializes the following JavaScript types:

- **string**
- **number** (including `NaN`)
- **boolean**
- **null**
- **undefined**
- **Date** (including `Invalid Date`)
- **BigInt**
- **RegExp**
- **URL**
- **Record (object)**
- **Array**
- **Set**
- **Map**
- **Blob** (unsupported in `AsyncIteratorObject`)
- **File** (unsupported in `AsyncIteratorObject`)
- **AsyncIteratorObject** (only at the root level; powers the [Event Iterator](https://orpc.unnoq.com/docs/event-iterator))

TIP

You can extend the list of supported types by [creating a custom serializer](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer#extending-native-data-types).

## Setup and Integration [​](https://orpc.unnoq.com/docs/rpc-handler\#setup-and-integration)

ts

```
import { RPCHandler } from '@orpc/server/fetch' // or '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'
import { onError } from '@orpc/server'

const handler = new RPCHandler(router, {
  plugins: [\
    new CORSPlugin()\
  ],
  interceptors: [\
    onError((error) => {\
      console.error(error)\
    })\
  ],
})

export default async function fetch(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: '/rpc',
    context: {} // Provide initial context if required
  })

  if (matched) {
    return response
  }

  return new Response('Not Found', { status: 404 })
}
```

## Event Iterator Keep Alive [​](https://orpc.unnoq.com/docs/rpc-handler\#event-iterator-keep-alive)

To keep [Event Iterator](https://orpc.unnoq.com/docs/event-iterator) connections alive, `RPCHandler` periodically sends a ping comment to the client. You can configure this behavior using the following options:

- `eventIteratorKeepAliveEnabled` (default: `true`) – Enables or disables pings.
- `eventIteratorKeepAliveInterval` (default: `5000`) – Time between pings (in milliseconds).
- `eventIteratorKeepAliveComment` (default: `''`) – Custom content for ping comments.

ts

```
const handler = new RPCHandler(router, {
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000, // 5 seconds
  eventIteratorKeepAliveComment: '',
})
```

## Default Plugins [​](https://orpc.unnoq.com/docs/rpc-handler\#default-plugins)

`RPCHandler` automatically enables **essential plugins** for security reasons.

| Plugin | Applies To | Toggle Option |
| --- | --- | --- |
| [StrictGetMethodPlugin](https://orpc.unnoq.com/docs/plugins/strict-get-method) | [HTTP Adapter](https://orpc.unnoq.com/docs/adapters/http) | `strictGetMethodPluginEnabled` |---
url: "https://orpc.unnoq.com/docs/server-action"
title: "Server Action - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/server-action#VPContent)

On this page

# Server Action [​](https://orpc.unnoq.com/docs/server-action\#server-action)

React [Server Actions](https://react.dev/reference/rsc/server-functions) let client components invoke asynchronous server functions. With oRPC, you simply append the `.actionable` modifier to enable Server Action compatibility.

## Server Side [​](https://orpc.unnoq.com/docs/server-action\#server-side)

Define your procedure with `.actionable` for Server Action support.

ts

```
'use server'

import {
redirect } from 'next/navigation'

export const
ping =
os
  .
input(
z.
object({
name:
z.
string() }))
  .
handler(async ({
input }) => `Hello, ${
input.
name}`)
  .
actionable({

context: async () => ({}), // Optional: provide initial context if needed

interceptors: [\
\
onSuccess(async\
output =>\
redirect(`/some-where`)),\
\
onError(async\
error =>\
console.\
error(\
error)),\
    ],
  })
```

TIP

We recommend using [Runtime Context](https://orpc.unnoq.com/docs/context#execution-context) instead of [Initial Context](https://orpc.unnoq.com/docs/context#initial-context) when working with Server Actions.

## Client Side [​](https://orpc.unnoq.com/docs/server-action\#client-side)

On the client, import and call your procedure as follows:

tsx

```
'use client'

import { ping } from './actions'

export function MyComponent() {
  const [name, setName] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const [error, data] = await ping({ name })
    console.log(error, data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

This approach seamlessly integrates server-side procedures with client components via Server Actions.

## Type‑Safe Error Handling [​](https://orpc.unnoq.com/docs/server-action\#type%E2%80%90safe-error-handling)

The `.actionable` modifier supports type-safe error handling with a JSON-like error object.

ts

```
'use client'

const [\
error,\
data] = await
someAction({
name: 'John' })

if (
error) {
  if (
error.
defined) {

console.
log(
error.
data)
    //                 ^ Typed error data
  }
  // Handle unknown errors
}
else {
  // Handle success

console.
log(
data)
}
```

## `@orpc/react` Package [​](https://orpc.unnoq.com/docs/server-action\#orpc-react-package)

The `@orpc/react` package offers utilities to integrate oRPC with React and React Server Actions.

### Installation [​](https://orpc.unnoq.com/docs/server-action\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/react@latest
```

sh

```
yarn add @orpc/react@latest
```

sh

```
pnpm add @orpc/react@latest
```

sh

```
bun add @orpc/react@latest
```

sh

```
deno install npm:@orpc/react@latest
```

### `useServerAction` Hook [​](https://orpc.unnoq.com/docs/server-action\#useserveraction-hook)

The `useServerAction` hook simplifies invoking server actions in React.

tsx

```
'use client'

import {
useServerAction } from '@orpc/react/hooks'
import {
isDefinedError,
onError } from '@orpc/client'

export function
MyComponent() {
  const {
execute,
data,
error,
status } =
useServerAction(
someAction, {

interceptors: [\
\
onError((\
error) => {\
        if (\
isDefinedError(\
error)) {\
\
console.\
error(\
error.\
data)\
          //                   ^ Typed error data\
        }\
      }),\
    ],
  })

  const
action = async (
form: FormData) => {
    const
name =
form.
get('name') as string

execute({
name })
  }

  return (
    <
form
action={
action}>
      <
input
type="text"
name="name"
required />
      <
button
type="submit">Submit</
button>
      {
status === 'pending' && <
p>Loading...</
p>}
    </
form>
  )
}
```

### `createFormAction` Utility [​](https://orpc.unnoq.com/docs/server-action\#createformaction-utility)

The `createFormAction` utility accepts a [procedure](https://orpc.unnoq.com/docs/procedure) and returns a function to handle form submissions. It uses [Bracket Notation](https://orpc.unnoq.com/docs/openapi/bracket-notation) to deserialize form data.

tsx

```
import { createFormAction } from '@orpc/react'

const dosomething = os
  .input(
    z.object({
      user: z.object({
        name: z.string(),
        age: z.coerce.number(),
      }),
    })
  )
  .handler(({ input }) => {
    console.log('Form action called!')
    console.log(input)
  })

export const redirectSomeWhereForm = createFormAction(dosomething, {
  interceptors: [\
    onSuccess(async () => {\
      redirect('/some-where')\
    }),\
  ],
})

export function MyComponent() {
  return (
    <form action={redirectSomeWhereForm}>
      <input type="text" name="user[name]" required />
      <input type="number" name="user[age]" required />
      <button type="submit">Submit</button>
    </form>
  )
}
```

By moving the `redirect('/some-where')` logic into `createFormAction` rather than the procedure, you enhance the procedure's reusability beyond Server Actions.

INFO

When using `createFormAction`, any `ORPCError` with a status of `401`, `403`, or `404` is automatically converted into the corresponding Next.js error responses: [unauthorized](https://nextjs.org/docs/app/api-reference/functions/unauthorized), [forbidden](https://nextjs.org/docs/app/api-reference/functions/forbidden), and [not found](https://nextjs.org/docs/app/api-reference/functions/not-found).---
url: "https://orpc.unnoq.com/docs/tanstack-query/basic"
title: "Tanstack Query Integration - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/tanstack-query/basic#VPContent)

On this page

# Tanstack Query Integration [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#tanstack-query-integration)

[Tanstack Query](https://tanstack.com/query/latest) is a robust solution for asynchronous state management. oRPC’s integration with Tanstack Query is lightweight and straightforward - there’s no extra overhead.

| Library | Tanstack Query | oRPC Integration |
| --- | --- | --- |
| React | ✅ | ✅ |
| Vue | ✅ | ✅ |
| Angular | ✅ | [Vote here](https://github.com/unnoq/orpc/issues/157) |
| Solid | ✅ | ✅ |
| Svelte | ✅ | ✅ |

WARNING

This documentation assumes you are already familiar with [Tanstack Query](https://tanstack.com/query/latest). If you need a refresher, please review the official Tanstack Query documentation before proceeding.

## Query Options Utility [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#query-options-utility)

Use `.queryOptions` to configure queries. Use it with hooks like `useQuery`, `useSuspenseQuery`, or `prefetchQuery`.

ts

```
const query = useQuery(orpc.planet.find.queryOptions({
  input: { id: 123 }, // Specify input if needed
  context: { cache: true }, // Provide client context if needed
  // additional options...
}))
```

## Infinite Query Options Utility [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#infinite-query-options-utility)

Use `.infiniteOptions` to configure infinite queries. Use it with hooks like `useInfiniteQuery`, `useSuspenseInfiniteQuery`, or `prefetchInfiniteQuery`.

INFO

The `input` parameter must be a function that accepts the page parameter and returns the query input. Be sure to define the type for `pageParam` if it can be `null` or `undefined`.

ts

```
const query = useInfiniteQuery(orpc.planet.list.infiniteOptions({
  input: (pageParam: number | undefined) => ({ limit: 10, offset: pageParam }),
  context: { cache: true }, // Provide client context if needed
  initialPageParam: undefined,
  getNextPageParam: lastPage => lastPage.nextPageParam,
  // additional options...
}))
```

## Mutation Options [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#mutation-options)

Use `.mutationOptions` to create options for mutations. Use it with hooks like `useMutation`.

ts

```
const mutation = useMutation(orpc.planet.create.mutationOptions({
  context: { cache: true }, // Provide client context if needed
  // additional options...
}))

mutation.mutate({ name: 'Earth' })
```

## Query/Mutation Key [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#query-mutation-key)

Use `.key` to generate a `QueryKey` or `MutationKey`. This is useful for tasks such as revalidating queries, checking mutation status, etc.

INFO

The `.key` accepts partial deep input—there’s no need to supply full input.

ts

```
const queryClient = useQueryClient()

// Invalidate all planet queries
queryClient.invalidateQueries({
  queryKey: orpc.planet.key(),
})

// Invalidate only regular (non-infinite) planet queries
queryClient.invalidateQueries({
  queryKey: orpc.planet.key({ type: 'query' })
})

// Invalidate the planet find query with id 123
queryClient.invalidateQueries({
  queryKey: orpc.planet.find.key({ input: { id: 123 } })
})
```

## Calling Procedure Clients [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#calling-procedure-clients)

Use `.call` to call a procedure client directly. It's an alias for corresponding procedure client.

ts

```
const result = orpc.planet.find.call({ id: 123 })
```

## Error Handling [​](https://orpc.unnoq.com/docs/tanstack-query/basic\#error-handling)

Easily manage type-safe errors using our built-in `isDefinedError` helper.

ts

```
import { isDefinedError } from '@orpc/client'

const mutation = useMutation(orpc.planet.create.mutationOptions({
  onError: (error) => {
    if (isDefinedError(error)) {
      // Handle the error here
    }
  }
}))

mutation.mutate({ name: 'Earth' })

if (mutation.error && isDefinedError(mutation.error)) {
  // Handle the error here
}
```

For more details, see our [type-safe error handling guide](https://orpc.unnoq.com/docs/error-handling#type%E2%80%90safe-error-handling).---
url: "https://orpc.unnoq.com/docs/tanstack-query/react"
title: "Tanstack Query Integration For React - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/tanstack-query/react#VPContent)

On this page

# Tanstack Query Integration For React [​](https://orpc.unnoq.com/docs/tanstack-query/react\#tanstack-query-integration-for-react)

This guide shows how to integrate oRPC with Tanstack Query for React. For an introduction, please review the [Basic Guide](https://orpc.unnoq.com/docs/tanstack-query/basic) first.

## Installation [​](https://orpc.unnoq.com/docs/tanstack-query/react\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/react-query@latest @tanstack/react-query@latest
```

sh

```
yarn add @orpc/react-query@latest @tanstack/react-query@latest
```

sh

```
pnpm add @orpc/react-query@latest @tanstack/react-query@latest
```

sh

```
bun add @orpc/react-query@latest @tanstack/react-query@latest
```

sh

```
deno install npm:@orpc/react-query@latest npm:@tanstack/react-query@latest
```

## Setup [​](https://orpc.unnoq.com/docs/tanstack-query/react\#setup)

Before you begin, ensure you have already configured a [server-side client](https://orpc.unnoq.com/docs/client/server-side) or a [client-side client](https://orpc.unnoq.com/docs/client/client-side).

ts

```
import {
createORPCReactQueryUtils } from '@orpc/react-query'

export const
orpc =
createORPCReactQueryUtils(
client)

orpc.
planet.
find.

queryOptions({
input: {
id: 123 } })

//
```

## Avoiding Query/Mutation Key Conflicts [​](https://orpc.unnoq.com/docs/tanstack-query/react\#avoiding-query-mutation-key-conflicts)

Prevent key conflicts by passing a unique base key when creating your utils:

ts

```
const userORPC = createORPCReactQueryUtils(userClient, {
  path: ['user']
})
const postORPC = createORPCReactQueryUtils(postClient, {
  path: ['post']
})
```

## Using React Context [​](https://orpc.unnoq.com/docs/tanstack-query/react\#using-react-context)

Integrate oRPC React Query utils into your React app with Context:

1. **Create the Context:**

ts

```
import {
createContext,
use } from 'react'
import {
RouterUtils } from '@orpc/react-query'
import {
RouterClient } from '@orpc/server'

type
ORPCReactUtils =
RouterUtils<
RouterClient<typeof
router>>

export const
ORPCContext =
createContext<
ORPCReactUtils | undefined>(
undefined)

export function
useORPC():
ORPCReactUtils {
     const
orpc =
use(
ORPCContext)
     if (!
orpc) {
       throw new
Error('ORPCContext is not set up properly')
     }
     return
orpc
}
```

2. **Provide the Context in Your App:**

tsx

```
export function App() {
     const [client] = useState<RouterClient<typeof router>>(() => createORPCClient(link))
     const [orpc] = useState(() => createORPCReactQueryUtils(client))

     return (
       <ORPCContext.Provider value={orpc}>
         <YourApp />
       </ORPCContext.Provider>
     )
}
```

3. **Use the Utils in Components:**

ts

```
const
orpc =
useORPC()

const
query =
useQuery(
orpc.
planet.
find.
queryOptions({
input: {
id: 123 } }))
```


## `skipToken` for Disabling Queries [​](https://orpc.unnoq.com/docs/tanstack-query/react\#skiptoken-for-disabling-queries)

You can still use [skipToken](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries/#typesafe-disabling-of-queries-using-skiptoken) by conditionally overriding the `queryFn` property:

ts

```
import {
skipToken,
useQuery } from '@tanstack/react-query'

const
options =
orpc.
planet.
find.
queryOptions({

input: {
id: 123 },
})

const
query =
useQuery({
  ...
options,

queryFn:
condition ?
skipToken :
options.
queryFn,
})
```

- call
- infiniteOptions
- key
- mutationOptions
- queryOptions---
url: "https://orpc.unnoq.com/docs/tanstack-query/solid"
title: "Tanstack Query Integration For Solid - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/tanstack-query/solid#VPContent)

On this page

# Tanstack Query Integration For Solid [​](https://orpc.unnoq.com/docs/tanstack-query/solid\#tanstack-query-integration-for-solid)

This guide shows how to integrate oRPC with Tanstack Query for Solid. For an introduction, please review the [Basic Guide](https://orpc.unnoq.com/docs/tanstack-query/basic) first.

## Installation [​](https://orpc.unnoq.com/docs/tanstack-query/solid\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/solid-query@latest @tanstack/solid-query@latest
```

sh

```
yarn add @orpc/solid-query@latest @tanstack/solid-query@latest
```

sh

```
pnpm add @orpc/solid-query@latest @tanstack/solid-query@latest
```

sh

```
bun add @orpc/solid-query@latest @tanstack/solid-query@latest
```

sh

```
deno install npm:@orpc/solid-query@latest npm:@tanstack/solid-query@latest
```

## Setup [​](https://orpc.unnoq.com/docs/tanstack-query/solid\#setup)

Before you begin, ensure you have already configured a [server-side client](https://orpc.unnoq.com/docs/client/server-side) or a [client-side client](https://orpc.unnoq.com/docs/client/client-side).

ts

```
import {
createORPCSolidQueryUtils } from '@orpc/solid-query'

export const
orpc =
createORPCSolidQueryUtils(
client)

orpc.
planet.
find.

queryOptions({
input: {
id: 123 } })

//
```

## Avoiding Query/Mutation Key Conflicts [​](https://orpc.unnoq.com/docs/tanstack-query/solid\#avoiding-query-mutation-key-conflicts)

Prevent key conflicts by passing a unique base key when creating your utils:

ts

```
const userORPC = createORPCSolidQueryUtils(userClient, {
  path: ['user']
})
const postORPC = createORPCSolidQueryUtils(postClient, {
  path: ['post']
})
```

## Usage [​](https://orpc.unnoq.com/docs/tanstack-query/solid\#usage)

WARNING

Unlike the React version, when creating a Solid Query Signal, the first argument must be a callback.

ts

```
import {
createQuery } from '@tanstack/solid-query'

const
query =
createQuery(
  () =>
orpc.
planet.
find.
queryOptions({
input: {
id: 123 } })
)
```

- call
- infiniteOptions
- key
- mutationOptions
- queryOptions---
url: "https://orpc.unnoq.com/docs/tanstack-query/svelte"
title: "Tanstack Query Integration For Svelte - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/tanstack-query/svelte#VPContent)

On this page

# Tanstack Query Integration For Svelte [​](https://orpc.unnoq.com/docs/tanstack-query/svelte\#tanstack-query-integration-for-svelte)

This guide shows how to integrate oRPC with Tanstack Query for Svelte. For an introduction, please review the [Basic Guide](https://orpc.unnoq.com/docs/tanstack-query/basic) first.

## Installation [​](https://orpc.unnoq.com/docs/tanstack-query/svelte\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/svelte-query@latest @tanstack/svelte-query@latest
```

sh

```
yarn add @orpc/svelte-query@latest @tanstack/svelte-query@latest
```

sh

```
pnpm add @orpc/svelte-query@latest @tanstack/svelte-query@latest
```

sh

```
bun add @orpc/svelte-query@latest @tanstack/svelte-query@latest
```

sh

```
deno install npm:@orpc/svelte-query@latest npm:@tanstack/svelte-query@latest
```

## Setup [​](https://orpc.unnoq.com/docs/tanstack-query/svelte\#setup)

Before you begin, ensure you have already configured a [server-side client](https://orpc.unnoq.com/docs/client/server-side) or a [client-side client](https://orpc.unnoq.com/docs/client/client-side).

ts

```
import {
createORPCSvelteQueryUtils } from '@orpc/svelte-query'

export const
orpc =
createORPCSvelteQueryUtils(
client)

orpc.
planet.
find.

queryOptions({
input: {
id: 123 } })

//
```

## Avoiding Query/Mutation Key Conflicts [​](https://orpc.unnoq.com/docs/tanstack-query/svelte\#avoiding-query-mutation-key-conflicts)

Prevent key conflicts by passing a unique base key when creating your utils:

ts

```
const userORPC = createORPCSvelteQueryUtils(userClient, {
  path: ['user']
})
const postORPC = createORPCSvelteQueryUtils(postClient, {
  path: ['post']
})
```

## Reactivity [​](https://orpc.unnoq.com/docs/tanstack-query/svelte\#reactivity)

To create reactive queries, use Svelte's legacy `derived` API from `svelte/store`. With the [Tanstack Svelte v5 branch](https://github.com/TanStack/query/discussions/7413), oRPC should work out of the box.

ts

```
import {
createQuery } from '@tanstack/svelte-query'
import {
derived,
writable } from 'svelte/store'

const
id =
writable(123)

const
query =
createQuery(

derived(
id,
$id =>
orpc.
planet.
find.
queryOptions({
input: {
id:
$id } })),
)
```

- call
- infiniteOptions
- key
- mutationOptions
- queryOptions---
url: "https://orpc.unnoq.com/docs/tanstack-query/vue"
title: "Tanstack Query Integration For Vue - oRPC"
---

Serverless API Gateway, designed for developers \-

[Try Zuplo](https://zuplo.link/orpc)

[Skip to content](https://orpc.unnoq.com/docs/tanstack-query/vue#VPContent)

On this page

# Tanstack Query Integration For Vue [​](https://orpc.unnoq.com/docs/tanstack-query/vue\#tanstack-query-integration-for-vue)

This guide shows how to integrate oRPC with Tanstack Query for Vue. For an introduction, please review the [Basic Guide](https://orpc.unnoq.com/docs/tanstack-query/basic) first.

## Installation [​](https://orpc.unnoq.com/docs/tanstack-query/vue\#installation)

npmyarnpnpmbundeno

sh

```
npm install @orpc/vue-query@latest @tanstack/vue-query@latest
```

sh

```
yarn add @orpc/vue-query@latest @tanstack/vue-query@latest
```

sh

```
pnpm add @orpc/vue-query@latest @tanstack/vue-query@latest
```

sh

```
bun add @orpc/vue-query@latest @tanstack/vue-query@latest
```

sh

```
deno install npm:@orpc/vue-query@latest npm:@tanstack/vue-query@latest
```

## Setup [​](https://orpc.unnoq.com/docs/tanstack-query/vue\#setup)

Before you begin, ensure you have already configured a [server-side client](https://orpc.unnoq.com/docs/client/server-side) or a [client-side client](https://orpc.unnoq.com/docs/client/client-side).

ts

```
import {
createORPCVueQueryUtils } from '@orpc/vue-query'

export const
orpc =
createORPCVueQueryUtils(
client)

orpc.
planet.
find.

queryOptions({
input: {
id: 123 } })

//
```

## Avoiding Query/Mutation Key Conflicts [​](https://orpc.unnoq.com/docs/tanstack-query/vue\#avoiding-query-mutation-key-conflicts)

Prevent key conflicts by passing a unique base key when creating your utils:

ts

```
const userORPC = createORPCVueQueryUtils(userClient, {
  path: ['user']
})
const postORPC = createORPCVueQueryUtils(postClient, {
  path: ['post']
})
```

- call
- infiniteOptions
- key
- mutationOptions
- queryOptions