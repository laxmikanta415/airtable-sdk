import { AirtableBase } from './base';
import { AirtableConfig } from './types';

export class AirtableClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: AirtableConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.airtable.com/v0';
  }

  /**
   * Get a base instance
   */
  base(baseId: string): AirtableBase {
    return new AirtableBase(baseId, this.apiKey, this.baseUrl);
  }

  /**
   * Get API key (for internal use)
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Get base URL (for internal use)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
