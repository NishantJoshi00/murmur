# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`
- **Type check**: No separate typecheck command - handled by Next.js build process

## Architecture Overview

This is Murmur, an MCP (Model Context Protocol) viewer built with Next.js 15, React 19, and TypeScript. The application provides a web interface for connecting to and interacting with MCP servers.

### Core Architecture Patterns

**Dual Client Architecture**: The app uses both client-side and server-side MCP clients:
- `MCPClient` (src/lib/mcp-client.ts): Direct browser connection via SSE transport
- `MCPAPIClient` (src/lib/api-client.ts): Proxied connection through Next.js API routes
- Server-side connection store in `src/lib/connections.ts` using in-memory Map (for production, consider Redis)

**State Management**: React hooks pattern with `useMCPConnection` hook centralizing connection state and MCP operations.

**API Routes Structure**: Next.js App Router API routes in `src/app/api/mcp/`:
- `/connect` - Connection management (POST/DELETE)
- `/tools` - Tool listing and invocation 
- `/resources` - Resource listing and reading
- `/prompts` - Prompt listing and execution

### Key Components

- **Connection Management**: `connection-form.tsx` and `connection-modal.tsx` handle MCP server connections
- **Tools Interface**: `tools-sidebar.tsx` displays available tools from connected servers
- **Request/Response**: `request-response.tsx` shows tool invocation results
- **UI Components**: Built with Radix UI primitives and styled with Tailwind CSS

### MCP Integration

The app integrates with the Model Context Protocol SDK (`@modelcontextprotocol/sdk`) to:
- Connect to MCP servers via SSE transport
- List and invoke tools, resources, and prompts
- Handle real-time communication with MCP servers

### TypeScript Configuration

Uses path mapping with `@/*` pointing to `src/*` for clean imports. Strict TypeScript configuration with Next.js plugin integration.

### Development Notes

**Theme System**: Uses `next-themes` with custom theme configurations stored in `src/lib/themes.json`. The `theme-manager.ts` handles theme switching logic.

**Error Handling**: MCP connection errors are handled gracefully with connection state management in `useMCPConnection` hook. The app shows appropriate error states in the UI.

**Data Flow**: 
1. User initiates connection via `connection-form.tsx`
2. `useMCPConnection` hook manages state and delegates to appropriate client
3. API routes handle server-side connections and proxy requests
4. UI components reactively update based on connection state changes

### Client-Side vs Server-Side Connection Strategy

**When to use MCPClient (client-side)**:
- Direct browser connections for real-time responsiveness
- Simple authentication scenarios
- Development and testing

**When to use MCPAPIClient (server-side proxy)**:
- Complex authentication requiring server-side secrets
- CORS restrictions from MCP servers
- Production deployments requiring enhanced security

### Storage and State Persistence

**Connection Storage**: Currently uses in-memory Map in `connections.ts`. For production scaling, consider:
- Redis for distributed session storage
- Database persistence for connection configurations
- Client-side localStorage for user preferences (themes, UI state)