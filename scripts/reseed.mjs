import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { scryptSync, randomBytes } from "node:crypto";
import "dotenv/config";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// We'll just hit the app after start; simpler: insert via SQL using the catalog data.
// Actually simplest path: start next, curl home which calls ensureSeed.

console.log("Use curl after start to seed.");
await pool.end();
