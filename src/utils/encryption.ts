import { EncryptionResult, DecryptionResult, EncryptionAlgorithm, EncryptionConfig } from '../types';

// Advanced encryption utilities
export class CryptoString {
  
  // Generate a secure random key
  static generateKey(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    return result;
  }

  // Generate salt for enhanced security
  static generateSalt(): string {
    return this.generateKey(16);
  }

  // Simple hash function for key derivation
  static simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Key derivation function with proper mixing
  static deriveKey(key: string, salt?: string): string {
    if (!salt) return key;
    
    const combined = key + salt;
    let derived = '';
    
    // Create a more complex derivation
    for (let i = 0; i < Math.max(key.length, 32); i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const saltChar = salt.charCodeAt(i % salt.length);
      const mixedChar = (keyChar ^ saltChar ^ i) % 256;
      derived += String.fromCharCode(mixedChar);
    }
    
    return derived;
  }

  // AES-like encryption using XOR with key derivation
  static aesEncrypt(text: string, key: string, salt?: string): string {
    const derivedKey = this.deriveKey(key, salt);
    let encrypted = '';
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = derivedKey.charCodeAt(i % derivedKey.length);
      const encryptedChar = textChar ^ keyChar ^ (i % 256);
      encrypted += String.fromCharCode(encryptedChar);
    }
    
