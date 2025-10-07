# incident.io n8n Node - Setup Guide

## Quick Start

Your incident.io n8n node is now ready! Here's how to test and deploy it.

## Project Structure

```
n8n-incidentio/
├── credentials/
│   └── IncidentIoApi.credentials.ts       # API authentication
├── nodes/
│   └── IncidentIo/
│       ├── IncidentIo.node.ts             # Main node implementation
│       └── incidentio.svg                  # Node icon
├── dist/                                   # Compiled output (generated)
├── package.json                            # Project configuration
├── tsconfig.json                           # TypeScript config
├── DEVELOPMENT_PLAN.md                     # Full development plan
├── README.md                               # User-facing documentation
└── swagger (1).json                        # incident.io API spec
```

## Testing Locally

### Option 1: Link to Local n8n Installation (Recommended)

1. **Link this package:**
   ```bash
   cd /Users/ruben/Desktop/n8n-incidentio
   npm link
   ```

2. **Link in your n8n custom nodes directory:**
   ```bash
   # If ~/.n8n/nodes doesn't exist, create it
   mkdir -p ~/.n8n/nodes
   cd ~/.n8n/nodes
   npm link n8n-nodes-incidentio
   ```

3. **Restart n8n:**
   ```bash
   # If running n8n locally
   n8n stop
   n8n start

   # Or if using npx
   npx n8n
   ```

