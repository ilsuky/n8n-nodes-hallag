export type OdooRestApiCredentials = {
	apiToken: string;
	host: string;
}

export type GetAllAdditionalOptions = {
	order?: {
		fields: Array<{
			field: string;
			direction: string;
		}>
	};
	filters?: {
		fields: Array<{
			field: string;
			operator: string;
			value: string;
		}>;
	};
	filterType: string,
	search: string,
};

export type LoadedResource = {
	id: number;
	name: string;
}

export type Accumulator = {
	[key: string]: string;
}

export type Row = Record<string, string>

export type OdooReturnData = {
	success: boolean,
	message: string,
	data: Object[]
}

export type FieldsUiValues = Array<{
	fieldId: string;
	fieldValue: string;
}>;

export type Operation = 'create' | 'delete' | 'update' | 'get' | 'getAll';
