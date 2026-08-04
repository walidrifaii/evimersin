import { execute, query } from "@/server/database/connection";
import type {
  CreateHeroSlideInput,
  HeroSlide,
  UpdateHeroSlideInput,
} from "@/server/types/hero-slide.types";

const SELECT_FIELDS = `
  id,
  image,
  alt_text,
  sort_order,
  status,
  created_at,
  updated_at
`;

let ensurePromise: Promise<void> | null = null;

async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await execute(`
        CREATE TABLE IF NOT EXISTS hero_slides (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          image VARCHAR(500) NOT NULL,
          alt_text VARCHAR(255) NOT NULL DEFAULT '',
          sort_order INT NOT NULL DEFAULT 0,
          status TINYINT NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  await ensurePromise;
}

export const heroSlideRepository = {
  ensureTable,

  async findAll() {
    await ensureTable();
    return query<HeroSlide[]>(
      `SELECT ${SELECT_FIELDS} FROM hero_slides ORDER BY sort_order ASC, id ASC`,
    );
  },

  async findActive() {
    await ensureTable();
    return query<HeroSlide[]>(
      `SELECT ${SELECT_FIELDS} FROM hero_slides WHERE status = 1 ORDER BY sort_order ASC, id ASC`,
    );
  },

  async findById(id: number) {
    await ensureTable();
    const rows = await query<HeroSlide[]>(
      `SELECT ${SELECT_FIELDS} FROM hero_slides WHERE id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async create(input: CreateHeroSlideInput) {
    await ensureTable();
    const result = await execute(
      `INSERT INTO hero_slides (image, alt_text, sort_order, status)
       VALUES (:image, :alt_text, :sort_order, :status)`,
      input,
    );
    const id = Number(result.insertId);
    return (await this.findById(id))!;
  },

  async update(id: number, input: UpdateHeroSlideInput) {
    await ensureTable();
    const current = await this.findById(id);
    if (!current) return null;

    const next = {
      image: input.image ?? current.image,
      alt_text: input.alt_text ?? current.alt_text,
      sort_order: input.sort_order ?? current.sort_order,
      status: input.status ?? current.status,
    };

    await execute(
      `UPDATE hero_slides
       SET image = :image, alt_text = :alt_text, sort_order = :sort_order, status = :status
       WHERE id = :id`,
      { ...next, id },
    );

    return this.findById(id);
  },

  async remove(id: number) {
    await ensureTable();
    await execute(`DELETE FROM hero_slides WHERE id = :id`, { id });
  },
};
