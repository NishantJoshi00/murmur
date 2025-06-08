'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, Save, History } from 'lucide-react';
import type { ConnectionState } from '@/types/mcp';
import type { ConnectionProfile } from '@/lib/connection-manager';

interface ConnectionFormProps {
  connectionState: ConnectionState;
  savedConnections: ConnectionProfile[];
  onConnect: (url: string, headers: Record<string, string>, name?: string) => Promise<void>;
  onConnectWithProfile: (profileId: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSaveConnection: (name: string, url: string, headers: Record<string, string>) => Promise<void>;
  onDeleteConnection: (id: string) => Promise<void>;
}

interface Header {
  id: string;
  key: string;
  value: string;
}

export function ConnectionForm({ 
  connectionState, 
  savedConnections,
  onConnect, 
  onConnectWithProfile,
  onDisconnect,
  onSaveConnection,
  onDeleteConnection
}: ConnectionFormProps) {
  const [url, setUrl] = useState(connectionState.url || 'http://localhost:3001/sse');
  const [connectionName, setConnectionName] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Authorization', value: 'Bearer your-token' }
  ]);

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const loadConnection = (profileId: string) => {
    const profile = savedConnections.find(c => c.id === profileId);
    if (profile) {
      setUrl(profile.url);
      setConnectionName(profile.name);
      setHeaders(
        Object.entries(profile.headers).map(([key, value], index) => ({
          id: `loaded-${index}`,
          key,
          value
        }))
      );
      setSelectedConnection(profileId);
    }
  };

  const handleConnect = async () => {
    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);

    if (selectedConnection) {
      await onConnectWithProfile(selectedConnection);
    } else {
      await onConnect(url, headersObj, connectionName || undefined);
    }
  };

  const handleSaveConnection = async () => {
    if (!connectionName.trim()) {
      alert('Please enter a connection name');
      return;
    }

    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      await onSaveConnection(connectionName, url, headersObj);
      alert('Connection saved successfully');
    } catch (error) {
      alert(`Failed to save connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusBadge = () => {
    switch (connectionState.status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500">Connecting...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>MCP Server Connection</CardTitle>
            <CardDescription>
              Connect to your MCP server using Server-Sent Events
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedConnections.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Saved Connections</Label>
              <Select value={selectedConnection} onValueChange={(value) => {
                if (value === 'new') {
                  setSelectedConnection('');
                  setUrl('http://localhost:3001/sse');
                  setConnectionName('');
                  setHeaders([{ id: '1', key: 'Authorization', value: 'Bearer your-token' }]);
                } else {
                  loadConnection(value);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved connection or create new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Create new connection
                    </div>
                  </SelectItem>
                  {savedConnections
                    .sort((a, b) => new Date(b.lastUsed || b.createdAt).getTime() - new Date(a.lastUsed || a.createdAt).getTime())
                    .map((conn) => (
                    <SelectItem key={conn.id} value={conn.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <History className="h-4 w-4 mr-2" />
                          <span>{conn.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDeleteConnection(conn.id);
                          }}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="connectionName">Connection Name (optional)</Label>
          <Input
            id="connectionName"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My MCP Server"
            disabled={connectionState.status === 'connecting'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">SSE URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:3001/sse"
            disabled={connectionState.status === 'connecting'}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom Headers</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeader}
              disabled={connectionState.status === 'connecting'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Header
            </Button>
          </div>
          
          <div className="space-y-2">
            {headers.map((header) => (
              <div key={header.id} className="flex items-center space-x-2">
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                  disabled={connectionState.status === 'connecting'}
                />
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                  disabled={connectionState.status === 'connecting'}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeHeader(header.id)}
                  disabled={connectionState.status === 'connecting'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {connectionState.error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {connectionState.error}
          </div>
        )}

        {connectionState.serverInfo && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Server Information</Label>
              <div className="text-sm space-y-1">
                <div><strong>Name:</strong> {connectionState.serverInfo.name}</div>
                <div><strong>Version:</strong> {connectionState.serverInfo.version}</div>
                <div><strong>Protocol Version:</strong> {connectionState.serverInfo.protocolVersion}</div>
              </div>
            </div>
          </>
        )}

        <div className="flex space-x-2">
          {connectionState.status === 'connected' ? (
            <Button
              onClick={onDisconnect}
              variant="destructive"
              disabled={connectionState.status === 'connecting'}
            >
              Disconnect
            </Button>
          ) : (
            <>
              <Button
                onClick={handleConnect}
                disabled={connectionState.status === 'connecting' || !url}
              >
                {connectionState.status === 'connecting' && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Connect
              </Button>
              {!selectedConnection && connectionName && (
                <Button
                  onClick={handleSaveConnection}
                  variant="outline"
                  disabled={connectionState.status === 'connecting' || !url || !connectionName.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}