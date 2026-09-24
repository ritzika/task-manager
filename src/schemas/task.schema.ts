// Rules for what a valid request body looks like.
//
// These schemas do two jobs:
//   1. Zod checks incoming JSON against them and throws if it's wrong.
//   2. The API docs are generated from them, so the docs always match the rules.
import { string, z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../db/schema';

// The fields someone can send us. `.meta({ id })` gives the schema a name,
// which is the name that shows up in the API docs.
const taskFields = z.object({
  title: z.string().min(1).max(255).meta({ example: 'Buy milk' }),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});

export const createTaskSchema = taskFields.meta({ id: 'CreateTask' });

// For updating, every field is optional — you might only change the title.
export const updateTaskSchema = taskFields.partial().meta({ id: 'UpdateTask' });
export const listTasksQuerySchema = z.object({status: z.enum(TASK_STATUSES).optional(), priority: z.enum(TASK_PRIORITIES).optional()});

// What a task looks like when we send it back. Note that the dates are text
// here, because JSON has no date type — that's what the client actually receives.
export const taskSchema = z
  .object({
    id: z.number().meta({ example: 1 }),
    title: z.string(),
    description: z.string().nullable(),
    status: z.enum(TASK_STATUSES),
    priority: z.enum(TASK_PRIORITIES),
    createdAt: z.string().meta({ format: 'date-time', example: '2026-01-01T10:00:00.000Z' }),
    updatedAt: z.string().meta({ format: 'date-time', example: '2026-01-01T10:00:00.000Z' }),
  })
  .meta({ id: 'Task' });

// These types are worked out from the rules above, so they can never disagree.
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
