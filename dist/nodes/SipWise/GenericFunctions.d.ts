import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
export declare function sipWiseApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body?: IDataObject, qs?: IDataObject): Promise<any>;
