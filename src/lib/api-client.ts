import type { Tool, Resource, Prompt, Implementation } from '@/types/mcp';

export class MCPAPIClient {
  private url: string;
  private headers: Record<string, string>;

  constructor(url: string, headers: Record<string, string> = {}) {
    this.url = url;
    this.headers = headers;
  }

  async connect(): Promise<Implementation> {
    const response = await fetch('/api/mcp/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: this.url,
        headers: this.headers
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to connect');
    }

    return data.serverInfo;
  }

  async disconnect(): Promise<void> {
    // No-op since we don't store connections server-side anymore
    return Promise.resolve();
  }

  async listTools(): Promise<Tool[]> {
    const response = await fetch('/api/mcp/tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'list',
        url: this.url,
        headers: this.headers
      })
    });

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
        operation: 'call',
        url: this.url,
        headers: this.headers,
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
    const response = await fetch('/api/mcp/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'list',
        url: this.url,
        headers: this.headers
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to list resources');
    }

    return data.resources;
  }

  async readResource(uri: string): Promise<any> {
    const response = await fetch('/api/mcp/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'read',
        url: this.url,
        headers: this.headers,
        uri
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to read resource');
    }

    return data.result;
  }

  async listPrompts(): Promise<Prompt[]> {
    const response = await fetch('/api/mcp/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'list',
        url: this.url,
        headers: this.headers
      })
    });

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
        operation: 'get',
        url: this.url,
        headers: this.headers,
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

  getConnectionDetails(): { url: string; headers: Record<string, string> } {
    return { url: this.url, headers: this.headers };
  }
}