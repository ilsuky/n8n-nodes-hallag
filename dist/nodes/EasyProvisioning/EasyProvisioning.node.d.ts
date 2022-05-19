import { IExecuteFunctions } from 'n8n-core';
import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class EasyProvisioning implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
