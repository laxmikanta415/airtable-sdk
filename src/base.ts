import { AirtableTable } from './table';
import { FieldSet } from './types';

export class AirtableBase {
  constructor(
    private readonly baseId: string,
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {}

  /**
   * Get a table instance
   */
  table<T extends FieldSet = FieldSet>(
    tableIdOrName: string
  ): AirtableTable<T> {
    return new AirtableTable<T>(
      this.baseId,
      tableIdOrName,
      this.apiKey,
      this.baseUrl
    );
  }
}
