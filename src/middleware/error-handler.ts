import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// Any error thrown in a route ends up here, so we only write this once.
// Express recognises it as an error handler because it takes 4 arguments.
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Zod throws this when the request body doesn't match the schema.
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Invalid request body',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        problem: issue.message,
      })),
    });
    return;
  }

  // Anything else is a bug on our side, so log it and send a generic message.
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
}
