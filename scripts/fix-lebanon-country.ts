import { loadEnv } from "./load-env";
import { closePool, execute, query } from "../src/server/database/connection";

loadEnv();

async function fixLebanonCountry() {
  // 1) Ensure country id 1 is Lebanon (no deletes)
  await execute(
    `INSERT INTO country (id, name, status)
     VALUES (1, 'Lebanon', 1)
     ON DUPLICATE KEY UPDATE
       name = 'Lebanon',
       status = 1`,
  );

  // 2) Point every city at Lebanon and keep cities active
  await execute(
    `UPDATE cities
     SET country_id = 1,
         status = 1`,
  );

  // 3) Keep other countries, just mark inactive
  await execute(
    `UPDATE country
     SET status = 0
     WHERE id <> 1`,
  );

  const countries = await query<Array<{ id: number; name: string; status: number }>>(
    "SELECT id, name, status FROM country ORDER BY id",
  );
  const cities = await query<
    Array<{ id: number; name: string; country_id: number; status: number }>
  >("SELECT id, name, country_id, status FROM cities ORDER BY id");
  const products = await query<Array<{ total: number }>>(
    "SELECT COUNT(*) AS total FROM products",
  );

  console.log("Lebanon country fix applied (no data deleted).");
  console.log("Countries:", countries);
  console.log("Cities:", cities);
  console.log("Products kept:", Number(products[0]?.total ?? 0));

  await closePool();
}

fixLebanonCountry()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Failed to fix Lebanon country:", error);
    try {
      await closePool();
    } catch {
      // ignore
    }
    process.exit(1);
  });
