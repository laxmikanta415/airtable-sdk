import { AirtableClient, AirtableError, RateLimitError } from '../src';

interface Project {
  Name: string;
  Status: string;
  StartDate: string;
  EndDate?: string;
  Tasks: string[]; // Record IDs
  Budget?: number;
}

async function advancedExample() {
  const client = new AirtableClient({
    apiKey: process.env.AIRTABLE_API_KEY!,
  });

  const base = client.base('appXXXXXXXXXXXXXX');
  const projectsTable = base.table<Project>('Projects');

  try {
    // Complex filtering with formula
    const activeProjects = await projectsTable.select({
      filterByFormula: `
        AND(
          {Status} = 'Active',
          IS_AFTER({EndDate}, TODAY()),
          {Budget} > 10000
        )
      `,
      sort: [
        { field: 'StartDate', direction: 'asc' },
        { field: 'Budget', direction: 'desc' },
      ],
      fields: ['Name', 'Status', 'Budget', 'Tasks'],
    });

    console.log('Active high-budget projects:', activeProjects.length);

    // Process projects in batches
    const updates = activeProjects.map(project => ({
      id: project.id,
      fields: {
        Status: 'Under Review' as const,
      },
    }));

    const updatedProjects = await projectsTable.updateBatch(updates);
    console.log(`Updated ${updatedProjects.length} projects`);

    // Manual pagination example
    let allProjects: typeof activeProjects = [];
    let offset: string | undefined;
    let page = 1;

    do {
      const response = await projectsTable.listRecords({
        pageSize: 100,
        offset,
      });

      allProjects.push(...response.records);
      offset = response.offset;

      console.log(`Fetched page ${page}, total records: ${allProjects.length}`);
      page++;
    } while (offset);

    console.log(`Total projects: ${allProjects.length}`);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error('Rate limit hit! Implement exponential backoff');
      // Implement retry logic here
    } else if (error instanceof AirtableError) {
      console.error('Airtable API error:');
      console.error('  Message:', error.message);
      console.error('  Status:', error.statusCode);
      console.error('  Type:', error.errorType);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

advancedExample();
