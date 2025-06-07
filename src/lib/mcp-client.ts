import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { Tool, Resource, Prompt, Implementation } from '@modelcontextprotocol/sdk/types.js';

export class MCPClient {
  private client: Client | null = null;
  private transport: SSEClientTransport | null = null;
  private isConnected = false;

  async connect(url: string, headers: Record<string, string> = {}): Promise<Implementation> {
    try {
      // Create SSE transport with custom headers
      this.transport = new SSEClientTransport(new URL(url), {
        headers
      });

      // Create client
      this.client = new Client(
        {
          name: "murmur",
          version: "1.0.0",
        },
        {
          capabilities: {}
        }
      );

      // Connect to the server
      const result = await this.client.connect(this.transport);
      this.isConnected = true;
      
      return result;
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.isConnected = false;
  }

  async listTools(): Promise<Tool[]> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await this.client.listTools();
    return response.tools;
  }

  async listResources(): Promise<Resource[]> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await this.client.listResources();
    return response.resources;
  }

  async listPrompts(): Promise<Prompt[]> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await this.client.listPrompts();
    return response.prompts;
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<any> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await this.client.callTool({
      name,
      arguments: arguments_
    });

    return response;
  }

  async readResource(uri: string): Promise<any> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await this.client.readResource({ uri });
    return response;
  }

  async getPrompt(name: string, arguments_?: Record<string, any>): Promise<any> {
    if (!this.client || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await this.client.getPrompt({
      name,
      arguments: arguments_
    });

    return response;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}