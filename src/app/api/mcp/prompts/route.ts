import { NextRequest, NextResponse } from 'next/server';
import { connections } from '@/lib/connections';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId || !connections.has(connectionId)) {
      return NextResponse.json(
        { success: false, error: 'No active connection found' },
        { status: 404 }
      );
    }

    const connection = connections.get(connectionId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    const response = await connection.client.listPrompts();
    
    return NextResponse.json({
      success: true,
      prompts: response.prompts
    });

  } catch (error) {
    console.error('List prompts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { connectionId, promptName, arguments: args } = await request.json();

    if (!connectionId || !connections.has(connectionId)) {
      return NextResponse.json(
        { success: false, error: 'No active connection found' },
        { status: 404 }
      );
    }

    const connection = connections.get(connectionId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    const response = await connection.client.getPrompt({
      name: promptName,
      arguments: args || {}
    });
    
    return NextResponse.json({
      success: true,
      result: response
    });

  } catch (error) {
    console.error('Get prompt error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}