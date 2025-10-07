# incident.io n8n Node - Development Plan

## Project Overview

Building a custom n8n node for incident.io that enables users to interact with incident.io's API and receive webhooks. The node will support incident management, on-call scheduling, catalog management, and more.

---

## Architecture Decision

### **Approach: Declarative Style Node**
- **Tool**: Use `npm create @n8n/node` to scaffold the project
- **Style**: Declarative node structure (JSON-based configuration)
- **Benefits**:
  - Cleaner, more maintainable code
  - Perfect for REST API integrations
  - Easier to extend and share
  - Less boilerplate code

### **Authentication**
- **Type**: API Key authentication via Bearer token
- **Base URL**: `https://api.incident.io`
- **Rate Limit**: 1200 requests/minute per API key (default)
- **Setup**: Users create API keys at https://app.incident.io/settings/api-keys

---

## Phase 1: Core API Operations

### 1.1 Authentication Setup
**Priority**: Critical (First Step)

- Implement API Key credential storage
- Set up Bearer token authentication
- Configure base URL and headers
- Handle rate limiting (429 responses)

---

### 1.2 Incident Operations
**Priority**: High (Core functionality)

#### Operations:
1. **List Incidents** - `GET /v2/incidents`
   - Support extensive filtering:
     - By status, severity, incident type
     - By custom fields
     - By date ranges (created_at, updated_at)
     - By assigned roles
     - By mode (standard, retrospective, test, tutorial)
   - Pagination support (page_size, after)

2. **Get Incident** - `GET /v2/incidents/{id}`
   - Retrieve single incident by ID
   - Return full incident details

3. **Create Incident** - `POST /v2/incidents`
   - Required: idempotency_key, visibility
   - Optional: name, summary, severity_id, status_id, type_id
   - Support custom fields, role assignments, timestamps
   - Support retrospective incident imports

4. **Update Incident** - `POST /v2/incidents/{id}/actions/edit`
   - Update existing incident fields
   - Optional: notify incident channel

---

### 1.3 Supporting Resources
**Priority**: High (Required for incident operations)

#### Operations:
1. **List Severities** - `GET /v1/severities`
   - Get all severity levels
   - Used when creating/updating incidents

2. **List Incident Statuses** - `GET /v1/incident_statuses`
   - Get all available statuses
   - Used when creating/updating incidents

3. **List Incident Types** - `GET /v1/incident_types`
   - Get all incident types
   - Used when creating/updating incidents

4. **List Custom Fields** - `GET /v2/custom_fields`
   - Get all custom field definitions
   - Types: single-select, multi-select, text, link, number
   - Used for understanding available custom fields

---

### 1.4 On-Call/Schedule Operations
**Priority**: Medium

#### Schedule Management:
1. **List Schedules** - `GET /v2/schedules`
   - List all configured schedules
   - Pagination support

2. **Get Schedule** - `GET /v2/schedules/{id}`
   - Get single schedule details
   - Includes rotation config, current shifts, holidays

3. **Create Schedule** - `POST /v2/schedules`
   - Create new on-call schedule
   - Configure rotations, handovers, working hours
   - Set timezone, holidays, team assignments

4. **Update Schedule** - `PUT /v2/schedules/{id}`
   - Update existing schedule configuration

#### Schedule Entries:
5. **Get Schedule Entries** - `GET /v2/schedule_entries`
   - Get who's on-call and when
   - Filter by schedule_id
   - Time window filtering (entry_window_start/end)
   - Returns: final, overrides, and scheduled entries

#### Schedule Overrides:
6. **Create Schedule Override** - `POST /v2/schedule_overrides`
   - Create manual schedule overrides
   - Specify user, time range, schedule layer

#### Escalation Management:
7. **Create Escalation Path** - `POST /v2/escalation_paths`
   - Define escalation paths
   - Configure levels, conditions, targets

8. **Get Escalation Path** - `GET /v2/escalation_paths/{id}`
   - Retrieve escalation path details

9. **Update Escalation Path** - `PUT /v2/escalation_paths/{id}`
   - Modify existing escalation path

10. **List Escalations** - `GET /v2/escalations`
    - List all escalations with filtering
    - Filter by: status, path, alert, dates
    - Pagination support

