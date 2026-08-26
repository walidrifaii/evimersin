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

/** Only run these if the column is missing — never spam ALTER on every cold start. */
const PRODUCT_COLUMN_MIGRATIONS: Array<{ table: string; column: string; sql: string }> = [
  { table: "products", column: "land_area", sql: "ALTER TABLE products ADD COLUMN land_area DOUBLE NULL AFTER city_id" },
  { table: "products", column: "land_type", sql: "ALTER TABLE products ADD COLUMN land_type VARCHAR(100) NULL AFTER land_area" },
  { table: "products", column: "zoning", sql: "ALTER TABLE products ADD COLUMN zoning VARCHAR(100) NULL AFTER land_type" },
  { table: "products", column: "road_access", sql: "ALTER TABLE products ADD COLUMN road_access TINYINT NULL AFTER zoning" },
  { table: "products", column: "allowed_floors", sql: "ALTER TABLE products ADD COLUMN allowed_floors INT NULL AFTER road_access" },
  { table: "products", column: "electricity", sql: "ALTER TABLE products ADD COLUMN electricity TINYINT NULL AFTER allowed_floors" },
  { table: "products", column: "water", sql: "ALTER TABLE products ADD COLUMN water TINYINT NULL AFTER electricity" },
  { table: "products", column: "built_area", sql: "ALTER TABLE products ADD COLUMN built_area DOUBLE NULL AFTER water" },
  { table: "products", column: "floors", sql: "ALTER TABLE products ADD COLUMN floors INT NULL AFTER built_area" },
  { table: "products", column: "bedrooms", sql: "ALTER TABLE products ADD COLUMN bedrooms INT NULL AFTER floors" },
  { table: "products", column: "bathrooms", sql: "ALTER TABLE products ADD COLUMN bathrooms INT NULL AFTER bedrooms" },
  { table: "products", column: "living_rooms", sql: "ALTER TABLE products ADD COLUMN living_rooms INT NULL AFTER bathrooms" },
  { table: "products", column: "parking", sql: "ALTER TABLE products ADD COLUMN parking TINYINT NULL AFTER living_rooms" },
  { table: "products", column: "garden", sql: "ALTER TABLE products ADD COLUMN garden TINYINT NULL AFTER parking" },
  { table: "products", column: "pool", sql: "ALTER TABLE products ADD COLUMN pool TINYINT NULL AFTER garden" },
  { table: "products", column: "furnished", sql: "ALTER TABLE products ADD COLUMN furnished TINYINT NULL AFTER pool" },
  { table: "products", column: "floor_number", sql: "ALTER TABLE products ADD COLUMN floor_number INT NULL AFTER furnished" },
  { table: "products", column: "balconies", sql: "ALTER TABLE products ADD COLUMN balconies INT NULL AFTER floor_number" },
  { table: "products", column: "elevator", sql: "ALTER TABLE products ADD COLUMN elevator TINYINT NULL AFTER balconies" },
  { table: "products", column: "frontage", sql: "ALTER TABLE products ADD COLUMN frontage DOUBLE NULL AFTER elevator" },
  { table: "products", column: "storage", sql: "ALTER TABLE products ADD COLUMN storage TINYINT NULL AFTER frontage" },
  { table: "products", column: "mezzanine", sql: "ALTER TABLE products ADD COLUMN mezzanine TINYINT NULL AFTER storage" },
  { table: "products", column: "rooms", sql: "ALTER TABLE products ADD COLUMN rooms INT NULL AFTER mezzanine" },
  { table: "products", column: "payment_method", sql: "ALTER TABLE products ADD COLUMN payment_method VARCHAR(255) NULL AFTER discount_value" },
  { table: "categories", column: "name_ar", sql: "ALTER TABLE categories ADD COLUMN name_ar VARCHAR(150) NULL AFTER name" },
  { table: "categories", column: "is_visible", sql: "ALTER TABLE categories ADD COLUMN is_visible TINYINT NOT NULL DEFAULT 1 AFTER status" },
];

async function ensureProductColumns(pool: Pool) {
  // Opt out entirely in production once schema is stable.
  if (process.env.SKIP_RUNTIME_DB_MIGRATIONS === "1") {
    return;
  }

  const tables = [...new Set(PRODUCT_COLUMN_MIGRATIONS.map((item) => item.table))];
  const placeholders = tables.map(() => "?").join(", ");
  const [existingRows] = await pool.query(
    `SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN (${placeholders})`,
    tables,
  );

  const existing = new Set(
    (existingRows as Array<{ table_name: string; column_name: string }>).map(
      (row) => `${row.table_name}.${row.column_name}`,
    ),
  );

  const missing = PRODUCT_COLUMN_MIGRATIONS.filter(
    (item) => !existing.has(`${item.table}.${item.column}`),
  );

  if (missing.length === 0) {
    return;
  }

  for (const item of missing) {
    try {
      await pool.execute(item.sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        !message.includes("Duplicate column name") &&
        !message.includes("already exists")
      ) {
        console.error("[db] Column migration failed:", message);
      }
    }
  }
}

export function getPool(): Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      ...getDatabaseConfig(),
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      namedPlaceholders: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
      connectTimeout: 10_000,
    });
  }

  return global.__mysqlPool;
}

async function ensureMigrations() {
  if (!global.__mysqlColumnMigration) {
    global.__mysqlColumnMigration = ensureProductColumns(getPool()).catch(
      (error) => {
        global.__mysqlColumnMigration = undefined;
        throw error;
      },
    );
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
