import React, { useState } from 'react';
import { Lock, Key, Copy, Download, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { CryptoString } from '../utils/encryption';
import { KeyStorage } from '../utils/keyStorage';
import { EncryptionResult, EncryptionConfig, EncryptionAlgorithm, StoredKey } from '../types';

interface EncryptionFormProps {
  onResult: (result: EncryptionResult) => void;
}

export const EncryptionForm: React.FC<EncryptionFormProps> = ({ onResult }) => {
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>('aes');
  const [keyLength, setKeyLength] = useState(32);
  const [useTimestamp, setUseTimestamp] = useState(true);
  const [useSalt, setUseSalt] = useState(true);
  const [saveKey, setSaveKey] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEncrypt = async () => {
    if (!text.trim()) {
      setError('Please enter text to encrypt');
      return;
    }

    setIsEncrypting(true);
    setError(null);
    setSuccess(null);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const config: EncryptionConfig = {
      algorithm,
      keyLength: Math.max(16, Math.min(64, keyLength)),
      useTimestamp,
      useSalt: useSalt && algorithm !== 'caesar' && algorithm !== 'base64'
    };

    try {
      const result = CryptoString.encrypt(text, config);
      onResult(result);

      // Save key if requested
      if (saveKey && keyName.trim()) {
        const storedKey: StoredKey = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: keyName.trim(),
          key: result.key,
          algorithm: result.algorithm,
          created: Date.now(),
          used: Date.now()
        };
        
        const saved = KeyStorage.saveKey(storedKey);
        if (saved) {
          setSuccess(`Text encrypted and key "${keyName}" saved successfully!`);
          setKeyName('');
          setSaveKey(false);
        } else {
          setSuccess('Text encrypted successfully, but failed to save key.');
        }
      } else {
        setSuccess('Text encrypted successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Encryption failed';
      setError(errorMessage);
      console.error('Encryption failed:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

  const clearForm = () => {
    setText('');
    setKeyName('');
    setSaveKey(false);
    setError(null);
    setSuccess(null);
  };

  const algorithmOptions = [
    { value: 'aes', label: 'AES-like (Advanced)', description: 'Strong encryption with key derivation and salt support' },
    { value: 'hybrid', label: 'Hybrid (Most Secure)', description: 'Combines Caesar, XOR, and AES-like algorithms' },
    { value: 'xor', label: 'XOR Cipher', description: 'Fast and efficient encryption using XOR operations' },
    { value: 'caesar', label: 'Caesar Cipher', description: 'Classic substitution cipher with configurable shift' },
    { value: 'base64', label: 'Base64 Encoding', description: 'Simple text encoding (not encryption)' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Encrypt Text</h2>
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
            Text to Encrypt *
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your text here..."
            maxLength={10000}
          />
          <p className="mt-1 text-xs text-white/60">{text.length}/10000 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Encryption Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value as EncryptionAlgorithm);
              setError(null);
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {algorithmOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-white/60">
            {algorithmOptions.find(opt => opt.value === algorithm)?.description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Advanced Options
          </button>
          
          <button
            onClick={clearForm}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          >
            Clear Form
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Key Length: {keyLength} characters
              </label>
              <input
                type="range"
                min="16"
                max="64"
                value={keyLength}
                onChange={(e) => setKeyLength(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>16 (Min)</span>
                <span>64 (Max)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-white/90">
                <input
                  type="checkbox"
                  checked={useTimestamp}
                  onChange={(e) => setUseTimestamp(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                Include Timestamp
              </label>

              <label className="flex items-center gap-2 text-white/90">
                <input
                  type="checkbox"
                  checked={useSalt}
                  onChange={(e) => setUseSalt(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  disabled={algorithm === 'caesar' || algorithm === 'base64'}
                />
                Use Salt
                {(algorithm === 'caesar' || algorithm === 'base64') && (
                  <span className="text-xs text-white/50">(Not available)</span>
                )}
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white/90 mb-2">
                <input
                  type="checkbox"
                  checked={saveKey}
                  onChange={(e) => setSaveKey(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                Save Key for Later Use
              </label>
              
              {saveKey && (
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Enter key name..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                />
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleEncrypt}
          disabled={!text.trim() || isEncrypting}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isEncrypting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Encrypting...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Encrypt Text
            </div>
          )}
        </button>
      </div>
    </div>
  );
};