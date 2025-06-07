'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Wifi, WifiOff, Plus } from 'lucide-react';
import type { ConnectionState } from '@/types/mcp';

interface SavedConnection {
  id: string;
  name: string;
  url: string;
  headers: Record<string, string>;
}

interface HeaderProps {
  connectionState: ConnectionState;
  onOpenConnectionModal: () => void;
  onDisconnect: () => void;
  onConnectToSaved: (url: string, headers: Record<string, string>, connectionName: string) => void;
  refreshConnections?: () => void;
}

export function Header({ connectionState, onOpenConnectionModal, onDisconnect, onConnectToSaved }: HeaderProps) {
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);

  // Load saved connections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mcp-saved-connections');
    if (saved) {
      try {
        const connections = JSON.parse(saved);
        setSavedConnections(connections);
      } catch (error) {
        console.error('Failed to parse saved connections:', error);
        setSavedConnections([]);
      }
    }
  }, []);

  // Listen for changes to saved connections in other components
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('mcp-saved-connections');
      if (saved) {
        try {
          const connections = JSON.parse(saved);
          setSavedConnections(connections);
        } catch (error) {
          console.error('Failed to parse saved connections:', error);
          setSavedConnections([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const getConnectionStatus = () => {
    switch (connectionState.status) {
      case 'connected':
        return (
          <div className="flex items-center" style={{ gap: '8px' }}>
            <Wifi className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10" style={{ padding: '4px 12px' }}>
              Connected
            </Badge>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center animate-in fade-in duration-300" style={{ gap: '8px' }}>
            <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10 transition-all duration-200" style={{ padding: '4px 12px' }}>
              Connecting...
            </Badge>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center animate-in fade-in duration-300" style={{ gap: '8px' }}>
            <WifiOff className="h-4 w-4 text-red-500" />
            <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10 transition-all duration-200" style={{ padding: '4px 12px' }}>
              Error
            </Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center" style={{ gap: '8px' }}>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-muted-foreground" style={{ padding: '4px 12px' }}>
              Disconnected
            </Badge>
          </div>
        );
    }
  };

  const getServerInfo = () => {
    if (connectionState.serverInfo) {
      return (
        <div className="text-sm text-muted-foreground">
          {connectionState.serverInfo.name} v{connectionState.serverInfo.version}
        </div>
      );
    }
    if (connectionState.connectionName) {
      return (
        <div className="text-sm text-muted-foreground">
          {connectionState.connectionName}
        </div>
      );
    }
    if (connectionState.url) {
      const url = new URL(connectionState.url);
      return (
        <div className="text-sm text-muted-foreground">
          {url.hostname}
        </div>
      );
    }
    return null;
  };

  const handleServerSelection = (value: string) => {
    if (value === 'create-new') {
      onOpenConnectionModal();
    } else {
      const connection = savedConnections.find(conn => conn.id === value);
      if (connection) {
        onConnectToSaved(connection.url, connection.headers, connection.name);
      }
    }
  };

  const getCurrentConnectionId = () => {
    if (connectionState.connectionName) {
      const connection = savedConnections.find(conn => conn.name === connectionState.connectionName);
      return connection?.id || '';
    }
    return '';
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between" style={{ height: '72px', padding: '0 32px' }}>
        {/* Left section - Title */}
        <div className="flex items-center" style={{ gap: '24px' }}>
          <div>
            <h1 className="text-xl font-normal">MCP Server Viewer</h1>
            <p className="text-sm text-muted-foreground">
              Model Context Protocol Explorer
            </p>
          </div>
        </div>

        {/* Center section - Connection info */}
        <div className="flex items-center" style={{ gap: '24px' }}>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <Select value={getCurrentConnectionId()} onValueChange={handleServerSelection}>
            <SelectTrigger className="transition-all duration-200 hover:border-accent-foreground/20 focus:ring-2 focus:ring-ring focus:ring-offset-2" style={{ width: '200px', height: '40px' }}>
              <SelectValue 
                placeholder={
                  connectionState.status === 'connecting' ? 'Connecting...' : 
                  connectionState.status === 'error' ? 'Connection Error' :
                  'Select server...'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="create-new">
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <Plus className="h-4 w-4" />
                  Create Connection
                </div>
              </SelectItem>
              {savedConnections.length > 0 ? (
                savedConnections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{connection.name}</span>
                      <div className="flex items-center" style={{ gap: '6px', marginLeft: '12px' }}>
                        {connectionState.status === 'connected' && connectionState.connectionName === connection.name ? (
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                        ) : connectionState.status === 'error' && connectionState.connectionName === connection.name ? (
                          <div className="h-2 w-2 bg-red-500 rounded-full" />
                        ) : (
                          <div className="h-2 w-2 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-connections" disabled>
                  <span className="text-muted-foreground text-sm">No saved connections</span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConnectionModal}
            className="transition-all duration-200 hover:bg-accent hover:border-accent-foreground/20 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ gap: '8px', padding: '8px 16px', height: '40px' }}
          >
            <Settings className="h-4 w-4" />
            Manage
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}