# Task Manager API

A small REST API for learning backend development, built with **Express**, **TypeScript**,
**MySQL** and **Drizzle ORM**.

## What you need first

- [Node.js](https://nodejs.org) version 20 or newer
- A MySQL database. If you have [Docker](https://www.docker.com), `docker compose up -d`
  starts one for you. Otherwise install MySQL and create an empty database.

## Getting started

```bash
npm install                 # download the libraries this project uses
cp .env.example .env        # create your settings file, then edit the DB_ values

docker compose up -d        # start MySQL (skip if you already have one)
npm run db:push             # create the tasks table in the database
npm run db:seed             # add 3 example tasks (optional)

npm run dev                 # start the server
```

Then open <http://localhost:3000/docs> in your browser. That page lists every endpoint and
lets you try them out without writing any code.

## Trying it out

```bash
# List every task
curl http://localhost:3000/tasks

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "content-type: application/json" \
  -d '{"title": "My first task", "priority": "high"}'

# Update one (use an id you got back from the list)
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "content-type: application/json" \
  -d '{"status": "completed"}'

# Delete one
curl -X DELETE http://localhost:3000/tasks/1
```

## The endpoints

| Method   | URL          | What it does                  |
| -------- | ------------ | ----------------------------- |
| `GET`    | `/health`    | Checks the server is running  |
| `GET`    | `/tasks`     | Lists all tasks               |
| `POST`   | `/tasks`     | Creates a task                |
| `GET`    | `/tasks/:id` | Gets one task                 |
| `PATCH`  | `/tasks/:id` | Changes some fields of a task |
| `DELETE` | `/tasks/:id` | Deletes a task                |

A task looks like this:

```json
{
  "id": 1,
  "title": "Learn Express",
  "description": null,
  "status": "pending",
  "priority": "medium",
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z"
}
```

`status` must be `pending`, `in_progress` or `completed`.
`priority` must be `low`, `medium` or `high`.

## How a request travels through the code

Say someone calls `GET /tasks/1`. The request passes through these files in order:

```
src/index.ts               1. the server receives the request
  └─ routes/task.routes.ts   2. matches the URL to a controller function
      └─ controllers/task.controller.ts   3. reads the id, decides the status code
          └─ services/task.service.ts       4. asks the database for the row
              └─ db/schema.ts                 5. describes what the table looks like
```

The split matters: **controllers** deal with HTTP (status codes, request bodies) and
**services** deal with the database. Keeping them apart means you can change how data is
stored without touching your routes.

## Every file, and what it's for

| File                                 | What it does                             |
| ------------------------------------ | ---------------------------------------- |
| `src/index.ts`                       | Starts the server and sets up middleware |
| `src/config.ts`                      | Reads settings from `.env`               |
| `src/db/schema.ts`                   | Describes the `tasks` table              |
| `src/db/index.ts`                    | Connects to MySQL                        |
| `src/db/seed.ts`                     | Adds example tasks                       |
| `src/routes/task.routes.ts`          | Maps URLs to controller functions        |
| `src/controllers/task.controller.ts` | Handles requests and responses           |
| `src/services/task.service.ts`       | Runs the database queries                |
| `src/schemas/task.schema.ts`         | Rules for valid request bodies           |
| `src/middleware/error-handler.ts`    | Turns errors into JSON responses         |

## Commands

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Starts the server and restarts when you save a file  |
| `npm run build`     | Compiles TypeScript into plain JavaScript in `dist/` |
| `npm start`         | Runs the compiled code                               |
| `npm run typecheck` | Checks for type mistakes without running anything    |
| `npm run format`    | Tidies up the formatting of your code                |
| `npm run db:push`   | Updates the database to match `schema.ts`            |
| `npm run db:seed`   | Adds the example tasks                               |
| `npm run db:studio` | Opens a web page to browse your data                 |

## Things worth understanding

**The three libraries in `index.ts`.** `helmet` adds security headers to responses. `cors`
lets a web page on a different address call this API. `morgan` prints a line for every
request, which is handy while you're learning — watch your terminal as you use the API.

**Validation.** `createTaskSchema.parse(req.body)` in the controller checks the incoming JSON.
If it's wrong it throws, and `error-handler.ts` turns that into a `400` response listing what
was wrong. Without this, a missing `title` would become a confusing crash deeper in the code.

**The docs write themselves.** `src/docs.ts` hands the _same_ Zod schemas to a library that
turns them into an OpenAPI description, which Swagger UI renders at `/docs`. Nothing describes
a task twice. Try it: add a value to `TASK_STATUSES` in `src/db/schema.ts`, save, and reload
`/docs` — the new value is already there, because that one list feeds the database column, the
validation rules and the docs.

**Errors.** Express 5 automatically sends any error thrown in a route to the error handler,
so controllers don't need `try`/`catch` around everything.

**`db:push` vs migrations.** `db:push` compares `schema.ts` to the database and changes the
database to match. It's the quickest way to work while learning. Real projects use
_migrations_ (`npm run db:generate` then `npm run db:migrate`), which record each change as a
file so a team can apply the same changes in order. Both are set up here.

## Try these next

1. Add a `dueDate` column to `src/db/schema.ts`, run `npm run db:push`, and let people set it.
2. Support `GET /tasks?status=pending` to filter the list.
3. Add pagination so `GET /tasks?page=2` returns the next set of results.
4. Add a second table, such as `categories`, following the same file layout.

## How the pieces connect

This is the part worth understanding, because it's what keeps the project from rotting:

```
src/db/schema.ts          TASK_STATUSES = ['pending', 'in_progress', 'completed']
        │                          the single source of truth
        ├──────────────►  the MySQL column          (mysqlEnum)
        │
        └──────────────►  src/schemas/task.schema.ts    (z.enum)
                                   │
                                   ├──►  validation, when a request comes in
                                   │
                                   └──►  src/docs.ts  ──►  /docs
```

In Python's FastAPI or Java's Spring Boot the framework can do this for you, because those
languages can inspect types while the program is running. TypeScript types disappear when the
code is compiled, so Express can't. Zod is the way around it: a Zod schema is a real value that
still exists at runtime, so it can be used to check requests _and_ to describe them.

Adding a field is therefore one edit in `db/schema.ts`, one in `task.schema.ts`, and
`npm run db:push`. The docs update on their own.
