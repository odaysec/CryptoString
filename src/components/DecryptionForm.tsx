import React, { useState } from 'react';
import { Unlock, Key, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { CryptoString } from '../utils/encryption';
import { KeyStorage } from '../utils/keyStorage';
import { DecryptionResult, EncryptionAlgorithm, StoredKey } from '../types';

interface DecryptionFormProps {
  onResult: (result: DecryptionResult) => void;
}

export const DecryptionForm: React.FC<DecryptionFormProps> = ({ onResult }) => {
  const [encryptedText, setEncryptedText] = useState('');
  const [key, setKey] = useState('');
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>('aes');
  const [salt, setSalt] = useState('');
  const [useStoredKey, setUseStoredKey] = useState(false);
  const [selectedStoredKey, setSelectedStoredKey] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const storedKeys = KeyStorage.getAllKeys();

  const handleDecrypt = async () => {
    if (!encryptedText.trim()) {
      setError('Please enter encrypted text');
      return;
    }

    if (!useStoredKey && !key.trim()) {
      setError('Please enter a decryption key');
      return;
    }

    if (useStoredKey && !selectedStoredKey) {
      setError('Please select a stored key');
      return;
    }

    setIsDecrypting(true);
    setError(null);
    setSuccess(null);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    let decryptionKey = key;
    let decryptionAlgorithm = algorithm;
    let decryptionSalt = salt;
    
    if (useStoredKey && selectedStoredKey) {
      const storedKey = KeyStorage.getKey(selectedStoredKey);
      if (storedKey) {
        decryptionKey = storedKey.key;
        decryptionAlgorithm = storedKey.algorithm as EncryptionAlgorithm;
        KeyStorage.updateKeyUsage(selectedStoredKey);
      } else {
        setError('Selected key not found');
        setIsDecrypting(false);
        return;
      }
    }

    try {
      const result = CryptoString.decrypt(
        encryptedText.trim(),
        decryptionKey,
        decryptionAlgorithm,
        decryptionSalt || undefined
      );
      
      onResult(result);
      
      if (result.success) {
        setSuccess('Text decrypted successfully!');
      } else {
        setError(result.error || 'Decryption failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      setError(errorMessage);
      onResult({
        decrypted: '',
        success: false,
        error: errorMessage
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleStoredKeyChange = (keyId: string) => {
    setSelectedStoredKey(keyId);
    setError(null);
    const storedKey = KeyStorage.getKey(keyId);
    if (storedKey) {
      setAlgorithm(storedKey.algorithm as EncryptionAlgorithm);
    }
  };

  const clearForm = () => {
    setEncryptedText('');
    setKey('');
    setSalt('');
    setSelectedStoredKey('');
    setError(null);
    setSuccess(null);
  };

  const refreshStoredKeys = () => {
    // Force re-render to get latest keys
    window.location.reload();
  };

  const algorithmOptions = [
    { value: 'aes', label: 'AES-like (Advanced)' },
    { value: 'hybrid', label: 'Hybrid (Most Secure)' },
    { value: 'xor', label: 'XOR Cipher' },
    { value: 'caesar', label: 'Caesar Cipher' },
    { value: 'base64', label: 'Base64 Encoding' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
          <Unlock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Decrypt Text</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Encrypted Text *
          </label>
          <textarea
            value={encryptedText}
            onChange={(e) => {
              setEncryptedText(e.target.value);
              setError(null);
            }}
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Enter encrypted text here..."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-white/90">
            <input
              type="radio"
              name="keySource"
              checked={!useStoredKey}
              onChange={() => {
                setUseStoredKey(false);
                setError(null);
              }}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500"
            />
            Manual Key
          </label>
          <label className="flex items-center gap-2 text-white/90">
            <input
              type="radio"
              name="keySource"
              checked={useStoredKey}
              onChange={() => {
                setUseStoredKey(true);
                setError(null);
              }}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500"
            />
            Stored Key ({storedKeys.length})
          </label>
        </div>

        {useStoredKey ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/90">
                Select Stored Key
              </label>
              <button
                onClick={refreshStoredKeys}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white/70 hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            <select
              value={selectedStoredKey}
              onChange={(e) => handleStoredKeyChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="" className="bg-gray-800">Select a key...</option>
              {storedKeys.map(key => (
                <option key={key.id} value={key.id} className="bg-gray-800">
                  {key.name} ({key.algorithm.toUpperCase()}) - Created: {new Date(key.created).toLocaleDateString()}
                </option>
              ))}
            </select>
            {storedKeys.length === 0 && (
              <p className="mt-2 text-sm text-white/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No stored keys found. Create some in the encryption section or key manager.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Decryption Key *
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter decryption key..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value as EncryptionAlgorithm);
                  setError(null);
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {algorithmOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {(algorithm === 'aes' || algorithm === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Salt (Optional)
                </label>
                <input
                  type="text"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter salt if used during encryption..."
                />
                <p className="mt-1 text-xs text-white/60">
                  Only required if salt was used during encryption
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleDecrypt}
            disabled={!encryptedText.trim() || (!key.trim() && !selectedStoredKey) || isDecrypting}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isDecrypting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Decrypting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Unlock className="w-5 h-5" />
                Decrypt Text
              </div>
            )}
          </button>
          
          <button
            onClick={clearForm}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};