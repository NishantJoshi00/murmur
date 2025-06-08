'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { ConnectionState, ConnectionMode } from '@/types/mcp';
import { getDefaultConnectionMode } from '@/lib/mcp-client-factory';

interface ConnectionFormProps {
  connectionState: ConnectionState;
  savedConnections: any[];
  onSaveConnection: (name: string, url: string, headers: Record<string, string>, mode?: ConnectionMode) => Promise<void>;
  onDisconnect: () => Promise<void>;
  showDeleteButton?: boolean;
  onDeleteCurrentConnection?: () => Promise<void>;
  onTestConnection?: (url: string, headers: Record<string, string>, mode?: ConnectionMode) => Promise<void>;
  onClose?: () => void;
}

interface Header {
  id: string;
  key: string;
  value: string;
}

export function ConnectionForm({ connectionState, savedConnections, onSaveConnection, onDisconnect, showDeleteButton, onDeleteCurrentConnection, onTestConnection, onClose }: ConnectionFormProps) {
  const [url, setUrl] = useState(connectionState.url || 'http://localhost:3001/sse');
  const [connectionName, setConnectionName] = useState(connectionState.connectionName || '');
  const [mode, setMode] = useState<ConnectionMode>(getDefaultConnectionMode());
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

  const handleSave = async () => {
    if (!connectionName.trim()) {
      return;
    }

    // Check for duplicate names (excluding current connection if editing)
    const isDuplicate = savedConnections.some(conn => 
      conn.name === connectionName.trim() && 
      conn.name !== connectionState.connectionName
    );
    
    if (isDuplicate) {
      return; // Silent failure for duplicate names
    }

    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      await onSaveConnection(connectionName, url, headersObj, mode);
      onClose?.();
    } catch (error) {
      // Silent failure - just don't close the modal
    }
  };

  const handleTest = async () => {
    if (!onTestConnection) return;

    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      await onTestConnection(url, headersObj, mode);
    } catch (error) {
      // Silent failure
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
    <div className="space-y-8">
      <div className="flex items-center justify-between pr-12">
        <div>
          <h2 className="text-lg font-semibold">MCP Server Connection</h2>
          <p className="text-sm text-muted-foreground">
            Connect to your MCP server using Server-Sent Events
          </p>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="connectionName">Connection Name</Label>
          <Input
            id="connectionName"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My MCP Server"
            disabled={connectionState.status === 'connecting'}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="url">SSE URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:3001/sse"
            disabled={connectionState.status === 'connecting'}
          />
        </div>

        <div className="space-y-3">
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(value: ConnectionMode) => setMode(value)} disabled={connectionState.status === 'connecting'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proxy">Proxy</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
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
          <Button
            onClick={handleSave}
            disabled={!url || !connectionName.trim() || savedConnections.some(conn => 
              conn.name === connectionName.trim() && 
              conn.name !== connectionState.connectionName
            )}
          >
            Save Connection
          </Button>
          {onTestConnection && (
            <Button
              onClick={handleTest}
              variant="outline"
              disabled={!url}
            >
              Test
            </Button>
          )}
          {showDeleteButton && onDeleteCurrentConnection && (
            <Button
              onClick={onDeleteCurrentConnection}
              variant="outline"
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}