4. **Verify the node appears:**
   - Open n8n in your browser (usually http://localhost:5678)
   - Create a new workflow
   - Search for "incident.io" in the node palette
   - The node should appear with the red icon

### Option 2: Set Custom Node Path

1. **Set N8N_CUSTOM_EXTENSIONS environment variable:**
   ```bash
   export N8N_CUSTOM_EXTENSIONS="/Users/ruben/Desktop/n8n-incidentio"
   n8n start
   ```

2. **Or add to your shell profile** (`.bashrc`, `.zshrc`, etc.):
   ```bash
   echo 'export N8N_CUSTOM_EXTENSIONS="/Users/ruben/Desktop/n8n-incidentio"' >> ~/.zshrc
   source ~/.zshrc
   ```

## Deploy to Unraid Server

### Option 1: Via npm (If you have a private npm registry)

1. **Publish to private registry** (update package.json first):
   ```bash
   npm publish --registry=https://your-registry.com
   ```

2. **On your Unraid server**, install in n8n:
   ```bash
   cd /path/to/n8n
   npm install n8n-nodes-incidentio --registry=https://your-registry.com
   ```

### Option 2: Direct File Copy

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Copy dist folder to your Unraid server:**
   ```bash
   scp -r dist/ user@unraid-server:/path/to/n8n/custom-nodes/n8n-nodes-incidentio/
   scp package.json user@unraid-server:/path/to/n8n/custom-nodes/n8n-nodes-incidentio/
   ```

3. **On Unraid, set the custom extensions path:**
   - Edit your n8n Docker container
   - Add environment variable: `N8N_CUSTOM_EXTENSIONS=/path/to/custom-nodes`
   - Restart the container

### Option 3: Git Repository

1. **Initialize git repository:**
   ```bash
   cd /Users/ruben/Desktop/n8n-incidentio
   git init
   git add .
   git commit -m "Initial commit: incident.io n8n node"
   ```

2. **Push to GitHub/GitLab:**
   ```bash
   git remote add origin https://github.com/yourusername/n8n-nodes-incidentio.git
   git push -u origin main
   ```

3. **On Unraid, clone and install:**
   ```bash
   cd /path/to/n8n/custom-nodes
   git clone https://github.com/yourusername/n8n-nodes-incidentio.git
   cd n8n-nodes-incidentio
   npm install
   npm run build
   ```

## Testing the Node

### 1. Set Up Credentials

1. In n8n, go to **Credentials** > **New**
2. Search for "incident.io API"
3. Enter your API key from https://app.incident.io/settings/api-keys
4. Click **Save**

### 2. Test Basic Operations

#### Test 1: List Severities (Simple GET request)
1. Add incident.io node to workflow
2. Select **Resource**: Severity
3. Select **Operation**: List
4. Select your credentials
5. Execute the node
6. You should see a list of severities

#### Test 2: List Incidents
1. Add incident.io node
2. Select **Resource**: Incident
3. Select **Operation**: List
4. Optionally add filters (page size, etc.)
5. Execute the node
6. You should see a list of incidents

#### Test 3: Get Who's On-Call
1. Add incident.io node to get schedules
2. Select **Resource**: Schedule
3. Select **Operation**: List
4. Execute and note a schedule ID
5. Add another incident.io node
6. Select **Resource**: Schedule Entry
7. Select **Operation**: List
8. Enter the schedule ID from step 4
9. Execute to see who's on-call

### 3. Test Error Handling

1. Try with invalid credentials (should show auth error)
2. Try to get a non-existent incident ID (should show 404 error)
3. Verify error messages are clear and helpful

## Development Workflow

### Making Changes

1. **Edit the source files** in `credentials/` or `nodes/`

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Restart n8n** to see changes

4. **Format code** before committing:
   ```bash
   npm run format
   ```

5. **Lint code:**
   ```bash
   npm run lint
   npm run lintfix  # Auto-fix issues
   ```

### Hot Reload (Advanced)

For faster development, use TypeScript watch mode:

```bash
# Terminal 1: Watch and rebuild on changes
npm run dev

# Terminal 2: Run n8n
n8n start
```

You'll still need to restart n8n to see changes, but compilation is automatic.

## What's Implemented

### ✅ Phase 1 Complete

- **Authentication**: API Key via Bearer token
- **Incidents**: List, Get, Create, Update
- **Supporting Resources**: Severities, Statuses, Types, Custom Fields
- **On-Call**: Schedules, Schedule Entries, Escalations
- **Catalog**: Types and Entries (V3 API)
- **Actions & Follow-ups**: List and Get operations

### 🔄 Phase 2 Pending

- **Webhook Trigger**: Receive events from incident.io
- **Signature Verification**: HMAC validation for webhooks
- **Event Types**: incident.created, incident.updated, etc.

## Troubleshooting

### Node doesn't appear in n8n

1. Check the linking worked:
   ```bash
   ls -la ~/.n8n/nodes
   # Should show n8n-nodes-incidentio symlink
   ```

2. Check n8n logs for errors:
   ```bash
   n8n start --verbose
   ```

3. Verify the build completed:
   ```bash
   ls -la dist/
   # Should have credentials/ and nodes/ folders
   ```

### Credentials test fails

1. Verify your API key is correct
2. Check the key has proper permissions
3. Test the API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" https://api.incident.io/v1/severities
   ```

### TypeScript errors

1. Install dependencies:
   ```bash
   npm install
   ```

2. Clean and rebuild:
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

## Next Steps

### 1. Test All Operations
- Go through each resource and operation
- Verify API responses match expectations
- Test error conditions

### 2. Implement Phase 2 (Webhooks)
- Create webhook trigger node
- Add signature verification
- Test with incident.io webhook configuration

### 3. Add More Operations
- Create/Update for Schedules
- Create/Update for Catalog Types/Entries
- More complex incident operations

### 4. Optimize & Polish
- Add resource loading (dynamic dropdowns for IDs)
- Improve error messages
- Add more filtering options
- Add pagination handling

### 5. Share with Community
- Publish to npm
- Submit to n8n community nodes
- Create example workflows
- Write blog post/tutorial

## Resources

- **Development Plan**: See `DEVELOPMENT_PLAN.md` for full implementation details
- **incident.io API**: https://api-docs.incident.io/
- **n8n Docs**: https://docs.n8n.io/integrations/creating-nodes/
- **n8n Community**: https://community.n8n.io/

## Need Help?

- Check the logs: `n8n start --verbose`
- Review the API spec: `swagger (1).json`
- Test API directly: Use curl or Postman
- n8n community forum: https://community.n8n.io/
