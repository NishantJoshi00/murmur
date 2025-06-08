'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import type { ConnectionProfile } from '@/lib/connection-manager';

interface ConnectionManagerProps {
  savedConnections: ConnectionProfile[];
  onDeleteConnection: (id: string) => Promise<void>;
  onCreateNew: () => void;
}

export function ConnectionManager({
  savedConnections,
  onDeleteConnection,
  onCreateNew
}: ConnectionManagerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Manage Connections</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your saved MCP server connections
          </p>
        </div>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Connection
        </Button>
      </div>

      {savedConnections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No saved connections yet</p>
          <Button onClick={onCreateNew} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create your first connection
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedConnections
            .sort((a, b) => new Date(b.lastUsed || b.createdAt).getTime() - new Date(a.lastUsed || a.createdAt).getTime())
            .map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium truncate">{connection.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {connection.mode || 'proxy'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {connection.url}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Created: {formatDate(connection.createdAt)}</span>
                  {connection.lastUsed && (
                    <span>Last used: {formatDate(connection.lastUsed)}</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteConnection(connection.id)}
                className="ml-4 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}