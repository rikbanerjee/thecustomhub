# ⚡ Quick Deploy Guide

Fast reference for deploying The Custom Hub to Firebase Hosting.

---

## 🚀 Quick Start

### 1. Setup (One-time)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if needed)
firebase init hosting
# Use existing project: Yes
# Select: thecustomhub
# Public directory: dist
# Single-page app: Yes
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
# Get them from: https://console.firebase.google.com > Project Settings
```

### 3. Deploy

```bash
npm run deploy
```

**That's it!** Your site is live at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

---

## 📦 Build Commands

```bash
# Development
npm run dev                 # Start dev server

# Build
npm run build               # Production build
npm run build:analyze       # Build with bundle analyzer
npm run preview             # Preview production build

# Deploy
npm run deploy              # Build and deploy
npm run deploy:all          # Deploy everything

# Utilities
npm run clean               # Clean build artifacts
npm run lint                # Lint code
npm run lint:fix            # Fix linting errors
```

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` file created with Firebase credentials
- [ ] `products.json` updated with real data
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] All routes tested
- [ ] Images load correctly
- [ ] Mobile responsive

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `firebase.json` | Hosting config, rewrites, cache headers |
| `.firebaserc` | Firebase project ID |
| `vite.config.js` | Build optimizations, code splitting |
| `.env.example` | Environment variables template |
| `public/404.html` | Custom 404 page |

---

## 📊 Build Output

**Initial Bundle:** ~95 KB gzipped ✅ (Target: <500 KB)

**Chunks:**
- `vendor-react.js` - 72 KB (gzipped)
- `index.js` - 21 KB (gzipped)
- `vendor-other.js` - 2 KB (gzipped)
- `data-products.js` - 52 KB (gzipped) - Loaded separately
- `index.css` - 7 KB (gzipped)

---

## 🐛 Common Issues

**Build fails:**
```bash
npm run clean && npm install && npm run build
```

**Deploy fails:**
```bash
firebase logout && firebase login
```

**Routes return 404:**
- Check `firebase.json` has SPA rewrites
- Rebuild and redeploy

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOYMENT_CHECKLIST.md`
- **Configuration Details:** `DEPLOYMENT_CONFIG.md`
- **Step-by-step:** Follow `DEPLOYMENT_CHECKLIST.md`

---

**Need help?** Check `DEPLOYMENT_CHECKLIST.md` for detailed instructions! 🚀

