export type SiteSettings = {
  id: number;
  email: string;
  phone: string;
  phone_label: string;
  whatsapp_phone: string;
  whatsapp_message: string;
  instagram_url: string;
  instagram_handle: string;
  facebook_url: string;
  facebook_handle: string;
  updated_at: Date | string;
};

export type UpdateSiteSettingsInput = {
  email: string;
  phone: string;
  whatsapp_phone: string;
  whatsapp_message: string;
  instagram_url: string;
  instagram_handle: string;
  facebook_url: string;
  facebook_handle: string;
};
