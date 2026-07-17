import mysql, { type ResultSetHeader } from "mysql2/promise";

type QueryParams = Record<string, string | number | boolean | null | Date> | unknown[];

type Pool = mysql.Pool;

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
}

function getDatabaseConfig() {
  const host = process.env.DB_HOST ?? "localhost";
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? "root";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? "evimersin";

  return { host, port, user, password, database };
}

export function getPool(): Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      ...getDatabaseConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
    });
  }

  return global.__mysqlPool;
}

export async function query<T>(sql: string, params?: QueryParams): Promise<T> {
  const pool = getPool();
  const [rows] = params
    ? await pool.execute(sql, params as never)
    : await pool.execute(sql);
  return rows as T;
}

export async function execute(sql: string, params?: QueryParams): Promise<ResultSetHeader> {
  const pool = getPool();
  const [result] = params
    ? await pool.execute(sql, params as never)
    : await pool.execute(sql);
  return result as ResultSetHeader;
}

export async function closePool(): Promise<void> {
  if (global.__mysqlPool) {
    await global.__mysqlPool.end();
    global.__mysqlPool = undefined;
  }
}
