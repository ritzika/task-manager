// Puts a few example tasks in the database so there is something to look at.
// Run it with: npm run db:seed
import { db } from './index';
import { tasks } from './schema';

async function seed() {
  await db.insert(tasks).values([
    { title: 'Learn Express', status: 'completed', priority: 'high' },
    { title: 'Learn Drizzle ORM', status: 'in_progress', priority: 'high' },
    { title: 'Build a task manager', description: 'Put it all together', priority: 'medium' },
  ]);

  console.log('Added 3 example tasks');
  process.exit(0);
}

seed();
