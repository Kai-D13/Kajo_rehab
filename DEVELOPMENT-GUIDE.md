# 🚀 Kajo Mini App Development Guide

## 📱 ZMP CLI Development Workflow

### 🔧 **Available Commands**

```bash
# Build project
npm run build
# or
zmp build

# Start development server  
npm start
# or  
zmp start

# Deploy to Zalo Mini App Platform
npm run deploy
# or
zmp deploy

# Local testing (our custom server)
npm run serve

# Build + Local serve
npm run local
```

### 🌐 **Development Environments**

#### **1. ZMP Development Server (Recommended for Development)**
```bash
zmp start
```
- **URL**: `http://localhost:3000` (default)
- **Features**: Hot reload, Zalo SDK integration, proper debugging
- **Use for**: Active development, debugging Zalo features

#### **2. Local Production-like Server**
```bash
npm run local
```
- **URL**: `http://localhost:4001`
- **Features**: Serves built files, tests production behavior
- **Use for**: Testing before deployment, admin reception testing

### 🎯 **Testing Strategy**

1. **Development Phase**: Use `zmp start` for active coding
2. **Pre-deployment Testing**: Use `npm run local` for final testing
3. **Production**: Deploy with `zmp deploy`

### 📁 **Build Output**
- ZMP builds to `www/` folder (not `dist/`)
- Admin reception is standalone HTML file

### 🔑 **Access Points**

#### Development Mode:
- **Mini App**: `http://localhost:3000` (zmp start)
- **Admin**: `http://localhost:4001/admin` (local server)

#### Production Mode:
- **Mini App**: Via QR code after deployment
- **Admin**: Host admin-reception-enhanced.html separately

### ⚠️ **Important Notes**

1. **ZMP CLI** handles Zalo SDK properly
2. **Local server** is for testing built files
3. **Admin reception** runs independently
4. **Always build** before local testing

### 🛠️ **Troubleshooting**

- If `zmp start` fails → Check port availability
- If build not found → Run `npm run build` first  
- If admin errors → Check console for syntax errors
- If Zalo features fail → Use `zmp start` for proper SDK
