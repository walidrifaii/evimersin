import { execute, query } from "@/server/database/connection";
import type {
  Category,
  CategoryWithStats,
  City,
  CityWithCountry,
  Country,
  CountryWithCities,
  CreateCategoryInput,
  CreateCityInput,
  CreateCountryInput,
  CreatePurposeInput,
  Purpose,
  PurposeWithStats,
  UpdateCategoryInput,
  UpdateCityInput,
  UpdateCountryInput,
  UpdatePurposeInput,
  UpdateRegionInput,
  CreateRegionInput,
  Region,
  RegionWithCity,
} from "@/server/types/lookup.types";

type UpdateValue = string | number | null;

async function updateRecord(
  table: "country" | "cities" | "regions" | "categories" | "purpose",
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
  table: "country" | "cities" | "regions" | "categories" | "purpose",
  id: number,
) {
  const result = await execute(`DELETE FROM ${table} WHERE id = :id`, { id });
  return result.affectedRows > 0;
}

function mapCountryWithCities(
  countries: Country[],
  cities: Array<{
    id: number;
    name: string;
    country_id: number;
    status: 0 | 1;
  }>,
): CountryWithCities[] {
  return countries.map((country) => {
    const countryCities = cities
      .filter((city) => city.country_id === country.id)
      .map((city) => ({
        id: city.id,
        name: city.name,
        status: city.status,
      }));

    return {
      ...country,
      cities_count: countryCities.length,
      cities: countryCities,
    };
  });
}

