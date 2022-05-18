import { json } from 'express';
import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeParameters, INodeType, INodeTypeDescription } from 'n8n-workflow';

import {
	easyProvisioningApiRequest, getJwtToken,
} from './GenericFunctions';
import { EasyProvisioningApiCredentials } from './types';

export class EasyProvisioning implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Easy Provisioning',
		name: 'easyProvisioning',
		icon: 'file:easy.svg',
		group: ['transform'],
		version: 1,
		description: 'Easy Provisioning Api',
		defaults: {
			name: 'Easy Provisioning',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'easyProvisioning',
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
						name: 'Customers',
						value: 'customers',
					},
				],
				default: 'customers',
				description: 'Resource to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'customers',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a record',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Retrieve a record',
					},
					{
						name: 'GetAll',
						value: 'getAll',
						description: 'Retrieve all records',
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
						],
					},
				},
				default: '',
				description: 'Id of Customer',
			},
			{
				displayName: 'Filter Attribute',
				name: 'filterAttribute',
				type: 'string',
				default: '',
				description: 'The attribute to filter on',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Filter Operation',
				name: 'filterOperation',
				type: 'string',
				default: '',
				description: 'The filter Operation',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Filter Value',
				name: 'filterValue',
				type: 'string',
				default: '',
				description: 'The value to filter',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Retrieve and Split Data Items',
				name: 'split',
				type: 'boolean',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
				default: true,
				description: 'Retrieve and Split Data array into seperate Items',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
				default: 10,
				description: 'Limit the items Retrieved',
			},
			{
				displayName: 'Values to Set',
				name: 'values',
				placeholder: 'Add Value',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				description: 'The value to set.',
				default: {},
				options: [
					{
						name: 'attributes',
						displayName: 'Attributes',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of value to set',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to set.',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation:[
							'create',
						],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		
		const resource = this.getNodeParameter('resource', 0, '') as string;
		const operation = this.getNodeParameter('operation', 0, '') as string;
		let item: INodeExecutionData;

		const credentials = await this.getCredentials('easyProvisioning') as EasyProvisioningApiCredentials;
		const token = await getJwtToken.call(this,credentials);
		// Itterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			try{
				//--------------------------------------------------------
				// 						Get
				//--------------------------------------------------------
				if(operation == 'get'){
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					
					const endpoint = `${resource}/${id}`;
					
					item = items[itemIndex];

					const data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, {},token);
					const datajson = data.data;
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = datajson;

					returnItems.push(newItem);
						
				}

				//--------------------------------------------------------
				// 						GetAll
				//--------------------------------------------------------
				if(operation == 'getAll'){
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const limit = this.getNodeParameter('limit', itemIndex, '') as number;
					const endpoint = resource;

					const filterAttribute = this.getNodeParameter('filterAttribute', itemIndex, '') as string;
					const filterOperation = this.getNodeParameter('filterOperation', itemIndex, '') as string;
					const filterkey = filterAttribute+'_'+filterOperation;
					const filterValue = this.getNodeParameter('filterValue', itemIndex, '') as string;

					let qs:IDataObject = {};
					qs[`page[number]`] = 1;
					if(filterAttribute.length>0 && filterOperation.length>0 && filterValue.length>0){
						qs[`filter[${filterkey}]`] = filterValue;
					}

					item = items[itemIndex];
					
					
					let data;
					do {
						data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, qs ,token);
						qs[`page[number]`] += 1;
						if(split){
							//const data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, qs ,token);
							const datajson = data.data;
							for (let dataIndex = 0; dataIndex < datajson.length; dataIndex++) {
								const newItem: INodeExecutionData = {
									json: {},
									binary: {},
								};
								newItem.json = datajson[dataIndex];
		
								returnItems.push(newItem);
							}
						}
						else{
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data;
							returnItems.push(newItem);
						}

						if (limit!=0 && returnItems.length > limit) {
							return this.prepareOutputData(returnItems.slice(0, limit));
						}

					} while (data.links.next);
				}

				//--------------------------------------------------------
				// 						Create
				//--------------------------------------------------------
				if(operation == 'create'){
					const endpoint = resource;
					const attributesInput = this.getNodeParameter('values.attributes', itemIndex, []) as INodeParameters[];
					item = items[itemIndex];
					
					
					const attributes:IDataObject ={};
					for (let attributesIndex = 0; attributesIndex < attributesInput.length; attributesIndex++) {
						attributes[`${attributesInput[attributesIndex].name}`] = attributesInput[attributesIndex].value;
					};
					const toCreate:IDataObject ={};
					toCreate.data ={
						"type": resource,
						attributes
					};
					
					console.log(toCreate);
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await easyProvisioningApiRequest.call(this,'Post', endpoint, toCreate, {},token);
					returnItems.push(newItem);
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