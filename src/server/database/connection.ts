import mysql, { type ResultSetHeader } from "mysql2/promise";

type QueryParams =
  | Record<string, string | number | boolean | null | Date | Buffer>
  | unknown[];

type Pool = mysql.Pool;

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __mysqlColumnMigration: Promise<void> | undefined;
}

function getDatabaseConfig() {
  const host = process.env.DB_HOST ?? "localhost";
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? "root";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? "evimersin";

  return { host, port, user, password, database };
}

const PRODUCT_COLUMN_MIGRATIONS = [
  "ALTER TABLE products ADD COLUMN land_area DOUBLE NULL AFTER city_id",
  "ALTER TABLE products ADD COLUMN land_type VARCHAR(100) NULL AFTER land_area",
  "ALTER TABLE products ADD COLUMN zoning VARCHAR(100) NULL AFTER land_type",
  "ALTER TABLE products ADD COLUMN road_access TINYINT NULL AFTER zoning",
  "ALTER TABLE products ADD COLUMN allowed_floors INT NULL AFTER road_access",
  "ALTER TABLE products ADD COLUMN electricity TINYINT NULL AFTER allowed_floors",
  "ALTER TABLE products ADD COLUMN water TINYINT NULL AFTER electricity",
  "ALTER TABLE products ADD COLUMN built_area DOUBLE NULL AFTER water",
  "ALTER TABLE products ADD COLUMN floors INT NULL AFTER built_area",
  "ALTER TABLE products ADD COLUMN bedrooms INT NULL AFTER floors",
  "ALTER TABLE products ADD COLUMN bathrooms INT NULL AFTER bedrooms",
  "ALTER TABLE products ADD COLUMN living_rooms INT NULL AFTER bathrooms",
  "ALTER TABLE products ADD COLUMN parking TINYINT NULL AFTER living_rooms",
  "ALTER TABLE products ADD COLUMN garden TINYINT NULL AFTER parking",
  "ALTER TABLE products ADD COLUMN pool TINYINT NULL AFTER garden",
  "ALTER TABLE products ADD COLUMN furnished TINYINT NULL AFTER pool",
  "ALTER TABLE products ADD COLUMN floor_number INT NULL AFTER furnished",
  "ALTER TABLE products ADD COLUMN balconies INT NULL AFTER floor_number",
  "ALTER TABLE products ADD COLUMN elevator TINYINT NULL AFTER balconies",
  "ALTER TABLE products ADD COLUMN frontage DOUBLE NULL AFTER elevator",
  "ALTER TABLE products ADD COLUMN storage TINYINT NULL AFTER frontage",
  "ALTER TABLE products ADD COLUMN mezzanine TINYINT NULL AFTER storage",
  "ALTER TABLE products ADD COLUMN rooms INT NULL AFTER mezzanine",
  "ALTER TABLE products ADD COLUMN payment_method VARCHAR(255) NULL AFTER discount_value",
];

async function ensureProductColumns(pool: Pool) {
  for (const sql of PRODUCT_COLUMN_MIGRATIONS) {
    try {
      await pool.execute(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        !message.includes("Duplicate column name") &&
        !message.includes("already exists")
      ) {
        console.error("[db] Product column migration failed:", message);
      }
    }
  }
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

async function ensureMigrations() {
  if (!global.__mysqlColumnMigration) {
    global.__mysqlColumnMigration = ensureProductColumns(getPool());
  }
  await global.__mysqlColumnMigration;
}

export async function query<T>(sql: string, params?: QueryParams): Promise<T> {
  await ensureMigrations();
  const pool = getPool();
  const [rows] = params
    ? await pool.execute(sql, params as never)
    : await pool.execute(sql);
  return rows as T;
}

export async function execute(
  sql: string,
  params?: QueryParams,
): Promise<ResultSetHeader> {
  await ensureMigrations();
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
