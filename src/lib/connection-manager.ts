'use client';

// Simple encryption/decryption using Web Crypto API
class EncryptionManager {
  private static key: CryptoKey | null = null;

  private static async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;
    
    // Generate or retrieve encryption key from localStorage
    const keyData = localStorage.getItem('murmur-encryption-key');
    if (keyData) {
      const keyBuffer = new Uint8Array(JSON.parse(keyData));
      this.key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } else {
      // Generate new key
      this.key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Store key in localStorage
      const keyBuffer = await crypto.subtle.exportKey('raw', this.key);
      localStorage.setItem('murmur-encryption-key', JSON.stringify(Array.from(new Uint8Array(keyBuffer))));
    }
    
    return this.key;
  }

  static async encrypt(data: string): Promise<string> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getKey();
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }
}

import type { ConnectionMode } from './mcp-interface';

export interface ConnectionProfile {
  id: string;
  name: string;
  url: string;
  headers: Record<string, string>;
  mode?: ConnectionMode;
  createdAt: string;
  lastUsed?: string;
}

export class ConnectionManager {
  private static readonly STORAGE_KEY = 'murmur-connections';

  static async saveConnection(profile: Omit<ConnectionProfile, 'id' | 'createdAt'>): Promise<string> {
    const connections = await this.getAllConnections();
    
    const newConnection: ConnectionProfile = {
      ...profile,
      id: crypto.randomUUID(),
      mode: profile.mode || 'proxy', // Default to proxy mode
      createdAt: new Date().toISOString()
    };
    
    connections.push(newConnection);
    await this.saveConnections(connections);
    
    return newConnection.id;
  }

  static async updateConnection(id: string, updates: Partial<Omit<ConnectionProfile, 'id' | 'createdAt'>>): Promise<void> {
    const connections = await this.getAllConnections();
    const index = connections.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Connection not found');
    }
    
    connections[index] = { ...connections[index], ...updates };
    await this.saveConnections(connections);
  }

  static async deleteConnection(id: string): Promise<void> {
    const connections = await this.getAllConnections();
    const filtered = connections.filter(c => c.id !== id);
    await this.saveConnections(filtered);
  }

  static async getConnection(id: string): Promise<ConnectionProfile | null> {
    const connections = await this.getAllConnections();
    return connections.find(c => c.id === id) || null;
  }

  static async getAllConnections(): Promise<ConnectionProfile[]> {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return [];
      
      const decryptedData = await EncryptionManager.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error loading connections:', error);
      return [];
    }
  }

  static async markAsUsed(id: string): Promise<void> {
    await this.updateConnection(id, { lastUsed: new Date().toISOString() });
  }

  static async clearAllConnections(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('murmur-encryption-key');
  }

  private static async saveConnections(connections: ConnectionProfile[]): Promise<void> {
    try {
      const dataToEncrypt = JSON.stringify(connections);
      const encryptedData = await EncryptionManager.encrypt(dataToEncrypt);
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving connections:', error);
      throw new Error('Failed to save connection data');
    }
  }

  // Utility methods for connection validation
  static validateConnectionProfile(profile: Partial<ConnectionProfile>): string[] {
    const errors: string[] = [];
    
    if (!profile.name?.trim()) {
      errors.push('Connection name is required');
    }
    
    if (!profile.url?.trim()) {
      errors.push('URL is required');
    } else {
      try {
        new URL(profile.url);
      } catch {
        errors.push('Invalid URL format');
      }
    }
    
    if (profile.mode && !['proxy', 'direct'].includes(profile.mode)) {
      errors.push('Invalid connection mode');
    }
    
    return errors;
  }

  // Export/Import functionality for backup
  static async exportConnections(): Promise<string> {
    const connections = await this.getAllConnections();
    return JSON.stringify(connections, null, 2);
  }

  static async importConnections(data: string): Promise<void> {
    try {
      const connections = JSON.parse(data) as ConnectionProfile[];
      
      // Validate the data structure
      if (!Array.isArray(connections)) {
        throw new Error('Invalid data format');
      }
      
      // Validate each connection
      for (const conn of connections) {
        const errors = this.validateConnectionProfile(conn);
        if (errors.length > 0) {
          throw new Error(`Invalid connection data: ${errors.join(', ')}`);
        }
      }
      
      await this.saveConnections(connections);
    } catch (error) {
      throw new Error(`Failed to import connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}