export const countryRepository = {
  findAll: () =>
    query<Country[]>("SELECT id, name, status FROM country ORDER BY name ASC"),

  async findAllWithCities(): Promise<CountryWithCities[]> {
    const [countries, cities] = await Promise.all([
      this.findAll(),
      query<
        Array<{ id: number; name: string; country_id: number; status: 0 | 1 }>
      >(
        `SELECT id, name, country_id, status
         FROM cities
         ORDER BY name ASC`,
      ),
    ]);
    return mapCountryWithCities(countries, cities);
  },

  async findById(id: number) {
    const rows = await query<Country[]>(
      "SELECT id, name, status FROM country WHERE id = :id LIMIT 1",
      { id },
    );
    return rows[0] ?? null;
  },

  async findByIdWithCities(id: number): Promise<CountryWithCities | null> {
    const country = await this.findById(id);
    if (!country) return null;

    const cities = await query<
      Array<{ id: number; name: string; country_id: number; status: 0 | 1 }>
    >(
      `SELECT id, name, country_id, status
       FROM cities
       WHERE country_id = :id
       ORDER BY name ASC`,
      { id },
    );

    return mapCountryWithCities([country], cities)[0] ?? null;
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

  findByCountryId: (countryId: number) =>
    query<City[]>(
      `SELECT cities.id, cities.name, cities.country_id,
              country.name AS country_name, cities.status
       FROM cities
       INNER JOIN country ON country.id = cities.country_id
       WHERE cities.country_id = :countryId
       ORDER BY cities.name ASC`,
      { countryId },
    ),

  findActiveByCountry: (countryName: string) =>
    query<City[]>(
      `SELECT cities.id, cities.name, cities.country_id,
              country.name AS country_name, cities.status
       FROM cities
       INNER JOIN country ON country.id = cities.country_id
       WHERE cities.status = 1
         AND LOWER(country.name) = LOWER(:countryName)
       ORDER BY cities.name ASC`,
      { countryName },
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

  async findByIdWithCountry(id: number): Promise<CityWithCountry | null> {
    const rows = await query<
      Array<
        City & {
          country_status: 0 | 1;
        }
      >
    >(
      `SELECT cities.id, cities.name, cities.country_id,
              country.name AS country_name, cities.status,
              country.status AS country_status
       FROM cities
       INNER JOIN country ON country.id = cities.country_id
       WHERE cities.id = :id
       LIMIT 1`,
      { id },
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      country_id: row.country_id,
      country_name: row.country_name,
      status: row.status,
      country: {
        id: row.country_id,
        name: row.country_name,
        status: row.country_status,
      },
    };
  },

  async findAllWithCountry(countryId?: number): Promise<CityWithCountry[]> {
    const rows = await query<
      Array<
        City & {
          country_status: 0 | 1;
        }
      >
    >(
      countryId
        ? `SELECT cities.id, cities.name, cities.country_id,
                country.name AS country_name, cities.status,
                country.status AS country_status
         FROM cities
         INNER JOIN country ON country.id = cities.country_id
         WHERE cities.country_id = :countryId
         ORDER BY cities.name ASC`
        : `SELECT cities.id, cities.name, cities.country_id,
                country.name AS country_name, cities.status,
                country.status AS country_status
         FROM cities
         INNER JOIN country ON country.id = cities.country_id
         ORDER BY cities.name ASC`,
      countryId ? { countryId } : undefined,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      country_id: row.country_id,
      country_name: row.country_name,
      status: row.status,
      country: {
        id: row.country_id,
        name: row.country_name,
        status: row.country_status,
      },
    }));
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

  async hasProducts(id: number) {
    const rows = await query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM products WHERE city_id = :id",
      { id },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },

  async hasRegions(id: number) {
    const rows = await query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM regions WHERE city_id = :id",
      { id },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },
};

export const regionRepository = {
  findAll: () =>
    query<Region[]>(
      `SELECT regions.id, regions.name, regions.city_id,
              cities.name AS city_name, regions.status
       FROM regions
       INNER JOIN cities ON cities.id = regions.city_id
       ORDER BY cities.name ASC, regions.name ASC`,
    ),

  findByCityId: (cityId: number) =>
    query<Region[]>(
      `SELECT regions.id, regions.name, regions.city_id,
              cities.name AS city_name, regions.status
       FROM regions
       INNER JOIN cities ON cities.id = regions.city_id
       WHERE regions.city_id = :cityId
       ORDER BY regions.name ASC`,
      { cityId },
    ),

  async findById(id: number) {
    const rows = await query<Region[]>(
      `SELECT regions.id, regions.name, regions.city_id,
              cities.name AS city_name, regions.status
       FROM regions
       INNER JOIN cities ON cities.id = regions.city_id
       WHERE regions.id = :id
       LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async findByIdWithCity(id: number): Promise<RegionWithCity | null> {
    const rows = await query<
      Array<
        Region & {
          city_status: 0 | 1;
        }
      >
    >(
      `SELECT regions.id, regions.name, regions.city_id,
              cities.name AS city_name, regions.status,
              cities.status AS city_status
       FROM regions
       INNER JOIN cities ON cities.id = regions.city_id
       WHERE regions.id = :id
       LIMIT 1`,
      { id },
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      city_id: row.city_id,
      city_name: row.city_name,
      status: row.status,
      city: {
        id: row.city_id,
        name: row.city_name,
        status: row.city_status,
      },
    };
  },

  async findAllWithCity(cityId?: number): Promise<RegionWithCity[]> {
    const rows = await query<
      Array<
        Region & {
          city_status: 0 | 1;
        }
      >
    >(
      cityId
        ? `SELECT regions.id, regions.name, regions.city_id,
                  cities.name AS city_name, regions.status,
                  cities.status AS city_status
           FROM regions
           INNER JOIN cities ON cities.id = regions.city_id
           WHERE regions.city_id = :cityId
           ORDER BY regions.name ASC`
        : `SELECT regions.id, regions.name, regions.city_id,
                  cities.name AS city_name, regions.status,
                  cities.status AS city_status
           FROM regions
           INNER JOIN cities ON cities.id = regions.city_id
           ORDER BY cities.name ASC, regions.name ASC`,
      cityId ? { cityId } : undefined,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      city_id: row.city_id,
      city_name: row.city_name,
      status: row.status,
      city: {
        id: row.city_id,
        name: row.city_name,
        status: row.city_status,
      },
    }));
  },

  async create(input: CreateRegionInput) {
    const result = await execute(
      `INSERT INTO regions (name, city_id, status)
       VALUES (:name, :city_id, :status)`,
      input,
    );
    return result.insertId;
  },

  update: (id: number, input: UpdateRegionInput) =>
    updateRecord("regions", id, input),
  delete: (id: number) => deleteRecord("regions", id),

  async hasProducts(id: number) {
    const rows = await query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM products WHERE region_id = :id",
      { id },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },
};

export const categoryRepository = {
  findAll: () =>
    query<Category[]>(
      `SELECT id, name, status, position, icon
       FROM categories
       ORDER BY position ASC, name ASC`,
    ),

  findAllWithStats: () =>
    query<CategoryWithStats[]>(
      `SELECT categories.id, categories.name, categories.status,
              categories.position, categories.icon,
              COUNT(products.id) AS products_count
       FROM categories
       LEFT JOIN products ON products.category_id = categories.id
       GROUP BY categories.id, categories.name, categories.status,
                categories.position, categories.icon
       ORDER BY categories.position ASC, categories.name ASC`,
    ),

  async findById(id: number) {
    const rows = await query<Category[]>(
      `SELECT id, name, status, position, icon
       FROM categories WHERE id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async findByIdWithStats(id: number): Promise<CategoryWithStats | null> {
    const rows = await query<CategoryWithStats[]>(
      `SELECT categories.id, categories.name, categories.status,
              categories.position, categories.icon,
              COUNT(products.id) AS products_count
       FROM categories
       LEFT JOIN products ON products.category_id = categories.id
       WHERE categories.id = :id
       GROUP BY categories.id, categories.name, categories.status,
                categories.position, categories.icon
       LIMIT 1`,
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

  async hasProducts(id: number) {
    const rows = await query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM products WHERE category_id = :id",
      { id },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },
};

export const purposeRepository = {
  findAll: () =>
    query<Purpose[]>(
      `SELECT id, name, status, position
       FROM purpose
       ORDER BY position ASC, name ASC`,
    ),

  findAllWithStats: () =>
    query<PurposeWithStats[]>(
      `SELECT purpose.id, purpose.name, purpose.status, purpose.position,
              COUNT(products.id) AS products_count
       FROM purpose
       LEFT JOIN products ON products.purpose_id = purpose.id
       GROUP BY purpose.id, purpose.name, purpose.status, purpose.position
       ORDER BY purpose.position ASC, purpose.name ASC`,
    ),

  async findById(id: number) {
    const rows = await query<Purpose[]>(
      `SELECT id, name, status, position
       FROM purpose WHERE id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async findByIdWithStats(id: number): Promise<PurposeWithStats | null> {
    const rows = await query<PurposeWithStats[]>(
      `SELECT purpose.id, purpose.name, purpose.status, purpose.position,
              COUNT(products.id) AS products_count
       FROM purpose
       LEFT JOIN products ON products.purpose_id = purpose.id
       WHERE purpose.id = :id
       GROUP BY purpose.id, purpose.name, purpose.status, purpose.position
       LIMIT 1`,
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

  async hasProducts(id: number) {
    const rows = await query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM products WHERE purpose_id = :id",
      { id },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },
};
