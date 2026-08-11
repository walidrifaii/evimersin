import { execute, query } from "@/server/database/connection";
import {
  clampOnlineWindowSeconds,
  GUEST_ONLINE_WINDOW_SECONDS,
} from "@/constants/guest-presence";
import type {
  CreateAnnouncementInput,
  GuestSession,
  SiteAnnouncement,
  UpsertGuestSessionInput,
} from "@/server/types/announcement.types";

export const announcementRepository = {
  findActive: () =>
    query<SiteAnnouncement[]>(
      `SELECT id, title, message, is_active, created_by, created_at
       FROM site_announcements
       WHERE is_active = 1
       ORDER BY created_at DESC
       LIMIT 1`,
    ),

  // LIMIT/OFFSET are inlined because the pool runs with namedPlaceholders.
  findPage: (limit: number, offset: number) =>
    query<SiteAnnouncement[]>(
      `SELECT id, title, message, is_active, created_by, created_at
       FROM site_announcements
       ORDER BY created_at DESC
       LIMIT ${Math.max(1, Math.min(100, Math.floor(limit)))}
       OFFSET ${Math.max(0, Math.floor(offset))}`,
    ),

  async countAll() {
    const rows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total FROM site_announcements`,
    );
    return Number(rows[0]?.total ?? 0);
  },

  async create(input: CreateAnnouncementInput) {
    await execute(`UPDATE site_announcements SET is_active = 0 WHERE is_active = 1`);

    const result = await execute(
      `INSERT INTO site_announcements (title, message, is_active, created_by)
       VALUES (:title, :message, 1, :created_by)`,
      {
        title: input.title,
        message: input.message,
        created_by: input.created_by,
      },
    );

    return result.insertId;
  },
};

export const guestSessionRepository = {
  async upsert(input: UpsertGuestSessionInput) {
    await execute(
      `INSERT INTO guest_sessions (session_id, path, locale, last_seen_at)
       VALUES (:session_id, :path, :locale, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         path = VALUES(path),
         locale = VALUES(locale),
         last_seen_at = CURRENT_TIMESTAMP`,
      {
        session_id: input.session_id,
        path: input.path,
        locale: input.locale ?? "en",
      },
    );
  },

  remove: (sessionId: string) =>
    execute(`DELETE FROM guest_sessions WHERE session_id = :sessionId`, {
      sessionId,
    }),

  countActive(withinSeconds = GUEST_ONLINE_WINDOW_SECONDS) {
    const seconds = clampOnlineWindowSeconds(withinSeconds);
    return query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total
       FROM guest_sessions
       WHERE last_seen_at >= (NOW() - INTERVAL ${seconds} SECOND)`,
    ).then((rows) => Number(rows[0]?.total ?? 0));
  },

  findActive: (withinSeconds = GUEST_ONLINE_WINDOW_SECONDS, limit = 50) => {
    const seconds = clampOnlineWindowSeconds(withinSeconds);
    return query<GuestSession[]>(
      `SELECT session_id, path, locale, last_seen_at
       FROM guest_sessions
       WHERE last_seen_at >= (NOW() - INTERVAL ${seconds} SECOND)
       ORDER BY last_seen_at DESC
       LIMIT ${Math.max(1, Math.min(100, Math.floor(limit)))}`,
    );
  },
};
