// Creates the connection to MySQL and hands us a `db` object to run queries with.
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from '../config';

// A pool keeps a few connections open and reuses them, which is faster
// than opening a new connection for every request.
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

export const db = drizzle(pool);
