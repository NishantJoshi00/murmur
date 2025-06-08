import type { Tool, Resource, Prompt, Implementation } from '@modelcontextprotocol/sdk/types.js';

/**
 * Common interface for MCP clients (both direct and proxy modes)
 */
export interface IMCPClient {
  /**
   * Connect to the MCP server
   */
  connect(url: string, headers?: Record<string, string>): Promise<Implementation>;

  /**
   * Disconnect from the MCP server
   */
  disconnect(): Promise<void>;

  /**
   * List available tools from the server
   */
  listTools(): Promise<Tool[]>;

  /**
   * List available resources from the server
   */
  listResources(): Promise<Resource[]>;

  /**
   * List available prompts from the server
   */
  listPrompts(): Promise<Prompt[]>;

  /**
   * Call a tool with the given name and arguments
   */
  callTool(name: string, arguments_: Record<string, any>): Promise<any>;

  /**
   * Read a resource by URI
   */
  readResource(uri: string): Promise<any>;

  /**
   * Get a prompt with optional arguments
   */
  getPrompt(name: string, arguments_?: Record<string, any>): Promise<any>;

  /**
   * Get the current connection status
   */
  getConnectionStatus(): boolean;
}

/**
 * Connection mode for MCP clients
 */
export type ConnectionMode = 'proxy' | 'direct';