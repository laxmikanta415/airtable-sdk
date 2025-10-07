import { AirtableClient } from '../src';

interface Task {
  Name: string;
  Status: 'Todo' | 'In Progress' | 'Done';
  Priority?: number;
  DueDate?: string;
  Assignee?: string[];
}

async function main() {
  // Initialize the client
  const client = new AirtableClient({
    apiKey: process.env.AIRTABLE_API_KEY || 'your_api_key_here',
  });

  // Get base and table
  const base = client.base('appXXXXXXXXXXXXXX');
  const tasksTable = base.table<Task>('Tasks');

  try {
    // Create a new task
    console.log('Creating a new task...');
    const newTask = await tasksTable.create({
      fields: {
        Name: 'Write documentation',
        Status: 'Todo',
        Priority: 1,
      },
    });
    console.log('Created task:', newTask.id);

    // List all tasks
    console.log('\nFetching all tasks...');
    const allTasks = await tasksTable.select({
      sort: [{ field: 'Priority', direction: 'desc' }],
    });
    console.log(`Found ${allTasks.length} tasks`);

    // Filter tasks
    console.log('\nFetching high priority tasks...');
    const highPriorityTasks = await tasksTable.select({
      filterByFormula: '{Priority} >= 3',
      maxRecords: 10,
    });
    console.log(`Found ${highPriorityTasks.length} high priority tasks`);

    // Update a task
    console.log('\nUpdating task status...');
    const updatedTask = await tasksTable.update(newTask.id, {
      Status: 'In Progress',
    });
    console.log('Updated task:', updatedTask.fields.Status);

    // Batch create
    console.log('\nBatch creating tasks...');
    const newTasks = await tasksTable.createBatch([
      { fields: { Name: 'Task 1', Status: 'Todo' } },
      { fields: { Name: 'Task 2', Status: 'Todo' } },
      { fields: { Name: 'Task 3', Status: 'Todo' } },
    ]);
    console.log(`Created ${newTasks.length} tasks in batch`);

    // Delete the test task
    console.log('\nDeleting test task...');
    await tasksTable.delete(newTask.id);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
