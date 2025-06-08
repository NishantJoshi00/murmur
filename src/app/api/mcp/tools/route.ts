import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function createTemporaryConnection(url: string, headers: Record<string, string>) {
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
        { name: "murmur", version: "1.0.0" },
        { capabilities: {} }
    );

    await client.connect(transport);
    return { client, transport };
}

export async function POST(request: NextRequest) {
    let client: Client | null = null;
    let transport: SSEClientTransport | null = null;

    try {
        const body = await request.json();

        // Handle both list tools and call tool operations
        if (body.operation === 'list') {
            const { url, headers } = body;
            ({ client, transport } = await createTemporaryConnection(url, headers || {}));

            const response = await client.listTools();

            return NextResponse.json({
                success: true,
                tools: response.tools
            });

        } else if (body.operation === 'call') {
            const { url, headers, toolName, arguments: args } = body;
            ({ client, transport } = await createTemporaryConnection(url, headers || {}));

            const response = await client.callTool({
                name: toolName,
                arguments: args || {}
            });

            return NextResponse.json({
                success: true,
                result: response
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid operation' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Tools API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        // Always clean up connections
        if (client) {
            try {
                await client.close();
            } catch (e) {
                console.error('Error closing client:', e);
            }
        }
        if (transport) {
            try {
                await transport.close();
            } catch (e) {
                console.error('Error closing transport:', e);
            }
        }
    }
}
