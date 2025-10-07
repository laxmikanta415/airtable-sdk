import {
  Record,
  RecordData,
  ListRecordsOptions,
  ListRecordsResponse,
  CreateRecordsOptions,
  UpdateRecordsOptions,
  DeleteRecordsResponse,
  FieldSet,
} from './types';
import { AirtableError, RateLimitError } from './errors';

export class AirtableTable<T extends FieldSet = FieldSet> {
  private readonly endpoint: string;

  constructor(
    private readonly baseId: string,
    private readonly tableIdOrName: string,
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {
    this.endpoint = `${this.baseUrl}/${this.baseId}/${encodeURIComponent(
      this.tableIdOrName
    )}`;
  }

  /**
   * List records with pagination support
   */
  async select(options: ListRecordsOptions = {}): Promise<Record<T>[]> {
    const allRecords: Record<T>[] = [];
    let offset: string | undefined;

    do {
      const response = await this.listRecords({ ...options, offset });
      allRecords.push(...response.records);
      offset = response.offset;
    } while (offset);

    return allRecords;
  }

  /**
   * List records (single page)
   */
  async listRecords(
    options: ListRecordsOptions & { offset?: string } = {}
  ): Promise<ListRecordsResponse<T>> {
    const params = new URLSearchParams();

    if (options.fields) {
      options.fields.forEach(field => params.append('fields[]', field));
    }
    if (options.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }
    if (options.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }
    if (options.pageSize) {
      params.append('pageSize', options.pageSize.toString());
    }
    if (options.sort) {
      options.sort.forEach((sort, index) => {
        params.append(`sort[${index}][field]`, sort.field);
        params.append(`sort[${index}][direction]`, sort.direction);
      });
    }
    if (options.view) {
      params.append('view', options.view);
    }
    if (options.cellFormat) {
      params.append('cellFormat', options.cellFormat);
    }
    if (options.timeZone) {
      params.append('timeZone', options.timeZone);
    }
    if (options.userLocale) {
      params.append('userLocale', options.userLocale);
    }
    if (options.returnFieldsByFieldId) {
      params.append('returnFieldsByFieldId', 'true');
    }
    if (options.offset) {
      params.append('offset', options.offset);
    }

    const url = `${this.endpoint}?${params.toString()}`;
    return this.request<ListRecordsResponse<T>>('GET', url);
  }

  /**
   * Get a single record by ID
   */
  async find(recordId: string): Promise<Record<T>> {
    const url = `${this.endpoint}/${recordId}`;
    return this.request<Record<T>>('GET', url);
  }

  /**
   * Create a single record
   */
  async create(
    record: RecordData<T>,
    options: CreateRecordsOptions = {}
  ): Promise<Record<T>> {
    const records = await this.createRecords([record], options);
    return records[0];
  }

  /**
   * Create multiple records (up to 10 at a time)
   */
  async createRecords(
    records: RecordData<T>[],
    options: CreateRecordsOptions = {}
  ): Promise<Record<T>[]> {
    if (records.length > 10) {
      throw new AirtableError(
        'Cannot create more than 10 records at once. Use createBatch() for larger operations.'
      );
    }

    const body: any = { records };
    if (options.typecast) {
      body.typecast = true;
    }

    const response = await this.request<{ records: Record<T>[] }>(
      'POST',
      this.endpoint,
      body
    );
    return response.records;
  }

  /**
   * Create records in batches (handles any number of records)
   */
  async createBatch(
    records: RecordData<T>[],
    options: CreateRecordsOptions = {}
  ): Promise<Record<T>[]> {
    const results: Record<T>[] = [];
    const batchSize = 10;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchResults = await this.createRecords(batch, options);
      results.push(...batchResults);

      // Rate limiting: wait between batches
      if (i + batchSize < records.length) {
        await this.sleep(200); // 5 requests per second
      }
    }

    return results;
  }

  /**
   * Update a single record
   */
  async update(
    recordId: string,
    fields: Partial<T>,
    options: UpdateRecordsOptions = {}
  ): Promise<Record<T>> {
    const records = await this.updateRecords(
      [{ id: recordId, fields }],
      options
    );
    return records[0];
  }

  /**
   * Update multiple records (up to 10 at a time)
   */
  async updateRecords(
    records: Array<{ id: string; fields: Partial<T> }>,
    options: UpdateRecordsOptions = {}
  ): Promise<Record<T>[]> {
    if (records.length > 10) {
      throw new AirtableError(
        'Cannot update more than 10 records at once. Use updateBatch() for larger operations.'
      );
    }

    const body: any = { records };
    if (options.typecast) {
      body.typecast = true;
    }

    const response = await this.request<{ records: Record<T>[] }>(
      'PATCH',
      this.endpoint,
      body
    );
    return response.records;
  }

  /**
   * Update records in batches (handles any number of records)
   */
  async updateBatch(
    records: Array<{ id: string; fields: Partial<T> }>,
    options: UpdateRecordsOptions = {}
  ): Promise<Record<T>[]> {
    const results: Record<T>[] = [];
    const batchSize = 10;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchResults = await this.updateRecords(batch, options);
      results.push(...batchResults);

      if (i + batchSize < records.length) {
        await this.sleep(200);
      }
    }

    return results;
  }

  /**
   * Replace a single record (PUT)
   */
  async replace(recordId: string, fields: T): Promise<Record<T>> {
    const url = `${this.endpoint}/${recordId}`;
    return this.request<Record<T>>('PUT', url, { fields });
  }

  /**
   * Delete a single record
   */
  async delete(recordId: string): Promise<{ id: string; deleted: boolean }> {
    const response = await this.deleteRecords([recordId]);
    return response.records[0];
  }

  /**
   * Delete multiple records (up to 10 at a time)
   */
  async deleteRecords(recordIds: string[]): Promise<DeleteRecordsResponse> {
    if (recordIds.length > 10) {
      throw new AirtableError(
        'Cannot delete more than 10 records at once. Use deleteBatch() for larger operations.'
      );
    }

    const params = new URLSearchParams();
    recordIds.forEach(id => params.append('records[]', id));

    const url = `${this.endpoint}?${params.toString()}`;
    return this.request<DeleteRecordsResponse>('DELETE', url);
  }

  /**
   * Delete records in batches (handles any number of records)
   */
  async deleteBatch(
    recordIds: string[]
  ): Promise<Array<{ id: string; deleted: boolean }>> {
    const results: Array<{ id: string; deleted: boolean }> = [];
    const batchSize = 10;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      const response = await this.deleteRecords(batch);
      results.push(...response.records);

      if (i + batchSize < recordIds.length) {
        await this.sleep(200);
      }
    }

    return results;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<R>(
    method: string,
    url: string,
    body?: any
  ): Promise<R> {
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));

      if (response.status === 429) {
        throw new RateLimitError(
          errorData.error?.message || 'Rate limit exceeded'
        );
      }

      throw new AirtableError(
        errorData.error?.message ||
          `Request failed with status ${response.status}`,
        response.status,
        errorData.error?.type
      );
    }

    return response.json() as Promise<R>;
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
