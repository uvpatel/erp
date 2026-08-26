import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNeonServerless } from "drizzle-orm/neon-serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/** Low-overhead connection used by ordinary, independent reads and writes. */
export const sql = neon(databaseUrl);
export const db = drizzleNeonHttp({ client: sql });

function createTransactionalDatabase(pool: Pool) {
  return drizzleNeonServerless({ client: pool });
}

type TransactionalDatabase = ReturnType<typeof createTransactionalDatabase>;
type TransactionCallback = Parameters<TransactionalDatabase["transaction"]>[0];

export type DatabaseTransaction = Parameters<TransactionCallback>[0];

/**
 * Runs dependent ERP writes on one WebSocket-backed connection.
 *
 * The Neon HTTP driver intentionally does not support interactive transactions,
 * so command workflows must enter through this helper instead of `db.transaction`.
 */
export async function withDatabaseTransaction<T>(
  callback: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const pool = new Pool({ connectionString: databaseUrl });
  const transactionalDatabase = createTransactionalDatabase(pool);

  try {
    return await transactionalDatabase.transaction(callback, {
      isolationLevel: "serializable",
    });
  } finally {
    await pool.end();
  }
}
