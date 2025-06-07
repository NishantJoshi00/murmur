# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Architecture Overview

This is Murmur, an MCP (Model Context Protocol) viewer built with Next.js 15, React 19, and TypeScript. The application provides a web interface for connecting to and interacting with MCP servers.

### Core Architecture Patterns

**Dual Client Architecture**: The app uses both client-side and server-side MCP clients:
- `MCPClient` (src/lib/mcp-client.ts): Direct browser connection via SSE
- `MCPAPIClient` (src/lib/api-client.ts): Proxied connection through Next.js API routes
- Connection management handled server-side in `src/lib/connections.ts` with in-memory Map

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