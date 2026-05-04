import pg from "pg";
import { config } from "./index.js";

export const pool = new pg.Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});

export async function query(text: string, params?: unknown[]): Promise<pg.QueryResult> {
  return pool.query(text, params);
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}
