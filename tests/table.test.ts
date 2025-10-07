import { AirtableTable } from '../src/table';
import { AirtableError } from '../src/errors';

// Mock fetch globally
global.fetch = jest.fn();

describe('AirtableTable', () => {
  let table: AirtableTable;

  beforeEach(() => {
    table = new AirtableTable(
      'appTest123',
      'Table Name',
      'test-key',
      'https://api.airtable.com/v0'
    );
    jest.clearAllMocks();
  });

  describe('select', () => {
    it('should fetch all records with pagination', async () => {
      const mockResponse1 = {
        records: [
          { id: 'rec1', createdTime: '2024-01-01', fields: { Name: 'Test 1' } },
        ],
        offset: 'offset123',
      };
      const mockResponse2 = {
        records: [
          { id: 'rec2', createdTime: '2024-01-02', fields: { Name: 'Test 2' } },
        ],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        });

      const records = await table.select();

      expect(records).toHaveLength(2);
      expect(records[0].id).toBe('rec1');
      expect(records[1].id).toBe('rec2');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('create', () => {
    it('should create a single record', async () => {
      const mockRecord = {
        id: 'recNew',
        createdTime: '2024-01-01',
        fields: { Name: 'New Record' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ records: [mockRecord] }),
      });

      const record = await table.create({
        fields: { Name: 'New Record' },
      });

      expect(record.id).toBe('recNew');
      expect(record.fields.Name).toBe('New Record');
    });
  });

  describe('createRecords', () => {
    it('should throw error when creating more than 10 records', async () => {
      const records = Array.from({ length: 11 }, (_, i) => ({
        fields: { Name: `Record ${i}` },
      }));

      await expect(table.createRecords(records)).rejects.toThrow(
        'Cannot create more than 10 records at once'
      );
    });
  });

  describe('find', () => {
    it('should fetch a single record by ID', async () => {
      const mockRecord = {
        id: 'rec123',
        createdTime: '2024-01-01',
        fields: { Name: 'Test Record' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecord,
      });

      const record = await table.find('rec123');

      expect(record.id).toBe('rec123');
      expect(record.fields.Name).toBe('Test Record');
    });
  });

  describe('error handling', () => {
    it('should throw AirtableError on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            type: 'NOT_FOUND',
            message: 'Record not found',
          },
        }),
      });

      await expect(table.find('invalid')).rejects.toThrow(AirtableError);
    });

    it('should throw RateLimitError on 429 status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            type: 'RATE_LIMIT',
            message: 'Rate limit exceeded',
          },
        }),
      });

      await expect(table.find('rec123')).rejects.toThrow('Rate limit exceeded');
    });
  });
});