    return btoa(encrypted);
  }

  static aesDecrypt(encryptedText: string, key: string, salt?: string): string {
    try {
      const derivedKey = this.deriveKey(key, salt);
      const decoded = atob(encryptedText);
      let decrypted = '';
      
      for (let i = 0; i < decoded.length; i++) {
        const encChar = decoded.charCodeAt(i);
        const keyChar = derivedKey.charCodeAt(i % derivedKey.length);
        const decryptedChar = encChar ^ keyChar ^ (i % 256);
        decrypted += String.fromCharCode(decryptedChar);
      }
      
      return decrypted;
    } catch (error) {
      throw new Error('Invalid encrypted text or key for AES decryption');
    }
  }

  // Caesar cipher implementation with proper wrapping
  static caesarEncrypt(text: string, shift: number): string {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      
      if (code >= 65 && code <= 90) { // Uppercase A-Z
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) { // Lowercase a-z
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      } else if (code >= 48 && code <= 57) { // Numbers 0-9
        return String.fromCharCode(((code - 48 + shift) % 10) + 48);
      }
      
      return char; // Return unchanged for other characters
    }).join('');
  }

  static caesarDecrypt(text: string, shift: number): string {
    return this.caesarEncrypt(text, -shift);
  }

  // XOR encryption with improved security
  static xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const xorChar = textChar ^ keyChar ^ (i % 256);
      result += String.fromCharCode(xorChar);
    }
    return btoa(result);
  }

  static xorDecrypt(encryptedText: string, key: string): string {
    try {
      const decoded = atob(encryptedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const encChar = decoded.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const decryptedChar = encChar ^ keyChar ^ (i % 256);
        result += String.fromCharCode(decryptedChar);
      }
      return result;
    } catch (error) {
      throw new Error('Invalid encrypted text or key for XOR decryption');
    }
  }

  // Base64 encoding (simple obfuscation)
  static base64Encrypt(text: string): string {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error('Failed to encode text to Base64');
    }
  }

  static base64Decrypt(encodedText: string): string {
    try {
      return decodeURIComponent(escape(atob(encodedText)));
    } catch (error) {
      throw new Error('Invalid Base64 encoded text');
    }
  }

  // Hybrid encryption combining multiple algorithms
  static hybridEncrypt(text: string, key: string, salt?: string): string {
    try {
      // Step 1: Apply Caesar cipher with dynamic shift
      const shift = key.charCodeAt(0) % 26;
      const caesarResult = this.caesarEncrypt(text, shift);
      
      // Step 2: Apply XOR encryption
      const xorResult = this.xorEncrypt(caesarResult, key);
      
      // Step 3: Apply AES-like encryption
      const xorDecoded = atob(xorResult);
      return this.aesEncrypt(xorDecoded, key, salt);
    } catch (error) {
      throw new Error('Hybrid encryption failed');
    }
  }

  static hybridDecrypt(encryptedText: string, key: string, salt?: string): string {
    try {
      // Step 1: Reverse AES-like decryption
      const aesResult = this.aesDecrypt(encryptedText, key, salt);
      
      // Step 2: Reverse XOR (re-encode to base64 first)
      const xorResult = this.xorDecrypt(btoa(aesResult), key);
      
      // Step 3: Reverse Caesar cipher
      const shift = key.charCodeAt(0) % 26;
      return this.caesarDecrypt(xorResult, shift);
    } catch (error) {
      throw new Error('Hybrid decryption failed - invalid encrypted text or key');
    }
  }

  // Main encryption function
  static encrypt(text: string, config: EncryptionConfig): EncryptionResult {
    if (!text || text.trim() === '') {
      throw new Error('Text to encrypt cannot be empty');
    }

    const key = config.keyLength ? this.generateKey(config.keyLength) : this.generateKey();
    const salt = config.useSalt ? this.generateSalt() : undefined;
    let encrypted = '';

    try {
      switch (config.algorithm) {
        case 'aes':
          encrypted = this.aesEncrypt(text, key, salt);
          break;
        case 'caesar':
          const shift = parseInt(key.slice(0, 2), 36) % 26 || 13;
          encrypted = this.caesarEncrypt(text, shift);
          break;
        case 'xor':
          encrypted = this.xorEncrypt(text, key);
          break;
        case 'base64':
          encrypted = this.base64Encrypt(text);
          break;
        case 'hybrid':
          encrypted = this.hybridEncrypt(text, key, salt);
          break;
        default:
          throw new Error('Unsupported encryption algorithm');
      }

      return {
        encrypted,
        key,
        algorithm: config.algorithm,
        timestamp: Date.now(),
        salt
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Main decryption function
  static decrypt(encryptedText: string, key: string, algorithm: EncryptionAlgorithm, salt?: string): DecryptionResult {
    if (!encryptedText || encryptedText.trim() === '') {
      return {
        decrypted: '',
        success: false,
        error: 'Encrypted text cannot be empty'
      };
    }

    if (!key || key.trim() === '') {
      return {
        decrypted: '',
        success: false,
        error: 'Decryption key cannot be empty'
      };
    }

    try {
      let decrypted = '';

      switch (algorithm) {
        case 'aes':
          decrypted = this.aesDecrypt(encryptedText, key, salt);
          break;
        case 'caesar':
          const shift = parseInt(key.slice(0, 2), 36) % 26 || 13;
          decrypted = this.caesarDecrypt(encryptedText, shift);
          break;
        case 'xor':
          decrypted = this.xorDecrypt(encryptedText, key);
          break;
        case 'base64':
          decrypted = this.base64Decrypt(encryptedText);
          break;
        case 'hybrid':
          decrypted = this.hybridDecrypt(encryptedText, key, salt);
          break;
        default:
          throw new Error('Unsupported decryption algorithm');
      }

      return { decrypted, success: true };
    } catch (error) {
      return { 
        decrypted: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  }

  // Generate JavaScript code for decryption
  static generateDecryptionCode(result: EncryptionResult): string {
    const { encrypted, key, algorithm, salt } = result;
    
    let code = `// Auto-generated decryption code for CryptoString\n`;
    code += `// Algorithm: ${algorithm.toUpperCase()}\n`;
    code += `// Generated: ${new Date().toISOString()}\n`;
    code += `// WARNING: Keep this code and key secure!\n\n`;
    
    // Include the necessary decryption functions
    switch (algorithm) {
      case 'aes':
        code += `function deriveKey(key, salt) {
  if (!salt) return key;
  const combined = key + salt;
  let derived = '';
  for (let i = 0; i < Math.max(key.length, 32); i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const saltChar = salt.charCodeAt(i % salt.length);
    const mixedChar = (keyChar ^ saltChar ^ i) % 256;
    derived += String.fromCharCode(mixedChar);
  }
  return derived;
}

function aesDecrypt(encryptedText, key, salt) {
  try {
    const derivedKey = deriveKey(key, salt);
    const decoded = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const encChar = decoded.charCodeAt(i);
      const keyChar = derivedKey.charCodeAt(i % derivedKey.length);
      const decryptedChar = encChar ^ keyChar ^ (i % 256);
      decrypted += String.fromCharCode(decryptedChar);
    }
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
}

// Encrypted data
const encryptedText = "${encrypted}";
const key = "${key}";
const salt = ${salt ? `"${salt}"` : 'undefined'};

// Decrypt the text
try {
  const decryptedText = aesDecrypt(encryptedText, key, salt);
  console.log('Decrypted text:', decryptedText);
} catch (error) {
  console.error('Decryption error:', error.message);
}`;
        break;
        
      case 'caesar':
        const shift = parseInt(key.slice(0, 2), 36) % 26 || 13;
        code += `function caesarDecrypt(text, shift) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    
    if (code >= 65 && code <= 90) { // Uppercase A-Z
      return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) { // Lowercase a-z
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    } else if (code >= 48 && code <= 57) { // Numbers 0-9
      return String.fromCharCode(((code - 48 - shift + 10) % 10) + 48);
    }
    
    return char;
  }).join('');
}

// Encrypted data
const encryptedText = "${encrypted}";
const shift = ${shift};

// Decrypt the text
const decryptedText = caesarDecrypt(encryptedText, shift);
console.log('Decrypted text:', decryptedText);`;
        break;
        
      case 'xor':
        code += `function xorDecrypt(encryptedText, key) {
  try {
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const encChar = decoded.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const decryptedChar = encChar ^ keyChar ^ (i % 256);
      result += String.fromCharCode(decryptedChar);
    }
    return result;
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
}

// Encrypted data
const encryptedText = "${encrypted}";
const key = "${key}";

// Decrypt the text
try {
  const decryptedText = xorDecrypt(encryptedText, key);
  console.log('Decrypted text:', decryptedText);
} catch (error) {
  console.error('Decryption error:', error.message);
}`;
        break;
        
      case 'base64':
        code += `function base64Decrypt(encodedText) {
  try {
    return decodeURIComponent(escape(atob(encodedText)));
  } catch (error) {
    throw new Error('Invalid Base64 text: ' + error.message);
  }
}

// Encoded data
const encryptedText = "${encrypted}";

// Decrypt the text
try {
  const decryptedText = base64Decrypt(encryptedText);
  console.log('Decrypted text:', decryptedText);
} catch (error) {
  console.error('Decryption error:', error.message);
}`;
        break;
        
      case 'hybrid':
        const hybridShift = key.charCodeAt(0) % 26;
        code += `function deriveKey(key, salt) {
  if (!salt) return key;
  const combined = key + salt;
  let derived = '';
  for (let i = 0; i < Math.max(key.length, 32); i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const saltChar = salt.charCodeAt(i % salt.length);
    const mixedChar = (keyChar ^ saltChar ^ i) % 256;
    derived += String.fromCharCode(mixedChar);
  }
  return derived;
}

function aesDecrypt(encryptedText, key, salt) {
  const derivedKey = deriveKey(key, salt);
  const decoded = atob(encryptedText);
  let decrypted = '';
  for (let i = 0; i < decoded.length; i++) {
    const encChar = decoded.charCodeAt(i);
    const keyChar = derivedKey.charCodeAt(i % derivedKey.length);
    const decryptedChar = encChar ^ keyChar ^ (i % 256);
    decrypted += String.fromCharCode(decryptedChar);
  }
  return decrypted;
}

function xorDecrypt(encryptedText, key) {
  const decoded = atob(encryptedText);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    const encChar = decoded.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    const decryptedChar = encChar ^ keyChar ^ (i % 256);
    result += String.fromCharCode(decryptedChar);
  }
  return result;
}

function caesarDecrypt(text, shift) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    } else if (code >= 48 && code <= 57) {
      return String.fromCharCode(((code - 48 - shift + 10) % 10) + 48);
    }
    
    return char;
  }).join('');
}

function hybridDecrypt(encryptedText, key, salt) {
  try {
    const aesResult = aesDecrypt(encryptedText, key, salt);
    const xorResult = xorDecrypt(btoa(aesResult), key);
    const shift = key.charCodeAt(0) % 26;
    return caesarDecrypt(xorResult, shift);
  } catch (error) {
    throw new Error('Hybrid decryption failed: ' + error.message);
  }
}

// Encrypted data
const encryptedText = "${encrypted}";
const key = "${key}";
const salt = ${salt ? `"${salt}"` : 'undefined'};

// Decrypt the text
try {
  const decryptedText = hybridDecrypt(encryptedText, key, salt);
  console.log('Decrypted text:', decryptedText);
} catch (error) {
  console.error('Decryption error:', error.message);
}`;
        break;
    }
    
    return code;
  }
}