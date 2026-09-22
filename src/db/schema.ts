// This file describes the shape of our database tables.
// Drizzle reads it to create the tables and to type-check our queries.
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

// The allowed values, written once here and reused by the validation rules,
// so the database and the API can never disagree about them.
export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export const TASK_PRIORITIES = ['very low', 'low', 'medium', 'high'] as const;

export const tasks = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', TASK_STATUSES).notNull().default('pending'),
  priority: mysqlEnum('priority', TASK_PRIORITIES).notNull().default('medium'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255}).notNull(),
  profession: varchar ('profession', {length: 255}),
});
// A `Task` is one row of the tasks table. Drizzle works this type out for us.
export type Task = typeof tasks.$inferSelect;
export type User = typeof users.$inferSelect;
