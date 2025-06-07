import { NextRequest, NextResponse } from 'next/server';
import { connections } from '@/lib/connections';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const uri = searchParams.get('uri');

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

    if (uri) {
      // Read specific resource
      const response = await connection.client.readResource({ uri });
      return NextResponse.json({
        success: true,
        result: response
      });
    } else {
      // List all resources
      const response = await connection.client.listResources();
      return NextResponse.json({
        success: true,
        resources: response.resources
      });
    }

  } catch (error) {
    console.error('Resources error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}