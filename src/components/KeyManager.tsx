import React, { useState, useEffect } from 'react';
import { Key, Trash2, Download, Upload, Plus, Clock, Shield, AlertCircle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { KeyStorage } from '../utils/keyStorage';
import { StoredKey } from '../types';
import { CryptoString } from '../utils/encryption';

export const KeyManager: React.FC = () => {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyAlgorithm, setNewKeyAlgorithm] = useState('aes');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    refreshKeys();
  }, []);

  const refreshKeys = () => {
    const allKeys = KeyStorage.getAllKeys();
    setKeys(allKeys);
  };

  const handleDeleteKey = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the key "${name}"? This action cannot be undone.`)) {
      const success = KeyStorage.deleteKey(id);
      if (success) {
        refreshKeys();
        setSuccess(`Key "${name}" deleted successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to delete key');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleAddKey = () => {
    if (!newKeyName.trim()) {
      setError('Please enter a key name');
      return;
    }

    if (!newKeyValue.trim()) {
      setError('Please enter a key value');
      return;
    }

    // Check for duplicate names
    if (keys.some(key => key.name.toLowerCase() === newKeyName.trim().toLowerCase())) {
      setError('A key with this name already exists');
      return;
    }

    const newKey: StoredKey = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newKeyName.trim(),
      key: newKeyValue.trim(),
      algorithm: newKeyAlgorithm,
      created: Date.now(),
      used: Date.now()
    };

    const success = KeyStorage.saveKey(newKey);
    if (success) {
      setNewKeyName('');
      setNewKeyValue('');
      setShowAddForm(false);
      refreshKeys();
      setSuccess(`Key "${newKey.name}" added successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError('Failed to save key');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleGenerateKey = () => {
    const generatedKey = CryptoString.generateKey(32);
    setNewKeyValue(generatedKey);
  };

  const handleExportKeys = () => {
    try {
      const keysData = KeyStorage.exportKeys();
      const blob = new Blob([keysData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptostring_keys_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Keys exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to export keys');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleImportKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const keysData = e.target?.result as string;
        const result = KeyStorage.importKeys(keysData);
        
        if (result.success) {
          refreshKeys();
          setSuccess(`Successfully imported ${result.imported} key(s)`);
          if (result.errors.length > 0) {
            console.warn('Import warnings:', result.errors);
          }
        } else {
          setError(`Import failed: ${result.errors.join(', ')}`);
        }
        
        setTimeout(() => {
          setSuccess(null);
          setError(null);
        }, 5000);
      } catch (error) {
        setError('Invalid file format');
        setTimeout(() => setError(null), 3000);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL stored keys? This action cannot be undone.')) {
      const success = KeyStorage.clearAllKeys();
      if (success) {
        refreshKeys();
        setSuccess('All keys cleared successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to clear keys');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(keyName);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Key Manager</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Key
          </button>
          
          <button
            onClick={handleExportKeys}
            disabled={keys.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportKeys}
              className="hidden"
            />
          </label>
        </div>
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

      {showAddForm && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Key Name *</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter key name..."
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Key Value *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter key value..."
                />
                <button
                  onClick={handleGenerateKey}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Algorithm</label>
              <select
                value={newKeyAlgorithm}
                onChange={(e) => setNewKeyAlgorithm(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="aes" className="bg-gray-800">AES-like</option>
                <option value="hybrid" className="bg-gray-800">Hybrid</option>
                <option value="xor" className="bg-gray-800">XOR</option>
                <option value="caesar" className="bg-gray-800">Caesar</option>
                <option value="base64" className="bg-gray-800">Base64</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddKey}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                Add Key
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewKeyName('');
                  setNewKeyValue('');
                  setError(null);
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {keys.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No keys stored yet</p>
            <p className="text-sm">Add your first key to get started</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-white/80">
                {keys.length} key{keys.length !== 1 ? 's' : ''} stored
              </p>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            {keys.map((key) => (
              <div
                key={key.id}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                        {key.algorithm.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-white/60 space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {formatDate(key.created)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last used: {formatDate(key.used)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-xs bg-black/20 px-2 py-1 rounded flex-1">
                          {visibleKeys.has(key.id) 
                            ? key.key 
                            : '•'.repeat(Math.min(key.key.length, 32))
                          }
                        </div>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title={visibleKeys.has(key.id) ? 'Hide key' : 'Show key'}
                        >
                          {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key, key.name)}
                          className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title="Copy key"
                        >
                          {copied === key.name ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteKey(key.id, key.name)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};