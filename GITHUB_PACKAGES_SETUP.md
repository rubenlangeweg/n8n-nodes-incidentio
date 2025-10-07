# Publishing to GitHub Packages - Quick Guide

## ✅ What's Done

- ✅ Git repository initialized
- ✅ Initial commit created
- ✅ package.json configured for GitHub Packages
- ✅ Package name: `@rubenlangeweg/n8n-nodes-incidentio`

## 📋 Next Steps

### 1. Create GitHub Repository (Do this first!)

1. Go to https://github.com/new
2. **Repository name**: `n8n-nodes-incidentio`
3. **Visibility**: Choose **Public** (GitHub Packages free) or **Private** (still free!)
4. **Don't** check "Initialize with README"
5. Click **Create repository**

### 2. Create Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. **Note**: `npm publish for n8n-nodes-incidentio`
4. **Expiration**: Your choice (or "No expiration")
5. **Select scopes**:
   - ✅ `write:packages`
   - ✅ `repo` (if using private repo)
6. Click **Generate token**
7. **COPY THE TOKEN** - save it somewhere safe!

### 3. Push to GitHub

After creating the repo, run these commands:

```bash
# Set your git name/email (one time)
git config --global user.name "Ruben Langeweg"
git config --global user.email "ruben@langeweg.dev"

# Add GitHub remote
git remote add origin https://github.com/rubenlangeweg/n8n-nodes-incidentio.git

# Set default branch name
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Login to GitHub Packages

```bash
# Login to GitHub npm registry
npm login --registry=https://npm.pkg.github.com

# When prompted:
# Username: rubenlangeweg
# Password: YOUR_GITHUB_TOKEN (paste the token you created)
# Email: ruben@langeweg.dev
```

### 5. Build and Publish

```bash
# Build the package
npm run build

# Publish to GitHub Packages
npm publish
```

That's it! Your package is now published to GitHub Packages! 🎉

---

## Installing on Your Unraid Server

### Option A: Create .npmrc in your n8n directory

1. SSH into your Unraid server
2. Navigate to your n8n directory
3. Create/edit `.npmrc`:

```bash
cat > .npmrc << 'EOF'
@rubenlangeweg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
EOF
```

4. Install the package:

```bash
npm install @rubenlangeweg/n8n-nodes-incidentio
```

### Option B: One-time install command

```bash
npm install @rubenlangeweg/n8n-nodes-incidentio \
  --registry=https://npm.pkg.github.com \
  --//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### Option C: Docker Environment Variable

Add to your n8n Docker container:

```bash
docker run -d \
  --name n8n \
  -e NPM_CONFIG_REGISTRY=https://npm.pkg.github.com \
  -e NPM_CONFIG_//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN \
  n8nio/n8n
```

---

## Updating the Package

When you make changes:

1. Update version in `package.json`:
   ```json
   "version": "0.1.1"
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Update: your changes"
   git push
   ```

3. Publish new version:
   ```bash
   npm run build
   npm publish
   ```

4. On Unraid:
   ```bash
   npm update @rubenlangeweg/n8n-nodes-incidentio
   ```

---

## Troubleshooting

### "401 Unauthorized" when publishing

- Check your token is correct
- Verify token has `write:packages` scope
- Make sure you're logged in: `npm whoami --registry=https://npm.pkg.github.com`

### "404 Not Found" when installing

- Check package name is correct: `@rubenlangeweg/n8n-nodes-incidentio`
- Verify token has `read:packages` scope
- Check `.npmrc` configuration

### Package not appearing in n8n

1. Check installation location:
   ```bash
   npm list @rubenlangeweg/n8n-nodes-incidentio
   ```

2. Restart n8n:
   ```bash
   docker restart n8n
   ```

3. Check n8n logs for errors

---

## Commands Summary

```bash
# One-time setup
git config --global user.name "Ruben Langeweg"
git config --global user.email "ruben@langeweg.dev"
git remote add origin https://github.com/rubenlangeweg/n8n-nodes-incidentio.git
git push -u origin main

# Publish to GitHub Packages
npm login --registry=https://npm.pkg.github.com
npm run build
npm publish

# Install on Unraid
npm install @rubenlangeweg/n8n-nodes-incidentio --registry=https://npm.pkg.github.com

# Update
npm update @rubenlangeweg/n8n-nodes-incidentio
```

---

## Alternative: Public npm (Easier!)

If you want to make it easier for yourself and others, consider publishing to public npm instead:

```bash
# 1. Update package.json - remove publishConfig section
# 2. Login to npm
npm login

# 3. Publish (free, no token needed on Unraid)
npm publish --access public

# 4. Install anywhere (no auth needed!)
npm install @rubenlangeweg/n8n-nodes-incidentio
```

Public npm is recommended for n8n community nodes!
