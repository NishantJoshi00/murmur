import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export async function POST(request: NextRequest) {
    try {
        const { url, headers } = await request.json();

        // Create a temporary connection to test and get server info
        const transport = new SSEClientTransport(new URL(url), {
            eventSourceInit: {
                fetch: (url, init) => fetch(url, {
                    ...init,
                    headers: {
                        ...headers,
                    }
                })
            },
            requestInit: {
                headers: {
                    ...headers,
                },
                credentials: "include"
            }
        });

        const client = new Client(
            {
                name: "murmur",
                version: "1.0.0",
            },
            {
                capabilities: {}
            }
        );

        const result = await client.connect(transport);

        // Close the test connection immediately
        await client.close();
        await transport.close();

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

// DELETE endpoint is no longer needed since we don't store connections
