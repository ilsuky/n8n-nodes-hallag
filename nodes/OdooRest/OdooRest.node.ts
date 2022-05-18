import { IExecuteFunctions } from 'n8n-core';
import { IDataObject,ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

import {
	odooRestApiRequest,
} from './GenericFunctions';

export class OdooRest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Odoo Rest',
		name: 'odooRest',
		icon: 'file:odoo.svg',
		group: ['transform'],
		version: 1,
		description: 'Odoo Rest Api Addon',
		defaults: {
			name: 'Odoo Rest',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'odooRest',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Partner',
						value: 'res.partner',
					},
					{
						name: 'User',
						value: 'res.users',
					},
					{
						name: 'LogNote',
						value: 'mail.message',
					},
				],
				default: 'res.partner',
				description: 'Object model to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search record(s)',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by Id',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record by Id',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record by Id',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new record',
					},
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a Function',
					},
					{
						name: 'Schema',
						value: 'schema',
						description: 'Retrieve the schema of the Resource',
					},
				],
				default: 'get',
				description: 'Operation to perform',
			},
			{
				displayName: 'Id',
				name: 'id',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'get',
							'update',
							'delete',
						],
					},
				},
				default: '',
				description: 'Id of the Resource',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'create',
							'update',
							'execute',
						],
					},
				},
				default: '',
				description: 'Request body',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'search',
						],
					},
				},
				default: '',
				description: 'Search Domain',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'search',
						],
					},
				},
				default: '',
				description: 'Fields to retrieve',
			},
			{
				displayName: 'Retrieve and Split Data Items',
				name: 'split',
				type: 'boolean',
				displayOptions: {
					show: {
						operation:[
							'get',
							'search',
							'schema',
						],
					},
				},
				default: true,
				description: 'Retrieve and Split Data array into seperate Items',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		
		const resource = this.getNodeParameter('resource', 0, '') as string;
		const operation = this.getNodeParameter('operation', 0, '') as string;
		let item: INodeExecutionData;

		// Itterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			try{
				//--------------------------------------------------------
				// 						Search
				//--------------------------------------------------------
				if(operation == 'search'){
					const domain = this.getNodeParameter('domain', itemIndex, '') as string;
					const fields = this.getNodeParameter('fields', itemIndex, '') as string;
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const endpoint = resource + '/search';
					
					const qs =
									{	
										domain: `${domain}`,
										fields: `${fields}`
									}
								;
					item = items[itemIndex];
					if(split){
						const data = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, qs)).data;
						for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, qs));
	
						returnItems.push(newItem);
					}
				}
				//--------------------------------------------------------
				// 						Get
				//--------------------------------------------------------
				if(operation == 'get'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const endpoint = resource + '/' + id;

					item = items[itemIndex];

					if(split){
						const data = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {})).data;
						for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {}));
	
						returnItems.push(newItem);
					}
				}
				//--------------------------------------------------------
				// 						Update
				//--------------------------------------------------------
				if(operation == 'update'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					const endpoint = resource + '/' + id;
					let jsonBody = {};
					if(body && body.length>0){
						jsonBody = JSON.parse(body);
					}

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Put', endpoint, jsonBody, {}));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Delete
				//--------------------------------------------------------
				if(operation == 'delete'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = resource + '/' + id;

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Delete', endpoint, {}, {}));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Create
				//--------------------------------------------------------
				if(operation == 'create'){
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					const endpoint = resource + '/create';
					let jsonBody = {};
					if(body && body.length>0){
						jsonBody = JSON.parse(body);
					}

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Post', endpoint, jsonBody, {}));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Execute
				//--------------------------------------------------------
				if(operation == 'execute'){
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					const endpoint = resource + '/execute_kw';
					let jsonBody = {};
					if(body && body.length>0){
						jsonBody = JSON.parse(body);
					}

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Post', endpoint, jsonBody, {}));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Schema
				//--------------------------------------------------------
				if(operation == 'schema'){
					const endpoint = resource + '/schema';
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;

					item = items[itemIndex];
					if(split){
						const data = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {})).data;
						for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {}));
	
						returnItems.push(newItem);
					}
				}
			} catch (error:any) {
				if (this.continueOnFail()) {
					returnItems.push({json:{ error: error.message}});
					continue;
				}
				throw error;
			}

		}

		return this.prepareOutputData(returnItems);
	}
}
