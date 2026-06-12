import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: PostgresJsDatabase<typeof schema> | null = null;

export function hasDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return false;
  }

  return !isPlaceholderDatabaseUrl(connectionString);
}

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || isPlaceholderDatabaseUrl(connectionString)) {
    return null;
  }

  if (!database) {
    const client = postgres(connectionString, { prepare: false });
    database = drizzle(client, { schema });
  }

  return database;
}

function isPlaceholderDatabaseUrl(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return url.hostname === "host" && url.username === "user" && url.password === "password";
  } catch {
    return false;
  }
}
