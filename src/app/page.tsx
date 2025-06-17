'use client';

import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Header } from '@/components/header';
import { ConnectionModal } from '@/components/connection-modal';
import { ToolsSidebar } from '@/components/tools-sidebar';
import { RequestResponse } from '@/components/request-response';
import { useMCPConnection } from '@/hooks/use-mcp-connection';
import type { Tool, Resource, Prompt } from '@/types/mcp';

export default function Home() {
  const {
    connectionState,
    savedConnections,
    connect,
    connectWithProfile,
    disconnect,
    saveConnection,
    updateConnection,
    deleteConnection,
    listTools,
    listResources,
    listPrompts,
    callTool,
    readResource,
    getPrompt,
    isConnected
  } = useMCPConnection();

  const [selectedTool, setSelectedTool] = useState<Tool | undefined>();
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>();
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    setSelectedResource(undefined);
    setSelectedPrompt(undefined);
  };

  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource);
    setSelectedTool(undefined);
    setSelectedPrompt(undefined);
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setSelectedTool(undefined);
    setSelectedResource(undefined);
  };

  const handleConnectToSaved = async (url: string, headers: Record<string, string>, connectionName: string) => {
    await connect(url, headers, connectionName);
  };

  const handleSaveAndConnect = async (name: string, url: string, headers: Record<string, string>, mode?: any) => {
    // Check if we're editing an existing connection
    if (showDeleteButton && connectionState.connectionName) {
      // Find the existing connection to get its ID
      const existingConnection = savedConnections.find(c => c.name === connectionState.connectionName);
      if (existingConnection) {
        // Update existing connection
        await updateConnection(existingConnection.id, { name, url, headers, mode });
      } else {
        // Fallback to creating new connection if existing one not found
        await saveConnection(name, url, headers, mode);
      }
    } else {
      // Create new connection
      await saveConnection(name, url, headers, mode);
    }
    await connect(url, headers, name, mode);
  };

  const handleTestConnection = async (url: string, headers: Record<string, string>, mode?: any) => {
    await connect(url, headers, undefined, mode);
  };

  const handleOpenManageModal = () => {
    setShowDeleteButton(true);
    setConnectionModalOpen(true);
  };

  const handleOpenConnectModal = () => {
    setShowDeleteButton(false);
    setConnectionModalOpen(true);
  };

  const handleDeleteCurrentConnection = async () => {
    // Find current connection and delete it
    if (connectionState.connectionName) {
      const connection = savedConnections.find(c => c.name === connectionState.connectionName);
      if (connection) {
        await deleteConnection(connection.id);
        await disconnect();
        setConnectionModalOpen(false);
      }
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <Header
        connectionState={connectionState}
        savedConnections={savedConnections}
        onOpenConnectionModal={handleOpenManageModal}
        onOpenCreateModal={handleOpenConnectModal}
        onDisconnect={disconnect}
        onConnectToSaved={handleConnectToSaved}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0" style={{ padding: '32px' }}>
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-sm border border-border shadow-xl bg-background/95 backdrop-blur-sm overflow-hidden">
          {/* Left Sidebar - Tools/Resources/Prompts */}
          <ResizablePanel defaultSize={38.2} minSize={30} maxSize={50}>
            <div className="h-full" style={{ padding: '32px' }}>
              <ToolsSidebar
                isConnected={isConnected}
                onLoadTools={listTools}
                onLoadResources={listResources}
                onLoadPrompts={listPrompts}
                onSelectTool={handleSelectTool}
                onSelectResource={handleSelectResource}
                onSelectPrompt={handleSelectPrompt}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border hover:bg-accent transition-colors" />

          {/* Right Panel - Request/Response */}
          <ResizablePanel defaultSize={61.8} minSize={50}>
            <div className="h-full" style={{ padding: '32px' }}>
              <RequestResponse
                selectedTool={selectedTool}
                selectedResource={selectedResource}
                selectedPrompt={selectedPrompt}
                onExecuteTool={callTool}
                onExecuteResource={readResource}
                onExecutePrompt={getPrompt}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        open={connectionModalOpen}
        onOpenChange={setConnectionModalOpen}
        connectionState={connectionState}
        savedConnections={savedConnections}
        onSaveConnection={handleSaveAndConnect}
        onDisconnect={disconnect}
        showDeleteButton={showDeleteButton}
        onDeleteCurrentConnection={handleDeleteCurrentConnection}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
}
