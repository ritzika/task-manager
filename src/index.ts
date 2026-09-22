// This is where the app starts.
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { openApiDocument } from './docs';
import { errorHandler } from './middleware/error-handler';
import { taskRouter } from './routes/task.routes';

const app = express();

// Middleware runs on every request, in the order listed here.
app.use(helmet()); // adds security headers to each response
app.use(cors()); // allows web pages on other domains to call this API
app.use(morgan('dev')); // logs each request, e.g. "GET /tasks 200 4ms"
app.use(express.json()); // reads a JSON request body into req.body

// Interactive API documentation, generated from our Zod schemas.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// A simple endpoint to check the server is running.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Everything starting with /tasks is handled by the task routes.
app.use('/tasks', taskRouter);

// If no route above matched, the URL doesn't exist.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// The error handler goes last so it can catch errors from everything above.
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
