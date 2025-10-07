import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class IncidentIoApi implements ICredentialType {
	name = 'incidentIoApi';
	displayName = 'incident.io API';
	documentationUrl = 'https://api-docs.incident.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API key for incident.io. Create one at https://app.incident.io/settings/api-keys',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.incident.io',
			url: '/v1/severities',
			method: 'GET',
		},
	};
}
