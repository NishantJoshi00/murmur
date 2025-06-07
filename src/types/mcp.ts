import type { Tool, Resource, Prompt, ServerCapabilities, Implementation } from '@modelcontextprotocol/sdk/types.js';

export type { Tool, Resource, Prompt, ServerCapabilities, Implementation };

export interface ConnectionState {
  status: "disconnected" | "connecting" | "connected" | "error";
  url?: string;
  headers?: Record<string, string>;
  connectionName?: string;
  serverInfo?: MCPServerInfo;
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