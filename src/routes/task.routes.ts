// Connects each URL and HTTP method to the controller function that handles it.
import { Router } from 'express';
import * as taskController from '../controllers/task.controller';

export const taskRouter = Router();

taskRouter.get('/', taskController.getTasks);
taskRouter.post('/', taskController.createTask);
taskRouter.get('/:id', taskController.getTask);
taskRouter.patch('/:id', taskController.updateTask);
taskRouter.delete('/:id', taskController.deleteTask);
