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
					name: 'Custom Field Option',
					value: 'customFieldOption',
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
				{
					name: 'Alert',
					value: 'alert',
				},
				{
					name: 'Alert Attribute',
					value: 'alertAttribute',
				},
				{
					name: 'Alert Route',
					value: 'alertRoute',
				},
				{
					name: 'Alert Source',
					value: 'alertSource',
				},
			{
				name: 'Alert Event',
				value: 'alertEvent',
			},
			{
				name: 'User',
				value: 'user',
			},
			{
				name: 'Workflow',
				value: 'workflow',
			},
			{
				name: 'Incident Attachment',
				value: 'incidentAttachment',
			},
			{
				name: 'Incident Membership',
				value: 'incidentMembership',
			},
			{
				name: 'Incident Update',
				value: 'incidentUpdate',
			},
			{
				name: 'Incident Timestamp',
				value: 'incidentTimestamp',
			},
			{
				name: 'Incident Relationship',
				value: 'incidentRelationship',
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
				{
					displayName: 'Created At',
					name: 'created_at',
					type: 'string',
					default: '',
					placeholder: 'gte:2025-01-01T00:00:00Z or lte:2025-12-31T23:59:59Z',
					description: 'Filter by creation date. Format: operator:ISO8601_date. Operators: gte (>=), lte (<=), date_range (use &created_at[lte]=...)',
					routing: {
						send: {
							type: 'query',
							property: 'created_at',
						},
					},
				},
				{
					displayName: 'Updated At',
					name: 'updated_at',
					type: 'string',
					default: '',
					placeholder: 'gte:2025-01-01T00:00:00Z',
					description: 'Filter by update date. Format: operator:ISO8601_date. Operators: gte (>=), lte (<=)',
					routing: {
						send: {
							type: 'query',
							property: 'updated_at',
						},
					},
				},
				{
					displayName: 'Status',
					name: 'status',
					type: 'string',
					default: '',
					placeholder: 'one_of:status_id_1,status_id_2',
					description: 'Filter by incident status. Format: operator:value1,value2. Operators: one_of, not_in',
					routing: {
						send: {
							type: 'query',
							property: 'status',
						},
					},
				},
				{
					displayName: 'Status Category',
					name: 'status_category',
					type: 'string',
					default: '',
					placeholder: 'one_of:triage,active,closed',
					description: 'Filter by status category. Format: operator:value1,value2. Operators: one_of, not_in',
					routing: {
						send: {
							type: 'query',
							property: 'status_category',
						},
					},
				},
				{
					displayName: 'Severity',
					name: 'severity',
					type: 'string',
					default: '',
					placeholder: 'gte:severity_id or one_of:sev1,sev2',
					description: 'Filter by severity. Format: operator:value. Operators: one_of, not_in, gte (>=), lte (<=)',
					routing: {
						send: {
							type: 'query',
							property: 'severity',
						},
					},
				},
				{
					displayName: 'Incident Type',
					name: 'incident_type',
					type: 'string',
					default: '',
					placeholder: 'one_of:type_id_1,type_id_2',
					description: 'Filter by incident type. Format: operator:value1,value2. Operators: one_of, not_in',
					routing: {
						send: {
							type: 'query',
							property: 'incident_type',
						},
					},
				},
				{
					displayName: 'Incident Role',
					name: 'incident_role',
					type: 'string',
					default: '',
					placeholder: 'role_id[one_of]:user_id_1,user_id_2',
					description: 'Filter by incident role assignment. Format: role_id[operator]:values. Operators: one_of, is_blank',
					routing: {
						send: {
							type: 'query',
							property: 'incident_role',
						},
					},
				},
				{
					displayName: 'Custom Field',
					name: 'custom_field',
					type: 'string',
					default: '',
					placeholder: 'field_id[operator]:value',
					description: 'Filter by custom field. Format: field_id[operator]:value. Operators vary by field type',
					routing: {
						send: {
							type: 'query',
							property: 'custom_field',
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
				{
					name: 'Create',
					value: 'create',
					description: 'Create a severity',
					action: 'Create a severity',
					routing: {
						request: {
							method: 'POST',
							url: '/v1/severities',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update a severity',
					action: 'Update a severity',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v1/severities/{{$parameter.severityId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete a severity',
					action: 'Delete a severity',
					routing: {
						request: {
							method: 'DELETE',
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
					operation: ['get', 'update', 'delete'],
				},
			},
		default: '',
		description: 'The ID of the severity',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['severity'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Name of the severity',
			routing: {
				send: {
					type: 'body',
					property: 'name',
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
					resource: ['severity'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					displayName: 'Description',
					name: 'description',
					type: 'string',
					default: '',
					description: 'Description of the severity',
					routing: {
						send: {
							type: 'body',
							property: 'description',
						},
					},
				},
				{
					displayName: 'Rank',
					name: 'rank',
					type: 'number',
					default: 1,
					description: 'Rank of the severity (higher = more severe)',
					routing: {
						send: {
							type: 'body',
							property: 'rank',
						},
					},
				},
			],
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
					{
						name: 'Create',
						value: 'create',
						description: 'Create an incident status',
						action: 'Create a status',
						routing: {
							request: {
								method: 'POST',
								url: '/v1/incident_statuses',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an incident status',
						action: 'Update a status',
						routing: {
							request: {
								method: 'PUT',
								url: '=/v1/incident_statuses/{{$parameter.statusId}}',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an incident status',
						action: 'Delete a status',
						routing: {
							request: {
								method: 'DELETE',
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
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the status',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Name of the status',
				routing: {
					send: {
						type: 'body',
						property: 'name',
					},
				},
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'Triage',
						value: 'triage',
					},
					{
						name: 'Active',
						value: 'active',
					},
					{
						name: 'Post-Incident',
						value: 'post_incident',
					},
					{
						name: 'Closed',
						value: 'closed',
					},
					{
						name: 'Declined',
						value: 'declined',
					},
				],
				default: 'triage',
				description: 'Category of the status',
				routing: {
					send: {
						type: 'body',
						property: 'category',
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
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the status',
						routing: {
							send: {
								type: 'body',
								property: 'description',
							},
						},
					},
				],
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
				{
					name: 'Create',
					value: 'create',
					description: 'Create a custom field',
					action: 'Create a custom field',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/custom_fields',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update a custom field',
					action: 'Update a custom field',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v2/custom_fields/{{$parameter.customFieldId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete a custom field',
					action: 'Delete a custom field',
					routing: {
						request: {
							method: 'DELETE',
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
					operation: ['get', 'update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the custom field',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['customField'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Name of the custom field',
			routing: {
				send: {
					type: 'body',
					property: 'name',
				},
			},
		},
		{
			displayName: 'Field Type',
			name: 'field_type',
			type: 'options',
			required: true,
			displayOptions: {
				show: {
					resource: ['customField'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					name: 'Single Line Text',
					value: 'single_line_text',
				},
				{
					name: 'Multi Line Text',
					value: 'multi_line_text',
				},
				{
					name: 'Single Select',
					value: 'single_select',
				},
				{
					name: 'Multi Select',
					value: 'multi_select',
				},
				{
					name: 'Link',
					value: 'link',
				},
				{
					name: 'Numeric',
					value: 'numeric',
				},
			],
			default: 'single_line_text',
			description: 'Type of the custom field',
			routing: {
				send: {
					type: 'body',
					property: 'field_type',
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
					resource: ['customField'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					displayName: 'Description',
					name: 'description',
					type: 'string',
					default: '',
					description: 'Description of the custom field',
					routing: {
						send: {
							type: 'body',
							property: 'description',
						},
					},
				},
				{
					displayName: 'Required',
					name: 'required',
					type: 'options',
					options: [
						{
							name: 'Never',
							value: 'never',
						},
						{
							name: 'Always',
							value: 'always',
						},
						{
							name: 'Before Closure',
							value: 'before_closure',
						},
					],
					default: 'never',
					description: 'Whether this field is required',
					routing: {
						send: {
							type: 'body',
							property: 'required',
						},
					},
				},
			],
		},

		// ==========================================
		//            Custom Field Option Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['customFieldOption'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all custom field options',
					action: 'List custom field options',
					routing: {
						request: {
							method: 'GET',
							url: '/v1/custom_field_options',
						},
					},
				},
				{
					name: 'Create',
					value: 'create',
					description: 'Create a custom field option',
					action: 'Create a custom field option',
					routing: {
						request: {
							method: 'POST',
							url: '/v1/custom_field_options',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update a custom field option',
					action: 'Update a custom field option',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v1/custom_field_options/{{$parameter.customFieldOptionId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete a custom field option',
					action: 'Delete a custom field option',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v1/custom_field_options/{{$parameter.customFieldOptionId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Custom Field Option ID',
			name: 'customFieldOptionId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['customFieldOption'],
					operation: ['update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the custom field option',
		},
		{
			displayName: 'Custom Field ID',
			name: 'custom_field_id',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['customFieldOption'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'The ID of the custom field this option belongs to',
			routing: {
				send: {
					type: 'body',
					property: 'custom_field_id',
				},
			},
		},
		{
			displayName: 'Value',
			name: 'value',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['customFieldOption'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Value of the option',
			routing: {
				send: {
					type: 'body',
					property: 'value',
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
					resource: ['customFieldOption'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					displayName: 'Sort Key',
					name: 'sort_key',
					type: 'number',
					default: 0,
					description: 'Sort order for the option',
					routing: {
						send: {
							type: 'body',
							property: 'sort_key',
						},
					},
				},
			],
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
				{
					name: 'Create',
					value: 'create',
					description: 'Create a schedule',
					action: 'Create a schedule',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/schedules',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update a schedule',
					action: 'Update a schedule',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v2/schedules/{{$parameter.scheduleId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete a schedule',
					action: 'Delete a schedule',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v2/schedules/{{$parameter.scheduleId}}',
						},
					},
				},
				{
					name: 'Create Override',
					value: 'createOverride',
					description: 'Create a schedule override',
					action: 'Create a schedule override',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/schedule_overrides',
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
					operation: ['get', 'update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the schedule',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Name of the schedule',
			routing: {
				send: {
					type: 'body',
					property: 'name',
				},
			},
		},
		{
			displayName: 'Timezone',
			name: 'timezone',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['create', 'update'],
				},
			},
			default: 'UTC',
			placeholder: 'Europe/London',
			description: 'Timezone for the schedule (e.g., Europe/London, America/New_York)',
			routing: {
				send: {
					type: 'body',
					property: 'timezone',
				},
			},
		},
		{
			displayName: 'Config',
			name: 'config',
			type: 'json',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['create', 'update'],
				},
			},
			default: '{"layers": []}',
			description: 'Schedule configuration (JSON format with layers)',
			routing: {
				send: {
					type: 'body',
					property: 'config',
				},
			},
		},
		{
			displayName: 'Override Schedule ID',
			name: 'override_schedule_id',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['createOverride'],
				},
			},
			default: '',
			description: 'The ID of the schedule to override',
			routing: {
				send: {
					type: 'body',
					property: 'schedule_id',
				},
			},
		},
		{
			displayName: 'Start At',
			name: 'start_at',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['createOverride'],
				},
			},
			default: '',
			placeholder: '2025-01-01T00:00:00Z',
			description: 'Start time for the override (ISO 8601 format)',
			routing: {
				send: {
					type: 'body',
					property: 'start_at',
				},
			},
		},
		{
			displayName: 'End At',
			name: 'end_at',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['createOverride'],
				},
			},
			default: '',
			placeholder: '2025-01-02T00:00:00Z',
			description: 'End time for the override (ISO 8601 format)',
			routing: {
				send: {
					type: 'body',
					property: 'end_at',
				},
			},
		},
		{
			displayName: 'User ID',
			name: 'user_id',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['schedule'],
					operation: ['createOverride'],
				},
			},
			default: '',
			description: 'User ID for the override',
			routing: {
				send: {
					type: 'body',
					property: 'user_id',
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
						resource: ['schedule'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Page Size',
						name: 'page_size',
						type: 'number',
						default: 250,
						description: 'Number of schedules to return per page',
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
						description: 'Schedule ID to start pagination from',
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
						displayName: 'From (Start Time)',
						name: 'from',
						type: 'string',
						default: '',
						description: 'Start of time window (ISO 8601 format)',
						routing: {
							send: {
								type: 'query',
								property: 'entry_window_start',
							},
						},
					},
					{
						displayName: 'To (End Time)',
						name: 'to',
						type: 'string',
						default: '',
						description: 'End of time window (ISO 8601 format)',
						routing: {
							send: {
								type: 'query',
								property: 'entry_window_end',
							},
						},
					},
					{
						displayName: 'Page Size',
						name: 'page_size',
						type: 'number',
						default: 250,
						description: 'Number of entries to return per page',
						routing: {
							send: {
								type: 'query',
								property: 'page_size',
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

		// List Actions - Filters
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: {
				show: {
					resource: ['action'],
					operation: ['list'],
				},
			},
			options: [
				{
					displayName: 'Incident ID',
					name: 'incident_id',
					type: 'string',
					default: '',
					description: 'Find actions related to this incident',
					routing: {
						send: {
							type: 'query',
							property: 'incident_id',
						},
					},
				},
				{
					displayName: 'Incident Mode',
					name: 'incident_mode',
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
					default: '',
					description: 'Filter to actions from incidents of the given mode',
					routing: {
						send: {
							type: 'query',
							property: 'incident_mode',
						},
					},
				},
			],
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

		// List Follow-Ups - Filters
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: {
				show: {
					resource: ['followUp'],
					operation: ['list'],
				},
			},
			options: [
				{
					displayName: 'Incident ID',
					name: 'incident_id',
					type: 'string',
					default: '',
					description: 'Find follow-ups related to this incident',
					routing: {
						send: {
							type: 'query',
							property: 'incident_id',
						},
					},
				},
				{
					displayName: 'Incident Mode',
					name: 'incident_mode',
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
					default: '',
					description: 'Filter to follow-ups from incidents of the given mode',
					routing: {
						send: {
							type: 'query',
							property: 'incident_mode',
						},
					},
				},
			],
		},

		// ==========================================
		//            Alert Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['alert'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all alerts',
					action: 'List alerts',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/alerts',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single alert',
					action: 'Get an alert',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/alerts/{{$parameter.alertId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Alert ID',
			name: 'alertId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alert'],
					operation: ['get'],
				},
			},
			default: '',
			description: 'The ID of the alert',
		},

		// List Alerts - Filters
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: {
				show: {
					resource: ['alert'],
					operation: ['list'],
				},
			},
			options: [
				{
					displayName: 'Page Size',
					name: 'page_size',
					type: 'number',
					default: 25,
					description: 'Number of alerts to return per page',
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
					description: 'Pagination cursor',
					routing: {
						send: {
							type: 'query',
							property: 'after',
						},
					},
				},
				{
					displayName: 'Deduplication Key',
					name: 'deduplication_key',
					type: 'string',
					default: '',
					placeholder: 'is:unique_key_123',
					description: 'Filter by deduplication key. Format: is:value',
					routing: {
						send: {
							type: 'query',
							property: 'deduplication_key',
						},
					},
				},
				{
					displayName: 'Status',
					name: 'status',
					type: 'string',
					default: '',
					placeholder: 'one_of:firing,resolved',
					description: 'Filter by alert status. Format: operator:value1,value2. Operators: one_of, not_in',
					routing: {
						send: {
							type: 'query',
							property: 'status',
						},
					},
				},
				{
					displayName: 'Created At',
					name: 'created_at',
					type: 'string',
					default: '',
					placeholder: 'gte:2025-01-01T00:00:00Z',
					description: 'Filter by creation date. Format: operator:ISO8601_date. Operators: gte (>=), lte (<=), date_range',
					routing: {
						send: {
							type: 'query',
							property: 'created_at',
						},
					},
				},
			],
		},

		// ==========================================
		//            Alert Attribute Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['alertAttribute'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all alert attributes',
					action: 'List alert attributes',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/alert_attributes',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single alert attribute',
					action: 'Get an alert attribute',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/alert_attributes/{{$parameter.alertAttributeId}}',
						},
					},
				},
				{
					name: 'Create',
					value: 'create',
					description: 'Create an alert attribute',
					action: 'Create an alert attribute',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/alert_attributes',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update an alert attribute',
					action: 'Update an alert attribute',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v2/alert_attributes/{{$parameter.alertAttributeId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete an alert attribute',
					action: 'Delete an alert attribute',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v2/alert_attributes/{{$parameter.alertAttributeId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Alert Attribute ID',
			name: 'alertAttributeId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertAttribute'],
					operation: ['get', 'update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the alert attribute',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertAttribute'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Unique name of this attribute',
			routing: {
				send: {
					type: 'body',
					property: 'name',
				},
			},
		},
		{
			displayName: 'Type',
			name: 'type',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertAttribute'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			placeholder: 'CatalogEntry["01GW2G3V0S59R238FAHPDS1R67"]',
			description: 'Engine resource name for this attribute',
			routing: {
				send: {
					type: 'body',
					property: 'type',
				},
			},
		},
		{
			displayName: 'Array',
			name: 'array',
			type: 'boolean',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertAttribute'],
					operation: ['create', 'update'],
				},
			},
			default: false,
			description: 'Whether this attribute is an array',
			routing: {
				send: {
					type: 'body',
					property: 'array',
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
					resource: ['alertAttribute'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					displayName: 'Required',
					name: 'required',
					type: 'boolean',
					default: false,
					description: 'Whether this attribute is required',
					routing: {
						send: {
							type: 'body',
							property: 'required',
						},
					},
				},
			],
		},

		// ==========================================
		//            Alert Route Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['alertRoute'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all alert routes',
					action: 'List alert routes',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/alert_routes',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single alert route',
					action: 'Get an alert route',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/alert_routes/{{$parameter.alertRouteId}}',
						},
					},
				},
				{
					name: 'Create',
					value: 'create',
					description: 'Create an alert route',
					action: 'Create an alert route',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/alert_routes',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update an alert route',
					action: 'Update an alert route',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v2/alert_routes/{{$parameter.alertRouteId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete an alert route',
					action: 'Delete an alert route',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v2/alert_routes/{{$parameter.alertRouteId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Alert Route ID',
			name: 'alertRouteId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertRoute'],
					operation: ['get', 'update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the alert route',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertRoute'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Name of the alert route',
			routing: {
				send: {
					type: 'body',
					property: 'name',
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
					resource: ['alertRoute'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					displayName: 'Enabled',
					name: 'enabled',
					type: 'boolean',
					default: true,
					description: 'Whether this route is enabled',
					routing: {
						send: {
							type: 'body',
							property: 'enabled',
						},
					},
				},
			],
		},

		// ==========================================
		//            Alert Source Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['alertSource'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all alert sources',
					action: 'List alert sources',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/alert_sources',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single alert source',
					action: 'Get an alert source',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/alert_sources/{{$parameter.alertSourceId}}',
						},
					},
				},
				{
					name: 'Create',
					value: 'create',
					description: 'Create an alert source',
					action: 'Create an alert source',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/alert_sources',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update an alert source',
					action: 'Update an alert source',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v2/alert_sources/{{$parameter.alertSourceId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete an alert source',
					action: 'Delete an alert source',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v2/alert_sources/{{$parameter.alertSourceId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Alert Source ID',
			name: 'alertSourceId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertSource'],
					operation: ['get', 'update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the alert source',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertSource'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Name of the alert source',
			routing: {
				send: {
					type: 'body',
					property: 'name',
				},
			},
		},
		{
			displayName: 'Config',
			name: 'config',
			type: 'json',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertSource'],
					operation: ['create', 'update'],
				},
			},
			default: '{}',
			description: 'Configuration for the alert source (JSON format)',
			routing: {
				send: {
					type: 'body',
					property: 'config',
				},
			},
		},

		// ==========================================
		//            Alert Event Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['alertEvent'],
				},
			},
			options: [
				{
					name: 'Create HTTP',
					value: 'createHTTP',
					description: 'Create an alert event via HTTP',
					action: 'Create an alert event',
					routing: {
						request: {
							method: 'POST',
							url: '=/v2/alert_events/http/{{$parameter.alertSourceConfigId}}',
						},
					},
				},
			],
			default: 'createHTTP',
		},
		{
			displayName: 'Alert Source Config ID',
			name: 'alertSourceConfigId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertEvent'],
					operation: ['createHTTP'],
				},
			},
			default: '',
			description: 'The ID of the alert source config',
		},
		{
			displayName: 'Title',
			name: 'title',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertEvent'],
					operation: ['createHTTP'],
				},
			},
			default: '',
			description: 'The title of the alert',
			routing: {
				send: {
					type: 'body',
					property: 'title',
				},
			},
		},
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			required: true,
			displayOptions: {
				show: {
					resource: ['alertEvent'],
					operation: ['createHTTP'],
				},
			},
			options: [
				{
					name: 'Firing',
					value: 'firing',
				},
				{
					name: 'Resolved',
					value: 'resolved',
				},
			],
			default: 'firing',
			description: 'Current status of this alert',
			routing: {
				send: {
					type: 'body',
					property: 'status',
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
					resource: ['alertEvent'],
					operation: ['createHTTP'],
				},
			},
			options: [
				{
					displayName: 'Deduplication Key',
					name: 'deduplication_key',
					type: 'string',
					default: '',
					description: 'A key that uniquely references this alert',
					routing: {
						send: {
							type: 'body',
							property: 'deduplication_key',
						},
					},
				},
				{
					displayName: 'Description',
					name: 'description',
					type: 'string',
					typeOptions: {
						rows: 4,
					},
					default: '',
					description: 'Description that adds more detail to the title (supports markdown)',
					routing: {
						send: {
							type: 'body',
							property: 'description',
						},
					},
				},
				{
					displayName: 'Source URL',
					name: 'source_url',
					type: 'string',
					default: '',
					description: 'Link to the alert in the upstream system',
					routing: {
						send: {
							type: 'body',
							property: 'source_url',
						},
					},
				},
				{
					displayName: 'Metadata',
					name: 'metadata',
					type: 'json',
					default: '{}',
					description: 'Additional metadata (JSON format)',
					routing: {
						send: {
							type: 'body',
							property: 'metadata',
						},
					},
				},
			],
		},

		// ==========================================
		//            User Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['user'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all users',
					action: 'List users',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/users',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single user',
					action: 'Get a user',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/users/{{$parameter.userId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'User ID',
			name: 'userId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['user'],
					operation: ['get'],
				},
			},
			default: '',
			description: 'The ID of the user',
		},

		// List Users - Filters
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: {
				show: {
					resource: ['user'],
					operation: ['list'],
				},
			},
			options: [
				{
					displayName: 'Email',
					name: 'email',
					type: 'string',
					default: '',
					description: 'Filter by email address',
					routing: {
						send: {
							type: 'query',
							property: 'email',
						},
					},
				},
				{
					displayName: 'Slack User ID',
					name: 'slack_user_id',
					type: 'string',
					default: '',
					description: 'Filter by Slack user ID',
					routing: {
						send: {
							type: 'query',
							property: 'slack_user_id',
						},
					},
				},
				{
					displayName: 'Page Size',
					name: 'page_size',
					type: 'number',
					default: 25,
					description: 'Number of users to return per page',
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
					description: 'Pagination cursor',
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
		//            Workflow Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['workflow'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all workflows',
					action: 'List workflows',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/workflows',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single workflow',
					action: 'Get a workflow',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/workflows/{{$parameter.workflowId}}',
						},
					},
				},
				{
					name: 'Create',
					value: 'create',
					description: 'Create a workflow',
					action: 'Create a workflow',
					routing: {
						request: {
							method: 'POST',
							url: '/v2/workflows',
						},
					},
				},
				{
					name: 'Update',
					value: 'update',
					description: 'Update a workflow',
					action: 'Update a workflow',
					routing: {
						request: {
							method: 'PUT',
							url: '=/v2/workflows/{{$parameter.workflowId}}',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete a workflow',
					action: 'Delete a workflow',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v2/workflows/{{$parameter.workflowId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Workflow ID',
			name: 'workflowId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['workflow'],
					operation: ['get', 'update', 'delete'],
				},
			},
			default: '',
			description: 'The ID of the workflow',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['workflow'],
					operation: ['create', 'update'],
				},
			},
			default: '',
			description: 'Name of the workflow',
			routing: {
				send: {
					type: 'body',
					property: 'name',
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
					resource: ['workflow'],
					operation: ['create', 'update'],
				},
			},
			options: [
				{
					displayName: 'Description',
					name: 'description',
					type: 'string',
					default: '',
					description: 'Description of the workflow',
					routing: {
						send: {
							type: 'body',
							property: 'description',
						},
					},
				},
				{
					displayName: 'Enabled',
					name: 'enabled',
					type: 'boolean',
					default: true,
					description: 'Whether the workflow is enabled',
					routing: {
						send: {
							type: 'body',
							property: 'enabled',
						},
					},
				},
			],
		},

		// ==========================================
		//            Incident Attachment Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['incidentAttachment'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List all incident attachments',
					action: 'List incident attachments',
					routing: {
						request: {
							method: 'GET',
							url: '/v1/incident_attachments',
						},
					},
				},
				{
					name: 'Create',
					value: 'create',
					description: 'Create an incident attachment',
					action: 'Create an incident attachment',
					routing: {
						request: {
							method: 'POST',
							url: '/v1/incident_attachments',
						},
					},
				},
				{
					name: 'Delete',
					value: 'delete',
					description: 'Delete an incident attachment',
					action: 'Delete an incident attachment',
					routing: {
						request: {
							method: 'DELETE',
							url: '=/v1/incident_attachments/{{$parameter.attachmentId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Attachment ID',
			name: 'attachmentId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['incidentAttachment'],
					operation: ['delete'],
				},
			},
			default: '',
			description: 'The ID of the attachment',
		},
		{
			displayName: 'Incident ID',
			name: 'incident_id',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['incidentAttachment'],
					operation: ['create'],
				},
			},
			default: '',
			description: 'The ID of the incident',
			routing: {
				send: {
					type: 'body',
					property: 'incident_id',
				},
			},
		},
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'json',
			required: true,
			displayOptions: {
				show: {
					resource: ['incidentAttachment'],
					operation: ['create'],
				},
			},
			default: '{"resource_type": "pagerduty_incident", "external_id": "abc123"}',
			description: 'Resource information (JSON format)',
			routing: {
				send: {
					type: 'body',
					property: 'resource',
				},
			},
		},

		// ==========================================
		//            Incident Membership Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['incidentMembership'],
				},
			},
			options: [
				{
					name: 'Create',
					value: 'create',
					description: 'Grant incident membership',
					action: 'Grant incident membership',
					routing: {
						request: {
							method: 'POST',
							url: '/v1/incident_memberships',
						},
					},
				},
				{
					name: 'Revoke',
					value: 'revoke',
					description: 'Revoke incident membership',
					action: 'Revoke incident membership',
					routing: {
						request: {
							method: 'POST',
							url: '/v1/incident_memberships/actions/revoke',
						},
					},
				},
			],
			default: 'create',
		},
		{
			displayName: 'Incident ID',
			name: 'incident_id',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['incidentMembership'],
					operation: ['create', 'revoke'],
				},
			},
			default: '',
			description: 'The ID of the incident',
			routing: {
				send: {
					type: 'body',
					property: 'incident_id',
				},
			},
		},
		{
			displayName: 'User ID',
			name: 'user_id',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['incidentMembership'],
					operation: ['create', 'revoke'],
				},
			},
			default: '',
			description: 'The ID of the user',
			routing: {
				send: {
					type: 'body',
					property: 'user_id',
				},
			},
		},

		// ==========================================
		//            Incident Update Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['incidentUpdate'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List incident updates',
					action: 'List incident updates',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/incident_updates',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: {
				show: {
					resource: ['incidentUpdate'],
					operation: ['list'],
				},
			},
			options: [
				{
					displayName: 'Incident ID',
					name: 'incident_id',
					type: 'string',
					default: '',
					description: 'Filter by incident ID',
					routing: {
						send: {
							type: 'query',
							property: 'incident_id',
						},
					},
				},
				{
					displayName: 'Page Size',
					name: 'page_size',
					type: 'number',
					default: 25,
					description: 'Number of updates to return per page',
					routing: {
						send: {
							type: 'query',
							property: 'page_size',
						},
					},
				},
			],
		},

		// ==========================================
		//            Incident Timestamp Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['incidentTimestamp'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List incident timestamps',
					action: 'List incident timestamps',
					routing: {
						request: {
							method: 'GET',
							url: '/v2/incident_timestamps',
						},
					},
				},
				{
					name: 'Get',
					value: 'get',
					description: 'Get a single incident timestamp',
					action: 'Get an incident timestamp',
					routing: {
						request: {
							method: 'GET',
							url: '=/v2/incident_timestamps/{{$parameter.timestampId}}',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Timestamp ID',
			name: 'timestampId',
			type: 'string',
			required: true,
			displayOptions: {
				show: {
					resource: ['incidentTimestamp'],
					operation: ['get'],
				},
			},
			default: '',
			description: 'The ID of the timestamp',
		},

		// ==========================================
		//            Incident Relationship Operations
		// ==========================================
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['incidentRelationship'],
				},
			},
			options: [
				{
					name: 'List',
					value: 'list',
					description: 'List incident relationships',
					action: 'List incident relationships',
					routing: {
						request: {
							method: 'GET',
							url: '/v1/incident_relationships',
						},
					},
				},
			],
			default: 'list',
		},
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: {
				show: {
					resource: ['incidentRelationship'],
					operation: ['list'],
				},
			},
			options: [
				{
					displayName: 'Incident ID',
					name: 'incident_id',
					type: 'string',
					default: '',
					description: 'Filter by incident ID',
					routing: {
						send: {
							type: 'query',
							property: 'incident_id',
						},
					},
				},
			],
		},
	],
};
}
