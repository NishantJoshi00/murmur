'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2, Save, Edit } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal';
import type { ConnectionState } from '@/types/mcp';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionState: ConnectionState;
  onConnect: (url: string, headers: Record<string, string>, connectionName?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

interface Header {
  id: string;
  key: string;
  value: string;
}

interface SavedConnection {
  id: string;
  name: string;
  url: string;
  headers: Record<string, string>;
}

export function ConnectionModal({
  open,
  onOpenChange,
  connectionState,
  onConnect,
  onDisconnect,
}: ConnectionModalProps) {
  const [url, setUrl] = useState(connectionState.url || 'http://localhost:3001/sse');
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Authorization', value: 'Bearer your-token' }
  ]);
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [connectionName, setConnectionName] = useState('');
  const [editingConnection, setEditingConnection] = useState<string | null>(null);

  // Load saved connections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mcp-saved-connections');
    if (saved) {
      setSavedConnections(JSON.parse(saved));
    }
  }, []);

  // Update form when connection state changes
  useEffect(() => {
    if (connectionState.url) {
      setUrl(connectionState.url);
    }
    if (connectionState.headers) {
      const headerArray = Object.entries(connectionState.headers).map(([key, value], index) => ({
        id: (index + 1).toString(),
        key,
        value
      }));
      if (headerArray.length > 0) {
        setHeaders(headerArray);
      }
    }
  }, [connectionState]);

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleConnect = async () => {
    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);

    await onConnect(url, headersObj, connectionName || undefined);
  };

  const handleDisconnect = async () => {
    await onDisconnect();
  };

  const saveConnection = () => {
    if (!connectionName.trim()) return;

    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const newConnection: SavedConnection = {
      id: Date.now().toString(),
      name: connectionName.trim(),
      url,
      headers: headersObj
    };

    const updated = [...savedConnections, newConnection];
    setSavedConnections(updated);
    localStorage.setItem('mcp-saved-connections', JSON.stringify(updated));
    setConnectionName('');
  };

  const loadConnection = (connection: SavedConnection) => {
    setUrl(connection.url);
    const headerArray = Object.entries(connection.headers).map(([key, value], index) => ({
      id: (index + 1).toString(),
      key,
      value
    }));
    setHeaders(headerArray.length > 0 ? headerArray : [{ id: '1', key: '', value: '' }]);
    setConnectionName(connection.name);
    setEditingConnection(null);
  };

  const deleteConnection = (id: string) => {
    const updated = savedConnections.filter(conn => conn.id !== id);
    setSavedConnections(updated);
    localStorage.setItem('mcp-saved-connections', JSON.stringify(updated));
  };

  const getStatusBadge = () => {
    switch (connectionState.status) {
      case 'connected':
        return <Badge className="mr-10 bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge className="mr-10  bg-yellow-500">Connecting...</Badge>;
      case 'error':
        return <Badge className='mr-10 ' variant="destructive">Error</Badge>;
      default:
        return <Badge className='mr-10 ' variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalClose onClick={() => onOpenChange(false)} />
        <ModalHeader>
          <div className="flex items-center justify-between">
            <div>
              <ModalTitle className="text-base">MCP Server Connection</ModalTitle>
              <ModalDescription className="text-sm">
                Connect to your Model Context Protocol server
              </ModalDescription>
            </div>
            {getStatusBadge()}
          </div>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Saved Connections */}
          {savedConnections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Label className="text-sm">Saved Connections</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    style={{ padding: '20px' }}
                    onClick={() => loadConnection(connection)}
                  >
                    <div className="flex-1">
                      <div className="text-sm">{connection.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{connection.url}</div>
                    </div>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadConnection(connection);
                        }}
                        className="h-9 w-9"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConnection(connection.id);
                        }}
                        className="h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Connection Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Label htmlFor="url" className="text-sm">SSE URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:3001/sse"
                disabled={connectionState.status === 'connecting'}
                className="font-mono"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Custom Headers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHeader}
                  disabled={connectionState.status === 'connecting'}
                  style={{ gap: '8px', padding: '8px 16px' }}
                >
                  <Plus className="h-4 w-4" />
                  Add Header
                </Button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {headers.map((header) => (
                  <div key={header.id} className="flex items-center" style={{ gap: '16px' }}>
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                      disabled={connectionState.status === 'connecting'}
                      className="font-mono"
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                      disabled={connectionState.status === 'connecting'}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHeader(header.id)}
                      disabled={connectionState.status === 'connecting'}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Label className="text-sm">Save This Connection</Label>
              <div className="flex items-center" style={{ gap: '16px' }}>
                <Input
                  placeholder="Connection name"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveConnection}
                  disabled={!connectionName.trim()}
                  className="shrink-0"
                  style={{ gap: '8px', padding: '8px 16px' }}
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            {connectionState.error && (
              <div className="text-sm text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg" style={{ padding: '20px' }}>
                <strong>Error:</strong> {connectionState.error}
              </div>
            )}

            {connectionState.serverInfo && (
              <>
                <Separator />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Label className="text-sm">Server Information</Label>
                  <div className="text-sm bg-muted/30 rounded-lg" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div><span className="font-mono text-muted-foreground">Name:</span> <span className="ml-2">{connectionState.serverInfo.name}</span></div>
                    <div><span className="font-mono text-muted-foreground">Version:</span> <span className="ml-2">{connectionState.serverInfo.version}</span></div>
                    <div><span className="font-mono text-muted-foreground">Protocol:</span> <span className="ml-2">{connectionState.serverInfo.protocolVersion}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </div>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center" style={{ gap: '12px' }}>
              {connectionState.status === 'connected' && (
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  disabled={connectionState.status === 'connecting'}
                >
                  Disconnect
                </Button>
              )}
            </div>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={connectionState.status === 'connecting' || !url}
              >
                {connectionState.status === 'connecting' && (
                  <Loader2 className="h-4 w-4 mr-xs animate-spin" />
                )}
                {connectionState.status === 'connected' ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
