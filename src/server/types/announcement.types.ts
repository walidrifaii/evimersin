export type SiteAnnouncement = {
  id: number;
  title: string;
  message: string;
  is_active: number;
  created_by: number | null;
  created_at: string;
};

export type CreateAnnouncementInput = {
  title: string;
  message: string;
  created_by: number;
};

export type GuestSession = {
  session_id: string;
  path: string;
  locale: string;
  last_seen_at: string;
};

export type UpsertGuestSessionInput = {
  session_id: string;
  path: string;
  locale?: string;
};