11. **Get Escalation** - `GET /v2/escalations/{id}`
    - Get detailed escalation information
    - Includes events timeline, related alerts/incidents

---

### 1.5 Catalog V3 Operations
**Priority**: Medium

#### Catalog Types:
1. **List Catalog Types** - `GET /v3/catalog_types`
   - List all catalog types
   - Includes integration-synced types

2. **Get Catalog Type** - `GET /v3/catalog_types/{id}`
   - Get single catalog type details
   - Includes schema and attributes

3. **Create Catalog Type** - `POST /v3/catalog_types`
   - Create new catalog type
   - Configure: name, description, icon, color, categories
   - Set ranking, identifier behavior

4. **Update Catalog Type** - `PUT /v3/catalog_types/{id}`
   - Update catalog type metadata
   - Schema updates done separately

5. **Delete Catalog Type** - `DELETE /v3/catalog_types/{id}`
   - Archive catalog type and all entries

6. **Update Type Schema** - `POST /v3/catalog_types/{id}/actions/update_schema`
   - Add/remove attributes
   - Handle type dependencies

#### Catalog Entries:
7. **List Catalog Entries** - `GET /v3/catalog_entries`
   - List entries for a catalog type
   - Filter by: catalog_type_id, identifier
   - Pagination support (max 250 per page)

8. **Get Catalog Entry** - `GET /v3/catalog_entries/{id}`
   - Get single entry details
   - Includes attribute values

9. **Create Catalog Entry** - `POST /v3/catalog_entries`
   - Create new catalog entry
   - Upsert behavior with external_id
   - Max 50,000 entries per type

10. **Update Catalog Entry** - `PUT /v3/catalog_entries/{id}`
    - Update existing entry
    - Support partial updates

11. **Delete Catalog Entry** - `DELETE /v3/catalog_entries/{id}`
    - Archive catalog entry

#### Catalog Resources:
12. **List Catalog Resources** - `GET /v3/catalog_resources`
    - List available attribute types
    - Used for schema creation

---

### 1.6 Actions & Follow-ups Operations
**Priority**: Low

#### Actions V2:
1. **List Actions** - `GET /v2/actions`
   - List incident actions (ephemeral todo items)
   - Filter by incident_id, incident_mode

2. **Get Action** - `GET /v2/actions/{id}`
   - Get single action details

#### Follow-ups V2:
3. **List Follow-ups** - `GET /v2/follow_ups`
   - List post-incident follow-ups
   - Filter by incident_id, incident_mode

4. **Get Follow-up** - `GET /v2/follow_ups/{id}`
   - Get single follow-up details

---

## Phase 2: Webhook Trigger Support

### Webhook Configuration
**Priority**: Medium (After Phase 1 complete)

#### Features:
- Receive webhook events from incident.io
- Events include:
  - incident.created
  - incident.updated
  - incident.status_updated
  - And more...

#### Implementation:
1. **Webhook Node Setup**
   - Create separate webhook trigger node
   - Register webhook endpoint with n8n

2. **Signature Verification**
   - Implement HMAC signature verification
   - Powered by Svix
   - Headers: webhook-id, webhook-timestamp, webhook-signature

3. **Event Handling**
   - Parse webhook payload
   - Handle private incidents (only ID sent)
   - Fetch latest state via API when needed

4. **Best Practices**
   - Always fetch latest state after webhook
   - Don't rely on webhook payload order
   - Handle retry logic (24hr retry window)

---

## Implementation Order

### Step 1: Project Setup
- [ ] Run `npm create @n8n/node` to initialize project
- [ ] Set up project structure
- [ ] Configure package.json for publication
- [ ] Set up TypeScript configuration

### Step 2: Authentication (1.1)
- [ ] Create credentials file for API key
- [ ] Implement Bearer token authentication
- [ ] Set up base URL and headers
- [ ] Test authentication with simple API call

### Step 3: Core Incidents (1.2)
- [ ] Implement List Incidents operation
- [ ] Implement Get Incident operation
- [ ] Implement Create Incident operation
- [ ] Implement Update Incident operation
- [ ] Add parameter validation
- [ ] Test all incident operations

