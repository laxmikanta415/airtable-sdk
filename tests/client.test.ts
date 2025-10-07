import { AirtableClient } from '../src/client';
import { AirtableBase } from '../src/base';

describe('AirtableClient', () => {
  it('should create a client instance', () => {
    const client = new AirtableClient({ apiKey: 'test-key' });
    expect(client).toBeInstanceOf(AirtableClient);
  });

  it('should create a base instance', () => {
    const client = new AirtableClient({ apiKey: 'test-key' });
    const base = client.base('appTest123');
    expect(base).toBeInstanceOf(AirtableBase);
  });

  it('should use custom base URL when provided', () => {
    const customUrl = 'https://custom.airtable.com/v0';
    const client = new AirtableClient({
      apiKey: 'test-key',
      baseUrl: customUrl,
    });
    expect(client.getBaseUrl()).toBe(customUrl);
  });

  it('should use default base URL when not provided', () => {
    const client = new AirtableClient({ apiKey: 'test-key' });
    expect(client.getBaseUrl()).toBe('https://api.airtable.com/v0');
  });
});
