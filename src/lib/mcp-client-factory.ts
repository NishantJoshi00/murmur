import { MCPClient } from './mcp-client';
import { MCPAPIClient } from './api-client';
import type { IMCPClient, ConnectionMode } from './mcp-interface';

/**
 * Factory function to create the appropriate MCP client based on connection mode
 */
export function createMCPClient(
  mode: ConnectionMode,
  url: string,
  headers: Record<string, string> = {}
): IMCPClient {
  switch (mode) {
    case 'direct':
      return new MCPClient();
    case 'proxy':
      return new MCPAPIClient(url, headers);
    default:
      throw new Error(`Unknown connection mode: ${mode}`);
  }
}

/**
 * Get the default connection mode based on environment or user preference
 */
export function getDefaultConnectionMode(): ConnectionMode {
  // Check localStorage for user preference
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('murmur-connection-mode');
    if (stored === 'direct' || stored === 'proxy') {
      return stored;
    }
  }
  
  // Default to proxy mode for better compatibility
  return 'proxy';
}

/**
 * Save user's preferred connection mode
 */
export function saveConnectionMode(mode: ConnectionMode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('murmur-connection-mode', mode);
  }
}