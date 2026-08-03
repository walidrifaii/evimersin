import { execute, query } from "@/server/database/connection";
import type {
  AdminFcmToken,
  CreateSiteVisitInput,
  RegisterFcmTokenInput,
  SiteVisit,
} from "@/server/types/notification.types";

export const fcmTokenRepository = {
  findAllTokens: () =>
    query<Array<{ token: string }>>(
      `SELECT token FROM admin_fcm_tokens ORDER BY updated_at DESC`,
    ),

  findByAdminId: (adminId: number) =>
    query<AdminFcmToken[]>(
      `SELECT id, admin_id, token, device_label, created_at, updated_at
       FROM admin_fcm_tokens
       WHERE admin_id = :adminId
       ORDER BY updated_at DESC`,
      { adminId },
    ),

  async upsert(input: RegisterFcmTokenInput) {
    await execute(
      `INSERT INTO admin_fcm_tokens (admin_id, token, device_label)
       VALUES (:admin_id, :token, :device_label)
       ON DUPLICATE KEY UPDATE
         admin_id = VALUES(admin_id),
         device_label = VALUES(device_label),
         updated_at = CURRENT_TIMESTAMP`,
      {
        admin_id: input.admin_id,
        token: input.token,
        device_label: input.device_label ?? null,
      },
    );
  },

  deleteByToken: (token: string) =>
    execute(`DELETE FROM admin_fcm_tokens WHERE token = :token`, { token }),
};

export const siteVisitRepository = {
  async hasRecentSession(sessionId: string, withinMinutes = 30) {
    const minutes = Math.max(1, Math.min(1440, Math.floor(withinMinutes)));
    const rows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total
       FROM site_visits
       WHERE session_id = :sessionId
         AND created_at >= (NOW() - INTERVAL ${minutes} MINUTE)`,
      { sessionId },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  },

  async create(input: CreateSiteVisitInput) {
    const result = await execute(
      `INSERT INTO site_visits (session_id, path, locale, referrer, user_agent)
       VALUES (:session_id, :path, :locale, :referrer, :user_agent)`,
      {
        session_id: input.session_id,
        path: input.path,
        locale: input.locale ?? "en",
        referrer: input.referrer ?? null,
        user_agent: input.user_agent ?? null,
      },
    );
    return result.insertId;
  },

  findRecent: (limit = 20) =>
    query<SiteVisit[]>(
      `SELECT id, session_id, path, locale, referrer, user_agent, created_at
       FROM site_visits
       ORDER BY created_at DESC
       LIMIT ${Math.max(1, Math.min(100, Math.floor(limit)))}`,
    ),
};
