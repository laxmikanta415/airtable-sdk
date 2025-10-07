# Airtable TypeScript SDK

A modern, fully-typed TypeScript SDK for the Airtable API with complete type safety and intuitive API design.

## Features

✨ **Full TypeScript Support** - Complete type definitions for all API operations  
🚀 **Modern Async/Await API** - Promise-based interface, no callbacks  
📦 **Batch Operations** - Automatic batching for large operations  
⚡ **Rate Limiting** - Built-in rate limit handling  
🛡️ **Error Handling** - Detailed error types and messages  
🎯 **Type-Safe Records** - Generic types for your record structures  
📝 **Comprehensive Documentation** - Full JSDoc comments

## Installation

```bash
npm install @dlax/airtable-sdk
```

## Quick Start

```typescript
import { AirtableClient } from '@dlax/airtable-sdk';

// Initialize the client
const client = new AirtableClient({
  apiKey: 'your_api_key_here',
});

// Get a base and table
const base = client.base('appXXXXXXXXXXXXXX');
const table = base.table('Table Name');

// List all records
const records = await table.select();
console.log(records);
```

## Usage Examples

### Define Your Record Types

```typescript
interface Task {
  Name: string;
  Status: 'Todo' | 'In Progress' | 'Done';
  DueDate?: string;
  Priority?: number;
  Assignee?: string[];
}

const tasksTable = base.table<Task>('Tasks');
```

### Create Records

```typescript
// Create a single record
const record = await tasksTable.create({
  fields: {
    Name: 'Complete documentation',
    Status: 'Todo',
    Priority: 1,
  },
});

// Create multiple records (up to 10)
const records = await tasksTable.createRecords([
  { fields: { Name: 'Task 1', Status: 'Todo' } },
  { fields: { Name: 'Task 2', Status: 'In Progress' } },
]);

// Create many records (auto-batched)
const manyRecords = await tasksTable.createBatch(
  Array.from({ length: 50 }, (_, i) => ({
    fields: { Name: `Task ${i}`, Status: 'Todo' },
  }))
);
```

### Read Records

```typescript
// Get all records
const allRecords = await tasksTable.select();

// Get records with filtering
const filteredRecords = await tasksTable.select({
  filterByFormula: "AND({Status} = 'Todo', {Priority} > 2)",
  sort: [{ field: 'Priority', direction: 'desc' }],
  maxRecords: 100,
});

// Get specific fields only
const limitedFields = await tasksTable.select({
  fields: ['Name', 'Status'],
});

// Get a single record by ID
const record = await tasksTable.find('recXXXXXXXXXXXXXX');

// Use a view
const viewRecords = await tasksTable.select({
  view: 'High Priority Tasks',
});
```

### Update Records

```typescript
// Update a single record
const updated = await tasksTable.update('recXXXXXXXXXXXXXX', {
  Status: 'Done',
});

// Update multiple records (up to 10)
const updatedRecords = await tasksTable.updateRecords([
  { id: 'recXXXXXXXXXXXXXX', fields: { Status: 'Done' } },
  { id: 'recYYYYYYYYYYYYYY', fields: { Status: 'In Progress' } },
]);

// Update many records (auto-batched)
const updates = records.map(record => ({
  id: record.id,
  fields: { Status: 'Done' as const },
}));
const batchUpdated = await tasksTable.updateBatch(updates);

// Replace entire record (PUT)
const replaced = await tasksTable.replace('recXXXXXXXXXXXXXX', {
  Name: 'New name',
  Status: 'Todo',
  Priority: 5,
});
```

### Delete Records

```typescript
// Delete a single record
const deleted = await tasksTable.delete('recXXXXXXXXXXXXXX');

// Delete multiple records (up to 10)
const deletedRecords = await tasksTable.deleteRecords([
  'recXXXXXXXXXXXXXX',
  'recYYYYYYYYYYYYYY',
]);

// Delete many records (auto-batched)
const recordIds = records.map(r => r.id);
const batchDeleted = await tasksTable.deleteBatch(recordIds);
```

### Advanced Filtering

