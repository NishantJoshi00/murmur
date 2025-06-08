'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ConnectionManager, type ConnectionProfile } from '@/lib/connection-manager';
import { createMCPClient, getDefaultConnectionMode } from '@/lib/mcp-client-factory';
import type { ConnectionState, Tool, Resource, Prompt, Implementation, ConnectionMode } from '@/types/mcp';
import type { IMCPClient } from '@/lib/mcp-interface';

export function useMCPConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected'
  });
  const [serverInfo, setServerInfo] = useState<Implementation | null>(null);
  const [savedConnections, setSavedConnections] = useState<ConnectionProfile[]>([]);
  const clientRef = useRef<IMCPClient | null>(null);
  const currentConnectionIdRef = useRef<string | null>(null);

  // Load saved connections on mount
  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = useCallback(async () => {
    try {
      const connections = await ConnectionManager.getAllConnections();
      setSavedConnections(connections);
    } catch (error) {
      console.error('Failed to load saved connections:', error);
    }
  }, []);

  const connect = useCallback(async (
    url: string, 
    headers: Record<string, string> = {}, 
    connectionName?: string,
    mode: ConnectionMode = getDefaultConnectionMode()
  ) => {
    setConnectionState({
      status: 'connecting',
      url,
      headers,
      connectionName,
      mode
    });

    try {
      if (clientRef.current) {
        await clientRef.current.disconnect();
      }

      clientRef.current = createMCPClient(mode, url, headers);
      const implementation = await clientRef.current.connect(url, headers);
      
      setServerInfo(implementation);
      setConnectionState({
        status: 'connected',
        url,
        headers,
        connectionName,
        mode,
        serverInfo: implementation
      });

      // Mark connection as used if it's a saved one
      if (currentConnectionIdRef.current) {
        await ConnectionManager.markAsUsed(currentConnectionIdRef.current);
        await loadSavedConnections(); // Refresh the list
      }

      return implementation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionState({
        status: 'error',
        url,
        headers,
        connectionName,
        mode,
        error: errorMessage
      });
      throw error;
    }
  }, [loadSavedConnections]);

  const connectWithProfile = useCallback(async (profileId: string) => {
    const profile = await ConnectionManager.getConnection(profileId);
    if (!profile) {
      throw new Error('Connection profile not found');
    }
    
    currentConnectionIdRef.current = profileId;
    return await connect(profile.url, profile.headers, profile.name, profile.mode);
  }, [connect]);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
    setServerInfo(null);
    setConnectionState({ status: 'disconnected' });
    currentConnectionIdRef.current = null;
  }, []);

  const saveConnection = useCallback(async (name: string, url: string, headers: Record<string, string>, mode?: ConnectionMode) => {
    const errors = ConnectionManager.validateConnectionProfile({ name, url, headers, mode });
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const id = await ConnectionManager.saveConnection({ name, url, headers, mode });
    await loadSavedConnections();
    return id;
  }, [loadSavedConnections]);

  const updateConnection = useCallback(async (id: string, updates: { name: string, url: string, headers: Record<string, string>, mode?: ConnectionMode }) => {
    const errors = ConnectionManager.validateConnectionProfile(updates);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    await ConnectionManager.updateConnection(id, updates);
    await loadSavedConnections();
  }, [loadSavedConnections]);

  const deleteConnection = useCallback(async (id: string) => {
    await ConnectionManager.deleteConnection(id);
    await loadSavedConnections();
  }, [loadSavedConnections]);

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
    savedConnections,
    connect,
    connectWithProfile,
    disconnect,
    saveConnection,
    updateConnection,
    deleteConnection,
    loadSavedConnections,
    listTools,
    listResources,
    listPrompts,
    callTool,
    readResource,
    getPrompt,
    isConnected: connectionState.status === 'connected'
  };
}