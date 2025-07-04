export interface EncryptionResult {
  encrypted: string;
  key: string;
  algorithm: string;
  timestamp: number;
  salt?: string;
}

export interface DecryptionResult {
  decrypted: string;
  success: boolean;
  error?: string;
}

export interface StoredKey {
  id: string;
  name: string;
  key: string;
  algorithm: string;
  created: number;
  used: number;
}

export type EncryptionAlgorithm = 'aes' | 'caesar' | 'xor' | 'base64' | 'hybrid';

export interface EncryptionConfig {
  algorithm: EncryptionAlgorithm;
  keyLength?: number;
  iterations?: number;
  useTimestamp?: boolean;
  useSalt?: boolean;
}