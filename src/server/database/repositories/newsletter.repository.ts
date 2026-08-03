import { execute, query } from "@/server/database/connection";
import type {
  CreateNewsletterSubscriberInput,
  NewsletterSubscriber,
} from "@/server/types/newsletter.types";

export const newsletterRepository = {
  findByEmail: async (email: string) => {
    const rows = await query<NewsletterSubscriber[]>(
      `SELECT id, email, name, locale, created_at
       FROM newsletter_subscribers
       WHERE email = :email
       LIMIT 1`,
      { email },
    );
    return rows[0] ?? null;
  },

  create: async (input: CreateNewsletterSubscriberInput) => {
    const result = await execute(
      `INSERT INTO newsletter_subscribers (email, name, locale)
       VALUES (:email, :name, :locale)`,
      {
        email: input.email,
        name: input.name ?? null,
        locale: input.locale ?? "en",
      },
    );
    return result.insertId;
  },

  findById: async (id: number) => {
    const rows = await query<NewsletterSubscriber[]>(
      `SELECT id, email, name, locale, created_at
       FROM newsletter_subscribers
       WHERE id = :id
       LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },
};
