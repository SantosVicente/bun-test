import { Database } from "bun:sqlite";
import { drizzle as drizzleBun } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { products } from "./schema";
export { products };

export const schema = { products };

let dbInstance;

if (process.env.TURSO_DATABASE_URL) {
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_AUTH_TOKEN não definido");
  }

  console.log("Conectando ao banco de dados Turso...");
  const tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  dbInstance = drizzleTurso(tursoClient, { schema });
} else {
  console.log("Conectando ao banco de dados local (app.sqlite)...");
  const sqlite = new Database("app.sqlite");

  dbInstance = drizzleBun(sqlite, { schema });
}

export const db = dbInstance;
