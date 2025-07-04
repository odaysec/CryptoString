import React, { useState } from 'react';
import { Copy, Download, Code, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { EncryptionResult, DecryptionResult } from '../types';
import { CryptoString } from '../utils/encryption';

interface ResultDisplayProps {
  encryptionResult?: EncryptionResult;
  decryptionResult?: DecryptionResult;
  type: 'encryption' | 'decryption';
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  encryptionResult, 
  decryptionResult, 
  type 
}) => {
  const [showKey, setShowKey] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const testDecryptionCode = (code: string) => {
    try {
      // Create a new function from the code and test it
      const testFunction = new Function(code + '\nreturn decryptedText;');
      const result = testFunction();
      if (result) {
        alert(`Code test successful! Decrypted: "${result}"`);
      } else {
        alert('Code test completed, but no result returned. Check the console for output.');
      }
    } catch (error) {
      alert(`Code test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (type === 'encryption' && encryptionResult) {
    const decryptionCode = CryptoString.generateDecryptionCode(encryptionResult);
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Encryption Result</h2>
        </div>

        <div className="space-y-6">
          {/* Encrypted Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/90">Encrypted Text</label>
              <button
                onClick={() => copyToClipboard(encryptionResult.encrypted, 'encrypted')}
                className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              >
                {copied === 'encrypted' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied === 'encrypted' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={encryptionResult.encrypted}
              readOnly
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none font-mono text-sm"
            />
            <p className="mt-1 text-xs text-white/60">
              Length: {encryptionResult.encrypted.length} characters
            </p>
          </div>

          {/* Decryption Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/90">Decryption Key</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => copyToClipboard(encryptionResult.key, 'key')}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  {copied === 'key' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied === 'key' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={encryptionResult.key}
              readOnly
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
            />
            <p className="mt-1 text-xs text-white/60">
              Length: {encryptionResult.key.length} characters
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Algorithm</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                {encryptionResult.algorithm.toUpperCase()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Created</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                {formatTimestamp(encryptionResult.timestamp)}
              </div>
            </div>
          </div>

          {encryptionResult.salt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/90">Salt</label>
                <button
                  onClick={() => copyToClipboard(encryptionResult.salt!, 'salt')}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  {copied === 'salt' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied === 'salt' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <input
                type="text"
                value={encryptionResult.salt}
                readOnly
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono"
              />
            </div>
          )}

          {/* Decryption Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/90">JavaScript Decryption Code</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Code className="w-4 h-4" />
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
                {showCode && (
                  <>
                    <button
                      onClick={() => testDecryptionCode(decryptionCode)}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Test
                    </button>
                    <button
                      onClick={() => copyToClipboard(decryptionCode, 'code')}
                      className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                    >
                      {copied === 'code' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied === 'code' ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => downloadFile(decryptionCode, `decrypt_${encryptionResult.algorithm}_${Date.now()}.js`)}
                      className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {showCode && (
              <div className="relative">
                <textarea
                  value={decryptionCode}
                  readOnly
                  className="w-full h-64 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-green-400 font-mono text-sm resize-none"
                />
                <div className="absolute top-2 right-2 text-xs text-green-400/60 bg-black/50 px-2 py-1 rounded">
                  JavaScript
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">Security Notice</h4>
                <p className="text-yellow-300/80 text-sm">
                  Keep your decryption key secure! Anyone with access to both the encrypted text and the key can decrypt your data.
                  Consider storing the key separately from the encrypted text.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'decryption' && decryptionResult) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${
            decryptionResult.success 
              ? 'bg-gradient-to-r from-green-500 to-blue-600' 
              : 'bg-gradient-to-r from-red-500 to-orange-600'
          }`}>
            {decryptionResult.success ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {decryptionResult.success ? 'Decryption Successful' : 'Decryption Failed'}
          </h2>
        </div>

        {decryptionResult.success ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/90">Decrypted Text</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(decryptionResult.decrypted, 'decrypted')}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  {copied === 'decrypted' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied === 'decrypted' ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => downloadFile(decryptionResult.decrypted, `decrypted_text_${Date.now()}.txt`)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={decryptionResult.decrypted}
              readOnly
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
            />
            <p className="mt-1 text-xs text-white/60">
              Length: {decryptionResult.decrypted.length} characters
            </p>
            
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400 font-medium">Decryption completed successfully!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Error: {decryptionResult.error}</p>
                  <p className="text-red-300/80 text-sm mt-2">
                    Please check your encrypted text, key, and algorithm settings.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h4 className="font-semibold text-blue-400 mb-2">Troubleshooting Tips:</h4>
              <ul className="text-blue-300/80 text-sm space-y-1">
                <li>• Ensure the encrypted text is complete and unmodified</li>
                <li>• Verify the decryption key matches the one used for encryption</li>
                <li>• Check that the correct algorithm is selected</li>
                <li>• For AES and Hybrid algorithms, ensure the salt is provided if it was used</li>
                <li>• Make sure there are no extra spaces or characters</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};