// The service layer talks to the database. It knows nothing about HTTP.
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { Task, tasks } from '../db/schema';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export async function getAllTasks(status?: Task['status'], priority?: Task['priority']): Promise<Task[]> {
    // SELECT * FROM tasks WHERE status = ?  (the WHERE only if a filter was given)  
  if (status) {
    if (priority){
      return db.select().from(tasks).where(and(eq(tasks.status, status), eq(tasks.priority, priority)));
    }else{
      return db.select().from(tasks).where(eq(tasks.status, status));
    }
  }else{
    if(priority){
      return db.select().from(tasks).where(eq(tasks.priority, priority));
    }else{
      return db.select().from(tasks);
    }
  } 
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  // SELECT * FROM tasks WHERE id = ?
  const rows = await db.select().from(tasks).where(eq(tasks.id, id));

  // `rows` is a list. If nothing matched it's empty, so we return undefined.
  return rows.length > 0 ? rows[0] : undefined;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  // INSERT INTO tasks ...
  const [result] = await db.insert(tasks).values(data);

  // MySQL doesn't hand back the row it just created, only its new id,
  // so we fetch the full row to return it.
  return (await getTaskById(result.insertId)) as Task;
}

export async function updateTask(id: number, data: UpdateTaskInput): Promise<Task | undefined> {
  // If the body was empty there's nothing to change.
  if (Object.keys(data).length > 0) {
    // UPDATE tasks SET ... WHERE id = ?
    await db.update(tasks).set(data).where(eq(tasks.id, id));
  }

  return getTaskById(id);
}

export async function deleteTask(id: number): Promise<boolean> {
  // DELETE FROM tasks WHERE id = ?
  const [result] = await db.delete(tasks).where(eq(tasks.id, id));

  // affectedRows tells us whether a row was actually deleted.
  return result.affectedRows > 0;
}
