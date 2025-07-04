# 🔐 CryptoString: Advanced String Encryption Tool

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

<div align="center">
  <h3>🚀 Advanced String Encryption Tool for Developers & Security Professionals</h3>
  <p>A modern, feature-rich web application for encrypting text with multiple algorithms and generating reusable decryption code.</p>
</div>



## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/odaysec/CryptoString.git
   cd CryptoString
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```


### **Encrypting Text**

1. Navigate to the **Encrypt** tab
2. Enter your text in the input field
3. Select your preferred encryption algorithm
4. Configure advanced options (optional):
   - Adjust key length (16-64 characters)
   - Enable/disable timestamp inclusion
   - Enable/disable salt usage
   - Save key for later use
5. Click **Encrypt Text**
6. Copy the encrypted result and decryption key

### **Decrypting Text**

1. Navigate to the **Decrypt** tab
2. Enter the encrypted text
3. Choose between:
   - **Manual Key**: Enter the decryption key manually
   - **Stored Key**: Select from previously saved keys
4. Select the correct algorithm used for encryption
5. Enter salt if it was used during encryption
6. Click **Decrypt Text**

### **Managing Keys**

1. Navigate to the **Key Manager** tab
2. **Add New Key**: Create custom keys with specific algorithms
3. **Generate Key**: Use the built-in secure key generator
4. **Export Keys**: Download all keys as JSON backup
5. **Import Keys**: Restore keys from backup file
6. **View/Hide Keys**: Toggle key visibility for security
7. **Copy Keys**: Quick copy to clipboard functionality

### **Using Generated Code**

1. After encryption, click **Show Code** in the results
2. **Test Code**: Verify the code works correctly
3. **Copy Code**: Copy to clipboard for use in your projects
4. **Download Code**: Save as .js file for integration



## Technical Details

### **Architecture**
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React icon library
- **Build Tool**: Vite for fast development and building
- **Storage**: Browser localStorage with encryption

### **Encryption Implementation**
- **AES-like**: XOR-based encryption with key derivation
- **Hybrid**: Multi-layer encryption combining multiple algorithms
- **Key Derivation**: Custom function mixing key and salt
- **Salt Generation**: Cryptographically secure random salt
- **Base64 Encoding**: Standard browser implementation

### **Security Considerations**
- All encryption happens client-side
- Keys are encrypted before localStorage
- No data is sent to external servers
- Cryptographically secure random number generation
- Proper key derivation with salt support


### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Contributing**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 📝 Algorithm Details

### **AES-like Encryption**
```javascript
// Key derivation with salt
function deriveKey(key, salt) {
  // Complex mixing of key and salt
  // XOR operations with position-based variation
}

// Encryption process
function encrypt(text, key, salt) {
  // Derive key from original key and salt
  // XOR each character with derived key
  // Apply position-based variation
  // Base64 encode result
}
```

### **Hybrid Encryption**
```javascript
// Multi-layer approach
function hybridEncrypt(text, key, salt) {
  // Step 1: Caesar cipher with dynamic shift
  // Step 2: XOR encryption
  // Step 3: AES-like encryption
}
```



## Security Notice

> **Important**: This tool is designed for educational and development purposes. For production applications requiring high security, please use established cryptographic libraries and follow security best practices.

### **Recommendations**
- Use strong, unique keys for each encryption
- Store keys separately from encrypted data
- Consider using established libraries for production use
- Regularly backup your encryption keys
- Test decryption before relying on encrypted data


## 🤝 Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🔄 Contributing to the codebase



## Stats

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=odaysec&repo=CryptoString&theme=dark&bg_color=0d1117&border_color=30363d" alt="CryptoString Stats">
</div>



<div align="center">
  <p>Built with ❤️ for the cybersecurity community</p>
</div>
