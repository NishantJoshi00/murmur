import type { Tool, Resource, Prompt, ServerCapabilities, Implementation } from '@modelcontextprotocol/sdk/types.js';
import type { ConnectionMode } from '@/lib/mcp-interface';

export type { Tool, Resource, Prompt, ServerCapabilities, Implementation };
export type { ConnectionMode };

export interface ConnectionState {
  status: "disconnected" | "connecting" | "connected" | "error";
  url?: string;
  headers?: Record<string, string>;
  connectionName?: string;
  mode?: ConnectionMode;
  serverInfo?: Implementation;
  error?: string;
}

export interface ToolInvocation {
  id: string;
  tool: MCPTool;
  parameters: Record<string, any>;
  timestamp: Date;
  response?: MCPResponse;
  error?: string;
  duration?: number;
}