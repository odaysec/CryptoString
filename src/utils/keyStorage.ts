import { StoredKey } from '../types';

const STORAGE_KEY = 'cryptostring_keys';
const ENCRYPTION_KEY = 'cryptostring_master_key';

export class KeyStorage {
  private static getMasterKey(): string {
    let masterKey = localStorage.getItem(ENCRYPTION_KEY);
    if (!masterKey) {
      masterKey = this.generateMasterKey();
      localStorage.setItem(ENCRYPTION_KEY, masterKey);
    }
    return masterKey;
  }

  private static generateMasterKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    const randomArray = new Uint8Array(32);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < 32; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    return result;
  }

  private static encryptData(data: string): string {
    try {
      const masterKey = this.getMasterKey();
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = masterKey.charCodeAt(i % masterKey.length);
        encrypted += String.fromCharCode(dataChar ^ keyChar ^ (i % 256));
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      return btoa(data); // Fallback to simple base64
    }
  }

  private static decryptData(encryptedData: string): string {
    try {
      const masterKey = this.getMasterKey();
      const decoded = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const encChar = decoded.charCodeAt(i);
        const keyChar = masterKey.charCodeAt(i % masterKey.length);
        decrypted += String.fromCharCode(encChar ^ keyChar ^ (i % 256));
      }
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      try {
        return atob(encryptedData); // Fallback to simple base64
      } catch {
        return '[]'; // Return empty array if all fails
      }
    }
  }

  static saveKey(key: StoredKey): boolean {
    try {
      if (!key.id || !key.name || !key.key || !key.algorithm) {
        throw new Error('Invalid key data');
      }

      const keys = this.getAllKeys();
      const existingIndex = keys.findIndex(k => k.id === key.id);
      
      if (existingIndex >= 0) {
        keys[existingIndex] = { ...key, used: Date.now() };
      } else {
        keys.push({ ...key, created: key.created || Date.now(), used: key.used || Date.now() });
      }
      
      const encrypted = this.encryptData(JSON.stringify(keys));
      localStorage.setItem(STORAGE_KEY, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to save key:', error);
      return false;
    }
  }

  static getAllKeys(): StoredKey[] {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return [];
      
      const decrypted = this.decryptData(encrypted);
      const keys = JSON.parse(decrypted);
      
      // Validate keys structure
      if (!Array.isArray(keys)) return [];
      
      return keys.filter(key => 
        key && 
        typeof key.id === 'string' && 
        typeof key.name === 'string' && 
        typeof key.key === 'string' && 
        typeof key.algorithm === 'string'
      );
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }

  static deleteKey(id: string): boolean {
    try {
      if (!id) return false;
      
      const keys = this.getAllKeys().filter(k => k.id !== id);
      const encrypted = this.encryptData(JSON.stringify(keys));
      localStorage.setItem(STORAGE_KEY, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to delete key:', error);
      return false;
    }
  }

  static getKey(id: string): StoredKey | undefined {
    try {
      if (!id) return undefined;
      return this.getAllKeys().find(k => k.id === id);
    } catch (error) {
      console.error('Failed to get key:', error);
      return undefined;
    }
  }

  static updateKeyUsage(id: string): boolean {
    try {
      const key = this.getKey(id);
      if (key) {
        key.used = Date.now();
        return this.saveKey(key);
      }
      return false;
    } catch (error) {
      console.error('Failed to update key usage:', error);
      return false;
    }
  }

  static clearAllKeys(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear keys:', error);
      return false;
    }
  }

  static exportKeys(): string {
    try {
      const keys = this.getAllKeys();
      return JSON.stringify(keys, null, 2);
    } catch (error) {
      console.error('Failed to export keys:', error);
      return '[]';
    }
  }

  static importKeys(keysData: string): { success: boolean; imported: number; errors: string[] } {
    const result = { success: false, imported: 0, errors: [] as string[] };
    
    try {
      const importedKeys = JSON.parse(keysData);
      
      if (!Array.isArray(importedKeys)) {
        result.errors.push('Invalid format: expected array of keys');
        return result;
      }

      let imported = 0;
      for (const key of importedKeys) {
        if (this.validateKeyStructure(key)) {
          // Generate new ID to avoid conflicts
          const newKey = { ...key, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) };
          if (this.saveKey(newKey)) {
            imported++;
          } else {
            result.errors.push(`Failed to save key: ${key.name || 'Unknown'}`);
          }
        } else {
          result.errors.push(`Invalid key structure: ${key.name || 'Unknown'}`);
        }
      }

      result.imported = imported;
      result.success = imported > 0;
      
      return result;
    } catch (error) {
      result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  private static validateKeyStructure(key: any): boolean {
    return (
      key &&
      typeof key === 'object' &&
      typeof key.name === 'string' &&
      typeof key.key === 'string' &&
      typeof key.algorithm === 'string' &&
      key.name.trim() !== '' &&
      key.key.trim() !== '' &&
      ['aes', 'caesar', 'xor', 'base64', 'hybrid'].includes(key.algorithm)
    );
  }
}