```typescript
// Complex formula
const records = await tasksTable.select({
  filterByFormula: `
    AND(
      OR({Status} = 'Todo', {Status} = 'In Progress'),
      {Priority} >= 3,
      IS_AFTER({DueDate}, TODAY())
    )
  `,
});

// Multiple sorts
const sortedRecords = await tasksTable.select({
  sort: [
    { field: 'Priority', direction: 'desc' },
    { field: 'DueDate', direction: 'asc' },
  ],
});
```

### Pagination

```typescript
// Manual pagination
let allRecords: Record<Task>[] = [];
let offset: string | undefined;

do {
  const response = await tasksTable.listRecords({
    pageSize: 100,
    offset,
  });
  allRecords.push(...response.records);
  offset = response.offset;
} while (offset);

// Or use select() which handles pagination automatically
const records = await tasksTable.select({ maxRecords: 1000 });
```

### Error Handling

```typescript
import { AirtableError, RateLimitError } from '@dlax/airtable-sdk';

try {
  const record = await tasksTable.find('invalidRecordId');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded, wait and retry');
  } else if (error instanceof AirtableError) {
    console.error('Airtable error:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Error type:', error.errorType);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Working with Multiple Tables

```typescript
interface Project {
  Name: string;
  Status: string;
  Tasks: string[]; // Record IDs
}

interface Task {
  Name: string;
  Project: string[]; // Record IDs
  Status: string;
}

const projectsTable = base.table<Project>('Projects');
const tasksTable = base.table<Task>('Tasks');

// Get all projects and their tasks
const projects = await projectsTable.select();
for (const project of projects) {
  if (project.fields.Tasks) {
    const tasks = await Promise.all(
      project.fields.Tasks.map(taskId => tasksTable.find(taskId))
    );
    console.log(`${project.fields.Name} has ${tasks.length} tasks`);
  }
}
```

### TypeScript Best Practices

```typescript
// Define strict types for your records
interface StrictTask {
  Name: string; // Required
  Status: 'Todo' | 'In Progress' | 'Done'; // Union types
  Priority?: number; // Optional
  Tags?: string[]; // Arrays
  DueDate?: string; // ISO date strings
}

const table = base.table<StrictTask>('Tasks');

// TypeScript will enforce types
await table.create({
  fields: {
    Name: 'Task',
    Status: 'Todo', // ✅ Valid
    // Status: 'Invalid', // ❌ TypeScript error
    Priority: 5,
  },
});

// Type inference works throughout
const records = await table.select();
records.forEach(record => {
  // record.fields is typed as StrictTask
  console.log(record.fields.Name.toUpperCase()); // ✅ Type-safe
});
```

## API Reference

### AirtableClient

```typescript
new AirtableClient(config: AirtableConfig)
```

- `config.apiKey` (required): Your Airtable API key
- `config.baseUrl` (optional): Custom API base URL

### AirtableBase

```typescript
base.table<T>(tableIdOrName: string): AirtableTable<T>
```

### AirtableTable

#### Query Methods

- `select(options?)`: Get all records with automatic pagination
- `listRecords(options?)`: Get a single page of records
- `find(recordId)`: Get a single record by ID

#### Create Methods

- `create(record, options?)`: Create a single record
- `createRecords(records, options?)`: Create up to 10 records
- `createBatch(records, options?)`: Create any number of records (auto-batched)

#### Update Methods

- `update(recordId, fields, options?)`: Update a single record (PATCH)
- `updateRecords(records, options?)`: Update up to 10 records
- `updateBatch(records, options?)`: Update any number of records (auto-batched)
- `replace(recordId, fields)`: Replace entire record (PUT)

#### Delete Methods

- `delete(recordId)`: Delete a single record
- `deleteRecords(recordIds)`: Delete up to 10 records
- `deleteBatch(recordIds)`: Delete any number of records (auto-batched)

### ListRecordsOptions

```typescript
{
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
```

## Rate Limiting

The SDK automatically handles rate limiting:

- Batch operations include delays between batches (5 requests/second)
- Rate limit errors are thrown as `RateLimitError`
- Consider implementing exponential backoff for production use

## Environment Variables

```bash
AIRTABLE_API_KEY=your_api_key_here
```

```typescript
const client = new AirtableClient({
  apiKey: process.env.AIRTABLE_API_KEY!,
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
