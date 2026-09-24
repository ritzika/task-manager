// The controller layer handles HTTP: read the request, call a service, send a response.
import { Request, Response } from 'express';
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from '../schemas/task.schema';
import * as taskService from '../services/task.service';

// URL parts are always text, so "5" has to become the number 5.
// If it isn't a number at all we reply 400 and return undefined,
// which tells the caller to stop.
function readIdParam(req: Request, res: Response): number | undefined {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'Id must be a number' });
    return undefined;
  }

  return id;
}

// GET /tasks
export async function getTasks(req: Request, res: Response) {
  // If ?status=, ?page= etc. are present but invalid, .parse() throws → 400.
  const queryData = listTasksQuerySchema.parse(req.query);
  const result = await taskService.getAllTasks(
    queryData.status,
    queryData.priority,
    queryData.page,
    queryData.limit,
  );
  res.json(result);
}

// GET /tasks/:id
export async function getTask(req: Request, res: Response) {
  const id = readIdParam(req, res);
  if (id === undefined) return;

  const task = await taskService.getTaskById(id);

  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }

  res.json(task);
}

// POST /tasks
export async function createTask(req: Request, res: Response) {
  // If the body is invalid, .parse() throws and the error handler sends a 400.
  const data = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(data);

  // 201 means "created".
  res.status(201).json(task);
}

// PATCH /tasks/:id
export async function updateTask(req: Request, res: Response) {
  const id = readIdParam(req, res);
  if (id === undefined) return;

  const data = updateTaskSchema.parse(req.body);
  const task = await taskService.updateTask(id, data);

  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }

  res.json(task);
}

// DELETE /tasks/:id
export async function deleteTask(req: Request, res: Response) {
  const id = readIdParam(req, res);
  if (id === undefined) return;

  const deleted = await taskService.deleteTask(id);

  if (!deleted) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }

  // 204 means "done, and there's nothing to send back".
  res.status(204).send();
}
