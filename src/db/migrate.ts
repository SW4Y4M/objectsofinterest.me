import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDatabase } from "./client";

async function main() {
  const database = getDatabase();

  if (!database) {
    throw new Error("DATABASE_URL is required for migrations");
  }

  await migrate(database, { migrationsFolder: "drizzle" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
