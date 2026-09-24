// Builds the API documentation from the Zod schemas we already use for validation.
//
// Nothing here re-describes what a task looks like — the fields, the allowed
// values and the length limits all come from task.schema.ts. Change a rule
// there and these docs update by themselves.
import { z } from 'zod';
import { createDocument } from 'zod-openapi';
 import {
    createTaskSchema,
    listTasksQuerySchema,
    taskSchema,
    updateTaskSchema,
  } from './schemas/task.schema';
// The `:id` part of a URL like /tasks/5.
const idParam = z.object({
  id: z.coerce.number().meta({ example: 1 }),
});

// The two error shapes our error handler can send back.
const notFoundSchema = z.object({ message: z.string() }).meta({ id: 'NotFound' });

const validationErrorSchema = z
  .object({
    message: z.string(),
    errors: z.array(z.object({ field: z.string(), problem: z.string() })),
  })
  .meta({ id: 'ValidationError' });

// A shorthand so we don't repeat this wrapper for every response.
const json = (schema: z.ZodType) => ({
  'application/json': { schema },
});

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Task Manager API',
    version: '1.0.0',
    description: 'A small REST API for learning Express, TypeScript, MySQL and Drizzle ORM.',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Check the server is running',
        responses: {
          200: {
            description: 'The server is up',
            content: json(z.object({ status: z.literal('ok') })),
          },
        },
      },
    },

    '/tasks': {
      get: {
        summary: 'List all tasks',
        requestParams: { query: listTasksQuerySchema },
        responses: {
          200: {
            description: 'One page of tasks',
            content: json(
              z.object({
                data: z.array(taskSchema),
                page: z.number(),
                limit: z.number(),
                total: z.number(),
                totalPages: z.number(),
              }),
            ),
          },
          400: { description: 'The body was invalid', content: json(validationErrorSchema) },

        },
      },
      post: {
        summary: 'Create a task',
        requestBody: { content: json(createTaskSchema) },
        responses: {
          201: { description: 'The task that was created', content: json(taskSchema) },
          400: { description: 'The body was invalid', content: json(validationErrorSchema) },
        },
      },
    },

    '/tasks/{id}': {
      get: {
        summary: 'Get one task',
        requestParams: { path: idParam },
        responses: {
          200: { description: 'The task', content: json(taskSchema) },
          404: { description: 'No task with that id', content: json(notFoundSchema) },
        },
      },
      patch: {
        summary: 'Change some fields of a task',
        requestParams: { path: idParam },
        requestBody: { content: json(updateTaskSchema) },
        responses: {
          200: { description: 'The updated task', content: json(taskSchema) },
          400: { description: 'The body was invalid', content: json(validationErrorSchema) },
          404: { description: 'No task with that id', content: json(notFoundSchema) },
        },
      },
      delete: {
        summary: 'Delete a task',
        requestParams: { path: idParam },
        responses: {
          204: { description: 'The task was deleted' },
          404: { description: 'No task with that id', content: json(notFoundSchema) },
        },
      },
    },
  },
});
