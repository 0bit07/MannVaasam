import { Pool, type QueryResultRow } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __mannvaasamPool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  })
}

function getPool(): Pool {
  if (!global.__mannvaasamPool) {
    global.__mannvaasamPool = createPool()
  }
  return global.__mannvaasamPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query<T>(text, params)
  return result.rows
}
