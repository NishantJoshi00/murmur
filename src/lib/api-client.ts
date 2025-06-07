import type { Tool, Resource, Prompt, Implementation } from '@/types/mcp';

export class MCPAPIClient {
  private connectionId: string;

  constructor() {
    this.connectionId = Math.random().toString(36).substring(7);
  }

  async connect(url: string, headers: Record<string, string> = {}): Promise<Implementation> {
    const response = await fetch('/api/mcp/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        headers,
        connectionId: this.connectionId
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to connect');
    }

    return data.serverInfo;
  }

  async disconnect(): Promise<void> {
    const response = await fetch('/api/mcp/connect', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionId: this.connectionId
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to disconnect');
    }
  }

  async listTools(): Promise<Tool[]> {
    const response = await fetch(`/api/mcp/tools?connectionId=${this.connectionId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to list tools');
    }

    return data.tools;
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<any> {
    const response = await fetch('/api/mcp/tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionId: this.connectionId,
        toolName: name,
        arguments: arguments_
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to call tool');
    }

    return data.result;
  }

  async listResources(): Promise<Resource[]> {
    const response = await fetch(`/api/mcp/resources?connectionId=${this.connectionId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to list resources');
    }

    return data.resources;
  }

  async readResource(uri: string): Promise<any> {
    const response = await fetch(`/api/mcp/resources?connectionId=${this.connectionId}&uri=${encodeURIComponent(uri)}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to read resource');
    }

    return data.result;
  }

  async listPrompts(): Promise<Prompt[]> {
    const response = await fetch(`/api/mcp/prompts?connectionId=${this.connectionId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to list prompts');
    }

    return data.prompts;
  }

  async getPrompt(name: string, arguments_?: Record<string, any>): Promise<any> {
    const response = await fetch('/api/mcp/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionId: this.connectionId,
        promptName: name,
        arguments: arguments_
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get prompt');
    }

    return data.result;
  }

  getConnectionId(): string {
    return this.connectionId;
  }
}