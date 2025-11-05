# Release Notes - v0.4.0

## Major Update: Comprehensive Extension

This release significantly expands the incident.io n8n integration with extensive new functionality, comprehensive filtering, and write operations across the board.

## What's New

### 1. Alert Management (NEW)
Complete alert management capabilities:
- **Alert** - List, Get
- **Alert Attribute** - Full CRUD (List, Get, Create, Update, Delete)
- **Alert Route** - Full CRUD (List, Get, Create, Update, Delete)
- **Alert Source** - Full CRUD (List, Get, Create, Update, Delete)
- **Alert Event** - Create HTTP alert events

Includes comprehensive filtering for alerts:
- Deduplication key filtering
- Status filtering (one_of, not_in)
- Date filtering (created_at with gte, lte, date_range)
- Pagination support

### 2. Enhanced Filtering for Existing Resources
Added extensive query options for better data retrieval:

**Incidents:**
- Date filters: `created_at`, `updated_at` (gte, lte, date_range operators)
- Status filters: `status`, `status_category` (one_of, not_in operators)
- Classification: `severity`, `incident_type`, `incident_role`
- Custom field filtering support

**Actions & Follow-ups:**
- Filter by incident ID
- Filter by incident mode (standard, retrospective, test, tutorial)

**Users:**
- Filter by email address
- Filter by Slack user ID

### 3. Write Operations for Existing Resources
Added create, update, and delete operations where API supports them:

**Severities:**
- Create, Update, Delete operations
- Fields: name, description, rank

**Incident Statuses:**
- Create, Update, Delete operations
- Fields: name, category, description

**Custom Fields:**
- Create, Update, Delete operations
- Fields: name, field_type, description, required settings

**Schedules:**
- Create, Update, Delete operations
- Create Override operation
- Fields: name, timezone, config

### 4. Custom Field Options (NEW)
Complete resource management:
- List, Create, Update, Delete operations
- Fields: custom_field_id, value, sort_key

### 5. Users & Workflows (NEW)
**Users (v2):**
- List with filtering (email, slack_user_id)
- Get individual users

**Workflows (v2):**
- Full CRUD operations
- Fields: name, description, enabled

### 6. Incident Extensions (NEW)
Five new resources for comprehensive incident management:

**Incident Attachments (v1):**
- List, Create, Delete operations
- Link external resources to incidents

**Incident Memberships (v1):**
- Grant and revoke incident access
- User permission management

**Incident Updates (v2):**
- List incident updates
- Filter by incident ID

**Incident Timestamps (v2):**
- List and Get timestamp definitions
- Track key incident timeline events

**Incident Relationships (v1):**
- List incident relationships
- Filter by incident ID

## Resource Count
- **Before:** 13 resources (mostly read-only)
- **After:** 23 resources (with comprehensive CRUD support)

## Breaking Changes
None. This is a backward-compatible enhancement.

## Publishing Instructions

### Prerequisites
1. Ensure you're logged into npm with the correct account
2. Verify your npm authentication: `npm whoami`
3. Ensure you have proper permissions for @rubenlangeweg scope

### Build & Publish

```bash
# Navigate to the project directory
cd /Users/ruben/Desktop/n8n/n8n-incidentio

# Verify the build (already done)
npm run build

# Run linter to ensure code quality
npm run lint

# Publish to npm (will auto-build via prepublishOnly hook)
npm publish

# If this is the first public publish of the scoped package
npm publish --access public
```

### Post-Publishing

1. **Tag the release in Git:**
   ```bash
   git add .
   git commit -m "Release v0.4.0: Major expansion with Alert Management, filtering, and CRUD operations"
   git tag v0.4.0
   git push origin main --tags
   ```

2. **Update GitHub Release:**
   - Create a new release on GitHub
   - Use tag v0.4.0
   - Copy content from RELEASE_NOTES_v0.4.0.md

3. **Verify npm package:**
   - Check https://www.npmjs.com/package/@rubenlangeweg/n8n-nodes-incidentio
   - Verify version 0.4.0 is listed
   - Test installation: `npm install @rubenlangeweg/n8n-nodes-incidentio@0.4.0`

4. **Update documentation** (if applicable):
   - Update README with new resources
   - Add examples for new functionality
   - Update any integration guides

## Testing Recommendations

Before deploying to production:
1. Test alert management workflows
2. Verify filtering operations work as expected
3. Test CRUD operations on custom fields, severities, and statuses
4. Validate schedule creation and override functionality
5. Test incident extension resources (attachments, memberships, etc.)

## Support

For issues or questions:
- GitHub: https://github.com/rubenlangeweg/n8n-nodes-incidentio
- Email: ruben@langeweg.dev
- API Documentation: https://api-docs.incident.io/

