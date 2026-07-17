import { execute, query } from "@/server/database/connection";
import type {
  Category,
  City,
  Country,
  CreateCategoryInput,
  CreateCityInput,
  CreateCountryInput,
  CreatePurposeInput,
  Purpose,
  UpdateCategoryInput,
  UpdateCityInput,
  UpdateCountryInput,
  UpdatePurposeInput,
} from "@/server/types/lookup.types";

type UpdateValue = string | number | null;

async function updateRecord(
  table: "country" | "cities" | "categories" | "purpose",
  id: number,
  input: Record<string, UpdateValue | undefined>,
) {
  const fields: string[] = [];
  const params: Record<string, UpdateValue> = { id };

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] = value;
    }
  }

  if (fields.length === 0) return false;
  const result = await execute(
    `UPDATE ${table} SET ${fields.join(", ")} WHERE id = :id`,
    params,
  );
  return result.affectedRows > 0;
}

async function deleteRecord(
  table: "country" | "cities" | "categories" | "purpose",
  id: number,
) {
  const result = await execute(`DELETE FROM ${table} WHERE id = :id`, { id });
  return result.affectedRows > 0;
}

export const countryRepository = {
  findAll: () =>
    query<Country[]>("SELECT id, name, status FROM country ORDER BY name ASC"),

  async findById(id: number) {
    const rows = await query<Country[]>(
      "SELECT id, name, status FROM country WHERE id = :id LIMIT 1",
      { id },
    );
    return rows[0] ?? null;
  },

  async create(input: CreateCountryInput) {
    const result = await execute(
      "INSERT INTO country (name, status) VALUES (:name, :status)",
      input,
    );
    return result.insertId;
  },

  update: (id: number, input: UpdateCountryInput) =>
    updateRecord("country", id, input),
  delete: (id: number) => deleteRecord("country", id),

  async hasCities(id: number) {
    const rows = await query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM cities WHERE country_id = :id",
      { id },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },
};

export const cityRepository = {
  findAll: () =>
    query<City[]>(
      `SELECT cities.id, cities.name, cities.country_id,
              country.name AS country_name, cities.status
       FROM cities
       INNER JOIN country ON country.id = cities.country_id
       ORDER BY cities.name ASC`,
    ),

  async findById(id: number) {
    const rows = await query<City[]>(
      `SELECT cities.id, cities.name, cities.country_id,
              country.name AS country_name, cities.status
       FROM cities
       INNER JOIN country ON country.id = cities.country_id
       WHERE cities.id = :id
       LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async create(input: CreateCityInput) {
    const result = await execute(
      `INSERT INTO cities (name, country_id, status)
       VALUES (:name, :country_id, :status)`,
      input,
    );
    return result.insertId;
  },

  update: (id: number, input: UpdateCityInput) =>
    updateRecord("cities", id, input),
  delete: (id: number) => deleteRecord("cities", id),
};

export const categoryRepository = {
  findAll: () =>
    query<Category[]>(
      `SELECT id, name, status, position, icon
       FROM categories
       ORDER BY position ASC, name ASC`,
    ),

  async findById(id: number) {
    const rows = await query<Category[]>(
      `SELECT id, name, status, position, icon
       FROM categories WHERE id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async create(input: CreateCategoryInput) {
    const result = await execute(
      `INSERT INTO categories (name, status, position, icon)
       VALUES (:name, :status, :position, :icon)`,
      input,
    );
    return result.insertId;
  },

  update: (id: number, input: UpdateCategoryInput) =>
    updateRecord("categories", id, input),
  delete: (id: number) => deleteRecord("categories", id),
};

export const purposeRepository = {
  findAll: () =>
    query<Purpose[]>(
      `SELECT id, name, status, position
       FROM purpose
       ORDER BY position ASC, name ASC`,
    ),

  async findById(id: number) {
    const rows = await query<Purpose[]>(
      `SELECT id, name, status, position
       FROM purpose WHERE id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async create(input: CreatePurposeInput) {
    const result = await execute(
      `INSERT INTO purpose (name, status, position)
       VALUES (:name, :status, :position)`,
      input,
    );
    return result.insertId;
  },

  update: (id: number, input: UpdatePurposeInput) =>
    updateRecord("purpose", id, input),
  delete: (id: number) => deleteRecord("purpose", id),
};
