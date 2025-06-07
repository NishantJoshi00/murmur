import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { connections } from '@/lib/connections';

export async function POST(request: NextRequest) {
  try {
    const { url, headers, connectionId } = await request.json();

    // Close existing connection if any
    if (connections.has(connectionId)) {
      const existing = connections.get(connectionId);
      if (existing) {
        await existing.client.close();
        await existing.transport.close();
        connections.delete(connectionId);
      }
    }

    // Create new connection
    const transport = new SSEClientTransport(new URL(url), {
      headers: headers || {}
    });

    const client = new Client(
      {
        name: "mcp-viewer",
        version: "1.0.0",
      },
      {
        capabilities: {}
      }
    );

    const result = await client.connect(transport);
    
    // Store the connection
    connections.set(connectionId, { client, transport, url, headers: headers || {} });

    return NextResponse.json({
      success: true,
      serverInfo: result
    });

  } catch (error) {
    console.error('MCP connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { connectionId } = await request.json();
    
    if (connections.has(connectionId)) {
      const connection = connections.get(connectionId);
      if (connection) {
        await connection.client.close();
        await connection.transport.close();
        connections.delete(connectionId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MCP disconnect error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}