### Step 4: Supporting Resources (1.3)
- [ ] Implement List Severities
- [ ] Implement List Statuses
- [ ] Implement List Types
- [ ] Implement List Custom Fields
- [ ] Test integration with incident operations

### Step 5: Local Testing
- [ ] Test node locally with n8n
- [ ] Verify all operations work correctly
- [ ] Test error handling
- [ ] Test rate limiting

### Step 6: On-Call Operations (1.4)
- [ ] Implement Schedule operations
- [ ] Implement Schedule Entries
- [ ] Implement Schedule Overrides
- [ ] Implement Escalation operations
- [ ] Test on-call functionality

### Step 7: Catalog Operations (1.5)
- [ ] Implement Catalog Type operations
- [ ] Implement Catalog Entry operations
- [ ] Implement Catalog Resources
- [ ] Test catalog functionality

### Step 8: Actions & Follow-ups (1.6)
- [ ] Implement Actions operations
- [ ] Implement Follow-ups operations
- [ ] Test actions and follow-ups

### Step 9: Webhook Trigger (Phase 2)
- [ ] Create webhook trigger node
- [ ] Implement signature verification
- [ ] Set up event handling
- [ ] Test webhook delivery
- [ ] Document webhook setup process

### Step 10: Polish & Publish
- [ ] Add comprehensive documentation
- [ ] Add usage examples
- [ ] Test on Unraid server deployment
- [ ] Prepare for npm publication
- [ ] Create README with setup instructions

---

## Technical Notes

### API Conventions
- **Pagination**: Most list endpoints use `page_size` and `after` parameters
- **Idempotency**: Incident creation uses `idempotency_key` to prevent duplicates
- **Filtering**: Advanced filtering with operators:
  - `one_of` - matches any of the provided values
  - `not_in` - excludes provided values
  - `gte`/`lte` - greater/less than or equal
  - `date_range` - date range filtering
  - `is_blank` - check for empty values

### Error Handling
- Standard HTTP status codes
- JSON error responses with:
  - `type` - error type
  - `status` - HTTP status code
  - `request_id` - for support debugging
  - `errors[]` - array of detailed errors
- Common errors:
  - 401: Authentication error
  - 422: Validation error
  - 429: Rate limit exceeded

### Best Practices
- Always use latest API version endpoints
- Implement exponential backoff for rate limits
- Use idempotency keys for incident creation
- Fetch latest state after receiving webhooks
- Handle private incidents carefully (limited data in webhooks)

---

## Resources

### Documentation
- incident.io API Docs: https://api-docs.incident.io/
- incident.io Dashboard: https://app.incident.io/
- n8n Node Creation: https://docs.n8n.io/integrations/creating-nodes/
- Swagger Spec: `swagger (1).json` in project root

### Testing
- **Local Development**: Use n8n in development mode
- **Production Testing**: Unraid server deployment
- **API Keys**: Create test API keys with limited permissions

### Publishing
- **npm Package**: Prepare for npm publication
- **n8n Community**: Consider submitting to n8n community nodes
- **Documentation**: Include setup guide and examples

---

## Success Criteria

### Phase 1 Complete When:
- ✅ All incident operations working
- ✅ Supporting resources (severities, statuses, types) working
- ✅ On-call/schedule operations working
- ✅ Catalog operations working
- ✅ Actions and follow-ups working
- ✅ Node tested locally with n8n
- ✅ Node deployed to Unraid server
- ✅ Documentation complete

### Phase 2 Complete When:
- ✅ Webhook trigger node implemented
- ✅ Signature verification working
- ✅ Event handling tested
- ✅ Webhook setup documented

### Project Complete When:
- ✅ Both phases complete
- ✅ Comprehensive testing done
- ✅ Ready for npm publication
- ✅ Can be easily shared with others
- ✅ Documentation and examples provided

---

## Notes

- Start simple: Focus on core incident operations first
- Iterate: Add more operations as needed
- Test frequently: Verify each operation before moving forward
- Keep it clean: Use declarative style for maintainability
- Think shareable: Structure code for easy npm publication
- Private testing: Ensure easy testing without affecting production data
