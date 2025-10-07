# n8n-nodes-incidentio

This is an n8n community node that lets you use [incident.io](https://incident.io) in your n8n workflows.

incident.io is an incident management platform that helps teams respond to and learn from incidents. This node provides access to the incident.io API, allowing you to automate incident management, on-call scheduling, and catalog operations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Local Development & Testing

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the node:
   ```bash
   npm run build
   ```
4. Link the node to your local n8n installation:
   ```bash
   npm link
   cd ~/.n8n/nodes
   npm link n8n-nodes-incidentio
   ```
5. Restart n8n

### Install in n8n

For production use:

```bash
npm install n8n-nodes-incidentio
```

Or install via the n8n UI:
1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-incidentio` and click **Install**

## Credentials

To use this node, you need an incident.io API key:

1. Go to your [incident.io dashboard](https://app.incident.io/settings/api-keys)
2. Navigate to **Settings** > **API Keys**
3. Click **Create API Key**
4. Choose appropriate permissions for the key
5. Copy the API key (you'll only see it once!)
6. In n8n, add new credentials for "incident.io API"
7. Paste your API key

## Operations

This node supports the following resources and operations:

### Incident
- **List**: Get a list of all incidents with filtering options
- **Get**: Get a single incident by ID
- **Create**: Create a new incident
- **Update**: Update an existing incident

### Severity
- **List**: List all severity levels
- **Get**: Get a single severity by ID

### Status
- **List**: List all incident statuses
- **Get**: Get a single status by ID

### Type
- **List**: List all incident types
- **Get**: Get a single type by ID

### Custom Field
- **List**: List all custom fields
- **Get**: Get a single custom field by ID

### Schedule
- **List**: List all on-call schedules
- **Get**: Get a single schedule by ID

### Schedule Entry
- **List**: Get schedule entries (who's on-call and when)

### Escalation
- **List**: List all escalations
- **Get**: Get a single escalation by ID

### Catalog Type
- **List**: List all catalog types
- **Get**: Get a single catalog type by ID

### Catalog Entry
- **List**: List entries for a catalog type
- **Get**: Get a single catalog entry by ID

### Action
- **List**: List all incident actions
- **Get**: Get a single action by ID

### Follow-Up
- **List**: List all follow-ups
- **Get**: Get a single follow-up by ID

## Example Workflows

### List Recent Incidents
1. Add incident.io node
2. Select **Incident** resource
3. Select **List** operation
4. Configure filters (optional)

### Create an Incident
1. Add incident.io node
2. Select **Incident** resource
3. Select **Create** operation
4. Fill required fields:
   - **Idempotency Key**: Unique identifier (e.g., use `{{$json.id}}` from previous node)
   - **Visibility**: Public or Private
5. Add optional fields:
   - Name, Summary, Severity ID, Status ID, Type ID, Mode

### Get Who's On-Call
1. Add incident.io node to get schedules
2. Select **Schedule** resource
3. Select **List** operation
4. Add another incident.io node
5. Select **Schedule Entry** resource
6. Select **List** operation
7. Set **Schedule ID** from previous node

### Check Catalog Entries
1. Add incident.io node
2. Select **Catalog Type** resource
3. Select **List** operation to get available types
4. Add another incident.io node
5. Select **Catalog Entry** resource
6. Select **List** operation
7. Set **Catalog Type ID** from previous node

## Rate Limits

The incident.io API has the following rate limits:
- **Default**: 1200 requests/minute per API key
- **Some endpoints**: Lower limits for third-party integrations

When you exceed a rate limit, the API returns a `429 Too Many Requests` response. Implement exponential backoff in your workflows for best results.

## API Version

This node uses the following API versions:
- Incidents, Actions, Follow-ups, Schedules, Escalations: **v2**
- Severities, Statuses, Types: **v1**
- Catalog: **v3** (latest)

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [incident.io API documentation](https://api-docs.incident.io/)
* [incident.io dashboard](https://app.incident.io/)

## Development

### Project Structure

```
n8n-nodes-incidentio/
├── credentials/
│   └── IncidentIoApi.credentials.ts
├── nodes/
│   └── IncidentIo/
│       ├── IncidentIo.node.ts
│       └── incidentio.svg
├── package.json
├── tsconfig.json
└── README.md
```

### Build

```bash
npm run build
```

### Format

```bash
npm run format
```

### Lint

```bash
npm run lint
npm run lintfix  # Auto-fix issues
```

## Roadmap

### Phase 2: Webhook Trigger (Coming Soon)
- Receive webhook events from incident.io
- Support for incident.created, incident.updated, and other events
- HMAC signature verification for security

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)

## Support

For issues and questions:
- [Create an issue](https://github.com/yourusername/n8n-nodes-incidentio/issues) on GitHub
- [n8n community forum](https://community.n8n.io/)
- [incident.io support](mailto:support@incident.io) for API-specific questions
