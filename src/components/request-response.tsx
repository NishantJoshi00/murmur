'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Copy, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Tool as MCPTool, Resource, Prompt, ToolInvocation } from '@/types/mcp';

interface RequestResponseProps {
  selectedTool?: MCPTool;
  selectedResource?: Resource;
  selectedPrompt?: Prompt;
  onExecuteTool: (name: string, args: Record<string, any>) => Promise<any>;
  onExecuteResource: (uri: string) => Promise<any>;
  onExecutePrompt: (name: string, args?: Record<string, any>) => Promise<any>;
}

export function RequestResponse({ 
  selectedTool, 
  selectedResource, 
  selectedPrompt,
  onExecuteTool,
  onExecuteResource,
  onExecutePrompt
}: RequestResponseProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isRequestCollapsed, setIsRequestCollapsed] = useState(false);

  // Reset state when selection changes
  useEffect(() => {
    setParameters({});
    setResponse(null);
    setError(null);
    setDuration(null);
    setIsRequestCollapsed(false);
  }, [selectedTool, selectedResource, selectedPrompt]);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setIsRequestCollapsed(true);
    const startTime = Date.now();

    try {
      let result;
      
      if (selectedTool) {
        result = await onExecuteTool(selectedTool.name, parameters);
      } else if (selectedResource) {
        result = await onExecuteResource(selectedResource.uri);
      } else if (selectedPrompt) {
        result = await onExecutePrompt(selectedPrompt.name, parameters);
      }
      
      setResponse(result);
      setDuration(Date.now() - startTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  };

  const toggleRequestCollapse = () => {
    setIsRequestCollapsed(!isRequestCollapsed);
  };

  const renderParameterInput = (paramName: string, paramSchema: any, required = false) => {
    const value = parameters[paramName] || '';
    
    if (paramSchema.type === 'string' && paramSchema.enum) {
      return (
        <select
          value={value}
          onChange={(e) => handleParameterChange(paramName, e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select...</option>
          {paramSchema.enum.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    
    if (paramSchema.type === 'boolean') {
      return (
        <select
          value={value.toString()}
          onChange={(e) => handleParameterChange(paramName, e.target.value === 'true')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    
    if (paramSchema.type === 'number' || paramSchema.type === 'integer') {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleParameterChange(paramName, Number(e.target.value))}
          placeholder={`Enter ${paramName}`}
        />
      );
    }
    
    if (paramSchema.type === 'object' || paramSchema.type === 'array') {
      return (
        <Textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleParameterChange(paramName, parsed);
            } catch {
              handleParameterChange(paramName, e.target.value);
            }
          }}
          placeholder={`Enter ${paramName} as JSON`}
          rows={4}
        />
      );
    }
    
    return (
      <Input
        id={paramName}
        value={value}
        onChange={(e) => handleParameterChange(paramName, e.target.value)}
        placeholder={`Enter ${paramName}`}
        className="focus:ring-2 focus:ring-ring focus:ring-offset-1"
        aria-describedby={paramSchema.description ? `${paramName}-description` : undefined}
        aria-required={required}
      />
    );
  };

  const renderParameters = () => {
    let schema: any = {};
    let requiredFields: string[] = [];
    
    if (selectedTool) {
      schema = selectedTool.inputSchema?.properties || {};
      requiredFields = selectedTool.inputSchema?.required || [];
    } else if (selectedPrompt) {
      // Convert prompt arguments to schema format
      selectedPrompt.arguments?.forEach(arg => {
        schema[arg.name] = {
          type: 'string',
          description: arg.description
        };
        if (arg.required) {
          requiredFields.push(arg.name);
        }
      });
    }
    
    const parameterKeys = Object.keys(schema);
    
    if (parameterKeys.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No parameters required
        </p>
      );
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {parameterKeys.map(paramName => {
          const paramSchema = schema[paramName];
          const isRequired = requiredFields.includes(paramName);
          
          return (
            <div key={paramName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor={paramName} className="flex items-center text-sm" style={{ gap: '8px' }}>
                <span className="font-mono">{paramName}</span>
                {isRequired && <Badge variant="destructive" className="text-xs" style={{ padding: '2px 6px' }} aria-label="Required field">Required</Badge>}
              </Label>
              {paramSchema.description && (
                <p id={`${paramName}-description`} className="text-sm text-muted-foreground">{paramSchema.description}</p>
              )}
              <div style={{ marginTop: '4px' }}>
                {renderParameterInput(paramName, paramSchema, isRequired)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (response) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  const currentItem = selectedTool || selectedResource || selectedPrompt;
  
  if (!currentItem) {
    return (
      <Card className="h-full border border-border shadow-lg bg-card backdrop-blur-sm">
        <CardHeader style={{ padding: '24px' }}>
          <CardTitle className="text-base">Request & Response</CardTitle>
          <CardDescription className="text-sm" style={{ marginTop: '8px' }}>
            Select a tool, resource, or prompt from the sidebar to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ gap: '24px' }}>
      {/* Request Section */}
      <Card className={`relative border border-border shadow-lg bg-card backdrop-blur-sm transition-all duration-500 ease-in-out ${
        isRequestCollapsed ? 'flex-shrink-0 py-0' : 'flex-1'
      }`} style={{ height: isRequestCollapsed ? '64px' : 'auto' }}>
        <CardHeader style={{ padding: isRequestCollapsed ? '0' : '24px' }}>
          <div className="flex items-center justify-between" style={{ padding: isRequestCollapsed ? '12px 24px' : '0' }}>
            <div className="flex-1">
              {isRequestCollapsed ? (
                <div className="flex items-center text-base font-mono" style={{ gap: '12px' }}>
                  {currentItem.name}
                  <Badge variant="outline" className="text-xs" style={{ padding: '4px 8px' }}>
                    {selectedTool ? 'Tool' : selectedResource ? 'Resource' : 'Prompt'}
                  </Badge>
                  {getStatusIcon()}
                  {duration && (
                    <Badge variant="outline" className="text-xs" style={{ padding: '4px 8px', gap: '4px' }}>
                      <Clock className="h-3 w-3" />
                      {duration}ms
                    </Badge>
                  )}
                </div>
              ) : (
                <CardTitle className="flex items-center text-base font-mono" style={{ gap: '12px' }}>
                  {currentItem.name}
                  <Badge variant="outline" className="text-xs" style={{ padding: '4px 8px' }}>
                    {selectedTool ? 'Tool' : selectedResource ? 'Resource' : 'Prompt'}
                  </Badge>
                </CardTitle>
              )}
              {!isRequestCollapsed && currentItem.description && (
                <CardDescription className="text-sm transition-opacity duration-300" style={{ marginTop: '8px' }}>
                  {currentItem.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center" style={{ marginLeft: '24px', marginRight: '56px' }}>
              <Button 
                onClick={handleExecute} 
                disabled={loading}
                className="transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                style={{ height: '40px', padding: '8px 16px', gap: '8px', width: '100px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRequestCollapsed ? '' : 'Executing...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {isRequestCollapsed ? '' : 'Execute'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRequestCollapse}
          className="absolute top-3 right-3 transition-all duration-200 hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-1"
          style={{ height: '40px', width: '40px', padding: '8px' }}
          aria-label={isRequestCollapsed ? 'Expand request card' : 'Collapse request card'}
        >
          {isRequestCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isRequestCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
        }`}>
          <CardContent style={{ padding: '0 24px 24px 24px' }}>
            {selectedResource ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <Label className="text-sm">Resource URI</Label>
                  <Input value={selectedResource.uri} readOnly className="font-mono text-sm" style={{ marginTop: '8px', height: '40px' }} />
                </div>
                {selectedResource.mimeType && (
                  <div>
                    <Label className="text-sm">MIME Type</Label>
                    <div style={{ marginTop: '8px' }}>
                      <Badge variant="outline" className="font-mono text-xs" style={{ padding: '4px 8px' }}>
                        {selectedResource.mimeType}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Label className="text-sm">Parameters</Label>
                {renderParameters()}
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Response Section */}
      <Card className={`border border-border shadow-lg bg-card backdrop-blur-sm transition-all duration-500 ease-in-out ${
        !isRequestCollapsed ? 'flex-shrink-0 py-0' : 'flex-1 min-h-0'
      }`} style={{ height: !isRequestCollapsed ? '64px' : 'auto' }}>
        <CardHeader style={{ padding: !isRequestCollapsed ? '0' : '24px' }}>
          <div className="flex items-center justify-between" style={{ padding: !isRequestCollapsed ? '16px 24px 10px 24px' : '0' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              {!isRequestCollapsed ? (
                <div className="flex items-center text-base font-semibold" style={{ gap: '12px' }}>
                  Response
                  {getStatusIcon()}
                  {duration && (
                    <Badge variant="outline" className="text-xs" style={{ padding: '4px 8px', gap: '4px' }}>
                      <Clock className="h-3 w-3" />
                      {duration}ms
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <span className="text-base font-semibold">Response</span>
                  {getStatusIcon()}
                  {duration && (
                    <Badge variant="outline" className="text-xs" style={{ padding: '4px 8px', gap: '4px' }}>
                      <Clock className="h-3 w-3" />
                      {duration}ms
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {response && isRequestCollapsed && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyResponse}
                className="transition-all duration-200 hover:bg-accent hover:border-accent-foreground/20 focus:ring-2 focus:ring-ring focus:ring-offset-1"
                style={{ gap: '8px', padding: '8px 12px', height: '36px' }}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            )}
          </div>
        </CardHeader>
        <div className={`flex-1 overflow-hidden transition-all duration-500 ease-in-out ${
          !isRequestCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'
        }`}>
          <CardContent className="flex-1 overflow-hidden" style={{ padding: '24px', marginTop: '0' }}>
          {error && (
            <div className="text-sm text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg" style={{ padding: '20px', marginBottom: '20px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {response && (
            <div className="h-full overflow-y-auto rounded-lg border border-border animate-in fade-in duration-300" style={{ padding: '16px' }}>
              {(() => {
                // Check if this is an MCP tool response with content array
                if (response.content && Array.isArray(response.content)) {
                  const isError = response.isError === true;
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      {response.content.map((item: any, index: number) => (
                        <div key={index} className={`rounded-lg border ${isError ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50' : 'border-border bg-muted/30'} animate-in slide-in-from-bottom-2 duration-300`} style={{ padding: '20px', animationDelay: `${index * 100}ms` }}>
                          {isError && (
                            <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Error Response</span>
                            </div>
                          )}
                          {item.type === 'text' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                {item.text}
                              </pre>
                            </div>
                          ) : (
                            <pre className="text-sm font-mono leading-relaxed">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // Check if this is a resource response - show only text content
                if (selectedResource && response && response.contents) {
                  return (
                    <div style={{ marginBottom: '24px' }}>
                      {response.contents.map((content: any, index: number) => (
                        <div key={index} className="rounded-lg border border-border bg-muted/30 animate-in slide-in-from-bottom-2 duration-300" style={{ padding: '20px', marginBottom: index < response.contents.length - 1 ? '16px' : '0' }}>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                              {content.text || JSON.stringify(content, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // Fallback to JSON display for other response types
                return (
                  <div style={{ marginBottom: '24px' }}>
                    <pre className="text-sm bg-muted/50 rounded-lg overflow-auto font-mono leading-relaxed" style={{ padding: '20px' }}>
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                );
              })()}
            </div>
          )}
          
          {loading && !response && !error && (
            <div className="flex items-center justify-center text-muted-foreground animate-in fade-in duration-300" style={{ height: '120px' }}>
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm animate-pulse">Executing request...</p>
              </div>
            </div>
          )}
          
          {!response && !error && !loading && (
            <div className="flex items-center justify-center text-muted-foreground" style={{ height: '120px' }}>
              <p className="text-sm">Execute a request to see the response</p>
            </div>
          )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
