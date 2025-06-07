# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terrascript UI is a SvelteKit application that combines real-time chat capabilities with interactive map visualization, using Google's Generative AI for chat functionality and MapLibre/Deck.gl for mapping features.

## Development Commands

### Core Commands
```bash
# Install dependencies (use pnpm, not npm)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality
```bash
# Run linter and format check
pnpm lint

# Auto-format code
pnpm format

# Type check
pnpm check

# Watch mode for type checking
pnpm check:watch
```

### Database Management
```bash
# Generate migrations from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes directly (development)
pnpm db:push
```

## Architecture Overview

### Technology Stack
- **Frontend**: SvelteKit 2.16.0 with Svelte 5
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4 with shadcn-svelte components
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSockets (ws) and Socket.io
- **AI**: Google Generative AI SDK
- **Maps**: MapLibre GL and Deck.gl

### Key Architectural Patterns

1. **Component Architecture**: The UI uses shadcn-svelte pattern where base components are in `/src/lib/components/ui/` and are composed into feature components like `ChatInterface.svelte` and `Map.svelte`.

2. **Database Layer**: 
   - Server-side: PostgreSQL via Drizzle ORM (`/src/lib/server/db/`)
   - Client-side: IndexedDB via Dexie (`/src/lib/client/db.ts`)
   - Schema defined in `/src/lib/server/db/schema.ts`

3. **Real-time Communication**: WebSocket handler at `/src/lib/server/webSocketHandler.ts` manages bidirectional communication between client and server.

4. **Type Safety**: Shared interfaces in `/src/lib/chatInterfaces.ts` ensure type consistency between client and server for chat messages.

### Environment Variables
- `POSTGRES_URL`: Required for database connection (configured in `drizzle.config.ts`)

### Testing
Currently no testing framework is configured. Consider adding Vitest for unit tests and Playwright for E2E tests when needed.