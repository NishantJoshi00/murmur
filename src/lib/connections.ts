import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Global connections store (in production, use Redis or similar)
export const connections = new Map<string, { 
  client: Client; 
  transport: SSEClientTransport;
  url: string;
  headers: Record<string, string>;
}>();