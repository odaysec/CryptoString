import React, { useState } from 'react';
import { Shield, Lock, Unlock, Key, Info, Heart, Github } from 'lucide-react';
import { EncryptionForm } from './components/EncryptionForm';
import { DecryptionForm } from './components/DecryptionForm';
import { ResultDisplay } from './components/ResultDisplay';
import { KeyManager } from './components/KeyManager';
import { EncryptionResult, DecryptionResult } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'keys' | 'about'>('encrypt');
  const [encryptionResult, setEncryptionResult] = useState<EncryptionResult | undefined>();
  const [decryptionResult, setDecryptionResult] = useState<DecryptionResult | undefined>();

  const tabs = [
    { id: 'encrypt', label: 'Encrypt', icon: Lock },
    { id: 'decrypt', label: 'Decrypt', icon: Unlock },
    { id: 'keys', label: 'Key Manager', icon: Key },
    { id: 'about', label: 'About', icon: Info }
  ];

  const handleEncryptionResult = (result: EncryptionResult) => {
    setEncryptionResult(result);
    setDecryptionResult(undefined);
  };

  const handleDecryptionResult = (result: DecryptionResult) => {
    setDecryptionResult(result);
    setEncryptionResult(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.03%27%3E%3Cpath%20d%3D%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CryptoString
                </h1>
                <p className="text-white/60 text-sm">Advanced String Encryption Tool</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center justify-center">
              <div className="flex bg-white/5 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-white/10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8">
              {activeTab === 'encrypt' && (
                <div className="grid lg:grid-cols-2 gap-8">
                  <EncryptionForm onResult={handleEncryptionResult} />
                  {encryptionResult && (
                    <ResultDisplay 
                      encryptionResult={encryptionResult} 
                      type="encryption"
                    />
                  )}
                </div>
              )}

              {activeTab === 'decrypt' && (
                <div className="grid lg:grid-cols-2 gap-8">
                  <DecryptionForm onResult={handleDecryptionResult} />
                  {decryptionResult && (
                    <ResultDisplay 
                      decryptionResult={decryptionResult} 
                      type="decryption"
                    />
                  )}
                </div>
              )}

              {activeTab === 'keys' && (
                <KeyManager />
              )}

              {activeTab === 'about' && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">About CryptoString</h2>
                  </div>

                  <div className="space-y-6 text-white/80">
                    <p className="text-lg leading-relaxed">
                      CryptoString is an advanced string encryption tool designed for developers, security professionals, 
                      and anyone who needs secure text encryption with reusable functionality.
                    </p>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Key Features</h3>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Multiple Encryption Algorithms:</strong> AES-like, Hybrid, XOR, Caesar Cipher, and Base64</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Key Management:</strong> Secure storage and management of encryption keys</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Code Generation:</strong> Automatic generation of JavaScript decryption code</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Enhanced Security:</strong> Salt-based encryption and secure key derivation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>Export/Import:</strong> Backup and restore your encryption keys</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Encryption Algorithms</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="font-semibold text-white mb-2">AES-like</h4>
                          <p className="text-sm">Advanced encryption using XOR with key derivation and salt support</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="font-semibold text-white mb-2">Hybrid</h4>
                          <p className="text-sm">Combines Caesar, XOR, and AES-like algorithms for maximum security</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="font-semibold text-white mb-2">XOR Cipher</h4>
                          <p className="text-sm">Fast and efficient encryption using XOR operations</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="font-semibold text-white mb-2">Caesar Cipher</h4>
                          <p className="text-sm">Classic substitution cipher with configurable shift</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl border border-blue-500/20">
                      <h4 className="font-semibold text-white mb-2">Security Notice</h4>
                      <p className="text-sm">
                        This tool is designed for educational and development purposes. For production applications 
                        requiring high security, please use established cryptographic libraries and follow security best practices.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer Copyright */}
        <footer className="py-6 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white/60">
              <div className="flex items-center gap-2">
                <span>Copyright by</span>
                <Heart className="w-4 h-4 text-purple-400 fill-current" />
                <span className="font-semibold text-purple-400">Odaysec</span>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href="https://github.com/odaysec" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  github.com/odaysec
                </a>
              </div>
              <span>All rights reserved</span>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-white/40">
                Built with ❤️ for the cybersecurity community
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;