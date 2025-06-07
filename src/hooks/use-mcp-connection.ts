'use client';

import { useState, useCallback, useRef } from 'react';
import { MCPAPIClient } from '@/lib/api-client';
import type { ConnectionState, Tool, Resource, Prompt, Implementation } from '@/types/mcp';

export function useMCPConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected'
  });
  const [serverInfo, setServerInfo] = useState<Implementation | null>(null);
  const clientRef = useRef<MCPAPIClient | null>(null);

  const connect = useCallback(async (url: string, headers: Record<string, string> = {}, connectionName?: string) => {
    setConnectionState({
      status: 'connecting',
      url,
      headers,
      connectionName
    });

    try {
      if (clientRef.current) {
        await clientRef.current.disconnect();
      }

      clientRef.current = new MCPAPIClient();
      const implementation = await clientRef.current.connect(url, headers);
      
      setServerInfo(implementation);
      setConnectionState({
        status: 'connected',
        url,
        headers,
        connectionName,
        serverInfo: implementation
      });

      return implementation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionState({
        status: 'error',
        url,
        headers,
        connectionName,
        error: errorMessage
      });
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
    setServerInfo(null);
    setConnectionState({ status: 'disconnected' });
  }, []);

  const listTools = useCallback(async (): Promise<Tool[]> => {
    if (!clientRef.current) {
      throw new Error('Not connected');
    }
    return await clientRef.current.listTools();
  }, []);

  const listResources = useCallback(async (): Promise<Resource[]> => {
    if (!clientRef.current) {
      throw new Error('Not connected');
    }
    return await clientRef.current.listResources();
  }, []);

  const listPrompts = useCallback(async (): Promise<Prompt[]> => {
    if (!clientRef.current) {
      throw new Error('Not connected');
    }
    return await clientRef.current.listPrompts();
  }, []);

  const callTool = useCallback(async (name: string, arguments_: Record<string, any>) => {
    if (!clientRef.current) {
      throw new Error('Not connected');
    }
    return await clientRef.current.callTool(name, arguments_);
  }, []);

  const readResource = useCallback(async (uri: string) => {
    if (!clientRef.current) {
      throw new Error('Not connected');
    }
    return await clientRef.current.readResource(uri);
  }, []);

  const getPrompt = useCallback(async (name: string, arguments_?: Record<string, any>) => {
    if (!clientRef.current) {
      throw new Error('Not connected');
    }
    return await clientRef.current.getPrompt(name, arguments_);
  }, []);

  return {
    connectionState,
    serverInfo,
    connect,
    disconnect,
    listTools,
    listResources,
    listPrompts,
    callTool,
    readResource,
    getPrompt,
    isConnected: connectionState.status === 'connected'
  };
}