'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Settings, FileText, MessageSquare, Loader2 } from 'lucide-react';
import type { Tool as MCPTool, Resource, Prompt } from '@/types/mcp';

interface ToolsSidebarProps {
  isConnected: boolean;
  onLoadTools: () => Promise<MCPTool[]>;
  onLoadResources: () => Promise<Resource[]>;
  onLoadPrompts: () => Promise<Prompt[]>;
  onSelectTool: (tool: MCPTool) => void;
  onSelectResource: (resource: Resource) => void;
  onSelectPrompt: (prompt: Prompt) => void;
}

export function ToolsSidebar({ 
  isConnected, 
  onLoadTools, 
  onLoadResources, 
  onLoadPrompts,
  onSelectTool,
  onSelectResource,
  onSelectPrompt
}: ToolsSidebarProps) {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [toolsData, resourcesData, promptsData] = await Promise.allSettled([
        onLoadTools(),
        onLoadResources(),
        onLoadPrompts()
      ]);

      if (toolsData.status === 'fulfilled') {
        setTools(toolsData.value);
      }
      if (resourcesData.status === 'fulfilled') {
        setResources(resourcesData.value);
      }
      if (promptsData.status === 'fulfilled') {
        setPrompts(promptsData.value);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadData();
    } else {
      setTools([]);
      setResources([]);
      setPrompts([]);
    }
  }, [isConnected]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredResources = resources.filter(resource => 
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.uri.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPrompts = prompts.filter(prompt => 
    prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isConnected) {
    return (
      <Card className="h-full border border-border shadow-lg bg-card backdrop-blur-sm">
        <CardHeader style={{ padding: '24px' }}>
          <CardTitle className="text-base">MCP Server Browser</CardTitle>
          <CardDescription className="text-sm" style={{ marginTop: '8px' }}>
            Connect to an MCP server to browse tools, resources, and prompts
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border border-border shadow-lg bg-card backdrop-blur-sm">
      <CardHeader style={{ padding: '24px 24px 20px 24px' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">MCP Server Browser</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="transition-all duration-200 hover:bg-accent hover:border-accent-foreground/20 focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
            style={{ height: '36px', padding: '8px 12px' }}
          >
            Refresh
          </Button>
        </div>
        <div className="relative" style={{ marginTop: '16px' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ paddingLeft: '40px', height: '40px' }}
            aria-label="Search tools, resources, and prompts"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden" style={{ padding: '0 24px 24px 24px' }}>
        {error && (
          <div className="text-sm text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg" style={{ padding: '16px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        <Tabs defaultValue="tools" className="h-full flex flex-col" aria-label="MCP Server Browser">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0" style={{ marginBottom: '20px', height: '44px' }} role="tablist">
            <TabsTrigger value="tools" className="text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1" style={{ gap: '6px' }} aria-label={`Tools (${filteredTools.length} available)`}>
              <Settings className="h-4 w-4" aria-hidden="true" />
              Tools ({filteredTools.length})
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1" style={{ gap: '6px' }} aria-label={`Resources (${filteredResources.length} available)`}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Resources ({filteredResources.length})
            </TabsTrigger>
            <TabsTrigger value="prompts" className="text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1" style={{ gap: '6px' }} aria-label={`Prompts (${filteredPrompts.length} available)`}>
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Prompts ({filteredPrompts.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="tools" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px', paddingRight: '16px' }}>
                {filteredTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="border border-border rounded-lg hover:bg-accent/50 hover:border-accent-foreground/20 hover:shadow-sm cursor-pointer transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ padding: '20px' }}
                    onClick={() => onSelectTool(tool)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectTool(tool)}
                    role="button"
                    aria-label={`Select ${tool.name} tool${tool.description ? `: ${tool.description}` : ''}`}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <h4 className="text-sm font-mono">{tool.name}</h4>
                      <Badge variant="secondary" className="text-xs" style={{ padding: '4px 8px' }}>Tool</Badge>
                    </div>
                    {tool.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2" style={{ marginBottom: '12px' }}>
                        {tool.description}
                      </p>
                    )}
                    {tool.inputSchema?.required && tool.inputSchema.required.length > 0 && (
                      <div className="flex flex-wrap" style={{ gap: '6px' }}>
                        {tool.inputSchema.required.map((param) => (
                          <Badge key={param} variant="outline" className="text-xs font-mono" style={{ padding: '2px 8px' }}>
                            {param}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center justify-center" style={{ padding: '40px 20px' }}>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading tools...</span>
                    </div>
                  </div>
                )}
                {filteredTools.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center" style={{ padding: '40px 20px' }}>
                    No tools found
                  </p>
                )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px', paddingRight: '16px' }}>
                {filteredResources.map((resource) => (
                  <div
                    key={resource.uri}
                    className="border border-border rounded-lg hover:bg-accent/50 hover:border-accent-foreground/20 hover:shadow-sm cursor-pointer transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ padding: '20px' }}
                    onClick={() => onSelectResource(resource)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectResource(resource)}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <h4 className="text-sm">{resource.name}</h4>
                      <Badge variant="secondary" className="text-xs" style={{ padding: '4px 8px' }}>Resource</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all" style={{ marginBottom: '12px' }}>{resource.uri}</p>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2" style={{ marginBottom: '12px' }}>
                        {resource.description}
                      </p>
                    )}
                    {resource.mimeType && (
                      <Badge variant="outline" className="text-xs font-mono" style={{ padding: '2px 8px' }}>
                        {resource.mimeType}
                      </Badge>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center justify-center" style={{ padding: '40px 20px' }}>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading resources...</span>
                    </div>
                  </div>
                )}
                {filteredResources.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center" style={{ padding: '40px 20px' }}>
                    No resources found
                  </p>
                )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="prompts" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px', paddingRight: '16px' }}>
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.name}
                    className="border border-border rounded-lg hover:bg-accent/50 hover:border-accent-foreground/20 hover:shadow-sm cursor-pointer transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ padding: '20px' }}
                    onClick={() => onSelectPrompt(prompt)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectPrompt(prompt)}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <h4 className="text-sm font-mono">{prompt.name}</h4>
                      <Badge variant="secondary" className="text-xs" style={{ padding: '4px 8px' }}>Prompt</Badge>
                    </div>
                    {prompt.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2" style={{ marginBottom: '12px' }}>
                        {prompt.description}
                      </p>
                    )}
                    {prompt.arguments && prompt.arguments.length > 0 && (
                      <div className="flex flex-wrap" style={{ gap: '6px' }}>
                        {prompt.arguments.map((arg) => (
                          <Badge key={arg.name} variant="outline" className="text-xs font-mono" style={{ padding: '2px 8px' }}>
                            {arg.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center justify-center" style={{ padding: '40px 20px' }}>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading prompts...</span>
                    </div>
                  </div>
                )}
                {filteredPrompts.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center" style={{ padding: '40px 20px' }}>
                    No prompts found
                  </p>
                )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}