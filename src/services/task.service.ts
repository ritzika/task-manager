// The service layer talks to the database. It knows nothing about HTTP.
import { and, count, eq, SQL } from 'drizzle-orm';
import { db } from '../db';
import { Task, tasks } from '../db/schema';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export async function getAllTasks(
  status: Task['status'] | undefined,
  priority: Task['priority'] | undefined,
  page: number,
  limit: number,
) {
  // 1. Work out the WHERE part. If no filter was given it stays undefined,
  //    which means "no WHERE at all".
  let whereCondition: SQL | undefined = undefined;

  if (status && priority) {
    whereCondition = and(eq(tasks.status, status), eq(tasks.priority, priority));
  } else if (status) {
    whereCondition = eq(tasks.status, status);
  } else if (priority) {
    whereCondition = eq(tasks.priority, priority);
  }

  // 2. How many rows to skip. Page 1 skips 0, page 2 skips `limit`, and so on.
  const offset = (page - 1) * limit;

  // 3. Get just this page of tasks.
  // SELECT * FROM tasks WHERE ... ORDER BY id LIMIT ? OFFSET ?
  // The ORDER BY keeps the order fixed, so a task never shows up on two pages.
  const rows = await db
    .select()
    .from(tasks)
    .where(whereCondition)
    .orderBy(tasks.id)
    .limit(limit)
    .offset(offset);

  // 4. Count ALL matching tasks, not just this page.
  // SELECT COUNT(*) FROM tasks WHERE ...
  const countResult = await db.select({ total: count() }).from(tasks).where(whereCondition);
  const total = countResult[0].total;

  // 5. Send back the tasks plus info about the pages.
  return {
    data: rows,
    page: page,
    limit: limit,
    total: total,
    totalPages: Math.ceil(total / limit),
  };
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
