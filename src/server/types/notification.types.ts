export type AdminFcmToken = {
  id: number;
  admin_id: number;
  token: string;
  device_label: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteVisit = {
  id: number;
  session_id: string;
  path: string;
  locale: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
};

export type CreateSiteVisitInput = {
  session_id: string;
  path: string;
  locale?: string;
  referrer?: string | null;
  user_agent?: string | null;
};

export type RegisterFcmTokenInput = {
  admin_id: number;
  token: string;
  device_label?: string | null;
};
