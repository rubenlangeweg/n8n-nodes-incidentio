import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeApiError,
	IHttpRequestMethods,
} from 'n8n-workflow';

import { createHmac } from 'crypto';

function computeSignature(body: string, timestamp: string, secret: string): string {
	const signaturePayload = `${timestamp}.${body}`;
	return createHmac('sha256', secret)
		.update(signaturePayload)
		.digest('hex');
}

export class IncidentIoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'incident.io Trigger',
		name: 'incidentIoTrigger',
		icon: 'file:incidentio.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Handle incident.io webhook events',
		defaults: {
			name: 'incident.io Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'incidentIoApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'incident.created',
				options: [
					{
						name: 'Incident Created',
						value: 'incident.created',
						description: 'Triggered when a new incident is created',
					},
					{
						name: 'Incident Updated',
						value: 'incident.updated',
						description: 'Triggered when an incident is updated',
					},
					{
						name: 'Incident Status Changed',
						value: 'incident.status_updated',
						description: 'Triggered when an incident status changes',
					},
					{
						name: 'Incident Severity Changed',
						value: 'incident.severity_updated',
						description: 'Triggered when an incident severity changes',
					},
					{
						name: 'All Events',
						value: '*',
						description: 'Triggered for any incident.io event',
					},
				],
				description: 'The event type to listen for',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Verify Signature',
						name: 'verifySignature',
						type: 'boolean',
						default: true,
						description: 'Whether to verify the webhook signature for security',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				const credentials = await this.getCredentials('incidentIoApi');
				const apiKey = credentials.apiKey as string;

				// Get all webhooks
				const options = {
					method: 'GET' as IHttpRequestMethods,
					url: 'https://api.incident.io/v2/webhooks',
					headers: {
						Authorization: `Bearer ${apiKey}`,
						Accept: 'application/json',
					},
					json: true,
				};

				try {
					const response: any = await this.helpers.request(options);
					const webhooks = response.webhooks || [];

					// Check if webhook exists
					for (const webhook of webhooks) {
						if (webhook.webhook_url === webhookUrl) {
							// Check if event matches
							if (event === '*' || webhook.event_type === event) {
								return true;
							}
						}
					}
					return false;
				} catch (error) {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				const credentials = await this.getCredentials('incidentIoApi');
				const apiKey = credentials.apiKey as string;

				const body: IDataObject = {
					webhook_url: webhookUrl,
					event_type: event === '*' ? 'incident.created' : event, // Default to created if all events
					name: `n8n Webhook - ${event}`,
					enabled: true,
				};

				const options = {
					method: 'POST' as IHttpRequestMethods,
					url: 'https://api.incident.io/v2/webhooks',
					headers: {
						Authorization: `Bearer ${apiKey}`,
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				};

				try {
					const response: any = await this.helpers.request(options);

					// Store webhook ID for deletion
					if (response.webhook?.id) {
						const webhookData = this.getWorkflowStaticData('node');
						webhookData.webhookId = response.webhook.id;
					}

					return true;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as any);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string;

				if (!webhookId) {
					return false;
				}

				const credentials = await this.getCredentials('incidentIoApi');
				const apiKey = credentials.apiKey as string;

				const options = {
					method: 'DELETE' as IHttpRequestMethods,
					url: `https://api.incident.io/v2/webhooks/${webhookId}`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
						Accept: 'application/json',
					},
				};

				try {
					await this.helpers.request(options);
					delete webhookData.webhookId;
					return true;
				} catch (error) {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = req.body as IDataObject;
		const headers = req.headers;

		const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
		const verifySignature = additionalFields.verifySignature !== false;

		// Verify webhook signature if enabled
		if (verifySignature) {
			const signature = headers['x-incident-signature'] as string;
			const timestamp = headers['x-incident-timestamp'] as string;

			if (!signature || !timestamp) {
				throw new NodeApiError(this.getNode(), {
					message: 'Missing webhook signature headers',
					description: 'The webhook request is missing required signature headers. This may indicate an invalid webhook request.',
				} as any);
			}

			// Get webhook secret from credentials
			const credentials = await this.getCredentials('incidentIoApi');
			const webhookSecret = credentials.webhookSecret as string;

			if (webhookSecret) {
				// Verify signature
				const rawBody = JSON.stringify(body);
				const expectedSignature = computeSignature(rawBody, timestamp, webhookSecret);

				if (signature !== expectedSignature) {
					throw new NodeApiError(this.getNode(), {
						message: 'Invalid webhook signature',
						description: 'The webhook signature does not match. This may indicate a security issue.',
					} as any);
				}
			}
		}

		// Filter by event type if not listening to all events
		const event = this.getNodeParameter('event') as string;
		const receivedEventType = body.event_type as string;

		if (event !== '*' && receivedEventType !== event) {
			// Event type doesn't match, ignore this webhook
			return {
				workflowData: [],
			};
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray(body),
			],
		};
	}
}
