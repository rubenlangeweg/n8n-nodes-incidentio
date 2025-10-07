import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class IncidentIo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'incident.io',
		name: 'incidentIo',
		icon: 'file:incidentio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with incident.io API',
		defaults: {
			name: 'incident.io',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'incidentIoApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.incident.io',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Incident',
						value: 'incident',
					},
					{
						name: 'Severity',
						value: 'severity',
					},
					{
						name: 'Status',
						value: 'status',
					},
					{
						name: 'Type',
						value: 'type',
					},
					{
						name: 'Custom Field',
						value: 'customField',
					},
					{
						name: 'Schedule',
						value: 'schedule',
					},
					{
						name: 'Schedule Entry',
						value: 'scheduleEntry',
					},
					{
						name: 'Escalation',
						value: 'escalation',
					},
					{
						name: 'Catalog Type',
						value: 'catalogType',
					},
					{
						name: 'Catalog Entry',
						value: 'catalogEntry',
					},
					{
						name: 'Action',
						value: 'action',
					},
					{
						name: 'Follow-Up',
						value: 'followUp',
					},
				],
				default: 'incident',
			},

			// ==========================================
			//            Incident Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['incident'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all incidents',
						action: 'List incidents',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/incidents',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single incident',
						action: 'Get an incident',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/incidents/{{$parameter.incidentId}}',
							},
						},
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new incident',
						action: 'Create an incident',
						routing: {
							request: {
								method: 'POST',
								url: '/v2/incidents',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing incident',
						action: 'Update an incident',
						routing: {
							request: {
								method: 'POST',
								url: '=/v2/incidents/{{$parameter.incidentId}}/actions/edit',
							},
						},
					},
				],
				default: 'list',
			},

			// Get Incident - Incident ID
			{
				displayName: 'Incident ID',
				name: 'incidentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['incident'],
						operation: ['get', 'update'],
					},
				},
				default: '',
				description: 'The ID of the incident',
			},

			// Create Incident Fields
			{
				displayName: 'Idempotency Key',
				name: 'idempotency_key',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['incident'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Unique key for idempotency (prevents duplicate incident creation)',
				routing: {
					send: {
						type: 'body',
						property: 'idempotency_key',
					},
				},
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['incident'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Public',
						value: 'public',
					},
					{
						name: 'Private',
						value: 'private',
					},
				],
				default: 'public',
				description: 'Whether the incident is public or private',
				routing: {
					send: {
						type: 'body',
						property: 'visibility',
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['incident'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Explanation of the incident',
						routing: {
							send: {
								type: 'body',
								property: 'name',
							},
						},
					},
					{
						displayName: 'Summary',
						name: 'summary',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Detailed description of the incident',
						routing: {
							send: {
								type: 'body',
								property: 'summary',
							},
						},
					},
					{
						displayName: 'Severity ID',
						name: 'severity_id',
						type: 'string',
						default: '',
						description: 'Severity level of the incident',
						routing: {
							send: {
								type: 'body',
								property: 'severity_id',
							},
						},
					},
					{
						displayName: 'Status ID',
						name: 'incident_status_id',
						type: 'string',
						default: '',
						description: 'Status of the incident',
						routing: {
							send: {
								type: 'body',
								property: 'incident_status_id',
							},
						},
					},
					{
						displayName: 'Type ID',
						name: 'incident_type_id',
						type: 'string',
						default: '',
						description: 'Type of the incident',
						routing: {
							send: {
								type: 'body',
								property: 'incident_type_id',
							},
						},
					},
					{
						displayName: 'Mode',
						name: 'mode',
						type: 'options',
						options: [
							{
								name: 'Standard',
								value: 'standard',
							},
							{
								name: 'Retrospective',
								value: 'retrospective',
							},
							{
								name: 'Test',
								value: 'test',
							},
							{
								name: 'Tutorial',
								value: 'tutorial',
							},
						],
						default: 'standard',
						description: 'Mode of the incident',
						routing: {
							send: {
								type: 'body',
								property: 'mode',
							},
						},
					},
				],
			},

			// List Incidents - Filters
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['incident'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Page Size',
						name: 'page_size',
						type: 'number',
						default: 25,
						description: 'Number of incidents to return (max 500)',
						routing: {
							send: {
								type: 'query',
								property: 'page_size',
							},
						},
					},
					{
						displayName: 'After',
						name: 'after',
						type: 'string',
						default: '',
						description: 'Incident ID to start pagination from',
						routing: {
							send: {
								type: 'query',
								property: 'after',
							},
						},
					},
				],
			},

			// ==========================================
			//            Severity Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['severity'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all severities',
						action: 'List severities',
						routing: {
							request: {
								method: 'GET',
								url: '/v1/severities',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single severity',
						action: 'Get a severity',
						routing: {
							request: {
								method: 'GET',
								url: '=/v1/severities/{{$parameter.severityId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Severity ID',
				name: 'severityId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['severity'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the severity',
			},

			// ==========================================
			//            Status Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['status'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all incident statuses',
						action: 'List statuses',
						routing: {
							request: {
								method: 'GET',
								url: '/v1/incident_statuses',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single status',
						action: 'Get a status',
						routing: {
							request: {
								method: 'GET',
								url: '=/v1/incident_statuses/{{$parameter.statusId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Status ID',
				name: 'statusId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the status',
			},

			// ==========================================
			//            Type Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['type'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all incident types',
						action: 'List types',
						routing: {
							request: {
								method: 'GET',
								url: '/v1/incident_types',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single type',
						action: 'Get a type',
						routing: {
							request: {
								method: 'GET',
								url: '=/v1/incident_types/{{$parameter.typeId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Type ID',
				name: 'typeId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['type'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the type',
			},

			// ==========================================
			//            Custom Field Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['customField'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all custom fields',
						action: 'List custom fields',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/custom_fields',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single custom field',
						action: 'Get a custom field',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/custom_fields/{{$parameter.customFieldId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Custom Field ID',
				name: 'customFieldId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['customField'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the custom field',
			},

			// ==========================================
			//            Schedule Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all schedules',
						action: 'List schedules',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/schedules',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single schedule',
						action: 'Get a schedule',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/schedules/{{$parameter.scheduleId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Schedule ID',
				name: 'scheduleId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the schedule',
			},

			// ==========================================
			//            Schedule Entry Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['scheduleEntry'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: "Get schedule entries (who's on-call)",
						action: 'List schedule entries',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/schedule_entries',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Schedule ID',
				name: 'schedule_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['scheduleEntry'],
						operation: ['list'],
					},
				},
				default: '',
				description: 'The ID of the schedule',
				routing: {
					send: {
						type: 'query',
						property: 'schedule_id',
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['scheduleEntry'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Entry Window Start',
						name: 'entry_window_start',
						type: 'dateTime',
						default: '',
						description: 'Start of time window',
						routing: {
							send: {
								type: 'query',
								property: 'entry_window_start',
							},
						},
					},
					{
						displayName: 'Entry Window End',
						name: 'entry_window_end',
						type: 'dateTime',
						default: '',
						description: 'End of time window',
						routing: {
							send: {
								type: 'query',
								property: 'entry_window_end',
							},
						},
					},
				],
			},

			// ==========================================
			//            Escalation Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['escalation'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all escalations',
						action: 'List escalations',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/escalations',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single escalation',
						action: 'Get an escalation',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/escalations/{{$parameter.escalationId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Escalation ID',
				name: 'escalationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['escalation'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the escalation',
			},

			// ==========================================
			//            Catalog Type Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['catalogType'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all catalog types',
						action: 'List catalog types',
						routing: {
							request: {
								method: 'GET',
								url: '/v3/catalog_types',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single catalog type',
						action: 'Get a catalog type',
						routing: {
							request: {
								method: 'GET',
								url: '=/v3/catalog_types/{{$parameter.catalogTypeId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Catalog Type ID',
				name: 'catalogTypeId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['catalogType'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the catalog type',
			},

			// ==========================================
			//            Catalog Entry Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['catalogEntry'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List catalog entries',
						action: 'List catalog entries',
						routing: {
							request: {
								method: 'GET',
								url: '/v3/catalog_entries',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single catalog entry',
						action: 'Get a catalog entry',
						routing: {
							request: {
								method: 'GET',
								url: '=/v3/catalog_entries/{{$parameter.catalogEntryId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Catalog Type ID',
				name: 'catalog_type_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['catalogEntry'],
						operation: ['list'],
					},
				},
				default: '',
				description: 'The ID of the catalog type',
				routing: {
					send: {
						type: 'query',
						property: 'catalog_type_id',
					},
				},
			},
			{
				displayName: 'Catalog Entry ID',
				name: 'catalogEntryId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['catalogEntry'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the catalog entry',
			},

			// ==========================================
			//            Action Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['action'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all actions',
						action: 'List actions',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/actions',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single action',
						action: 'Get an action',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/actions/{{$parameter.actionId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Action ID',
				name: 'actionId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['action'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the action',
			},

			// ==========================================
			//            Follow-Up Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['followUp'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all follow-ups',
						action: 'List follow-ups',
						routing: {
							request: {
								method: 'GET',
								url: '/v2/follow_ups',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single follow-up',
						action: 'Get a follow-up',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/follow_ups/{{$parameter.followUpId}}',
							},
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Follow-Up ID',
				name: 'followUpId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['followUp'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the follow-up',
			},
		],
	};
}
