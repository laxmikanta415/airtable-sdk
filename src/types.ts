export interface AirtableConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface FieldSet {
  [key: string]: unknown;
}

export interface Record<T extends FieldSet = FieldSet> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface RecordData<T extends FieldSet = FieldSet> {
  fields: T;
  id?: string;
  createdTime?: string;
}

export interface ListRecordsOptions {
  fields?: string[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
  cellFormat?: 'json' | 'string';
  timeZone?: string;
  userLocale?: string;
  returnFieldsByFieldId?: boolean;
}

export interface ListRecordsResponse<T extends FieldSet = FieldSet> {
  records: Record<T>[];
  offset?: string;
}

export interface CreateRecordsOptions {
  typecast?: boolean;
}

export interface UpdateRecordsOptions {
  typecast?: boolean;
}

export interface DeleteRecordsResponse {
  records: Array<{ id: string; deleted: boolean }>;
}
