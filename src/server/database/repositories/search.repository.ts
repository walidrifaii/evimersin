import { query } from "@/server/database/connection";
import type { DashboardSearchHit } from "@/server/types/search.types";

const LIMIT_PER_TYPE = 8;

function likeTerm(q: string) {
  return `%${q}%`;
}

export const searchRepository = {
  async searchProducts(q: string): Promise<DashboardSearchHit[]> {
    const rows = await query<
      Array<{
        id: number;
        name: string;
        image: string | null;
        category_name: string;
        city_name: string;
        purpose_name: string;
      }>
    >(
      `SELECT products.id, products.name, products.image,
              categories.name AS category_name,
              cities.name AS city_name,
              purpose.name AS purpose_name
       FROM products
       INNER JOIN categories ON categories.id = products.category_id
       INNER JOIN purpose ON purpose.id = products.purpose_id
       INNER JOIN cities ON cities.id = products.city_id
       WHERE products.name LIKE :q
          OR CAST(products.id AS CHAR) LIKE :q
          OR categories.name LIKE :q
          OR cities.name LIKE :q
          OR purpose.name LIKE :q
          OR CAST(products.price AS CHAR) LIKE :q
       ORDER BY products.position ASC, products.id DESC
       LIMIT ${LIMIT_PER_TYPE}`,
      { q: likeTerm(q) },
    );

    return rows.map((row) => ({
      type: "products" as const,
      id: row.id,
      title: row.name,
      subtitle: [row.category_name, row.city_name, row.purpose_name]
        .filter(Boolean)
        .join(" · "),
      image: row.image,
    }));
  },

  async searchCategories(q: string): Promise<DashboardSearchHit[]> {
    const rows = await query<
      Array<{ id: number; name: string; icon: string | null; position: number }>
    >(
      `SELECT id, name, icon, position
       FROM categories
       WHERE name LIKE :q OR CAST(id AS CHAR) LIKE :q OR CAST(position AS CHAR) LIKE :q
       ORDER BY position ASC, name ASC
       LIMIT ${LIMIT_PER_TYPE}`,
      { q: likeTerm(q) },
    );

    return rows.map((row) => ({
      type: "categories" as const,
      id: row.id,
      title: row.name,
      subtitle: `Position ${row.position}`,
      image: row.icon,
    }));
  },

  async searchCities(q: string): Promise<DashboardSearchHit[]> {
    const rows = await query<
      Array<{ id: number; name: string; country_name: string | null }>
    >(
      `SELECT cities.id, cities.name, country.name AS country_name
       FROM cities
       LEFT JOIN country ON country.id = cities.country_id
       WHERE cities.name LIKE :q OR CAST(cities.id AS CHAR) LIKE :q
       ORDER BY cities.name ASC
       LIMIT ${LIMIT_PER_TYPE}`,
      { q: likeTerm(q) },
    );

    return rows.map((row) => ({
      type: "cities" as const,
      id: row.id,
      title: row.name,
      subtitle: row.country_name,
      image: null,
    }));
  },

  async searchCountries(q: string): Promise<DashboardSearchHit[]> {
    const rows = await query<Array<{ id: number; name: string; status: number }>>(
      `SELECT id, name, status
       FROM country
       WHERE name LIKE :q OR CAST(id AS CHAR) LIKE :q
       ORDER BY name ASC
       LIMIT ${LIMIT_PER_TYPE}`,
      { q: likeTerm(q) },
    );

    return rows.map((row) => ({
      type: "countries" as const,
      id: row.id,
      title: row.name,
      subtitle: Number(row.status) === 1 ? "Active" : "Inactive",
      image: null,
    }));
  },

  async searchPurposes(q: string): Promise<DashboardSearchHit[]> {
    const rows = await query<
      Array<{ id: number; name: string; position: number }>
    >(
      `SELECT id, name, position
       FROM purpose
       WHERE name LIKE :q OR CAST(id AS CHAR) LIKE :q OR CAST(position AS CHAR) LIKE :q
       ORDER BY position ASC, name ASC
       LIMIT ${LIMIT_PER_TYPE}`,
      { q: likeTerm(q) },
    );

    return rows.map((row) => ({
      type: "purposes" as const,
      id: row.id,
      title: row.name,
      subtitle: `Position ${row.position}`,
      image: null,
    }));
  },
};
